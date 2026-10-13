"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";
import { SigninSchema } from "@/types/schema";

import SubmitButton from "./submit-button";

const SignInForm = () => {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [userdata, setUserdata] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = SigninSchema.safeParse(userdata);
    if (!validation.success) {
      validation.error.issues.forEach((issue) => notify.error(issue.message));
      return;
    }

    setLoading(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: userdata.email,
        password: userdata.password,
      });
      if (response && !response.error) {
        notify.success("Login successful");
        router.push(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
        router.refresh();
      } else {
        notify.error("Login failed", "Check your email and password.");
      }
    } catch (error) {
      console.error(error);
      notify.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserdata({ ...userdata, [e.target.name]: e.target.value });

  return (
    <form onSubmit={handleLogin} className="my-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          id="email"
          placeholder="example@example.com"
          required
          autoComplete="email"
          value={userdata.email}
          onChange={handleChange}
          type="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          id="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          type="password"
          value={userdata.password}
          onChange={handleChange}
        />
      </div>
      <div className="py-3">
        <SubmitButton loading={loading} className="w-full">
          Sign In
        </SubmitButton>
      </div>
    </form>
  );
};

export default SignInForm;
