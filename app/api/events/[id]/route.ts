// app/api/events/[id]/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UpdateEventInput } from "@/lib/types";
import { supabase } from "@/utils/supabase/supabase";
import { getSession } from "@/lib/auth";

// GET - Fetch single event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const userId = session?.id as string;
    const id = (await params).id;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH - Update event
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const session = await getSession();
    const userId = session?.id as string;
    const updateData: UpdateEventInput = await request.json();
    const id = (await params).id;

    // First check if the event exists and belongs to the user
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const session = await getSession();
    const userId = session?.id as string;
    const id = (await params).id;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
