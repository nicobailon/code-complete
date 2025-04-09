import * as vscode from 'vscode';
import { ExtensionConfig } from './config.js';

export class ContextGatherer {
    public getEnhancedContext(
        document: vscode.TextDocument,
        position: vscode.Position,
        config: ExtensionConfig,
        projectContextSnippets?: string[]
    ): { prompt: string; suffix: string } {
        const totalLines = document.lineCount;

        const startLine = Math.max(0, position.line - config.contextLinesAbove);
        const endLine = Math.min(totalLines - 1, position.line + config.contextLinesBelow);

        let promptLines: string[] = [];
        for (let i = startLine; i < position.line; i++) {
            promptLines.push(document.lineAt(i).text);
        }

        let suffixLines: string[] = [];
        for (let i = position.line; i <= endLine; i++) {
            suffixLines.push(document.lineAt(i).text);
        }

        let prompt = promptLines.join('\n');
        let suffix = suffixLines.join('\n');

        // Incorporate project context snippets if provided
        if (projectContextSnippets && projectContextSnippets.length > 0) {
            const projectContext = projectContextSnippets.join('\n// --- Project Context Separator ---\n');
            prompt = projectContext + '\n' + prompt;
        }

        // Truncate prompt and suffix to max chars
        if (prompt.length > config.contextMaxPromptChars) {
            prompt = prompt.slice(-config.contextMaxPromptChars);
        }
        if (suffix.length > config.contextMaxSuffixChars) {
            suffix = suffix.slice(0, config.contextMaxSuffixChars);
        }

        const languageComment = `// Language: ${document.languageId}\n`;

        return {
            prompt: languageComment + prompt,
            suffix: suffix
        };
    }
}