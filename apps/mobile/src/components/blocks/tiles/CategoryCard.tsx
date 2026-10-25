import { useRouter } from "expo-router";

import { getImageUrl, type MediaSource } from "@/utils/media";
import { EditorialTile } from "./EditorialTile";

type CategoryCardProps = {
  slug: string;
  name?: string | null;
  image: MediaSource;
  height?: number;
  onPress?: () => void;
};

export function CategoryCard({
  slug,
  name,
  image,
  height,
  onPress,
}: CategoryCardProps) {
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
      imageUrl={getImageUrl(image)}
      height={height}
      onPress={handlePress}
      accessibilityLabel={`Shop ${label}`}
    />
  );
}
