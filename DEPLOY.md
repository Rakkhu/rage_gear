# Deployment Guide

The project consists of two parts:
1. **Client** (Frontend) -> Can be hosted on **Vercel**.
2. **Server** (Backend/WebSocket) -> **Cannot** be hosted on standard Vercel. Needs a persistent server like **Render**, **Railway**, or **Glitch**.

## 1. Push to GitHub
Create a new repository on GitHub and push this code.
```bash
git remote add origin https://github.com/YOUR_USERNAME/rage-road.git
git push -u origin main
```

## 2. Deploy Server (Backend)
Recommendations: **Render.com** (Free tier available) or **Railway.app**.

**Steps for Render:**
1. Create a new **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Deploy.
5. **Copy the URL** provided by Render (e.g., `rage-road-server.onrender.com`). *Note: Render uses persistent ports. It will be `wss://<URL>`.*

## 3. Deploy Client (Vercel)
1. Go to Vercel and "Add New Project".
2. Import the same GitHub repo.
3. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `vite build` (default)
   - **Output Directory**: `dist` (default)
4. **Environment Variables**:
   Add a new variable:
   - Name: `VITE_WS_URL`
   - Value: The **Server URL** from Step 2 with protocol (e.g., `wss://rage-road-server.onrender.com`).
5. Deploy.

## 4. Play
Visit your Vercel URL! The client will connect to your Render backend.
