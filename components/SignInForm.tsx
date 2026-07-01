"use client"
import * as React from "react"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Controller, useForm } from "react-hook-form"
import { formSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "./ui/button"


const SignInForm = () => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values)
    }

  return (
    <div className="flex flex-col">
      <form onSubmit={form.handleSubmit(onSubmit)}>    
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                {...field}
                 data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Username
                  </FieldLabel>
                  <Input
                    placeholder="Enter your username"
                    autoComplete="off"
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
                <Field
                 data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    password
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            
          </FieldGroup>

       <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="mt-4">
          Sign In
        </Button>
        </form>

       
    </div>
  )
}

export default SignInForm
