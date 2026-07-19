"use client";

import React from "react";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";

import { useAuth } from "@/providers/Auth";
import { useLoginModal } from "@/providers/LoginModal";
import { useTRPC } from "@/trpc/client";

type Props = {
  productId: string;
  className?: string;
};

export const WishlistButton: React.FC<Props> = ({ productId, className }) => {
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useQuery(
    trpc.wishlist.check.queryOptions(
      { productId },
      { enabled: !!user },
    ),
  );

  const isWishlisted = data?.isWishlisted ?? false;

  const { mutate: toggle } = useMutation(
    trpc.wishlist.toggle.mutationOptions({
      onMutate: async ({ productId }) => {
        await queryClient.cancelQueries(
          trpc.wishlist.check.queryOptions({ productId }),
        );

        const previous = queryClient.getQueryData(
          trpc.wishlist.check.queryOptions({ productId }).queryKey,
        );

        queryClient.setQueryData(
          trpc.wishlist.check.queryOptions({ productId }).queryKey,
          { isWishlisted: !isWishlisted },
        );

        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            trpc.wishlist.check.queryOptions({ productId }).queryKey,
            context.previous,
          );
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.wishlist.check.queryOptions({ productId }),
        );
        void queryClient.invalidateQueries(trpc.wishlist.getAll.queryOptions());
      },
    }),
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    toggle({ productId });
  };

  return (
    <button onClick={handleClick} className={className}>
      <motion.div
        animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          className={
            isWishlisted ? "text-primary fill-primary" : "text-foreground"
          }
          size={16}
        />
      </motion.div>
    </button>
  );
};
