# DeepSeek Completer VS Code Extension

## Description

This VS Code extension provides AI-powered code completion suggestions using the DeepSeek AI API. It aims to enhance the coding experience by offering multi-line completions informed by both the current file context and optional analysis of the broader project.

This version is based on the technical plan `technical-plan-vscode-llm-completer-v1.7.md`, incorporating Phase 0/1 (Foundation &amp; Enhanced Inline Completion) and Phase 4 (Project-Wide Context). The experimental "Next-Action Prediction" (NES) feature (Phase 2/3) was investigated but found to be infeasible with current API capabilities for structured output and is therefore **not included**.

## Features

*   **Multi-line Inline Completions:** Generates code suggestions displayed as "ghost text" directly in the editor.
*   **Enhanced Context:** Utilizes configurable context windows (lines above/below, character limits) from the current file to improve suggestion relevance.
*   **Project-Wide Context (Optional):** Can analyze related files in the workspace in the background to provide more contextually aware suggestions. This feature can be enabled/disabled in settings.
*   **DeepSeek API Integration:** Leverages the `deepseek-coder` model (configurable) for code generation.
*   **Secure API Key Handling:** Uses VS Code's built-in `SecretStorage` to securely store your DeepSeek API key.
*   **Basic Tab Re-trigger:** Accepting an inline suggestion via Tab can trigger a request for subsequent suggestions.
*   **Configurable:** Various aspects like model, timeouts, context size, and feature toggles can be configured via VS Code settings.

## Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (usually included with Node.js)
*   [Visual Studio Code](https://code.visualstudio.com/)
*   A DeepSeek AI API Key ([Get one here](https://platform.deepseek.com/))

## Installation & Running for Development

1.  **Clone the repository** (if applicable) or ensure you have the code locally.
2.  **Open the project folder** in VS Code:
    ```bash
    code .
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the extension:**
    *   Press `F5` or go to `Run > Start Debugging`.
    *   This will compile the extension and open a new VS Code window (the "Extension Development Host") with the `deepseek-completer` extension loaded and running.

## Configuration

### Setting the API Key

Before the extension can provide suggestions, you need to securely store your DeepSeek API key:

1.  In the **Extension Development Host** window (the one that opened after pressing `F5`), open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2.  Type `DeepSeek: Set API Key` and select the command.
3.  Paste your DeepSeek API key when prompted and press Enter.

The key will be stored securely using VS Code's `SecretStorage`.

### Extension Settings

You can configure the extension's behavior via VS Code settings (File > Preferences > Settings, or modify your `settings.json`). Search for "deepseek-completer" to find available options, including:

*   `deepseek-completer.model`: The DeepSeek model to use (default: `deepseek-coder`).
*   `deepseek-completer.requestTimeout`: API request timeout.
*   `deepseek-completer.debounceDelay`: Delay before triggering completion.
*   `deepseek-completer.enableInlineCompletion`: Toggle inline completions (default: `true`).
*   `deepseek-completer.enableProjectContext`: Toggle project-wide context analysis (default: `false`).
*   Context settings (`contextLinesAbove`, `contextMaxPromptChars`, etc.).
*   Project context settings (`projectScanDepth`, `projectIncludePatterns`, etc.).

## Usage & Testing

1.  Ensure the extension is running in the Extension Development Host window (see "Installation & Running").
2.  Make sure you have set your API key (see "Configuration").
3.  Open a code file in a supported language (e.g., TypeScript, Python - check `activationEvents` in `package.json`).
4.  Start typing code. Pause for a moment (longer than the `debounceDelay` setting).
5.  **Verify Inline Suggestions:** If the API call is successful, you should see a code suggestion appear as grayed-out "ghost text" inline.
6.  **Accept Suggestion:** Press `Tab` to accept the suggestion. The code should be inserted.
7.  **Test Re-trigger:** After accepting, pause again. The extension might automatically trigger another suggestion based on the newly inserted code (basic re-trigger).
8.  **Test Project Context (Optional):**
    *   Enable `deepseek-completer.enableProjectContext` in settings.
    *   Reload the Extension Development Host window (`Developer: Reload Window` command).
    *   Open a project with multiple related files (e.g., a TypeScript project with imports between files).
    *   Make edits in one file.
    *   Go to another related file and try triggering completions. Observe if the suggestions seem more relevant due to the context from the other file. (Note: Project indexing happens in the background and might take some time initially).
9.  **Check Status/Errors:** Look at the VS Code status bar for messages from the extension (e.g., loading status, errors). Check the Output panel (`View > Output`) and select "DeepSeek Completer" from the dropdown for more detailed logs.

## Known Issues / Limitations

*   **NES Feature:** The planned "Next-Action Prediction" feature was found to be infeasible and is not included.
*   **Project Context Performance:** Background indexing for project context might consume resources, especially on large projects. Performance depends on configuration and project size.
*   **Suggestion Quality:** Suggestion relevance and quality depend on the DeepSeek model, context provided, and prompt engineering.