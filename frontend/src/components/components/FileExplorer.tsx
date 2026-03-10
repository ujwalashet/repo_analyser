'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileCode2, ChevronRight, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileNode {
    name: string;
    type: 'file' | 'dir';
    path: string;
    children?: FileNode[];
}

interface FileExplorerProps {
    repoName: string | null;
    files: string[];
    onFileClick: (path: string) => void;
}

export function FileExplorer({ repoName, files, onFileClick }: FileExplorerProps) {
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['root']));

    if (!repoName) {
        return (
            <div className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col h-full font-mono text-sm opacity-50">
                <div className="p-4 flex items-center justify-center h-full text-neutral-600 text-center">
                    Select a repository to view its files
                </div>
            </div>
        );
    }

    // Parse flat file list into tree structure
    const buildTree = (paths: string[]): FileNode[] => {
        const root: FileNode = { name: 'root', type: 'dir', path: '', children: [] };

        paths.forEach(path => {
            const parts = path.replace(/\\/g, '/').split('/');
            let current = root;

            parts.forEach((part, i) => {
                if (i === parts.length - 1) {
                    current.children!.push({ name: part, type: 'file', path });
                } else {
                    let existing = current.children!.find(c => c.name === part && c.type === 'dir');
                    if (!existing) {
                        existing = { name: part, type: 'dir', path: parts.slice(0, i + 1).join('/'), children: [] };
                        current.children!.push(existing);
                    }
                    current = existing;
                }
            });
        });

        return root.children || [];
    };

    const tree = buildTree(files);

    const toggleDir = (path: string) => {
        setExpandedDirs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    const renderTree = (nodes: FileNode[], level = 0) => {
        return nodes.map((node, index) => {
            const isExpanded = expandedDirs.has(node.path);
            const isFile = node.type === 'file';

            return (
                <div key={`${node.path}-${index}`} className="w-full">
                    <div
                        className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 rounded-sm`}
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                        onClick={() => isFile ? onFileClick(node.path) : toggleDir(node.path)}
                    >
                        {isFile ? (
                            <FileCode2 className="w-3.5 h-3.5 text-neutral-500" />
                        ) : (
                            <div className="flex items-center gap-1">
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                        )}
                        <span className="truncate">{node.name}</span>
                    </div>

                    <AnimatePresence>
                        {!isFile && isExpanded && node.children && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                {renderTree(node.children, level + 1)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        });
    };

    return (
        <div className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col h-full font-mono text-[13px]">
            <div className="p-3 border-b border-neutral-800 text-neutral-300 font-semibold tracking-tight text-sm uppercase flex items-center justify-between">
                <span className="truncate">{repoName}</span>
            </div>
            <ScrollArea className="flex-1 p-2">
                {renderTree(tree)}
            </ScrollArea>
        </div>
    );
}
