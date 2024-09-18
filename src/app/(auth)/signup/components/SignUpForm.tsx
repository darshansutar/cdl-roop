'use client'
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from "next/link";
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth-actions";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";


export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await signup(formData);
      toast.success('Sign up successful!');
      router.push('/login');
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#222620]">
      <Toaster position="top-center" reverseOrder={false} />
  
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 -mt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-28 h-28 mb-6"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              id="curve"
              d="M50,10 a40,40 0 0,1 0,80 a40,40 0 0,1 0,-80"
              fill="none"
              stroke="none"
            />
            <text className="text-[#85e178] text-[12px] font-bold uppercase">
              <textPath xlinkHref="#curve">
                CDL ROOP • CDL ROOP • CDL ROOP •
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-[#85e178] rounded-full"></div>
          </div>
        </motion.div>
        <h1 className="text-xl font-bold mb-6 text-[#85e178]">CDL ROOP</h1>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#85e178] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 text-[#222620]">
            <h2 className="text-3xl font-bold mb-2 text-center">Sign Up</h2>
            <p className="text-[#222620] opacity-80 text-center mb-6">
              Enter your information to create an account
            </p>

            {error && <p className="text-red-600 text-center mb-4">{error}</p>}
            {success && <p className="text-green-600 text-center mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name" className="text-[#222620] font-semibold">First name</Label>
                  <div className="relative">
                    <Input
                      name="first-name"
                      id="first-name"
                      placeholder="Max"
                      required
                      className="pl-10 bg-[#222620] text-[#85e178] border-[#85e178] focus:ring-[#85e178]"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85e178] w-5 h-5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="last-name" className="text-[#222620] font-semibold">Last name</Label>
                  <div className="relative">
                    <Input
                      name="last-name"
                      id="last-name"
                      placeholder="Robinson"
                      required
                      className="pl-10 bg-[#222620] text-[#85e178] border-[#85e178] focus:ring-[#85e178]"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85e178] w-5 h-5" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-[#222620] font-semibold">Email</Label>
                <div className="relative">
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="pl-10 bg-[#222620] text-[#85e178] border-[#85e178] focus:ring-[#85e178]"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85e178] w-5 h-5" />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-[#222620] font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10 bg-[#222620] text-[#85e178] border-[#85e178] focus:ring-[#85e178]"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85e178] w-5 h-5" />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <Eye className="text-[#85e178] w-5 h-5" />
                    ) : (
                      <EyeOff className="text-[#85e178] w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#222620] text-[#85e178] hover:bg-[#2a2e27]"
              >
                Create an account <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6">
              <SignInWithGoogleButton />
            </div>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#222620] font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}