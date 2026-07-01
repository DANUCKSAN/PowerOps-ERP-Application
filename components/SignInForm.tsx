"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as z from "zod";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { formSchema } from "@/lib/validation";

const SignInForm = () => {
  const router = useRouter();
  const [error, setError] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");

    const result = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      return;
    }

    router.push("/");
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="auth-card-eyebrow">Welcome back</p>
        <h1 className="auth-card-title">Sign in to PowerOps</h1>
        <p className="auth-card-description">
          Manage inventory, projects, payments, and operations securely.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="username">Username</FieldLabel>

                <Input
                  {...field}
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="auth-input"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="auth-input"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {error && <p className="auth-error">{error}</p>}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="auth-submit-button mt-4"
        >
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;