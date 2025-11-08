"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Embed from "@/components/Embed";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchPosts();
  }, [status]);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const j = await res.json();
    setPosts(j.posts);
  };

  const addPost = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, comment }) });
    const j = await res.json();
    setPosts([j.post, ...posts]);
    setUrl(""); setComment("");
  };

  const editPost = async (id: string) => {
    const newUrl = prompt("Edit URL:");
    const newComment = prompt("Edit comment:");
    if (!newUrl) return;
    const res = await fetch("/api/posts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, url: newUrl, comment: newComment }) });
    const j = await res.json();
    setPosts(posts.map(p => p._id === id ? j.post : p));
  };

  const delPost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch("/api/posts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPosts(posts.filter(p => p._id !== id));
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <header className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Welcome, {session.user?.email}</h1>
        <button onClick={() => signOut()} className="bg-red-600 px-4 py-2 rounded">Sign Out</button>
      </header>

      <form onSubmit={addPost} className="flex flex-col gap-2 mb-8">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a link (YouTube, X, Instagram, GitHub, LinkedIn...)" className="p-3 rounded bg-white/10" />
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment (optional)" className="p-3 rounded bg-white/10" />
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded">Add</button>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map(p => (
          <div key={p._id} className="p-4 border border-white/10 rounded space-y-2">
            <Embed url={p.url} />
            {p.comment && <p className="text-sm text-gray-300">{p.comment}</p>}
            <div className="flex gap-2 text-sm">
              <button onClick={() => editPost(p._id)} className="bg-blue-600 px-3 py-1 rounded">Edit</button>
              <button onClick={() => delPost(p._id)} className="bg-red-600 px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
