"use client";
import { Database } from "@/database.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const USERS_QUERY_KEY = "users";

export function useUsers() {
  const queryClient = useQueryClient();
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<Database["public"]["Tables"]["users"]["Row"][]>({
    queryKey: [USERS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  return {
    users,
    isLoading,
    isError,
    error,
  };
}
