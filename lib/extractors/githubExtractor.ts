// lib/extractors/githubExtractor.ts
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// 💤 Utility: wait for a few ms
const sleep = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

// ✂️ Clamp large text to prevent token overflow
function clampText(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "\n...[truncated]..." : s;
}

// 🔍 Parse a GitHub repo URL into owner/repo
function parseOwnerRepo(url: string): { owner: string; repo: string } {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)(?:$|\/|\?)/i);
  if (!m || !m[1] || !m[2]) throw new Error("Invalid GitHub repo URL");
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

// 📁 Convert repo tree into a visual text map
function asTree(tree: any[]): string {
  const lines: string[] = [];
  const sorted = tree.map((t: any) => t.path).sort((a, b) => a.localeCompare(b));
  for (const p of sorted) {
    const depth = (p.match(/\//g) || []).length;
    const isDir = tree.some((t: any) => t.path === p && t.type === "tree");
    const bullet = isDir ? "📁" : "📄";
    lines.push(`${"  ".repeat(depth)}${bullet} ${p}`);
  }
  return lines.join("\n");
}

// 🌐 GitHub Axios Client
const http = axios.create({
  headers: {
    "User-Agent": "SecondBrain-App",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    Accept: "application/vnd.github+json",
  },
  timeout: 30000,
});

// ==================
// 📦 Core Fetchers
// ==================
async function fetchRepoMeta(owner: string, repo: string) {
  const { data } = await http.get(`https://api.github.com/repos/${owner}/${repo}`);
  return data;
}

async function fetchReadme(owner: string, repo: string, branch: string): Promise<string> {
  const urls = [
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README`,
  ];

  for (const u of urls) {
    try {
      const { data } = await axios.get(u);
      if (typeof data === "string" && data.trim()) return data;
    } catch {}
  }
  return "";
}

async function fetchTree(owner: string, repo: string, branch: string) {
  const ref = await http.get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`);
  const sha = ref.data?.object?.sha;
  if (!sha) throw new Error("Could not resolve branch SHA");

  const commit = await http.get(`https://api.github.com/repos/${owner}/${repo}/git/commits/${sha}`);
  const treeSha = commit.data?.tree?.sha;
  if (!treeSha) throw new Error("Could not resolve tree SHA");

  const { data } = await http.get(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`
  );
  return data.tree;
}

async function fetchFileRaw(owner: string, repo: string, branch: string, filePath: string): Promise<string> {
  try {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const { data } = await axios.get(rawUrl, { timeout: 20000 });
    return typeof data === "string" ? data : JSON.stringify(data);
  } catch {
    return "";
  }
}

// ==================
// 🧠 Gemini Summarization
// ==================
async function analyzeWithGemini(payload: {
  meta: any;
  fileTreeText: string;
  readme: string;
  sampledFiles: { path: string; snippet: string }[];
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const snippets = payload.sampledFiles
    .map((f) => `---\n# ${f.path}\n${f.snippet}`)
    .join("\n\n");

  const prompt = `
You are a senior developer summarizing a GitHub repository.

Provide:
1️⃣ A short 2–3 line summary of the repo purpose and functionality.
2️⃣ List key technologies and architecture insights.
3️⃣ Identify the main files or directories and their importance.

=== Repo Info ===
${payload.meta.full_name} (${payload.meta.stargazers_count}⭐)
${payload.meta.description}

=== File Tree (partial) ===
${clampText(payload.fileTreeText, 10000)}

=== README (partial) ===
${clampText(payload.readme, 8000)}

=== Code Samples (partial) ===
${clampText(snippets, 8000)}
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ==================
// 🚀 Main Export
// ==================
export async function extractGitHubSummary(url: string): Promise<string> {
  try {
    console.log("💻 Extracting GitHub summary for:", url);
    const { owner, repo } = parseOwnerRepo(url);

    const meta = await fetchRepoMeta(owner, repo);
    const tree = await fetchTree(owner, repo, meta.default_branch);
    const readme = await fetchReadme(owner, repo, meta.default_branch);

    const sampled = tree
      .filter((t: any) => t.type === "blob" && /\.(ts|js|py|md)$/.test(t.path))
      .slice(0, 5);

    const sampledFiles = [];
    for (const f of sampled) {
      const snippet = await fetchFileRaw(owner, repo, meta.default_branch, f.path);
      sampledFiles.push({ path: f.path, snippet: clampText(snippet, 4000) });
      await sleep(200);
    }

    const fileTreeText = asTree(tree);
    const summary = await analyzeWithGemini({ meta, fileTreeText, readme, sampledFiles });

    console.log("✅ GitHub summary generated successfully!");
    return summary;
  } catch (err) {
    console.error("❌ GitHub extractor failed:", err);
    return "⚠️ Failed to summarize GitHub repository.";
  }
}
