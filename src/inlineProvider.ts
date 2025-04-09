import * as vscode from 'vscode';
import { LLMService } from './llmService.js';
import { ContextGatherer } from './contextGatherer.js';
import { StateManager } from './stateManager.js';
import { ExtensionConfig } from './config.js';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private llmService: LLMService;
    private contextGatherer: ContextGatherer;
    private stateManager: StateManager;
    private config: ExtensionConfig;
    private projectAnalysisService?: any; // avoid import cycle, type as any

    constructor(
        llmService: LLMService,
        contextGatherer: ContextGatherer,
        stateManager: StateManager,
        config: ExtensionConfig,
        projectAnalysisService?: any
    ) {
        this.llmService = llmService;
        this.contextGatherer = contextGatherer;
        this.stateManager = stateManager;
        this.config = config;
        this.projectAnalysisService = projectAnalysisService;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionList> {
        if (!this.config.enableInlineCompletion) {
            return { items: [] };
        }

        const abortController = new AbortController();
        token.onCancellationRequested(() => abortController.abort());

        let projectContextSnippets: string[] = [];
        if (this.config.enableProjectContext && this.projectAnalysisService) {
            try {
                projectContextSnippets = this.projectAnalysisService.getRelevantContext(document, position, this.config);
            } catch (e) {
                console.error('Error getting project context', e);
            }
        }

        const { prompt, suffix } = this.contextGatherer.getEnhancedContext(document, position, this.config, projectContextSnippets);

        const completionText = await this.llmService.callDeepSeekApiFimCompletion(prompt, suffix, abortController.signal);

        if (!completionText) {
            this.stateManager.setContext('deepseek.inlineVisible', false);
            return { items: [] };
        }

        const item = new vscode.InlineCompletionItem(completionText, undefined, {
            command: 'editor.action.triggerSuggest',
            title: 'Re-trigger'
        });

        this.stateManager.setContext('deepseek.inlineVisible', true);

        return { items: [item] };
    }
}