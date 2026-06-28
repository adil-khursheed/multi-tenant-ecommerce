"use client";

import { useRouter } from "next/navigation";

import { LogoutSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/providers/Auth";
import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export const Logout = ({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) => {
  const { setUser } = useAuth();
  const trpc = useTRPC();
  const router = useRouter();

  const { mutate: logoutMutate, isPending } = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        setUser(null);
        router.replace("/");
      },
      onError: () => {
        toast.error("Logout failed");
      },
    }),
  );

  return (
    <Button
      variant={"ghost"}
      size={"lg"}
      onClick={() => logoutMutate()}
      disabled={isPending}
      className={className}
    >
      {isPending ? <Spinner /> : <HugeiconsIcon icon={LogoutSquare02Icon} />}
      {label && label}
    </Button>
  );
};
