# Weather Agent - Microsoft 365 Agents Template

This weather agent template demonstrates how to build intelligent conversational AI using the [Microsoft 365 Agents SDK](https://github.com/Microsoft/Agents) with LangChain integration. The agent provides weather forecasts with beautiful adaptive card responses and can be deployed in multiple environments.

## 🌟 Features

- **Smart Weather Forecasting** - Ask about weather for any date and location
- **LangChain Integration** - Advanced AI reasoning with OpenAI GPT models
- **Adaptive Cards** - Beautiful, interactive responses in Teams-style format
- **Date/Time Tools** - Intelligent date parsing and calculations
- **Multiple Deployment Options** - Test locally, in playground, or deploy to Teams/Azure
- **Memory Management** - Conversation context retention across interactions

## 🚀 Deployment Options

This agent can run in several environments:

1. **Microsoft 365 Agents Playground** - Browser-based testing (no Teams required)
2. **Microsoft Teams** - Full Teams integration with channels and chats
3. **Azure Bot Service** - Deploy as a standalone bot service
4. **Local Development** - Direct Express.js server for testing

Note: This template works best with newer OpenAI models like gpt-4o-mini that support reliable JSON output.

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
1. Press F5 to start debugging which launches your agent in Microsoft 365 Agents Playground using a web browser. Select `Debug in Microsoft 365 Agents Playground`.
1. You can send any message to get a response from the agent.

**Congratulations**! You are running an agent that can now interact with users in Microsoft 365 Agents Playground.


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
|`src/index.js`| Sets up the agent server.|
|`src/tools/*.js`| Tools that can be utilized by model.|
|`src/agent.js`| Handles business logics for the Weather Agent.|

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
- The agent is currently not working in any Teams group chats or Teams channels when the stream response is enabled.
