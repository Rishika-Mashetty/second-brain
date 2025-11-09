// lib/extractors/youtubeExtractor.ts
import fs from "fs";
import path from "path";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { spawn } from "child_process";


dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ---------------- Helpers ----------------
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&#39;": "'",
  "&quot;": '"'
};
function decodeEntities(s: string): string {
  return s.replace(/&amp;|&lt;|&gt;|&#39;|&quot;/g, (m) => HTML_ENTITIES[m] || m);
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /v=([0-9A-Za-z_-]{11})/,
    /youtu\.be\/([0-9A-Za-z_-]{11})/,
    /shorts\/([0-9A-Za-z_-]{11})/,
    /embed\/([0-9A-Za-z_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

// ---------------- Fetch title & description ----------------
async function fetchTitleAndDescription(videoId: string) {
  try {
    const { data: html } = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    // Safe parse for title and description
    const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (match) {
      const json = JSON.parse(match[1]);
      return {
        title: decodeEntities(json?.videoDetails?.title || "Untitled"),
        description: decodeEntities(json?.videoDetails?.shortDescription || ""),
      };
    }
    return { title: "Unknown", description: "Unavailable" };
  } catch {
    return { title: "Unknown", description: "Unavailable" };
  }
}

// ---------------- Try to get transcript via YouTube captions ----------------
async function fetchTranscriptViaTimedText(videoId: string): Promise<string | undefined> {
  try {
    const listUrl = `https://video.google.com/timedtext?type=list&v=${videoId}&hl=en`;
    const { data: xml } = await axios.get(listUrl);
    const parsed = await parseStringPromise(xml);
    const tracks = parsed?.transcript_list?.track ?? [];
    if (!tracks.length) return undefined;

    const track =
      tracks.find((t: any) => t.$.lang_code.startsWith("en")) ||
      tracks.find((t: any) => t.$.kind === "asr") ||
      tracks[0];

    const lang = track.$.lang_code;
    const resp = await axios.get(`https://video.google.com/timedtext?lang=${lang}&v=${videoId}`);
    const parsedTrack = await parseStringPromise(resp.data);
    const lines = parsedTrack?.transcript?.text ?? [];
    return lines.map((t: any) => t._ || "").join(" ").trim();
  } catch {
    return undefined;
  }
}

// ---------------- Download audio (.webm) ----------------
async function downloadAudio(videoUrl: string, videoId: string): Promise<string> {
  const outPath = path.resolve(`./tmp/audio_${videoId}.webm`);
  console.log("🎧 Downloading .webm audio using global yt-dlp...");

  return new Promise((resolve, reject) => {
    const yt = spawn("yt-dlp", [
      "-f", "bestaudio[ext=webm]",
      "-o", outPath,
      videoUrl,
      "--no-check-certificates",
      "--no-warnings"
    ]);

    yt.stdout.on("data", (data) => process.stdout.write(data.toString()));
    yt.stderr.on("data", (data) => process.stderr.write(data.toString()));

    yt.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath)) {
        console.log("✅ Audio downloaded:", outPath);
        resolve(outPath);
      } else {
        reject(new Error(`yt-dlp failed with code ${code}`));
      }
    });
  });
}


// ---------------- Transcribe & summarize with Gemini ----------------
async function transcribeWithGemini(audioPath: string, meta: any): Promise<string> {
  console.log("🧠 Sending audio to Gemini for transcription + summarization...");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const fileBuffer = fs.readFileSync(audioPath);

  const prompt = `
You are an AI summarizer. Transcribe this video and summarize it clearly.
Include key points and tone in under 2 paragraphs.

Video Info:
Title: ${meta.title}
Description: ${meta.description}
`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "audio/webm",
        data: fileBuffer.toString("base64"),
      },
    },
    { text: prompt },
  ]);

  return result.response.text();
}

// ---------------- Summarize everything to 2-3 lines ----------------
async function summarizeFinalWithGemini(fullText: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`
Summarize the following video transcription and metadata into 2–3 concise sentences highlighting the key theme and value:
${fullText}
`);
  return result.response.text();
}

// ---------------- Main extractor function ----------------
export async function extractYouTubeSummary(videoUrl: string): Promise<string> {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");

    console.log("🎬 Fetching metadata...");
    const meta = await fetchTitleAndDescription(videoId);

    console.log("🔍 Checking captions...");
    const captions = await fetchTranscriptViaTimedText(videoId);

    let transcriptText: string;
    if (captions) {
      console.log("✅ Using captions for summarization");
      transcriptText = captions;
    } else {
      console.log("⚠️ No captions found. Downloading and transcribing...");
      const audioPath = await downloadAudio(videoUrl, videoId);
      transcriptText = await transcribeWithGemini(audioPath, meta);
      fs.unlinkSync(audioPath); // Cleanup temp file
    }

    // Combine everything for a final concise summary
    const fullText = `
🎬 Title: ${meta.title}
📝 Description: ${meta.description}
🧾 Transcript / Captions:
${transcriptText}
    `;

    const finalSummary = await summarizeFinalWithGemini(fullText);

    console.log("✅ Summary ready.");
    return finalSummary;
  } catch (err) {
    console.error("❌ YouTube extractor failed:", err);
    throw err;
  }
}