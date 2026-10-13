"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";
import { SignupSchema } from "@/types/schema";

import SubmitButton from "./submit-button";

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userdata, setUserdata] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = SignupSchema.safeParse(userdata);
    if (!validation.success) {
      validation.error.issues.forEach((issue) => notify.error(issue.message));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userdata),
      });
      const data = await res.json();
      if (data.success) {
        notify.success(data.message.description);
        router.push("/auth/sign-in");
      } else {
        notify.error(data.message?.description ?? "Sign up failed");
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
    <form onSubmit={handleSignup} className="my-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          name="name"
          id="username"
          placeholder="Alice Doe"
          required
          value={userdata.name}
          autoComplete="username"
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          id="email"
          placeholder="example@example.com"
          required
          autoComplete="email"
          onChange={handleChange}
          value={userdata.email}
          type="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          id="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          type="password"
          onChange={handleChange}
          value={userdata.password}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          name="confirmPassword"
          id="confirm-password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          type="password"
          onChange={handleChange}
          value={userdata.confirmPassword}
        />
      </div>
      <div className="py-3">
        <SubmitButton loading={loading} className="w-full">
          Sign Up
        </SubmitButton>
      </div>
    </form>
  );
};

export default SignupForm;
