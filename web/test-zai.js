import { callZAI } from "./src/ai/zaiClient.js";

(async () => {
  const res = await callZAI("Säg hej och bekräfta att API:t funkar");
  console.log(res);
})();

