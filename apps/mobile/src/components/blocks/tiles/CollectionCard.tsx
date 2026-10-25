import { type DimensionValue } from "react-native";

import { useRouter } from "expo-router";

import { getImageUrl, type MediaSource } from "@/utils/media";
import { EditorialTile } from "./EditorialTile";

type CollectionCardProps = {
  slug: string;
  name?: string | null;
  coverImage: MediaSource;
  width?: DimensionValue;
  onPress?: () => void;
};

export function CollectionCard({
  slug,
  name,
  coverImage,
  width,
  onPress,
}: CollectionCardProps) {
  const router = useRouter();
  const label = name ?? slug;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push("/(tabs)/shop" as never);
  };

  return (
    <EditorialTile
      name={label}
      imageUrl={getImageUrl(coverImage)}
      width={width}
      onPress={handlePress}
      accessibilityLabel={`Explore ${label}`}
    />
  );
}
