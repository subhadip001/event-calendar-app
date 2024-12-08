// app/hooks/useEvents.ts
"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/database.types";
import { CreateEventInput, Event, UpdateEventInput } from "@/lib/types";
import toast from "react-hot-toast";

const EVENTS_QUERY_KEY = "events";
const EVENT_QUERY_KEY = "event";

export function useEvents() {
  const queryClient = useQueryClient();

  const { data: fetchedEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: [EVENTS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: CreateEventInput) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok) {
        throw new Error("Failed to create event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
      toast.success("Event created successfully");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({
      id,
      event,
    }: {
      id: string;
      event: UpdateEventInput;
    }) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Event updated successfully");
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
    },
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });

  return {
    fetchedEvents,
    isLoading,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
}
