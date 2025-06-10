// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

interface ConsoleLog {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai';
import { ActivityTypes } from '@microsoft/agents-activity';
import { AgentApplicationBuilder, MessageFactory } from '@microsoft/agents-hosting';

import { dateTool } from './tools/dateTimeTool';
import { environmentSimulationTool } from './tools/environmentSimulationTool';
import { sirAnalysisTool } from './tools/sirAnalysisTool';

const sirAgent = new AgentApplicationBuilder().build();

sirAgent.onConversationUpdate('membersAdded', async (context) => {
  await context.sendActivity(
    'Welcome to the Hexperiment Labs SIR Control Interface! I am your Super Intelligent Regulator assistant, ready to help you with environment analysis, simulation control, and AI assistant generation.',
  );
});

const agentModel = new ChatOpenAI({
  apiKey: (process.env as ProcessEnv).SECRET_OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  temperature: 0,
});

const agentTools = [sirAnalysisTool, environmentSimulationTool, dateTool];
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

const sysMessage = new SystemMessage(`
You are the Hexperiment Labs Super Intelligent Regulator (SIR) Control Interface assistant.

Your primary functions:
1. Environmental Analysis - Analyze real-world environments and conditions for optimal AI assistant deployment
2. Simulation Control - Manage and monitor environment simulations for AI training
3. AI Assistant Generation - Help users understand and configure tailored AI assistants for specific environments
4. System Monitoring - Provide insights into SIR system status and operational metrics

You operate in two modes:
- PASSIVE MODE: Observation and analysis phase, gathering environmental data
- ACTIVE MODE: Generating and deploying tailored AI assistants based on simulation results

Always provide responses that are professional, technical, and focused on the SIR system capabilities.
Use adaptive cards for complex data visualization and system status reports.

Respond in JSON format with the following JSON schema, and do not use markdown in the response:

{
    "contentType": "'Text' or 'AdaptiveCard' only",
    "content": "{The content of the response, may be plain text, or JSON based adaptive card}"
}`);

sirAgent.onActivity(ActivityTypes.Message, async (context, _state) => {
  const llmResponse = await agent.invoke(
    {
      messages: [sysMessage, new HumanMessage(context.activity.text ?? '')],
    },
    {
      configurable: { thread_id: context.activity.conversation?.id ?? 'default' },
    },
  );

  const llmResponseContent = JSON.parse(
    llmResponse.messages[llmResponse.messages.length - 1].content,
  );

  if (llmResponseContent.contentType === 'Text') {
    await context.sendActivity(llmResponseContent.content);
  } else if (llmResponseContent.contentType === 'AdaptiveCard') {
    const response = MessageFactory.attachment({
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: llmResponseContent.content,
    });
    await context.sendActivity(response);
  }
});

export { sirAgent };
