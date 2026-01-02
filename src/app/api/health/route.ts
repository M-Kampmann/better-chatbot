import { NextResponse } from "next/server";

export async function GET() {
  console.log("Health endpoint called");
  return NextResponse.json({ status: "ok" });
}
