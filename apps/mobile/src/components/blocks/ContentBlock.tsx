import { StyleSheet, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

import { LinkButton } from "./LinkButton";
import type { BlockLink } from "./types";

type ContentColumn = {
  size?: string | null;
  richText?: unknown;
  link?: BlockLink | null;
};

type ContentBlockProps = {
  columns: ContentColumn[];
};

export function ContentBlock({ columns }: ContentBlockProps) {
  if (!columns?.length) return null;

  return (
    <View style={styles.container}>
      {columns.map((column, i) => (
        <View key={i} style={styles.column}>
          {column.richText != null && <RichText data={column.richText as never} />}
          {column.link && (
            <View style={styles.columnLink}>
              <LinkButton
                label={column.link.label}
                href={column.link.href}
                appearance={
                  column.link.appearance === "outline" ? "outline" : "default"
                }
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[6]),
  },
  column: {
    width: "100%",
  },
  columnLink: {
    marginTop: verticalScale(spacing[3]),
  },
});
