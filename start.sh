#!/bin/bash

# Start Ollama in background
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS=* ollama serve &

# Wait for Ollama to start
sleep 3

# Start API server
cd /home/workspace/agent
PORT=3001 bun run api-server.ts
