"use client";
import Script from "next/script";

export default function Embed({ url }: { url: string }) {
  const lower = url.toLowerCase();
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
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return (
      <>
        <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
        <blockquote className="twitter-tweet"><a href={url}></a></blockquote>
      </>
    );
  }
  if (lower.includes("instagram.com")) {
    return (
      <>
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onLoad={() => (window as any).instgrm?.Embeds?.process()} />
        <blockquote className="instagram-media" data-instgrm-permalink={url}></blockquote>
      </>
    );
  }
  if (lower.includes("github.com")) {
    return (
      <div className="rounded border p-4">
        <p className="text-sm text-gray-400">GitHub Repository</p>
        <a className="underline" href={url} target="_blank">{url}</a>
        <iframe className="w-full h-72 mt-3 rounded" src={url.replace("github.com","github1s.com")} />
      </div>
    );
  }
  if (lower.includes("linkedin.com")) {
  const match = url.match(/urn:li:activity:(\d+)/);
  const activityId = match ? match[1] : null;
  if (activityId) {
    return (
      <iframe
        src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityId}`}
        height="600"
        width="100%"
        frameBorder="0"
        allowFullScreen
        title="LinkedIn post"
        className="rounded-lg"
      />
    );
  }
  return (
    <div className="rounded border border-gray-700 p-4">
      <p className="text-sm text-gray-400">LinkedIn link:</p>
      <a href={url} target="_blank" className="underline text-blue-400">
        {url}
      </a>
    </div>
  );
}

  return <a href={url} target="_blank" className="underline break-all">{url}</a>;
}
