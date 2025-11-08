import { GoogleGenerativeAI } from "@google/generative-ai";
import { dbConnect } from "@/lib/mongodb"; // make sure this exists
import Post from "@/models/Post"; // your MongoDB Post model

export async function POST(req: Request) {
  try {
    const { posts, question } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ answer: "Gemini API key not configured." }),
        { status: 500 }
      );
    }

    // 🔹 Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🔹 If no posts are selected, fetch all from DB
    let postsToAnalyze = posts;
    if (!posts || posts.length === 0) {
      await dbConnect();
      postsToAnalyze = await Post.find().lean();
    }

    // 🔹 Build context from posts
    const context = postsToAnalyze
      .map((p: any) => `• ${p.comment || "No comment"} (${p.url})`)
      .join("\n\n");

    const prompt = `
You are an AI assistant that analyzes the user's saved posts and comments.

Here are the posts:
${context}

User's question:
${question}

Please provide a clear, concise, and context-aware response that summarizes or analyzes the content meaningfully.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ answer: text }), { status: 200 });
  } catch (err: any) {
    console.error("❌ Gemini API Error:", err);
    return new Response(
      JSON.stringify({
        answer:
          "⚠️ There was an issue contacting Gemini. Check your API key, model, or network.",
      }),
      { status: 500 }
    );
  }
}
