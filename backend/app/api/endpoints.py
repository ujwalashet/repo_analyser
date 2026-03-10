import os
import shutil
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.github_service import GitHubService
from app.services.rag_service import RAGService
from app.core.config import settings

router = APIRouter()

# Initialize services
github_service = GitHubService(settings.REPOS_STORAGE_DIR)
rag_service = RAGService()

# In-memory status tracker
repo_status: Dict[str, str] = {}

class RepoRequest(BaseModel):
    url: str

class QueryRequest(BaseModel):
    repo_name: str
    question: str

def process_repository(repo_url: str, repo_name: str):
    try:
        repo_status[repo_name] = "cloning"
        repo_dir = github_service.clone_repository(repo_url)
        
        repo_status[repo_name] = "parsing"
        files = github_service.get_supported_files(repo_dir)
        
        documents = []
        for file_path in files:
            content = github_service.read_file_content(file_path)
            if content:
                # Store relative path for cleaner display
                rel_path = os.path.relpath(file_path, repo_dir)
                documents.append({"file_path": rel_path, "content": content})
                
        repo_status[repo_name] = "embedding"
        rag_service.index_documents(repo_name, documents)
        
        repo_status[repo_name] = "completed"
    except Exception as e:
        repo_status[repo_name] = f"error: {str(e)}"

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Repo Analysis API is running."}

@router.post("/repos/analyze")
async def analyze_repo(req: RepoRequest, background_tasks: BackgroundTasks):
    repo_name = github_service.extract_repo_name(req.url)
    
    if repo_name in repo_status and repo_status[repo_name] in ["cloning", "parsing", "embedding"]:
        return {"message": f"Repository {repo_name} is already being processed.", "status": repo_status[repo_name]}
        
    background_tasks.add_task(process_repository, req.url, repo_name)
    repo_status[repo_name] = "queued"
    
    return {"message": f"Analysis started for {repo_name}.", "repo_name": repo_name}

@router.get("/repos/{repo_name}/status")
async def get_repo_status(repo_name: str):
    status = repo_status.get(repo_name, "not_found")
    return {"repo_name": repo_name, "status": status}

@router.get("/repos/{repo_name}/files")
async def get_repo_files(repo_name: str):
    files = github_service.get_relative_files(repo_name)
    if not files:
        if repo_status.get(repo_name) == "cloning":
            return {"files": [], "message": "Repository is still cloning..."}
        if not os.path.exists(os.path.join(settings.REPOS_STORAGE_DIR, repo_name)):
            raise HTTPException(status_code=404, detail="Repository not found.")
    return {"files": files}

@router.post("/query")
async def query_repository(req: QueryRequest):
    status = repo_status.get(req.repo_name)
    if status is not None and status != "completed":
        raise HTTPException(status_code=400, detail=f"Repository is not fully processed yet. Status: {status}")
        
    try:
        answer = rag_service.query_repository(req.repo_name, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
