// Type definitions for Microsoft Agents packages
declare module '@microsoft/agents-activity' {
  export interface ActivityTypes {
    Message: string;
  }
  
  export const ActivityTypes: {
    Message: string;
  };
}

declare module '@microsoft/agents-hosting' {
  export interface MessageContent {
    content?: string;
    [key: string]: any;
  }
  
  export interface MessageContentComplex {
    type: string;
    text?: string;
    [key: string]: any;
  }
  
  export type MessageContentType = string | MessageContentComplex[];
  
  export interface Message {
    content: MessageContentType;
    [key: string]: any;
  }
  
  export interface Context {
    activity: {
      text: string;
      [key: string]: any;
    };
    sendActivity(message: any): Promise<any>;
    [key: string]: any;
  }
  
  export class MessageFactory {
    static text(text: string): Message;
    static [key: string]: any;
  }
  
  export class AgentApplicationBuilder {
    constructor();
    onConversationUpdate(event: string, handler: (context: Context) => Promise<void>): this;
    onActivity(type: string, handler: (context: Context, state: any) => Promise<void>): this;
    onMessage(event: string, handler: (context: Context) => Promise<void>): this;
    start(): Promise<void>;
    [key: string]: any;
  }
}
