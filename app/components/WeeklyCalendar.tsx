"use client";

import { useEvents } from "@/hooks/useEvents";
import {
  CreateEventInput,
  Event as CalendarEvent,
  EventTagEnum,
} from "@/lib/types";
import { getEventsForDay, getEventStyle, isMultiDayEvent } from "@/lib/utils";
import {
  addDays,
  addHours,
  addMinutes,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEventContext } from "@/contexts/EventContext";

export function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    fetchedEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEvents();

  const [loading, setLoading] = useState(true);
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [temporaryEvent, setTemporaryEvent] = useState<CalendarEvent | null>(
    null
  );

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start from Monday
  const weekDays = [...Array(7)].map((_, index) => addDays(weekStart, index));

  const hours = [...Array(24)].map((_, index) => index);

  const previousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * 60;
    }
  }, []);

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

  const handleEditEvent = (event: CalendarEvent) => {
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
    deleteEvent(eventId);
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
    // setEventForm((prev) => ({
    //   ...prev,
    //   [name]: name.includes("datetime") ? parseISO(value) : value,
    // }));

    setEventForm({
      ...eventForm,
      [name]: name.includes("datetime") ? parseISO(value) : value,
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleEditFromDialog = () => {
    if (selectedEvent) {
      handleEditEvent(selectedEvent);
      setOpenDialog(false);
    }
  };

  const handleDeleteFromDialog = () => {
    if (selectedEvent) {
      handleRemoveEvent(selectedEvent.id);
      setOpenDialog(false);
    }
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

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEventForm({
        name: "",
        description: "",
        start_datetime: new Date().toISOString(),
        end_datetime: addHours(new Date(), 1).toISOString(),
        tag: EventTagEnum.WORK,
      });
      setSelectedEvent(null);
      setTemporaryEvent(null);
    }
    setShowEventForm(open);
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
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickY = e.clientY - rect.top;
                        const minutes = Math.floor((clickY / rect.height) * 60);
                        const eventDate = addHours(startOfDay(day), hour);
                        const eventDateTime = addMinutes(eventDate, minutes);

                        const newEventForm = {
                          name: "",
                          description: "",
                          start_datetime: eventDateTime.toISOString(),
                          end_datetime: addHours(
                            eventDateTime,
                            1
                          ).toISOString(),
                          tag: EventTagEnum.WORK,
                        };

                        setEventForm(newEventForm);
                        setTemporaryEvent({
                          id: "temp",
                          ...newEventForm,
                          name: "No title",
                        });
                        setShowEventForm(true);
                      }}
                    />
                  ))}
                  {/* Events */}
                  {[
                    ...getEventsForDay(day, fetchedEvents),
                    ...(temporaryEvent &&
                    isSameDay(day, new Date(temporaryEvent.start_datetime))
                      ? [temporaryEvent]
                      : []),
                  ].map((event) => (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 rounded p-1 text-xs text-white overflow-hidden ${
                        event.id === "temp" ? "opacity-50" : ""
                      } ${getEventColor(
                        event.tag
                      )} cursor-pointer hover:opacity-90`}
                      style={getEventStyle(event, day)}
                      onClick={() =>
                        event.id !== "temp" && handleEventClick(event)
                      }
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showEventForm} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEvent}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="start_datetime"
                  className="text-sm font-medium text-gray-700"
                >
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="start_datetime"
                  name="start_datetime"
                  value={format(
                    new Date(eventForm.start_datetime),
                    "yyyy-MM-dd'T'HH:mm"
                  )}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="end_datetime"
                  className="text-sm font-medium text-gray-700"
                >
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="end_datetime"
                  name="end_datetime"
                  value={format(
                    new Date(eventForm.end_datetime),
                    "yyyy-MM-dd'T'HH:mm"
                  )}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="tag"
                  className="text-sm font-medium text-gray-700"
                >
                  Tag
                </label>
                <select
                  id="tag"
                  name="tag"
                  value={eventForm.tag}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="work">Work</option>
                  <option value="meeting">Meeting</option>
                  <option value="personal">Personal</option>
                  <option value="important">Important</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedEvent ? "Update" : "Create"} Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <div className="flex justify-end gap-3 mr-5">
            <div
              onClick={handleEditFromDialog}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
            </div>
            <div
              onClick={handleDeleteFromDialog}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold capitalize">
              {selectedEvent?.name}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <div>
              <span className="font-medium">Time:</span>{" "}
              {selectedEvent &&
                `${format(
                  new Date(selectedEvent.start_datetime),
                  "MMM d, h:mm a"
                )} - ${format(
                  new Date(selectedEvent.end_datetime),
                  "MMM d, h:mm a"
                )}`}
            </div>
            <div>
              <span className="font-medium">Type:</span> {selectedEvent?.tag}
            </div>
            {selectedEvent?.description && (
              <div>
                <span className="font-medium">Description:</span>{" "}
                {selectedEvent.description}
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end space-x-2"></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
