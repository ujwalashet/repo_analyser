import os
import google.generativeai as genai
import chromadb
from app.core.config import settings

# Initialize Gemini and ChromaDB
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

# Use PersistentClient to avoid requiring a separate Chroma container/server locally
import os
if settings.CHROMA_HOST == "chromadb":
    chroma_client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
else:
    os.makedirs("./data/chroma_db", exist_ok=True)
    chroma_client = chromadb.PersistentClient(path="./data/chroma_db")

class RAGService:
    def __init__(self):
        self.collection = chroma_client.get_or_create_collection("repo_embeddings")
        self.model = genai.GenerativeModel("models/gemini-2.5-flash")

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
        # Basic chunking implementation
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            # Find the last newline to break cleanly if possible
            if end < len(text):
                last_newline = text.rfind('\n', start, end)
                if last_newline != -1 and last_newline > start + chunk_size // 2:
                    end = last_newline + 1
            chunks.append(text[start:end])
            start = end - overlap if end < len(text) else len(text)
        return chunks

    def compute_embedding(self, text: str) -> list[float]:
        # Using Gemini embedding model
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']

    def index_documents(self, repo_name: str, documents: list[dict]):
        # documents format: [{"file_path": str, "content": str}, ...]
        ids = []
        embeddings = []
        metadatas = []
        documents_text = []

        chunk_counter = 0
        for doc in documents:
            chunks = self.chunk_text(doc["content"])
            for idx, chunk in enumerate(chunks):
                if not chunk.strip():
                    continue
                chunk_id = f"{repo_name}_{doc['file_path']}_{idx}"
                embedding = self.compute_embedding(chunk)
                
                ids.append(chunk_id)
                embeddings.append(embedding)
                metadatas.append({"repo": repo_name, "file_path": doc["file_path"]})
                documents_text.append(chunk)

                chunk_counter += 1

                # Batch insertion to avoid immense requests
                if len(ids) >= 100:
                    self.collection.add(
                        ids=ids,
                        embeddings=embeddings,
                        metadatas=metadatas,
                        documents=documents_text
                    )
                    ids, embeddings, metadatas, documents_text = [], [], [], []

        if ids:
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas,
                documents=documents_text
            )

    def query_repository(self, repo_name: str, question: str) -> str:
        query_embedding = genai.embed_content(
            model="models/gemini-embedding-001",
            content=question,
            task_type="retrieval_query"
        )['embedding']

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            where={"repo": repo_name}
        )

        context_blocks = []
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            context_blocks.append(f"File: {meta['file_path']}\n{doc}")

        context = "\n\n".join(context_blocks)

        prompt = f"""You are an expert software developer and repository explainer.
Based on the following code segments from the repository '{repo_name}', answer the user's question.

Context from repository:
{context}

Question:
{question}
"""
        response = self.model.generate_content(prompt)
        return response.text
