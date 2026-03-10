# 🧠 Repo Analysis AI

A powerful, AI-driven tool to interactively chat with any GitHub repository. 
Understand codebase architecture, find complex logic, and answer deep technical questions using Google Gemini and Retrieval-Augmented Generation (RAG).

<div align="center">
  <img src="./docs/images/screenshot1.png" alt="Main Interface" width="800"/>
</div>

## 🚀 Features

* **Instant Repository Cloning:** Paste any GitHub URL, and the application instantly fetches the codebase directly into your customized analysis engine.
* **Intelligent File Parsing:** Automatically identifies and processes relevant code files (Python, JS/TS, HTML, CSS, Markdown, etc.) while ignoring heavy build/dependency folders.
* **Vector Embeddings (RAG):** Contextually chunks and embeds codebase knowledge locally using ChromaDB, allowing for incredibly fast and precise contextual retrieval matching user queries.
* **AI-Powered Chat Interface:** Powered by the Google Gemini API, ask nuanced questions about your repository ("Where is the payment logic?", "How is the app laid out?") and get rich markdown-formatted responses.
* **Sleek UI:** A stunning, dark-themed UI built with Next.js, Framer Motion, and Tailwind CSS.

## 📸 Screenshots

<div align="center">
  <img src="./docs/images/screenshot2.png" alt="Architecture Explanation" width="800"/>
  <br/><br/>
  <img src="./docs/images/screenshot3.png" alt="Code Explanation 1" width="800"/>
  <br/><br/>
  <img src="./docs/images/screenshot4.png" alt="Code Explanation 2" width="800"/>
  <br/><br/>
  <img src="./docs/images/screenshot5.png" alt="Code Explanation 2" width="800"/>
</div>

## 🛠️ Tech Stack

* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion
* **Backend:** FastAPI (Python), uvicorn
* **AI & Embeddings:** Google Gemini `gemini-2.5-flash`, `gemini-embedding-001`
* **Vector Database:** ChromaDB 
* **Database & Caching (Optional):** PostgreSQL, Redis (Configured in Docker setup)

## ⚙️ Requirements

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Python 3.10+](https://www.python.org/) and [Node.js 18+](https://nodejs.org/) (for local execution)
* Google Gemini API Key. [Get it here](https://aistudio.google.com/).

## 🚦 Getting Started

### Option 1: Docker (Recommended for ease of use)

1. Clone or download this project.
2. In the `backend` folder, duplicate `.env.example` and rename it to `.env`. Add your active `GOOGLE_API_KEY`:

   ```env
   GOOGLE_API_KEY="your-gemini-api-key-here"
   ```

3. From the root directory, start all services using Docker Compose:

   ```bash
   docker-compose up -d --build
   ```

4. The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

### Option 2: Local Execution

**Backend Setup:**
1. Navigate to the `backend` directory: `cd backend`
2. Configure `.env` as mentioned above with your API Key.
3. Install dependencies and activate your virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Run the API:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

**Frontend Setup:**
1. Open a new terminal and navigate to the `frontend` directory: `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Find the app running at [http://localhost:3000](http://localhost:3000) or 3001 depending on port availability.

## 💡 Usage Example

1. Type a GitHub URL into the top-left sidebar text box (e.g., `https://github.com/fastapi/fastapi`).
2. Wait a few moments as the system clones, reads, and embeds the repository internally.
3. Once completed, select the repository from the sidebar list.
4. Begin asking questions like: *"How is the routing structured in this application?"*
