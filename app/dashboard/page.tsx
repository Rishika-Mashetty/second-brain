'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Embed from '@/components/Embed';
import { cn } from '@/lib/utils';
import {
  Film,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  LogOut,
  Menu,
  X as CloseIcon,
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'youtube' | 'x' | 'instagram' | 'linkedin' | 'github'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') fetchPosts();
  }, [status]);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const j = await res.json();
    setPosts(j.posts);
  };

  const addPost = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, comment }),
    });
    const j = await res.json();
    setPosts([j.post, ...posts]);
    setUrl('');
    setComment('');
  };

  const editPost = async (id: string) => {
    const newUrl = prompt('Edit URL:');
    const newComment = prompt('Edit comment:');
    if (!newUrl) return;
    const res = await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, url: newUrl, comment: newComment }),
    });
    const j = await res.json();
    setPosts(posts.map((p) => (p._id === id ? j.post : p)));
  };

  const delPost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch('/api/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPosts(posts.filter((p) => p._id !== id));
  };

  const filterPosts = (p: any) => {
    if (filter === 'all') return true;
    const u = p.url.toLowerCase();
    if (filter === 'youtube') return u.includes('youtube.com') || u.includes('youtu.be');
    if (filter === 'x') return u.includes('x.com') || u.includes('twitter.com');
    if (filter === 'instagram') return u.includes('instagram.com');
    if (filter === 'linkedin') return u.includes('linkedin.com');
    if (filter === 'github') return u.includes('github.com');
    return true;
  };

  if (status === 'loading') return <div className="p-8 text-white">Loading...</div>;
  if (!session) return <div className="p-8 text-white">Not signed in</div>;

  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'z-30 bg-white/5 border-r border-white/10 flex flex-col p-4 transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold whitespace-nowrap">📚 My Visual Board</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <CloseIcon className="w-5 h-5" />
          </Button>
        </div>

        {sidebarOpen && (
          <>
            <nav className="space-y-2">
              {[
                { key: 'all', label: 'All', icon: Film },
                { key: 'youtube', label: 'YouTube', icon: Youtube },
                { key: 'x', label: 'X / Twitter', icon: Twitter },
                { key: 'instagram', label: 'Instagram', icon: Instagram },
                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                { key: 'github', label: 'GitHub', icon: Github },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => setFilter(key as any)}
                >
                  <Icon className="w-4 h-4 mr-2" /> {label}
                </Button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
              <Button
                variant="destructive"
                className="w-full justify-center"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </>
        )}
      </aside>

      {/* Sidebar Open Button */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-30 rounded-full bg-white/10 hover:bg-white/20"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6">Welcome, {session.user?.email}</h1>

        {/* Add new post */}
        <form
          onSubmit={addPost}
          className="flex flex-col md:flex-row gap-3 mb-8 items-center"
        >
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a link (YouTube, X, Instagram, GitHub, LinkedIn...)"
            className="flex-1 p-3 rounded bg-white/10"
          />
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment (optional)"
            className="flex-1 p-3 rounded bg-white/10"
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            Add
          </Button>
        </form>

        {/* Masonry layout using columns (no wasted space) */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {posts.filter(filterPosts).map((p) => (
            <div
              key={p._id}
              className="break-inside-avoid border border-white/10 rounded-lg bg-white/5 p-3 mb-4 hover:bg-white/10 transition-all"
            >
              <Embed url={p.url} />
              {p.comment && (
                <p className="text-sm text-gray-300 mt-2">{p.comment}</p>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs px-2 py-1"
                  onClick={() => editPost(p._id)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs px-2 py-1"
                  onClick={() => delPost(p._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
