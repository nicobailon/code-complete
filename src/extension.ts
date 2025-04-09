// Entry point for DeepSeek Completer extension
import * as vscode from 'vscode';
import { loadConfig, saveApiKey, getApiKey } from './config.js';
import { StateManager } from './stateManager.js';
import { LLMService } from './llmService.js';
import { ContextGatherer } from './contextGatherer.js';
import { InlineCompletionProvider } from './inlineProvider.js';
import { ProjectAnalysisService } from './projectAnalysisService.js';

export async function activate(context: vscode.ExtensionContext) {
    const config = loadConfig();
    const stateManager = new StateManager(context);

    context.subscriptions.push(
        vscode.commands.registerCommand('deepseek-completer.setApiKey', async () => {
            const apiKey = await vscode.window.showInputBox({ prompt: 'Enter your DeepSeek API Key', ignoreFocusOut: true, password: true });
            if (apiKey) {
                await saveApiKey(context.secrets, apiKey);
                vscode.window.showInformationMessage('DeepSeek API Key saved securely.');
            }
        })
    );

    const apiKey = await getApiKey(context.secrets);
    if (!apiKey) {
        vscode.window.showWarningMessage('DeepSeek API Key not set. Use "DeepSeek: Set API Key" command.');
    }

    const llmService = new LLMService(apiKey, config, stateManager);
    const contextGatherer = new ContextGatherer();

    let projectAnalysisService: ProjectAnalysisService | undefined = undefined;
    if (config.enableProjectContext) {
        projectAnalysisService = new ProjectAnalysisService();
        projectAnalysisService.initialize(config); // async, fire and forget
    }

    const provider = new InlineCompletionProvider(llmService, contextGatherer, stateManager, config, projectAnalysisService);
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            [{ scheme: 'file' }, { scheme: 'untitled' }],
            provider
        )
    );

    vscode.window.setStatusBarMessage('DeepSeek Completer activated', 3000);

    context.subscriptions.push(
        vscode.commands.registerCommand('deepseek-completer.showPerformanceStats', () => {
            if (projectAnalysisService) {
                const stats = projectAnalysisService.getStats();
                vscode.window.showInformationMessage(`DeepSeek Project Context Stats: ${stats}`);
            } else {
                vscode.window.showInformationMessage('DeepSeek Project Context is disabled.');
            }
        })
    );
}

export function deactivate() {}