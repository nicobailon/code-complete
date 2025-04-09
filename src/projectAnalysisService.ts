import * as vscode from 'vscode';

export class ProjectAnalysisService {
    private index: Map<string, any> = new Map();
    private watchers: vscode.FileSystemWatcher[] = [];
    private initialized = false;

    async initialize(config: any): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;

        // Scan workspace folders
        const folders = vscode.workspace.workspaceFolders || [];
        for (const folder of folders) {
            this.scanFolder(folder.uri, config);
        }

        // Setup file watchers
        this.setupWatchers(config);
    }

    private async scanFolder(folderUri: vscode.Uri, config: any) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: 'DeepSeek: Indexing project files...',
            cancellable: false
        }, async (progress) => {
            try {
                const files = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(folderUri.fsPath, '**/*'),
                    '{**/node_modules/**,**/.git/**}',
                    10000
                );
                for (const file of files) {
                    await this.indexFile(file, config);
                }
            } catch (e) {
                console.error('ProjectAnalysisService scan error', e);
            }
        });
    }

    async indexFile(uri: vscode.Uri, config: any): Promise<void> {
        try {
            const doc = await vscode.workspace.openTextDocument(uri);
            const text = doc.getText();

            const imports = Array.from(text.matchAll(/import\s.+from\s['"](.+)['"]/g)).map(m => m[1]);
            const symbols = Array.from(text.matchAll(/(function|class|interface|type)\s+([a-zA-Z0-9_]+)/g)).map(m => m[2]);

            this.index.set(uri.toString(), { uri, imports, symbols, snippet: text.slice(0, 1000) });
        } catch (e) {
            console.error('Indexing failed for', uri.toString(), e);
        }
    }

    setupWatchers(config: any) {
        const folders = vscode.workspace.workspaceFolders || [];
        for (const folder of folders) {
            const watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(folder.uri.fsPath, '**/*')
            );

            const reindex = (uri: vscode.Uri) => {
                this.indexFile(uri, config);
            };

            watcher.onDidChange(reindex);
            watcher.onDidCreate(reindex);
            watcher.onDidDelete((uri) => this.index.delete(uri.toString()));

            this.watchers.push(watcher);
        }
    }

    getRelevantContext(document: vscode.TextDocument, position: vscode.Position, config: any): string[] {
        const snippets: string[] = [];

        for (const { snippet } of this.index.values()) {
            snippets.push(snippet);
            if (snippets.length >= (config.maxProjectContextFiles || 5)) break;
        }

        return snippets;
    }

    getStats(): string {
        return `Indexed files: ${this.index.size}`;
    }

    dispose() {
        for (const watcher of this.watchers) {
            watcher.dispose();
        }
        this.watchers = [];
        this.index.clear();
        this.initialized = false;
    }
}