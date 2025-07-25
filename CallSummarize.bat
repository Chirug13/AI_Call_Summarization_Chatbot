@echo off
:: Start frontend
start "" /min cmd /c "cd /d D:\Redhats\AI_Call_Summarization_Chatbot\client && npm start"

:: Start backend
start "" /min cmd /c "cd /d D:\Redhats\AI_Call_Summarization_Chatbot\backend && uvicorn main:app --reload"