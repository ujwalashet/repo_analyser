import os
import shutil
from git import Repo
import logging

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self, repos_storage_dir: str):
        self.repos_storage_dir = repos_storage_dir
        if not os.path.exists(self.repos_storage_dir):
            os.makedirs(self.repos_storage_dir)

    def extract_repo_name(self, repo_url: str) -> str:
        # e.g. https://github.com/fastapi/fastapi -> fastapi_fastapi
        parts = repo_url.rstrip("/").split("/")
        if len(parts) >= 2:
            return f"{parts[-2]}_{parts[-1]}"
        return "unknown_repo"

    def clone_repository(self, repo_url: str) -> str:
        repo_name = self.extract_repo_name(repo_url)
        target_dir = os.path.join(self.repos_storage_dir, repo_name)
        
        if os.path.exists(target_dir):
            logger.info(f"Repository {repo_name} already exists. Pulling latest changes...")
            repo = Repo(target_dir)
            repo.remotes.origin.pull()
        else:
            logger.info(f"Cloning {repo_url} into {target_dir}...")
            Repo.clone_from(repo_url, target_dir)
            
        return target_dir

    def get_supported_files(self, repo_dir: str) -> list[str]:
        supported_extensions = {
            ".py", ".js", ".ts", ".jsx", ".tsx",
            ".html", ".css", ".md", ".json", ".yaml", ".yml", ".toml"
        }
        
        ignore_dirs = {".git", "node_modules", "venv", "__pycache__", "build", "dist"}
        
        file_paths = []
        for root, dirs, files in os.walk(repo_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in supported_extensions:
                    file_paths.append(os.path.join(root, file))
        return file_paths

    def read_file_content(self, file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Could not read {file_path}: {e}")
            return ""

    def get_relative_files(self, repo_name: str) -> list[str]:
        target_dir = os.path.join(self.repos_storage_dir, repo_name)
        if not os.path.exists(target_dir):
            return []
            
        abs_paths = self.get_supported_files(target_dir)
        return [os.path.relpath(p, target_dir).replace('\\', '/') for p in abs_paths]
