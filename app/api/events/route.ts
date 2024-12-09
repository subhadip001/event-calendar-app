import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabase";
import type { CreateEventInput, EventFilters } from "@/lib/types";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: EventFilters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      tag: (searchParams.get("tag") as EventFilters["tag"]) || undefined,
    };

    const session = await getSession();
    const userId = session?.id as string;

    let query = supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .order("start_datetime", { ascending: true });

    if (filters.startDate) {
      query = query.gte("start_datetime", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("end_datetime", filters.endDate);
    }
    if (filters.tag) {
      query = query.eq("tag", filters.tag);
    }

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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const userId = session?.id as string;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated", session },
        { status: 401 }
      );
    }

    const eventData: CreateEventInput = await request.json();

    if (
      !eventData.name ||
      !eventData.start_datetime ||
      !eventData.end_datetime ||
      !eventData.tag
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...eventData,
          user_id: userId,
          start_datetime: eventData.start_datetime,
          end_datetime: eventData.end_datetime,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23514") {
        return NextResponse.json(
          {
            error:
              "Time slot conflict: Another event exists in this time range",
          },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
