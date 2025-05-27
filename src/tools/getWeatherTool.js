const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const getWeatherTool = tool(
  async ({ date, location }) => {
    console.log("************Getting random weather for", date, location);
    const min = -22;
    const max = 55;
    return {
      Date: date,
      TemperatureC: Math.floor(Math.random() * (max - min + 1)) + min,
    };
  },
  {
    name: "GetWeather",
    description:
      "Retrieve the weather forecast for a specific date. This is a placeholder for a real implementation and currently only returns a random temperature. This would typically call a weather service API.",
    schema: z.object({
      date: z.string(),
      location: z.string(),
    }),
  }
);

module.exports = {
  getWeatherTool,
};
