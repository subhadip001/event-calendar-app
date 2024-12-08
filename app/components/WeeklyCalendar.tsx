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
import React, { use, useEffect, useRef, useState } from "react";
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
import toast from "react-hot-toast";

export function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    ownerEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEvents();

  const [viewingEvents, setViewingEvents] =
    useState<CalendarEvent[]>(ownerEvents);

  const {
    selectedUserId,
    setSelectedUserId,
    selectedUserEvents,
    setSelectedUserEvents,
    showEventForm,
    setShowEventForm,
    selectedEvent,
    setSelectedEvent,
    eventForm,
    setEventForm,
  } = useEventContext();

  useEffect(() => {
    if (selectedUserId && selectedUserEvents.length > 0) {
      setViewingEvents(selectedUserEvents);
    } else {
      setViewingEvents(ownerEvents);
    }
  }, [selectedUserId, selectedUserEvents, ownerEvents.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const scrollToCurrentTime = () => {
      if (scrollContainerRef.current) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const hourHeight = 60;
        const scrollPosition =
          currentHour * hourHeight + (currentMinute * hourHeight) / 60;

        const offset = 100;
        const finalScrollPosition = Math.max(0, scrollPosition - offset);

        scrollContainerRef.current.scrollTop = finalScrollPosition;
      }
    };

    // Small delay to ensure the container is properly rendered
    const timer = setTimeout(scrollToCurrentTime, 100);
    return () => clearTimeout(timer);
  }, []);

  const getCurrentTimePosition = () => {
    try {
      const now = new Date();
      const startOfDayTime = startOfDay(now);
      const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

      const position = (minutesSinceMidnight / (24 * 60)) * 100;

      return Math.min(Math.max(position, 0), 100);
    } catch (error) {
      console.error("Error calculating current time position:", error);
      return 0;
    }
  };

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

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      const updatedEvent = {
        ...eventForm,
      };
      await updateEvent({
        id: selectedEvent.id,
        event: updatedEvent,
      });
      setShowEventForm(false);
      setSelectedEvent(null);
      setTemporaryEvent(null);
      toast.success("Event updated successfully");
    } else {
      const newEvent = {
        ...eventForm,
      };
      await createEvent(newEvent);
      setShowEventForm(false);
      setEventForm({
        name: "",
        start_datetime: new Date().toISOString(),
        end_datetime: new Date().toISOString(),
        tag: EventTagEnum.WORK,
      });
      setTemporaryEvent(null);
      toast.success("Event created successfully");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
    <div className="flex flex-col h-screen">
      <div className="flex items-center py-4 gap-2">
        <div
          onClick={() => {
            setCurrentDate(new Date());
          }}
          className="flex items-center border border-gray-600 rounded-full px-6 py-2 cursor-pointer hover:bg-gray-100"
        >
          <span>Today</span>
        </div>
        <div className="flex">
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
        <span className="text-xl">{format(weekStart, "MMMM, yyyy")}</span>
      </div>

      {/* Total Calendar Grid Boxes */}
      <div className="flex flex-1 overflow-hidden bg-white mb-5 rounded-2xl">
        <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
          <div className="flex">
            {/* Left bar for hours */}
            <div className="w-16 flex-shrink-0 border-r">
              <div className="h-24"></div> {/* Header spacer */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] text-xs text-gray-500 relative"
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
                className="flex-1 border-r bg-white min-w-[120px] z-10"
              >
                {/* Day Header */}
                <div className="h-24 flex flex-col gap-1 items-center justify-center border-b text-center py-2 sticky top-0 bg-white z-10">
                  <div
                    className={`text-xs uppercase ${
                      isSameDay(day, new Date())
                        ? "text-blue-600 font-semibold"
                        : ""
                    }`}
                  >
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-2xl p-5 flex cursor-pointer justify-center items-center h-8 w-8 rounded-full ${
                      isSameDay(day, new Date())
                        ? "text-white bg-[#0A52C4]"
                        : " hover:bg-gray-200 "
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
                  {/* This is the current time line */}
                  {isSameDay(day, currentTime) && (
                    <div
                      className="absolute w-full flex items-center"
                      style={{
                        top: `${getCurrentTimePosition()}%`,
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="flex-1 h-[2px] bg-blue-500"></div>
                    </div>
                  )}
                  {/* Events */}
                  {[
                    ...getEventsForDay(day, viewingEvents),
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
          {!selectedUserId && (
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
          )}
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
