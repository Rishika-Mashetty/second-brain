import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";
import { extractSummary } from "@/lib/extractors"; // ✅ Extractor for link summaries

// =======================
// 📦 GET — Fetch all user posts
// =======================
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const posts = await Post.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ posts });
}

// =======================
// ➕ POST — Add new post or note
// =======================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url = "", comment = "" } = await req.json();
  await dbConnect();

  try {
    let summary = "";

    if (url.trim()) {
      // 🧠 URL present → extract platform summary
      summary = await extractSummary(url);
    } else if (comment.trim()) {
      // 📝 No URL → treat as note
      summary = `Note: ${comment.slice(0, 150)}${
        comment.length > 150 ? "..." : ""
      }`;
    } else {
      return NextResponse.json(
        { error: "Either URL or comment must be provided." },
        { status: 400 }
      );
    }

    const post = await Post.create({
      userId: session.user.id,
      url,
      comment,
      summary,
      createdAt: new Date(),
    });

    return NextResponse.json({ post });
  } catch (err: any) {
    console.error("❌ Error creating post:", err);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}

// =======================
// ✏️ PUT — Edit post or note
// =======================
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, url = "", comment = "" } = await req.json();
  await dbConnect();

  try {
    let updateData: any = { comment };
    if (url.trim()) {
      // re-extract summary for URL
      const summary = await extractSummary(url);
      updateData.url = url;
      updateData.summary = summary;
    } else {
      // if no URL → update as note
      updateData.url = "";
      updateData.summary = `Note: ${comment.slice(0, 150)}${
        comment.length > 150 ? "..." : ""
      }`;
    }

    const post = await Post.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updateData,
      { new: true }
    );

    return NextResponse.json({ post });
  } catch (err) {
    console.error("❌ Error updating post:", err);
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 }
    );
  }
}

// =======================
// ❌ DELETE — Remove post
// =======================
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await dbConnect();

  await Post.deleteOne({ _id: id, userId: session.user.id });
  return NextResponse.json({ ok: true });
}
