import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const posts = await Post.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, comment } = await req.json();
  await dbConnect();
  const post = await Post.create({ userId: session.user.id, url, comment });
  return NextResponse.json({ post });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, url, comment } = await req.json();
  await dbConnect();
  const post = await Post.findOneAndUpdate({ _id: id, userId: session.user.id }, { url, comment }, { new: true });
  return NextResponse.json({ post });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await dbConnect();
  await Post.deleteOne({ _id: id, userId: session.user.id });
  return NextResponse.json({ ok: true });
}
