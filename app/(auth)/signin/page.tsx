"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) setError(res.error);
    else router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 border border-white/10 rounded-xl space-y-5 bg-white/5 backdrop-blur"
      >
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>

        <input
          type="text"
          placeholder="Email or Username"
          className="w-full p-3 rounded bg-white/10 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-white/10 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90"
        >
          Sign In
        </button>

        <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
          <div className="h-px flex-1 bg-gray-600" />
          <span>or</span>
          <div className="h-px flex-1 bg-gray-600" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 border border-white/20 rounded-lg font-medium hover:bg-white/10 transition-all"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-pink-400 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}
