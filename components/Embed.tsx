"use client";
import Script from "next/script";

export default function Embed({ url }: { url: string }) {
  if (!url) return null;
  const lower = url.toLowerCase();

  // ✅ YouTube
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

  // ✅ Twitter / X
  // ✅ Twitter / X (works for both twitter.com and x.com)
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    const tweetIdMatch = url.match(/status\/(\d+)/);
    const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

    if (!tweetId)
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400"
        >
          View on X
        </a>
      );

    return (
      <div
        id={`tweet-${tweetId}`}
        className="flex justify-center"
        suppressHydrationWarning
      >
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
          onLoad={() => {
            if ((window as any).twttr?.widgets && tweetId) {
              const container = document.getElementById(`tweet-${tweetId}`);
              if (container) {
                // Clear any old renders before re-creating
                container.innerHTML = "";
                (window as any).twttr.widgets
                  .createTweet(tweetId, container, {
                    theme: "dark",
                    align: "center",
                  })
                  .catch((e: any) => console.error("Tweet render failed:", e));
              }
            }
          }}
        />
      </div>
    );
  }

  // ✅ Instagram
  if (lower.includes("instagram.com")) {
    return (
      <>
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
          onLoad={() => (window as any).instgrm?.Embeds?.process()}
        />
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
        ></blockquote>
      </>
    );
  }

  // ✅ GitHub
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

  if (lower.includes("linkedin.com")) {
    try {
      const activityMatch =
        url.match(/activity[-:]([0-9]+)/i) ||
        url.match(/urn:li:activity:([0-9]+)/i);
      const activityId = activityMatch ? activityMatch[1] : null;

      if (activityId) {
        // Detect localhost to show preview card
        if (
          typeof window !== "undefined" &&
          window.location.hostname === "localhost"
        ) {
          return (
            <div className="rounded border border-gray-700 p-4 bg-white/5">
              <p className="text-sm text-gray-400">
                LinkedIn Preview (local mode)
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {url}
              </a>
              <p className="text-gray-300 text-sm mt-2">
                LinkedIn blocks iframe embeds on localhost. Deploy to Vercel to
                see the full post.
              </p>
            </div>
          );
        }

        // ✅ Only use iframe in deployed environment
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

      // Fallback if no ID
      return (
        <div className="rounded border border-gray-700 p-4">
          <p className="text-sm text-gray-400">LinkedIn post:</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            {url}
          </a>
        </div>
      );
    } catch (err) {
      console.error("LinkedIn embed failed:", err);
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400"
        >
          {url}
        </a>
      );
    }
  }
  return (
    <a href={url} target="_blank" className="underline break-all">
      {url}
    </a>
  );
}
