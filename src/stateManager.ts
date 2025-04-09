import * as vscode from 'vscode';

export class StateManager {
    private context: vscode.ExtensionContext;
    private abortControllers: Map<string, AbortController> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    private _config: any;
    public get config() {
        return this._config;
    }
    public set config(cfg: any) {
        this._config = cfg;
    }

    public setContext(key: string, value: any) {
        vscode.commands.executeCommand('setContext', key, value);
    }

    public getAbortController(requestId: string): AbortController {
        let controller = this.abortControllers.get(requestId);
        if (!controller) {
            controller = new AbortController();
            this.abortControllers.set(requestId, controller);
        }
        return controller;
    }

    public clearAbortController(requestId: string) {
        this.abortControllers.delete(requestId);
    }
}