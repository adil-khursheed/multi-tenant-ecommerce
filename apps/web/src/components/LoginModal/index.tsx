"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LockPasswordIcon,
  Mail,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";

import { loginSchema, type LoginFormData } from "@repo/validators";
import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/Auth";
import { useTRPC } from "@/trpc/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const LoginModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const [togglePassword, setTogglePassword] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const trpc = useTRPC();
  const { setUser } = useAuth();

  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: login } = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: (data) => {
        setUser(data.data || null);
        reset();
        onOpenChange(false);
      },
      onError: () => {
        setError(
          "There was an error with the credentials provided. Please try again.",
        );
      },
    }),
  );

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    await login(data);
  };

  const handleOpenChange = (state: boolean) => {
    if (!state) {
      reset();
      setError(null);
    }
    onOpenChange(state);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light tracking-tight">
            Sign in to your wardrobe.
          </DialogTitle>
          <DialogDescription>
            Don&apos;t have an account?{" "}
            <Link
              href="/create-account"
              className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
            >
              Create one &rarr;
            </Link>
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        {error && <Message className="mb-2" error={error} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    required
                    className="text-xs uppercase tracking-[0.15em]"
                  >
                    Email Address
                  </FieldLabel>
                  <InputGroup
                    aria-invalid={fieldState.invalid}
                    className="h-11"
                  >
                    <InputGroupInput
                      {...field}
                      id="login-modal-email"
                      type="email"
                      placeholder="arjun@editorial.com"
                    />
                    <InputGroupAddon align={"inline-start"}>
                      <HugeiconsIcon icon={Mail} />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    required
                    className="text-xs uppercase tracking-[0.15em]"
                  >
                    Password
                  </FieldLabel>
                  <InputGroup
                    aria-invalid={fieldState.invalid}
                    className="h-11"
                  >
                    <InputGroupInput
                      {...field}
                      id="login-modal-password"
                      type={togglePassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <InputGroupAddon align={"inline-start"}>
                      <HugeiconsIcon icon={LockPasswordIcon} />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Show Password"
                        title="Show Password"
                        size="icon-xs"
                        onClick={() => setTogglePassword((prev) => !prev)}
                      >
                        {togglePassword ? (
                          <HugeiconsIcon icon={EyeOff} />
                        ) : (
                          <HugeiconsIcon icon={Eye} />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-11 w-full text-xs font-semibold uppercase tracking-[0.2em]"
              size="lg"
            >
              {isSubmitting ? <Spinner /> : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
