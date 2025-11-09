export const runtime = "nodejs";

import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ===========================================
// STEP 1️⃣ — Extract visible LinkedIn post data
// ===========================================
async function fetchLinkedInPostData(url: string): Promise<{
  author: string;
  title: string;
  description: string;
  hashtags: string;
}> {
  console.log("🚀 Launching headless browser for LinkedIn...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("🌐 Navigating to LinkedIn post:", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

  // Try scrolling to load dynamic post content
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await delay(2000);
  }

  const post = await page.evaluate(() => {
    const clean = (t: string | null | undefined): string =>
      t?.replace(/\s+/g, " ").replace(/See more|...more/gi, "").trim() || "";

    // Extract author name
    const author =
      document.querySelector("span.feed-shared-actor__name")?.textContent?.trim() ||
      document.querySelector("div.update-components-actor__title span")?.textContent?.trim() ||
      "Unknown";

    // Title or metadata
    const title =
      document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      document.querySelector("title")?.textContent?.trim() ||
      "LinkedIn Post";

    // Post text extraction
    const postContainer =
      document.querySelector("div.update-components-text") ||
      document.querySelector("div.feed-shared-update-v2__description-wrapper") ||
      document.body;

    let description = "";
    if (postContainer) {
      const walker = document.createTreeWalker(postContainer, NodeFilter.SHOW_TEXT, null);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = (node.textContent || "").trim();
        if (text && text.length > 2) description += text + " ";
      }
    }

    // Extract hashtags
    const hashtags = Array.from(document.querySelectorAll("a[href*='/feed/hashtag/']"))
      .map((a) => a.textContent?.trim())
      .filter(Boolean)
      .join(" ");

    return {
      author,
      title: clean(title),
      description: clean(description),
      hashtags,
    };
  });

  await browser.close();
  return post;
}

// ===========================================
// STEP 2️⃣ — Summarize LinkedIn post with Gemini
// ===========================================
async function summarizeWithGemini(data: {
  author: string;
  title: string;
  description: string;
  hashtags: string;
}): Promise<string> {
  console.log("🧠 Summarizing LinkedIn post with Gemini...");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a professional summarizer. Summarize this LinkedIn post in **2–3 sentences**.
Capture the key idea, purpose, and context (professional, technical, or motivational tone).
Exclude UI or login details. Focus only on what the post *communicates*.

Author: ${data.author}
Title: ${data.title}
Content: ${data.description}
Hashtags: ${data.hashtags}
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ===========================================
// STEP 3️⃣ — Combined Export Function
// ===========================================
export async function extractLinkedInSummary(url: string): Promise<string> {
  try {
    console.log("🔍 Extracting LinkedIn summary for:", url);
    const post = await fetchLinkedInPostData(url);

    if (!post.description || post.description.length < 20) {
      console.warn("⚠️ No meaningful post content found.");
      return "⚠️ Unable to summarize — LinkedIn post content not accessible or too short.";
    }

    const summary = await summarizeWithGemini(post);
    console.log("✅ LinkedIn summary generated successfully!");
    return summary;
  } catch (err) {
    console.error("❌ LinkedIn extractor failed:", err);
    return "⚠️ Failed to summarize LinkedIn post.";
  }
}
