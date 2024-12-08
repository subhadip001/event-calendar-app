import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabase";
import type { TUser } from "@/lib/types";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const userId = session?.id as string;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated", session },
        { status: 401 }
      );
    }

    let query = supabase
      .from("users")
      .select("id, name, email, created_at")
      .order("created_at", { ascending: true });

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
