// lib/extractors/index.ts
export const runtime = "nodejs"; // ✅ ensures Node runtime (not Edge)

// ✅ Import specific extractors
import { extractYouTubeSummary } from "./youtubeExtractor";
import { extractXSummary } from "./xExtractor";
import { extractLinkedInSummary } from "./linkedinExtractor";
import { extractInstagramSummary } from "./instagramExtractor";
import { extractGitHubSummary } from "./githubExtractor";

/**
 * Chooses the correct content extractor based on the URL.
 * Each extractor generates a short, AI-processed summary.
 */
export async function extractSummary(url: string): Promise<string> {
  const lower = url.toLowerCase();

  try {
    // 🎥 YouTube
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      console.log("🧩 Using YouTube extractor for:", url);
      return await extractYouTubeSummary(url);
    }

    // 🐦 X / Twitter
    if (lower.includes("twitter.com") || lower.includes("x.com")) {
      console.log("🧩 Using X extractor for:", url);
      return await extractXSummary(url);
    }

    // 📸 Instagram
    if (lower.includes("instagram.com")) {
      console.log("🧩 Using Instagram extractor for:", url);
      return await extractInstagramSummary(url);
    }

    // 💼 LinkedIn
    if (lower.includes("linkedin.com")) {
      console.log("🧩 Using LinkedIn extractor for:", url);
      return await extractLinkedInSummary(url);
    }

    // 🧑‍💻 GitHub
    if (lower.includes("github.com")) {
      console.log("🧩 Using GitHub extractor for:", url);
      return await extractGitHubSummary(url);
    }

    // 🌐 Default
    console.warn("⚠️ No extractor found for:", url);
    return "Generic link – no specialized extractor available yet.";
  } catch (err: any) {
    console.error("❌ Extractor failed for URL:", url, "\nError:", err);
    return "⚠️ Failed to generate summary for this URL.";
  }
}
