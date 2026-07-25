import { useCallback } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { FavouriteIcon, HeartAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { horizontalScale, moderateScale } from "@/constants/responsive";
import { colors } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";
import { useTRPC } from "@/utils/api";

type Props = {
  productId: string;
  size?: number;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WishlistButton({ productId, size = 20, style }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();
  const scale = useSharedValue(1);

  const { data } = useQuery(
    trpc.wishlist.check.queryOptions({ productId }, { enabled: !!user }),
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

        const currentData = queryClient.getQueryData(
          trpc.wishlist.check.queryOptions({ productId }).queryKey,
        ) as { isWishlisted: boolean } | undefined;

        queryClient.setQueryData(
          trpc.wishlist.check.queryOptions({ productId }).queryKey,
          { isWishlisted: !(currentData?.isWishlisted ?? false) },
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

  const handlePress = useCallback(() => {
    if (!user) {
      router.push("/(modals)/login");
      return;
    }

    scale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 }),
    );

    toggle({ productId });
  }, [user, router, toggle, productId, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.container, style, animatedStyle]}
      hitSlop={8}
    >
      <HugeiconsIcon
        icon={isWishlisted ? FavouriteIcon : HeartAddIcon}
        size={moderateScale(size)}
        color={isWishlisted ? colors.primary : colors.foreground}
        strokeWidth={1.5}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
