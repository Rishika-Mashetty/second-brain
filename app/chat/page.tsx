'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Embed from '@/components/Embed';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function ChatPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSelection, setShowSelection] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'youtube' | 'x' | 'instagram' | 'linkedin' | 'github'
  >('all');

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error('Error loading posts:', err));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredPosts = posts.filter((p) => {
    const u = p.url.toLowerCase();
    const matchesFilter =
      filter === 'all' ||
      (filter === 'youtube' && (u.includes('youtube.com') || u.includes('youtu.be'))) ||
      (filter === 'x' && (u.includes('twitter.com') || u.includes('x.com'))) ||
      (filter === 'instagram' && u.includes('instagram.com')) ||
      (filter === 'linkedin' && u.includes('linkedin.com')) ||
      (filter === 'github' && u.includes('github.com'));

    const matchesSearch =
      p.comment?.toLowerCase().includes(search.toLowerCase()) ||
      p.url.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const askGemini = async () => {
    try {
      setLoading(true);
      setResponse('');
      const selectedPosts =
        selected.length > 0 ? posts.filter((p) => selected.includes(p._id)) : posts;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: selectedPosts,
          question,
        }),
      });

      if (!res.ok) throw new Error('Gemini API Error');
      const data = await res.json();
      setResponse(data.answer || '⚠️ No response from Gemini.');
    } catch {
      setResponse('⚠️ Gemini failed to respond. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">💬 Chat with Your Posts</h1>
      <p className="text-gray-400 mb-6">
        Select posts (or leave empty to chat with all). Gemini will analyze your posts and comments to answer intelligently.
      </p>

      {/* 📁 Collapsible Post Selection */}
      <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden mb-6">
        <div
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/10 transition-all"
          onClick={() => setShowSelection(!showSelection)}
        >
          <h2 className="text-lg font-semibold">📁 Select Posts</h2>
          {showSelection ? <ChevronUp /> : <ChevronDown />}
        </div>

        {showSelection && (
          <div className="p-4 border-t border-white/10 space-y-4">
            {/* 🔍 Search + Filter Controls */}
            <div className="flex flex-col md:flex-row gap-3 items-center mb-4">
              <div className="relative w-full md:w-2/3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts or comments..."
                  className="w-full p-3 rounded bg-white/10 pl-10 text-sm"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                {['all', 'youtube', 'x', 'instagram', 'linkedin', 'github'].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? 'default' : 'ghost'}
                    onClick={() => setFilter(f as any)}
                    className="capitalize"
                  >
                    {f === 'x' ? 'X / Twitter' : f}
                  </Button>
                ))}
              </div>
            </div>

            {/* 🧱 Masonry Layout like Dashboard */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {filteredPosts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No posts match your search or filter.
                </p>
              ) : (
                filteredPosts.map((p) => (
                  <div
                    key={p._id}
                    className={`break-inside-avoid border border-white/10 rounded-lg bg-white/5 p-3 mb-4 hover:bg-white/10 transition-all ${
                      selected.includes(p._id) ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={selected.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="accent-purple-500"
                      />
                      <span className="truncate text-gray-300">
                        {p.comment || p.url}
                      </span>
                    </label>

                    <Embed url={p.url} />

                    {p.comment && (
                      <p className="text-sm text-gray-400 mt-2">{p.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🧠 Gemini Chat Area */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something about your posts..."
        className="w-full p-4 rounded bg-white/10 mb-4 text-sm"
        rows={3}
      />

      <Button
        onClick={askGemini}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-[1.02] transition-transform"
      >
        {loading ? 'Thinking...' : 'Ask Gemini'}
      </Button>

      {response && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg">
          <h2 className="font-semibold mb-2 text-lg">🤖 Gemini’s Response:</h2>
          <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
            {response}
          </p>
        </div>
      )}
    </div>
  );
}
