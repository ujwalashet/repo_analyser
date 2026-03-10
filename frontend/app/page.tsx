'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FileExplorer } from '@/components/FileExplorer';
import { ChatInterface } from '@/components/ChatInterface';

interface RepoStatusResponse {
    repo_name: string;
    status: string;
}

export default function Home() {
    const [repos, setRepos] = useState<string[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [repoFiles, setRepoFiles] = useState<string[]>([]);
    const [isAddingRepo, setIsAddingRepo] = useState(false);

    // In a real app, you would fetch these from the backend. 
    // For demo purposes and depending on the backend implementation, we simulate fetching files:
    const fetchRepoData = async (repoName: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/repos/${repoName}/files`);
            const data = await res.json();
            if (res.ok && data.files) {
                setRepoFiles(data.files);
            } else {
                setRepoFiles([]);
            }
        } catch (error) {
            console.error('Failed to fetch repo files:', error);
            setRepoFiles([]);
        }
    };

    const handleSelectRepo = async (repo: string) => {
        setSelectedRepo(repo);
        await fetchRepoData(repo);
    };

    const handleAddRepo = async (url: string) => {
        setIsAddingRepo(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/repos/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            const data = await res.json();

            if (data.repo_name) {
                let isCompleted = false;
                while (!isCompleted) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const statusRes = await fetch(`http://localhost:8000/api/v1/repos/${data.repo_name}/status`);
                    const statusData = await statusRes.json();

                    if (statusData.status === 'completed') {
                        isCompleted = true;
                    } else if (statusData.status.startsWith('error')) {
                        throw new Error(statusData.status);
                    }
                }

                if (!repos.includes(data.repo_name)) {
                    setRepos(prev => [...prev, data.repo_name]);
                }
                await handleSelectRepo(data.repo_name);
            }
        } catch (error) {
            console.error('Failed to add repo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to connect to backend or process repository: ${errorMessage}`);
        } finally {
            setIsAddingRepo(false);
        }
    };

    const handleFileClick = (path: string) => {
        // File clicking could load file contents in the chat or a side panel
        console.log('Clicked file:', path);
    };

    const handleSendMessage = async (msg: string): Promise<string> => {
        const res = await fetch(`http://localhost:8000/api/v1/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                repo_name: selectedRepo,
                question: msg
            })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Failed to query repository');
        }
        return data.answer;
    };

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-200 overflow-hidden font-sans">
            <Sidebar
                repos={repos}
                selectedRepo={selectedRepo}
                onSelectRepo={handleSelectRepo}
                onAddRepo={handleAddRepo}
                isLoading={isAddingRepo}
            />
            <FileExplorer
                repoName={selectedRepo}
                files={repoFiles}
                onFileClick={handleFileClick}
            />
            <ChatInterface
                repoName={selectedRepo}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}
