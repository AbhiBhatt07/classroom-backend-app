import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

if (!process.env.ARCJET_KEY && process.env.NODE_ENV !== "test") {
 throw new Error("Arcjet Enviroment variable is not set in .env file.");
}

const aj = arcjet({
 key: process.env.ARCJET_KEY!,
 rules: [
  shield({ mode: "LIVE" }),
  detectBot({
   mode: "LIVE",
   allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  }),
 ],
});

export default aj;