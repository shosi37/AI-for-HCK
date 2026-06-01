# Hosting Guide: AI for HCK

Your project consists of three main components, each requiring a different hosting strategy:
1. **Frontend**: A Vite React application (`frontend/`)
2. **Backend**: A Node.js Express server (`backend/`)
3. **Rasa Chatbot**: A Python-based machine learning server (Root directory)

Here is a step-by-step guide on how to host each part of your application.

---

## 1. Hosting the Frontend (Vite + React)
The easiest and most cost-effective platforms for hosting a React frontend are **Vercel**, **Netlify**, or **Firebase Hosting**. They are completely free for most use cases and offer automatic deployments from GitHub.

**Recommendation: Vercel**
1. Create a free account on [Vercel](https://vercel.com).
2. Install the Vercel CLI or connect your GitHub repository.
3. If connecting via GitHub, select the repository.
4. **Important Configurations**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add any necessary Environment Variables (e.g., your Firebase config keys or your backend URL).
6. Click **Deploy**.

---

## 2. Hosting the Node.js Backend (Express)
Your backend requires a Node.js runtime. Good platforms for this are **Render**, **Railway**, or **Fly.io**. They offer simple continuous deployment from GitHub.

**Recommendation: Render**
1. Create an account on [Render](https://render.com).
2. Click "New +" and select **Web Service**.
3. Connect your GitHub repository.
4. **Important Configurations**:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add all your Environment Variables from your local `.env` file (e.g., Firebase Service Account credentials, email credentials, etc.).
6. Click **Create Web Service**. 
7. *Note:* Ensure you update your frontend's API base URL to point to this new Render URL.

---

## 3. Hosting the Rasa Chatbot Server (Python)
Rasa requires significant memory (at least 2GB RAM, though 4GB is recommended) to run effectively, especially when loading its NLU models. Because of this, free-tier services (like Render's free tier) will likely fail due to Out-Of-Memory (OOM) errors.

**Recommendation: Virtual Private Server (VPS) via DigitalOcean or AWS EC2**
1. Rent a VPS (e.g., a $12/month DigitalOcean Droplet with 2GB RAM or an AWS EC2 `t3.small` instance).
2. SSH into your server:
   ```bash
   ssh root@your_server_ip
   ```
3. Install Python 3.10 and dependencies:
   ```bash
   sudo apt update
   sudo apt install python3.10 python3.10-venv git
   ```
4. Clone your repository onto the server.
5. Create a virtual environment and install Rasa:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
6. Run the Rasa server in API mode using a process manager like `tmux` or `systemd` to keep it running in the background:
   ```bash
   rasa run -m models --enable-api --cors "*" --port 5006
   ```
   *(You will also need to run `rasa run actions` in a separate terminal if you use custom actions).*
7. **Important**: Update your Node.js backend's `chat.js` file to point to your new VPS IP address (e.g., `http://your_server_ip:5006/webhooks/rest/webhook`) instead of `http://localhost:5006`.

> [!TIP]
> **Docker Alternative**
> If you prefer containerization, you can write a `Dockerfile` for your Rasa project and deploy it using Render (using their paid Docker tier) or Google Cloud Run. This is often more reliable but requires Docker knowledge.

---

## Summary of URL Updates
Once everything is hosted, you must link them together:
1. **Frontend** needs to know the **Node.js Backend URL**.
2. **Node.js Backend** needs to know the **Rasa Server URL**.
3. **Node.js Backend CORS** needs to allow requests from the **Frontend URL**.

If you'd like to proceed with one of these platforms, I can help you set up the exact configuration files (like `render.yaml` or a `Dockerfile`)!
