import { getSession } from "@/lib/auth";
import { supabase } from "@/utils/supabase/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    const id = session?.id as string;

    if (!id) {
      return NextResponse.json(
        { error: "Not authenticated", session },
        { status: 401 }
      );
    }

    const userId = (await params).userId;

    let query = supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .order("start_datetime", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
