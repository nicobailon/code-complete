import fetch, { RequestInit } from 'node-fetch';
import AbortController from 'abort-controller';
import { ExtensionConfig } from './config';
import { StateManager } from './stateManager';

export class LLMService {
    private apiKey: string | undefined;
    private config: ExtensionConfig;
    private stateManager: StateManager;

    constructor(apiKey: string | undefined, config: ExtensionConfig, stateManager: StateManager) {
        this.apiKey = apiKey;
        this.config = config;
        this.stateManager = stateManager;
    }

    public async callDeepSeekApiFimCompletion(prompt: string, suffix: string, signal: AbortSignal): Promise<string | null> {
        if (!this.apiKey) {
            return null;
        }

        const url = 'https://api.deepseek.com/beta/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        const body = {
            model: this.config.model,
            prompt: prompt,
            suffix: suffix,
            max_tokens: this.config.maxTokens,
            temperature: 0.2,
            top_p: 0.95,
            n: 1,
            stop: null,
            stream: false
        };

        const requestOptions: RequestInit = {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal
        };

        try {
            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                console.error(`DeepSeek API error: ${response.status} ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            if (data && data.choices && data.choices.length > 0) {
                return data.choices[0].text;
            }
            return null;
        } catch (error) {
            if ((error as any).name === 'AbortError') {
                console.log('DeepSeek API request aborted');
            } else {
                console.error('DeepSeek API request failed', error);
            }
            return null;
        }
    }
}