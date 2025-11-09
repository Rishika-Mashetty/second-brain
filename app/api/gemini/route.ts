import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { posts, question } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const context = posts
      .map(
        (p: any) => `
🔗 URL: ${p.url}
💬 Comment: ${p.comment || "None"}
🧾 Summary: ${p.summary || "No summary available"}
`
      )
      .join("\n---------------------\n");

    const prompt = `
You are an AI assistant helping users analyze their saved online content.

Here are the user's saved posts (summarized already):
${context}

Now, the user asks:
"${question}"

Answer comprehensively and contextually.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ answer: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    return Response.json({ answer: "⚠️ Gemini failed to respond." }, { status: 500 });
  }
}
