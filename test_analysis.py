import asyncio
import os
import sys

# Add the app directory to the path so we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.services.github_service import GitHubService
from app.services.rag_service import RAGService
from app.core.config import settings

def test_analysis():
    print("Testing repository analysis...")
    github_service = GitHubService(settings.REPOS_STORAGE_DIR)
    rag_service = RAGService()
    
    repo_url = "https://github.com/samuelcolvin/pydantic-core"  # A relatively small repo or part of one
    repo_name = github_service.extract_repo_name(repo_url)
    
    try:
        print(f"Cloning {repo_url}...")
        repo_dir = github_service.clone_repository(repo_url)
        print("Cloned successfully.")
        
        print(f"Parsing files...")
        files = github_service.get_supported_files(repo_dir)
        print(f"Found {len(files)} files.")
        
        if not files:
            print("No files found!")
            return
            
        print("Reading content...")
        documents = []
        for i, file_path in enumerate(files[:5]): # only process 5 files for speed
            content = github_service.read_file_content(file_path)
            if content:
                rel_path = os.path.relpath(file_path, repo_dir)
                documents.append({"file_path": rel_path, "content": content})
                print(f"Read {rel_path}")
                
        print("Embedding documents...")
        rag_service.index_documents(repo_name, documents)
        print("Success!")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")

if __name__ == "__main__":
    test_analysis()
