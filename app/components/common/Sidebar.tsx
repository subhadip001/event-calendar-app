"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useEventContext } from "@/contexts/EventContext";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useUsers } from "@/hooks/useUsers";
import { EventTagEnum } from "@/lib/types";
import { LogOut, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
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

  const { users } = useUsers();
  const { useFetchedSearchedUserEvents } = useEvents();
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    data: searchedUserEvents,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
  } = useFetchedSearchedUserEvents(selectedUserId || "");

  useEffect(() => {
    if (searchedUserEvents) {
      setSelectedUserEvents(searchedUserEvents);
    }
  }, [searchedUserEvents]);

  const handleUserClick = (clickedUser: {
    id: string;
    name: string;
    email: string;
  }) => {
    setSelectedUserId(clickedUser.id);
    setSelectedUser(clickedUser);
    setSearchQuery(""); // Clear search after selection
  };

  const handleRemoveUser = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setSelectedUserEvents([]); // Clear selected user events when removing user
  };

  return (
    <aside className="w-64 h-screen bg-gray-50 text-gray-800 flex flex-col">
      <div className="p-5">
        <h1 className="text-xl font-bold">Event Calendar</h1>
        <div className="space-y-4">
          <button
            onClick={handleAddEvent}
            className="p-2 bg-blue-500 text-white rounded flex items-center"
            aria-label="Add event"
          >
            <Plus className="w-5 h-5 mr-1" /> Add Event
          </button>

          <div className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pr-8 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {searchQuery && (
              <div className="absolute w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto z-10">
                {filteredUsers?.length ? (
                  filteredUsers?.map((filteredUser) => (
                    <div
                      key={filteredUser.id}
                      className={`p-2 ${
                        filteredUser.id !== user?.id
                          ? "hover:bg-gray-100 cursor-pointer"
                          : "bg-gray-50"
                      }`}
                      onClick={() =>
                        filteredUser.id !== user?.id &&
                        handleUserClick(filteredUser)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{filteredUser.name}</div>
                          <div className="text-sm text-gray-600">
                            {filteredUser.email}
                          </div>
                        </div>
                        {filteredUser.id === user?.id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No users found</div>
                )}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="mt-2 p-3 bg-white border rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedUser.email}
                  </div>
                </div>
                <button
                  onClick={handleRemoveUser}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  aria-label="Remove selected user"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {isLoadingEvents && (
                <div className="mt-2 text-sm text-gray-500">
                  Loading events...
                </div>
              )}
              {isErrorEvents && (
                <div className="mt-2 text-sm text-red-500">
                  Error loading events
                </div>
              )}
              {searchedUserEvents && (
                <div className="mt-2 text-sm text-gray-600">
                  {searchedUserEvents.length} events found
                </div>
              )}
            </div>
          )}
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
