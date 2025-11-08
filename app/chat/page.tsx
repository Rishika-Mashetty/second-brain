'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("Error loading posts:", err));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const askGemini = async () => {
    try {
      setLoading(true);
      setResponse('');

      const selectedPosts = posts.filter((p) => selected.includes(p._id));

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: selectedPosts,
          question,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Response error:", text);
        throw new Error("Gemini API error: " + text);
      }

      const data = await res.json().catch(() => ({ answer: "⚠️ No valid JSON returned." }));
      setResponse(data.answer || "⚠️ No response from Gemini.");
    } catch (err: any) {
      console.error("Ask Gemini error:", err);
      setResponse("⚠️ Gemini failed to respond. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">💬 Chat with Your Posts</h1>

      <p className="text-gray-400 mb-4">
        Select posts (or leave empty to chat with all).
      </p>

      <div className="max-h-[300px] overflow-y-auto mb-6 space-y-2">
        {posts.map((p) => (
          <label key={p._id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selected.includes(p._id)}
              onChange={() => toggleSelect(p._id)}
            />
            <span>{p.comment || p.url}</span>
          </label>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something about your posts..."
        className="w-full p-3 rounded bg-white/10 mb-4"
        rows={3}
      />

      <Button
        onClick={askGemini}
        className="bg-gradient-to-r from-blue-500 to-purple-600"
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Ask Gemini'}
      </Button>

      {response && (
        <div className="mt-6 p-4 rounded bg-white/10 border border-white/20">
          <h2 className="font-semibold mb-2">Gemini’s Response:</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
