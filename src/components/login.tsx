import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth-actions";

import SignInWithGoogleButton from "@/components/SignInWithGoogleButton"

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={login}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <Button type="submit" formAction={login} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Login
            </Button>
            <SignInWithGoogleButton/> 
          </div>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
