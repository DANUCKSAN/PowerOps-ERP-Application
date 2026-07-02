"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";
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
        <p className="auth-card-eyebrow">Secure access</p>
        <h1 className="auth-card-title">Welcome back</h1>
        <p className="auth-card-description">
          Sign in to manage inventory, projects, payments, and operations.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="username" className="auth-field-label">
                  Username
                </FieldLabel>

                <div className="auth-input-shell">
                  <UserRound className="auth-input-icon" />
                  <Input
                    {...field}
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="auth-input"
                  />
                </div>

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
                <FieldLabel htmlFor="password" className="auth-field-label">
                  Password
                </FieldLabel>

                <div className="auth-input-shell">
                  <LockKeyhole className="auth-input-icon" />
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="auth-input"
                  />
                </div>

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
          className="auth-submit-button"
        >
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
