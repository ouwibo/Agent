# Ouwibo Agent v2.0 - Web3 AI Platform

## Project Overview

A Web3 AI platform featuring chat, crypto trading, NFT minting, and Farcaster Frames integration. Built with React/Vite on the frontend and Cloudflare Workers (Hono) on the backend.

## Architecture

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS, running on port 5000
- **Backend**: Cloudflare Workers with Hono framework (deployed to `agent.ouwibo.workers.dev`)

## Local Development

The frontend Vite dev server runs on port 5000 (0.0.0.0) with all hosts allowed for Replit proxy compatibility.

The backend is a Cloudflare Workers service — it is deployed to Cloudflare and not run locally in this environment.

## User Preferences

- Use TypeScript throughout
- Follow existing project structure and conventions
