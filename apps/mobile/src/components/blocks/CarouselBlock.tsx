import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { width as SCREEN_WIDTH } from "@/constants/responsive";

import { BlockWrapper } from "./BlockWrapper";
import { CategoryCard } from "./tiles/CategoryCard";
import { CollectionCard } from "./tiles/CollectionCard";
import { ProductTile } from "./tiles/ProductTile";
import type { CarouselItem } from "./types";

type CarouselBlockProps = {
  heading?: unknown;
  items: CarouselItem[];
};

const AUTOPLAY_INTERVAL = 4000;

export function CarouselBlock({ heading, items }: CarouselBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSnap = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (!items?.length) return null;

  const slideWidth = SCREEN_WIDTH * (2 / 3);

  return (
    <BlockWrapper heading={heading} style={styles.container}>
      <View>
        <Carousel
          width={slideWidth}
          height={slideWidth}
          data={items}
          loop
          autoPlay
          autoPlayInterval={AUTOPLAY_INTERVAL}
          snapEnabled
          onSnapToItem={handleSnap}
          style={styles.carousel}
          renderItem={({ item }) => {
            if (item.type === "product") {
              return (
                <View style={styles.slide}>
                  <ProductTile
                    slug={item.slug}
                    title={item.title}
                    price={item.price}
                    image={item.image}
                  />
                </View>
              );
            }

            if (item.type === "category") {
              return (
                <View style={styles.slide}>
                  <CategoryCard slug={item.slug} name={item.name} image={item.image} />
                </View>
              );
            }

            return (
              <View style={styles.slide}>
                <CollectionCard
                  slug={item.slug}
                  name={item.name}
                  coverImage={item.coverImage}
                />
              </View>
            );
          }}
        />
        {items.length > 1 && (
          <View style={styles.pagination}>
            {items.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 0,
  },
  carousel: {
    overflow: "hidden",
  },
  slide: {
    paddingHorizontal: 0,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: "#d9cfc7",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#914216",
  },
});
