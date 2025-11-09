"use client";
import { useEffect, useRef } from "react";

export default function Embed({ url }: { url?: string }) {
  if (!url || url.trim() === "") {
    // 📝 If no URL, just return nothing — notes handle text separately
    return null;
  }

  const lower = url.toLowerCase();

  // ===============================
  // ✅ YouTube Embed
  // ===============================
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9\-_]+)/
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    return (
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    );
  }

  // ===============================
  // ✅ X / Twitter Embed
  // ===============================
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    const tweetIdMatch = url.match(/status\/(\d+)/);
    const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;
    const tweetRef = useRef<HTMLDivElement>(null);
    const hasRenderedRef = useRef(false);

    useEffect(() => {
      if (!tweetId || !tweetRef.current || hasRenderedRef.current) return;
      hasRenderedRef.current = true;

      const loadTwitterWidget = () => {
        (window as any).twttr?.widgets
          ?.createTweet(tweetId, tweetRef.current, {
            theme: "dark",
            align: "center",
          })
          .catch(() => {});
      };

      if (!(window as any)._twitterScriptLoaded) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.onload = () => {
          (window as any)._twitterScriptLoaded = true;
          loadTwitterWidget();
        };
        document.body.appendChild(script);
      } else {
        loadTwitterWidget();
      }
    }, [tweetId]);

    return (
      <div className="flex justify-center my-2" style={{ minHeight: "120px" }}>
        <div ref={tweetRef} />
      </div>
    );
  }

  // ===============================
  // ✅ Instagram Embed
  // ===============================
  if (lower.includes("instagram.com")) {
    useEffect(() => {
      const loadInsta = () => (window as any).instgrm?.Embeds?.process();
      if ((window as any).instgrm) {
        loadInsta();
      } else {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = loadInsta;
        document.body.appendChild(script);
      }
    }, [url]);

    return (
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ margin: "auto", maxWidth: "540px" }}
      />
    );
  }

  // ===============================
  // ✅ GitHub Embed
  // ===============================
  if (lower.includes("github.com")) {
    return (
      <div className="rounded border border-gray-700 p-4">
        <p className="text-sm text-gray-400">GitHub Repository</p>
        <a
          className="underline text-blue-400"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
        <iframe
          className="w-full h-72 mt-3 rounded"
          src={url.replace("github.com", "github1s.com")}
        />
      </div>
    );
  }

  // ===============================
  // ✅ LinkedIn Embed
  // ===============================
  if (lower.includes("linkedin.com")) {
    const activityMatch =
      url.match(/activity[-:]([0-9]+)/i) ||
      url.match(/urn:li:activity:([0-9]+)/i);
    const activityId = activityMatch ? activityMatch[1] : null;

    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
    ) {
      return (
        <div className="rounded border border-gray-700 p-4 bg-white/5">
          <p className="text-sm text-gray-400 mb-1">LinkedIn Preview</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline break-all"
          >
            {url}
          </a>
          <p className="text-xs text-gray-500 mt-2">
            LinkedIn embeds don’t work locally. Deploy to view the full post.
          </p>
        </div>
      );
    }

    if (activityId) {
      return (
        <iframe
          src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityId}`}
          width="100%"
          height="600"
          frameBorder="0"
          allowFullScreen
          title="LinkedIn post"
          className="rounded-lg"
        />
      );
    }

    return (
      <div className="rounded border border-gray-700 p-4">
        <p className="text-sm text-gray-400 mb-1">LinkedIn Link:</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all"
        >
          {url}
        </a>
      </div>
    );
  }

  // ===============================
  // ✅ Fallback for other links
  // ===============================
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline break-all text-blue-400"
    >
      {url}
    </a>
  );
}
