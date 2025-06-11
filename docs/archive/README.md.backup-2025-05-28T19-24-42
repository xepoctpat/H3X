# Hexperiment Labs SIR Control Interface - Microsoft 365 Agents Implementation

This SIR (Super Intelligent Regulator) Control Interface demonstrates advanced AI system management using the [Microsoft 365 Agents SDK](https://github.com/Microsoft/Agents). The SIR agent provides environmental analysis, simulation control, and AI assistant generation capabilities.

## 🌟 Features

- **Environmental Analysis** - Real-time analysis of environmental conditions and AI system status
- **Simulation Control** - Advanced simulation management and experimental control systems
- **AI Assistant Generation** - Dynamic creation and deployment of specialized AI assistants
- **Monitoring System** - Continuous monitoring of environmental parameters with real-life standards
- **Human Supervision** - Request and process human-supervised confirmation for critical operations
- **Adaptive Cards** - Beautiful, interactive responses with SIR-style formatting
- **Date/Time Tools** - Intelligent temporal analysis for system operations
- **Multiple Deployment Options** - Test locally, in playground, or deploy to Teams/Azure
- **No External Dependencies** - Can operate without OpenAI dependency (Microsoft SDK only version)

## 📋 Available Versions

This SIR Control Interface has two implementation options:

### 1. Standard Version (with OpenAI)
- Uses LangChain integration with OpenAI GPT models
- Requires an OpenAI API key
- Provides advanced reasoning capabilities

### 2. No-OpenAI Version
- Uses only Microsoft SDK Agents (no external AI dependencies)
- No API key required
- Implements real-life environment creation standards
- Includes monitoring and human-supervised confirmation scenarios
- Based on Hexperiment Labs framework from provided PDFs

## 🚀 Deployment Options

This SIR Control Interface can run in several environments:

1. **Microsoft 365 Agents Playground** - Browser-based testing (no Teams required)
2. **Microsoft Teams** - Full Teams integration with channels and chats
3. **Azure Bot Service** - Deploy as a standalone SIR service
4. **Local Development** - Direct Express.js server for SIR testing

Note: The SIR system works best with newer OpenAI models like gpt-4o-mini that support reliable JSON output for complex environmental analysis.

## Get started with the template

> **Prerequisites**
>
> To run the template in your local dev machine, you will need:
>
> - [Node.js](https://nodejs.org/), supported versions: 18, 20, 22.
> - [Microsoft 365 Agents Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) latest version or [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli).
> - An account with [OpenAI](https://platform.openai.com/).

> For local debugging using Microsoft 365 Agents Toolkit CLI, you need to do some extra steps described in [Set up your Microsoft 365 Agents Toolkit CLI for local debugging](https://aka.ms/teamsfx-cli-debugging).

1. First, select the Microsoft 365 Agents Toolkit icon on the left in the VS Code toolbar.
1. In file *env/.env.playground.user*, fill in your OpenAI key `SECRET_OPENAI_API_KEY=<your-key>`.
1. Press F5 to start debugging which launches the SIR Control Interface in Microsoft 365 Agents Playground using a web browser. Select `Debug in Microsoft 365 Agents Playground`.
1. You can send SIR commands like "Analyze environmental conditions" or "What is the status of the SIR system?" to interact with the interface.

**Congratulations**! You are running the SIR Control Interface that can now provide environmental analysis and simulation control through Microsoft 365 Agents Playground.

## What's included in the template

| Folder       | Contents                                            |
| - | - |
| `.vscode`    | VSCode files for debugging                          |
| `appPackage` | Templates for the application manifest        |
| `env`        | Environment files                                   |
| `infra`      | Templates for provisioning Azure resources          |
| `src`        | The source code for the application                 |

The following files can be customized and demonstrate an example implementation to get you started.

| File                                 | Contents                                           |
| - | - |
|`src/index.js`| Sets up the SIR Control Interface server.|
|`src/tools/*.js`| SIR tools for environmental analysis and simulation control.|
|`src/agent.js`| Handles business logic for the SIR Control Interface.|

The following are Microsoft 365 Agents Toolkit specific project files. You can [visit a complete guide on Github](https://github.com/OfficeDev/TeamsFx/wiki/Teams-Toolkit-Visual-Studio-Code-v5-Guide#overview) to understand how Microsoft 365 Agents Toolkit works.

| File                                 | Contents                                           |
| - | - |
|`m365agents.yml`|This is the main Microsoft 365 Agents Toolkit project file. The project file defines two primary things:  Properties and configuration Stage definitions. |
|`m365agents.local.yml`|This overrides `m365agents.yml` with actions that enable local execution and debugging.|
|`m365agents.playground.yml`| This overrides `m365agents.yml` with actions that enable local execution and debugging in Microsoft 365 Agents Playground.|

## Additional information and references

- [Microsoft 365 Agents Toolkit Documentations](https://docs.microsoft.com/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli)
- [Microsoft 365 Agents Toolkit Samples](https://github.com/OfficeDev/TeamsFx-Samples)

## Known issue

- The SIR Control Interface is currently not working in any Teams group chats or Teams channels when the stream response is enabled.
