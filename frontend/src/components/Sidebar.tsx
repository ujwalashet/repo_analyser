'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Plus, Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  repos: string[];
  selectedRepo: string | null;
  onSelectRepo: (repo: string) => void;
  onAddRepo: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function Sidebar({ repos, selectedRepo, onSelectRepo, onAddRepo, isLoading }: SidebarProps) {
  const [newRepoUrl, setNewRepoUrl] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl) return;
    await onAddRepo(newRepoUrl);
    setNewRepoUrl('');
  };

  return (
    <div className="w-72 bg-neutral-950 border-r border-neutral-800 text-neutral-300 flex flex-col h-screen">
      <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Github className="w-5 h-5" />
        </div>
        <h1 className="font-semibold text-white tracking-tight text-lg">Repo Analysis</h1>
      </div>

      <div className="p-4 border-b border-neutral-800">
        <form onSubmit={handleAddSubmit} className="flex gap-2">
          <Input 
            placeholder="GitHub URL..." 
            value={newRepoUrl}
            onChange={(e) => setNewRepoUrl(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-sm h-9"
          />
          <Button type="submit" size="icon" className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Repositories
        </div>
        <div className="space-y-1 px-2">
          {repos.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-600">
              No repositories added yet. Paste a link above.
            </div>
          ) : (
            repos.map((repo) => (
              <button
                key={repo}
                onClick={() => onSelectRepo(repo)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  selectedRepo === repo 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'hover:bg-neutral-900 hover:text-white text-neutral-400'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span className="truncate text-left">{repo}</span>
              </button>
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-800 text-xs text-neutral-600 text-center">
        Powered by Gemini Pro
      </div>
    </div>
  );
}

