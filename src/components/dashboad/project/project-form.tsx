"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import SubmitButton from "@/components/auth/submit-button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/notify";
import { createProjectSchema, type CreateProjectInput } from "@/types/schema";

/**
 * Shared create/edit project form (react-hook-form + zod, Vinyaas Form parts).
 */
export function ProjectForm({
  endpoint,
  defaultValues,
  extraBody,
  submitLabel,
  onSuccess,
}: {
  endpoint: string;
  defaultValues: CreateProjectInput;
  extraBody?: Record<string, unknown>;
  submitLabel: string;
  onSuccess: "dashboard" | "refresh";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues,
  });
  const { errors } = form.formState;

  async function onSubmit(values: CreateProjectInput) {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...extraBody }),
      });
      const data = await res.json();
      if (data.success) {
        notify.success(data.message.title);
        if (onSuccess === "dashboard") router.push("/dashboard");
        router.refresh();
      } else {
        notify.error(data.message?.title ?? "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      notify.error("Something went wrong with the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto mb-20 max-w-3xl gap-8"
    >
      <FormField name="title" error={errors.title?.message} disabled={loading}>
        <FormItem>
          <FormLabel>Project Title</FormLabel>
          <FormControl>
            <Input placeholder="Title" {...form.register("title")} />
          </FormControl>
          <FormDescription>This is your public project name.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField
        name="description"
        error={errors.description?.message}
        disabled={loading}
      >
        <FormItem>
          <FormLabel>Project Description</FormLabel>
          <FormControl>
            <Textarea
              className="h-48"
              placeholder="Description"
              {...form.register("description")}
            />
          </FormControl>
          <FormDescription>
            Provide a detailed description of your project. It should be atleast
            16 characters long.
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField
        name="deployedUrl"
        error={errors.deployedUrl?.message}
        disabled={loading}
      >
        <FormItem>
          <FormLabel>Deployed URL</FormLabel>
          <FormControl>
            <Input
              type="url"
              placeholder="https://www.example.com"
              {...form.register("deployedUrl")}
            />
          </FormControl>
          <FormDescription>
            Provide the URL where your project is deployed. This will allow
            others to view the live version of your project.
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField
        name="githubUrl"
        error={errors.githubUrl?.message}
        disabled={loading}
      >
        <FormItem>
          <FormLabel>Github URL</FormLabel>
          <FormControl>
            <Input
              type="url"
              placeholder="https://github.com/username/reponame"
              {...form.register("githubUrl")}
            />
          </FormControl>
          <FormDescription>
            Provide the GitHub repository URL for your project. This will allow
            others to view the source code.
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <Controller
        control={form.control}
        name="isPrivate"
        render={({ field }) => (
          <FormField name="isPrivate" disabled={loading}>
            <FormItem className="flex-row items-center justify-between gap-5">
              <div className="flex flex-1 flex-col gap-2.5">
                <FormLabel>Private Project</FormLabel>
                <FormDescription>
                  Mark this project as private. Private projects are only
                  visible to you and the members you invite. It can be changed
                  later.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="isFavourite"
        render={({ field }) => (
          <FormField name="isFavourite" disabled={loading}>
            <FormItem className="flex-row items-center justify-between gap-5">
              <div className="flex flex-1 flex-col gap-2.5">
                <FormLabel>Favourite Project</FormLabel>
                <FormDescription>
                  Mark this project as a favourite. Favourite projects will be
                  highlighted and easily accessible.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          </FormField>
        )}
      />

      <SubmitButton loading={loading} className="w-full">
        {submitLabel}
      </SubmitButton>
    </Form>
  );
}
