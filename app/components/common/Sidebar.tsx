"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useEventContext } from "@/contexts/EventContext";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useUsers } from "@/hooks/useUsers";
import { EventTagEnum } from "@/lib/types";
import { LogOut, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MdOutlinePeopleAlt } from "react-icons/md";

export default function Sidebar() {
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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
    setSearchQuery("");
  };

  const handleRemoveUser = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setSelectedUserEvents([]);
  };

  return (
    <aside className="w-64 h-screen bg-[#F7FAFD] text-gray-800 flex flex-col">
      <div className="p-5">
        <h1 className="text-xl text-gray-500">Event Calendar</h1>
        <div className="my-10 flex flex-col gap-10">
          <button
            onClick={handleAddEvent}
            className="px-5 py-4 w-fit flex gap-2 rounded-2xl items-center bg-white hover:bg-gray-50"
            style={{
              boxShadow:
                "0 2px 5px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)",
            }}
            aria-label="Add event"
          >
            <div>
              <Plus className="w-6 h-6" />
            </div>
            Create
          </button>

          <div className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full p-2 bg-[#d9dde57d] hover:bg-[#D9DDE5] rounded focus:outline-none  border-b-2 border-transparent focus:border-[#3b82f6]"
              />
              {!searchQuery && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-600">
                  <MdOutlinePeopleAlt className="w-4 h-4 mr-2" />
                  <span className="">Search users...</span>
                </div>
              )}
            </div>
            {(searchQuery || isFocused) && (
              <div className="absolute w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto z-10">
                {searchQuery ? (
                  filteredUsers?.length ? (
                    filteredUsers.map((filteredUser) => (
                      <div
                        key={filteredUser.id}
                        onClick={() =>
                          filteredUser.id !== user?.id &&
                          handleUserClick(filteredUser)
                        }
                        className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 ${
                          filteredUser.id === user?.id
                            ? "bg-gray-50 cursor-default"
                            : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {filteredUser.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{filteredUser.name}</div>
                          <div className="text-sm text-gray-500">
                            {filteredUser.email}
                          </div>
                        </div>
                        {filteredUser.id === user?.id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No users found</div>
                  )
                ) : (
                  users
                    ?.slice(-4)
                    .reverse()
                    .map((recentUser) => (
                      <div
                        key={recentUser.id}
                        onClick={() =>
                          recentUser.id !== user?.id &&
                          handleUserClick(recentUser)
                        }
                        className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 ${
                          recentUser.id === user?.id
                            ? "bg-gray-50 cursor-default"
                            : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {recentUser.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{recentUser.name}</div>
                          <div className="text-sm text-gray-500">
                            {recentUser.email}
                          </div>
                        </div>
                        {recentUser.id === user?.id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    ))
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
