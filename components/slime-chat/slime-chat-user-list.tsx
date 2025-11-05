"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  color: string;
  status: "online" | "away" | "offline";
}

interface SlimeChatUserListProps {
  onClose: () => void;
}

export function SlimeChatUserList({ onClose }: SlimeChatUserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const guildId = 'default'; // Use default guild for now

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/chat/users?guildId=${guildId}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Refresh user list every 5 seconds
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const onlineUsers = users.filter(u => u.status === 'online' || u.status === 'away');

  return (
    <div className="absolute top-14 right-4 bg-zinc-800 border border-emerald-500/30 rounded-lg shadow-lg p-4 w-48 z-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-emerald-500 font-semibold text-sm">ONLINE</h3>
        <span className="text-gray-400 text-xs">({onlineUsers.length})</span>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 text-xs py-4">Loading...</div>
      ) : onlineUsers.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-4">No users online</div>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: user.color }}
              >
                {user.username}
              </span>
              {user.status === 'away' && (
                <span className="text-xs text-gray-500">(away)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
