"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";


const LoginButton = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    router.push("/login");
  };

  if (user) {
    return null; // Don't render anything if user is logged in
  }

  return (
    <Button
      className="bg-[#85e178] hover:bg-[#6bc160] text-[#222620] font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="spinner"></span>
      ) : (
        "Get Started"
      )}
    </Button>
  );
};

export default LoginButton;