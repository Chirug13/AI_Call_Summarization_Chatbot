// src/utils/audioUtils.js
export function setupSilenceDetection(stream, onSilence, threshold = 0.01, delay = 5000) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(2048, 1, 1);

  let silenceStart = performance.now();
  let triggered = false;

  analyser.fftSize = 2048;
  source.connect(analyser);
  analyser.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = () => {
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const normalized = data.map(val => (val - 128) / 128);
    const volume = Math.max(...normalized.map(Math.abs));

    if (volume < threshold) {
      if (performance.now() - silenceStart > delay && !triggered) {
        triggered = true;
        onSilence();
        processor.disconnect();
        analyser.disconnect();
      }
    } else {
      silenceStart = performance.now();
    }
  };

  return () => {
    processor.disconnect();
    analyser.disconnect();
    source.disconnect();
    audioContext.close();
  };
}
