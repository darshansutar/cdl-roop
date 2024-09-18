"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { User } from "@supabase/supabase-js";

const UserGreetText = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    fetchUser();

    // Listen for the custom logout event
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  if (!user) {
    return (
      <div className="flex items-center">
        <svg
          className="w-6 h-6 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="currentColor"
          />
        </svg>
        <p>Guest</p>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {user.user_metadata.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          className="w-8 h-8 rounded-full mr-2"
        />
      ) : (
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
          <span className="text-gray-600 text-sm">
            {user.user_metadata.full_name.charAt(0)}
          </span>
        </div>
      )}
      <p>{user.user_metadata.full_name}</p>
    </div>
  );
};

export default UserGreetText;