import "dotenv/config";
import fetch from "node-fetch";

const ENDPOINT =
  "https://open.bigmodel.cn/api/paas/v4/chat/completions";

export async function callZAI(prompt) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ZAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "glm-4.7",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Z.ai error ${response.status}: ${text}`);
  }

  const data = JSON.parse(text);
  return data.choices[0].message.content;
}

