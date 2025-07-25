import React, { useState, useEffect, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import WaveSurfer from 'wavesurfer.js';
import {
  FaMicrophone,
  FaFilePdf,
  FaUpload,
  FaUserCircle,
  FaRobot
} from 'react-icons/fa';
import { setupSilenceDetection } from './utils/audioUtils';
import './App.css';

const recorder = new MicRecorder({ bitRate: 128 });

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(30);
  const [audioUrl, setAudioUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const intervalRef = useRef(null);
  const chatWindowRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const cleanupSilenceDetection = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#aaa',
        progressColor: '#4fc3f7',
        responsive: true,
        height: 60,
      });
      wavesurfer.current.load(audioUrl);
    }
  }, [audioUrl]);

  const handleSend = async () => {
    if (!input.trim() || !transcription) return;
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input, context: transcription })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    setIsTyping(false);
  };

  const handleToneAnalysis = async () => {
    if (!transcription) return alert("Please upload or record audio first.");
    setIsTyping(true);
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Analyze the emotional tone or sentiment of the following transcript:',
        context: transcription
      })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { text: `🧠 Tone Analysis: ${data.response}`, sender: 'bot' }]);
    setIsTyping(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('audio', file);

    const res = await fetch('http://localhost:8000/transcribe', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!data.transcription || data.transcription.includes("No voice detected")) {
      alert("No voice detected in the audio.");
    }
    setTranscription(data.transcription || '');
  };

  const handlePDFExport = async () => {
    if (!transcription) return alert("Please upload or record audio first.");
    const res = await fetch('http://localhost:8000/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: transcription })
    });
    const data = await res.json();
    if (data.file) {
      window.open('http://localhost:8000/' + data.file, '_blank');
    } else {
      alert("PDF generation failed.");
    }
  };

  const stopRecording = async () => {
    const [buffer, blob] = await recorder.stop().getMp3();
    const file = new File([blob], "mic_recording.mp3", { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setIsRecording(false);
    setRecordingSeconds(30);
    clearInterval(intervalRef.current);
    if (cleanupSilenceDetection.current) cleanupSilenceDetection.current();

    const formData = new FormData();
    formData.append("audio", file);
    const res = await fetch("http://localhost:8000/transcribe", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    const text = data.transcription || '';

    if (!text || text.includes("No voice detected")) {
      alert("No voice detected in the audio.");
      return;
    }

    setTranscription(text);

    // 🔥 Auto-send transcription as chat query
    const userMessage = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const replyRes = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text, context: text })
    });
    const replyData = await replyRes.json();

    setMessages(prev => [...prev, { text: replyData.response, sender: 'bot' }]);
    setIsTyping(false);
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        await recorder.start();
        setIsRecording(true);

        cleanupSilenceDetection.current = setupSilenceDetection(stream, stopRecording, 0.01, 5000);

        intervalRef.current = setInterval(() => {
          setRecordingSeconds(prev => {
            if (prev <= 1) {
              stopRecording();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        console.error("Mic error:", err);
        alert("Microphone access denied.");
      }
    } else {
      stopRecording();
    }
  };

  return (
    <div className="app">
      {/* Left Panel */}
      <div className="left-panel">
        <img src="/logo192.png" alt="Logo" className="w-24 h-24 rounded-full mb-2" />
        <div className="space-y-3 w-full">
          <label className="action-button cursor-pointer">
            <FaUpload />
            <input type="file" accept=".mp3,.wav" onChange={handleFileUpload} hidden />
            <span className="text-sm mt-1">Upload</span>
          </label>

          <button className="action-button" onClick={handleMicClick}>
            <FaMicrophone />
            <span className="text-sm mt-1">
              {isRecording ? `Recording... (${recordingSeconds}s)` : 'Microphone'}
            </span>
          </button>

          <button className="action-button" onClick={handlePDFExport}>
            <FaFilePdf />
            <span className="text-sm mt-1">Export PDF</span>
          </button>

          <button className="action-button" onClick={handleToneAnalysis}>
            🧠
            <span className="text-sm mt-1">Analyze Tone</span>
          </button>
        </div>

        <div className="text-3xl text-gray-300 mt-4 text-center">
          <p>📌 How to use:</p>
          <p>Upload or record audio</p>
          <p>Interact via chat</p>
          <p>Analyze tone</p>
          <p>Export summary</p>
        </div>
        <img src="/call_center.jpg" alt="Call Center" className="w-full mt-4 rounded-lg" />
      </div>

      {/* Center Chat Panel */}
      <div className="center-panel">
        <div className="chat-title">AI Call Summarization Chatbot</div>
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.sender}`}>
              {msg.sender === 'user' ? '🧑' : '🤖'}
              <span>{msg.text}</span>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message bot">
              🤖 <span className="typing-indicator">Typing...</span>
            </div>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the call..."
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div ref={waveformRef} className="waveform-preview" />
        <div className="transcription-box">
          <strong className="mb-1">Transcript Preview</strong>
          <textarea
            className="scrollable-box"
            value={transcription}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

export default App;
