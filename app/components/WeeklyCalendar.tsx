"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  isSameDay,
  differenceInMinutes,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";
import { CreateEventInput, Event, EventTagEnum } from "@/lib/types";
import { useEvents } from "@/hooks/useEvents";

export function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEvents();
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<CreateEventInput>({
    name: "",
    description: "",
    start_datetime: new Date().toISOString(),
    end_datetime: new Date().toISOString(),
    tag: EventTagEnum.WORK,
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start from Monday
  const weekDays = [...Array(7)].map((_, index) => addDays(weekStart, index));

  const hours = [...Array(24)].map((_, index) => index);

  const getEventStyle = (event: Event, day: Date) => {
    const eventStart = new Date(event.start_datetime);
    const eventEnd = new Date(event.end_datetime);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    let start = eventStart;
    let end = eventEnd;

    if (isBefore(start, dayStart)) {
      start = dayStart;
    }
    if (isAfter(end, dayEnd)) {
      end = dayEnd;
    }

    const topPosition = (differenceInMinutes(start, dayStart) / 60) * 60;
    const height = (differenceInMinutes(end, start) / 60) * 60;

    return {
      top: `${topPosition}px`,
      height: `${height}px`,
    };
  };

  const getEventColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      work: "bg-blue-500",
      meeting: "bg-green-500",
      personal: "bg-purple-500",
      important: "bg-red-500",
      other: "bg-gray-500",
    };
    return colors[tag] || colors.other;
  };

  const previousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * 60;
    }
  }, []);

  const isMultiDayEvent = (event: Event) => {
    return !isSameDay(
      new Date(event.start_datetime),
      new Date(event.end_datetime)
    );
  };

  // Filter events for a specific day
  const getEventsForDay = (day: Date, events: Event[]) => {
    return events.filter(
      (event) =>
        isSameDay(new Date(event.start_datetime), day) ||
        isSameDay(new Date(event.end_datetime), day) ||
        (isAfter(day, new Date(event.start_datetime)) &&
          isBefore(day, new Date(event.end_datetime)))
    );
  };

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

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      name: event.name,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      tag: event.tag,
    });
    setShowEventForm(true);
  };

  const handleRemoveEvent = (eventId: string) => {
    //
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      const updatedEvent = {
        ...eventForm,
      };
      updateEvent({
        id: selectedEvent.id,
        event: updatedEvent,
      });
    } else {
      const newEvent = {
        ...eventForm,
      };
      createEvent(newEvent);
    }
    setShowEventForm(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: name.includes("datetime") ? parseISO(value) : value,
    }));
  };

  return (
    <div className="flex flex-col bg-white h-screen">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">
          Week of {format(weekStart, "MMM d, yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddEvent}
            className="p-2 bg-blue-500 text-white rounded flex items-center"
            aria-label="Add event"
          >
            <Plus className="w-5 h-5 mr-1" /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
          <div className="flex">
            {/* Time Labels */}
            <div className="w-16 flex-shrink-0 border-r">
              <div className="h-12 border-b"></div> {/* Header spacer */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b text-xs text-gray-500 relative"
                >
                  <span className="absolute -top-2 right-2">
                    {format(addHours(startOfDay(currentDate), hour), "ha")}
                  </span>
                </div>
              ))}
            </div>

            {/* Days and Events */}
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                className="flex-1 border-r min-w-[120px]"
              >
                {/* Day Header */}
                <div className="h-12 border-b text-center py-2 sticky top-0 bg-white z-10">
                  <div className="text-sm font-medium">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-sm ${
                      isSameDay(day, new Date())
                        ? "text-blue-600 font-semibold"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>

                {/* Hourly Grid */}
                <div className="relative">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-200"
                    />
                  ))}

                  {/* Events */}
                  {getEventsForDay(day, events).map((event) => (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 rounded p-1 text-xs text-white overflow-hidden ${getEventColor(
                        event.tag
                      )}`}
                      style={getEventStyle(event, day)}
                    >
                      <div className="font-semibold">{event.name}</div>
                      <div>
                        {isMultiDayEvent(event) ? (
                          <>
                            {format(
                              new Date(event.start_datetime),
                              "MMM d, h:mm a"
                            )}{" "}
                            -
                            {format(
                              new Date(event.end_datetime),
                              "MMM d, h:mm a"
                            )}
                          </>
                        ) : (
                          <>
                            {format(new Date(event.start_datetime), "h:mm a")} -
                            {format(new Date(event.end_datetime), "h:mm a")}
                          </>
                        )}
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                          aria-label="Edit event"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveEvent(event.id)}
                          className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                          aria-label="Remove event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {selectedEvent ? "Edit Event" : "Add New Event"}
            </h3>
            <form onSubmit={handleSubmitEvent}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={eventForm.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="start_datetime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="start_datetime"
                  name="start_datetime"
                  value={format(eventForm.start_datetime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="end_datetime"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="end_datetime"
                  name="end_datetime"
                  value={format(eventForm.end_datetime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="tag"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tag
                </label>
                <select
                  id="tag"
                  name="tag"
                  value={eventForm.tag}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="work">Work</option>
                  <option value="meeting">Meeting</option>
                  <option value="personal">Personal</option>
                  <option value="important">Important</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {selectedEvent ? "Update" : "Add"} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
