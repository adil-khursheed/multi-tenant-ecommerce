import { forwardRef, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { sorting } from "@repo/types";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";

type SortDrawerProps = {
  currentSort: string | null;
  onSortSelect: (slug: string | null) => void;
};

export const SortDrawer = forwardRef<BottomSheetModal, SortDrawerProps>(
  function SortDrawer({ currentSort, onSortSelect }, ref) {
    const snapPoints = useMemo(() => ["35%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleSelect = (slug: string | null) => {
      onSortSelect(slug);
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Sort By</Text>

          <View style={styles.optionsList}>
            {sorting.map((option) => {
              const isActive = currentSort === option.slug;
              return (
                <Pressable
                  key={option.slug ?? "default"}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => handleSelect(option.slug)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isActive && styles.optionTextActive,
                    ]}
                  >
                    {option.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
  },
  handle: {
    backgroundColor: colors.border,
    width: moderateScale(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[2]),
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[4]),
  },
  optionsList: {
    gap: verticalScale(spacing[2]),
  },
  option: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3.5]),
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  optionTextActive: {
    color: colors.primaryForeground,
    fontFamily: fonts.sans.medium,
  },
});
