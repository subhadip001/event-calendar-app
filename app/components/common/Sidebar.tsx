"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { CreateEventInput } from "@/lib/types";
import { LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { EventTagEnum } from "@/lib/types";
import { useEventContext } from "@/contexts/EventContext";

export default function Sidebar() {
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const {
    storedEvents,
    setStoredEvents,
    showEventForm,
    setShowEventForm,
    selectedEvent,
    setSelectedEvent,
    eventForm,
    setEventForm,
  } = useEventContext();

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setEventForm({
      name: "",
      start_datetime: new Date().toISOString(),
      end_datetime: new Date().toISOString(),
      tag: EventTagEnum.WORK,
    });
    setShowEventForm(true);
  };

  return (
    <aside className="w-64 h-screen bg-gray-50 text-gray-800 flex flex-col">
      <div className="p-5">
        <h1 className="text-xl font-bold">Event Calendar</h1>
        <div>
          <button
            onClick={handleAddEvent}
            className="p-2 bg-blue-500 text-white rounded flex items-center"
            aria-label="Add event"
          >
            <Plus className="w-5 h-5 mr-1" /> Add Event
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between w-full py-2 px-4 text-center">
          {user?.name}
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
