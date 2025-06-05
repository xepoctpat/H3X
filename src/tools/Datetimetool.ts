// No-OpenAI version - Native implementation without LangChain

const dateTool = {
  name: 'Date',
  description: 'Get the current date',
  execute: async () => {
    const d = new Date();
    console.log('************Getting the date', d);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  },
};

const todayTool = {
  name: 'Today',
  description: 'Get the current date',
  execute: async () => {
    return new Date().toDateString();
  },
};

const nowTool = {
  name: 'Now',
  description: 'Get the current date and time in the local time zone',
  execute: async () => {
    return new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  },
};

export { dateTool, todayTool, nowTool };
