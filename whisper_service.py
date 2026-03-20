#!/usr/bin/env python3
"""
Whisper transcription HTTP service for WhatsApp audio messages.
Listens on port 5555, accepts POST with audio file, returns transcription.
"""
import sys
import json
import tempfile
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import whisper

print("Loading Whisper model 'base'...", flush=True)
model = whisper.load_model("base")
print("Model loaded. Server starting on port 5555...", flush=True)

class TranscribeHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            audio_data = self.rfile.read(content_length)

            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False) as f:
                f.write(audio_data)
                temp_path = f.name

            # Transcribe
            result = model.transcribe(temp_path, language="es", fp16=False)
            text = result.get("text", "").strip()

            # Cleanup
            os.unlink(temp_path)

            # Respond
            response = json.dumps({"text": text, "ok": True})
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response.encode())
            print(f"[Whisper] Transcribed: {text[:100]}", flush=True)

        except Exception as e:
            response = json.dumps({"text": "", "ok": False, "error": str(e)})
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response.encode())
            print(f"[Whisper] Error: {e}", flush=True)

    def log_message(self, format, *args):
        pass  # Suppress default logging

server = HTTPServer(('127.0.0.1', 5555), TranscribeHandler)
print("Whisper service running on http://127.0.0.1:5555", flush=True)
server.serve_forever()
