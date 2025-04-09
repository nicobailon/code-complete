import * as vscode from 'vscode';

export interface ExtensionConfig {
    model: string;
    maxTokens: number;
    requestTimeout: number;
    debounceDelay: number;
    showErrors: boolean;
    enableInlineCompletion: boolean;
    contextLinesAbove: number;
    contextLinesBelow: number;
    contextMaxPromptChars: number;
    contextMaxSuffixChars: number;

    // Phase 4 project context settings
    enableProjectContext: boolean;
    projectScanDepth: number;
    projectIncludePatterns: string[];
    projectExcludePatterns: string[];
    maxProjectContextFiles: number;
    maxProjectContextSize: number;
}

export function loadConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('deepseek-completer');
    return {
        model: config.get('model', 'deepseek-coder'),
        maxTokens: config.get('maxTokens', 256),
        requestTimeout: config.get('requestTimeout', 8000),
        debounceDelay: config.get('debounceDelay', 300),
        showErrors: config.get('showErrors', true),
        enableInlineCompletion: config.get('enableInlineCompletion', true),
        contextLinesAbove: config.get('contextLinesAbove', 50),
        contextLinesBelow: config.get('contextLinesBelow', 20),
        contextMaxPromptChars: config.get('contextMaxPromptChars', 8000),
        contextMaxSuffixChars: config.get('contextMaxSuffixChars', 4000),

        enableProjectContext: config.get('enableProjectContext', false),
        projectScanDepth: config.get('projectScanDepth', 3),
        projectIncludePatterns: config.get('projectIncludePatterns', ['**/*.ts', '**/*.js', '**/*.py']),
        projectExcludePatterns: config.get('projectExcludePatterns', ['**/node_modules/**', '**/.git/**']),
        maxProjectContextFiles: config.get('maxProjectContextFiles', 5),
        maxProjectContextSize: config.get('maxProjectContextSize', 8000)
    };
}

const SECRET_KEY = 'deepseek-completer-api-key';

export async function saveApiKey(secretStorage: vscode.SecretStorage, apiKey: string): Promise<void> {
    await secretStorage.store(SECRET_KEY, apiKey);
}

export async function getApiKey(secretStorage: vscode.SecretStorage): Promise<string | undefined> {
    return await secretStorage.get(SECRET_KEY);
}

export async function deleteApiKey(secretStorage: vscode.SecretStorage): Promise<void> {
    await secretStorage.delete(SECRET_KEY);
}