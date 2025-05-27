const { tool } = require("@langchain/core/tools");

const dateTool = tool(
  async () => {
    const d = new Date();
    console.log("************Getting the date", d);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  },
  {
    name: "Date",
    description: "Get the current date",
  }
);

const todayTool = tool(
  async () => {
    return new Date().toDateString();
  },
  {
    name: "Today",
    description: "Get the current date",
  }
);

const nowTool = tool(
  async () => {
    return new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
  },
  {
    name: "Now",
    description: "Get the current date and time in the local time zone",
  }
);

module.exports = {
  dateTool,
  todayTool,
  nowTool,
};
