import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Linking } from "react-native";

import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { moderateScale, verticalScale } from "@/constants/responsive";

// ─── Lexical Node Types ──────────────────────────────────────────────────────

interface LexicalNode {
  type: string;
  version: number;
  [key: string]: unknown;
}

interface TextNode extends LexicalNode {
  type: "text";
  text: string;
  format: number;
  style?: string;
}

interface ElementNode extends LexicalNode {
  type: string;
  children: LexicalNode[];
  direction?: "ltr" | "rtl" | null;
  format?: string;
  indent?: number;
}

interface ParagraphNode extends ElementNode {
  type: "paragraph";
}

interface HeadingNode extends ElementNode {
  type: "heading";
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface ListNode extends ElementNode {
  type: "list";
  listType: "number" | "bullet";
  start?: number;
}

interface ListItemNode extends ElementNode {
  type: "listitem";
  value?: number;
}

interface LinkNode extends ElementNode {
  type: "link";
  fields: {
    url: string;
    newTab?: boolean;
    linkType?: "custom" | "internal";
  };
}

interface QuoteNode extends ElementNode {
  type: "quote";
}

interface RootNode extends ElementNode {
  type: "root";
}

interface SerializedEditorState {
  root: RootNode;
  [key: string]: unknown;
}

// ─── Text Format Flags (bitwise) ─────────────────────────────────────────────

const BOLD = 1;
const ITALIC = 2;
const STRIKETHROUGH = 4;
const UNDERLINE = 8;
const CODE = 16;

// ─── Component Props ─────────────────────────────────────────────────────────

export interface RichTextProps {
  data: SerializedEditorState | unknown | null | undefined;
  style?: object;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RichText({ data, style }: RichTextProps) {
  if (!data || typeof data !== "object") return null;

  const state = data as SerializedEditorState;
  if (!state.root || !Array.isArray(state.root.children)) return null;

  return (
    <View style={style}>
      {state.root.children.map((node, index) => (
        <NodeRenderer key={index} node={node} index={index} />
      ))}
    </View>
  );
}

// ─── Node Renderer ───────────────────────────────────────────────────────────

function NodeRenderer({ node, index, listIndex }: {
  node: LexicalNode;
  index: number;
  listIndex?: number;
}) {
  switch (node.type) {
    case "paragraph":
      return <ParagraphRenderer node={node as ParagraphNode} index={index} />;
    case "heading":
      return <HeadingRenderer node={node as HeadingNode} index={index} />;
    case "text":
      return <TextLeafRenderer node={node as TextNode} />;
    case "list":
      return <ListRenderer node={node as ListNode} index={index} />;
    case "listitem":
      return <ListItemRenderer node={node as ListItemNode} index={index} listIndex={listIndex} />;
    case "link":
      return <LinkRenderer node={node as LinkNode} index={index} />;
    case "quote":
      return <QuoteRenderer node={node as QuoteNode} index={index} />;
    default:
      return <FallbackRenderer node={node} index={index} />;
  }
}

// ─── Paragraph ───────────────────────────────────────────────────────────────

function ParagraphRenderer({ node, index }: { node: ParagraphNode; index: number }) {
  if (!node.children || node.children.length === 0) {
    return <Text style={styles.paragraph}>{""}</Text>;
  }

  return (
    <Text style={styles.paragraph}>
      {node.children.map((child, i) => (
        <NodeRenderer key={i} node={child} index={i} />
      ))}
    </Text>
  );
}

// ─── Heading ─────────────────────────────────────────────────────────────────

function HeadingRenderer({ node, index }: { node: HeadingNode; index: number }) {
  const headingStyle = headingStyles[node.tag] || headingStyles.h4;

  return (
    <Text style={headingStyle}>
      {node.children?.map((child, i) => (
        <NodeRenderer key={i} node={child} index={i} />
      ))}
    </Text>
  );
}

// ─── Text Leaf ───────────────────────────────────────────────────────────────

function TextLeafRenderer({ node }: { node: TextNode }) {
  const textStyle = getTextStyle(node.format);

  if (node.format && node.format & CODE) {
    return <Text style={[textStyle, styles.inlineCode]}>{node.text}</Text>;
  }

  if (Object.keys(textStyle).length > 0) {
    return <Text style={textStyle}>{node.text}</Text>;
  }

  return <Text>{node.text}</Text>;
}

// ─── List ────────────────────────────────────────────────────────────────────

function ListRenderer({ node, index }: { node: ListNode; index: number }) {
  const isBullet = node.listType === "bullet";
  const start = node.start ?? 1;

  return (
    <View style={styles.list}>
      {node.children?.map((child, i) => (
        <ListItemRenderer
          key={i}
          node={child as ListItemNode}
          index={i}
          listIndex={isBullet ? undefined : start + i}
        />
      ))}
    </View>
  );
}

// ─── List Item ───────────────────────────────────────────────────────────────

function ListItemRenderer({ node, index, listIndex }: {
  node: ListItemNode;
  index: number;
  listIndex?: number;
}) {
  const bullet = listIndex !== undefined ? `${listIndex}.` : "\u2022";

  return (
    <View style={styles.listItem}>
      <Text style={styles.listBullet}>{bullet}</Text>
      <Text style={styles.listItemText}>
        {node.children?.map((child, i) => (
          <NodeRenderer key={i} node={child} index={i} />
        ))}
      </Text>
    </View>
  );
}

// ─── Link ────────────────────────────────────────────────────────────────────

function LinkRenderer({ node, index }: { node: LinkNode; index: number }) {
  const url = node.fields?.url;

  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Text style={styles.link} onPress={handlePress}>
      {node.children?.map((child, i) => (
        <NodeRenderer key={i} node={child} index={i} />
      ))}
    </Text>
  );
}

// ─── Quote ───────────────────────────────────────────────────────────────────

function QuoteRenderer({ node, index }: { node: QuoteNode; index: number }) {
  return (
    <View style={styles.quote}>
      <View style={styles.quoteBar} />
      <View style={styles.quoteContent}>
        {node.children?.map((child, i) => (
          <NodeRenderer key={i} node={child} index={i} />
        ))}
      </View>
    </View>
  );
}

// ─── Fallback ────────────────────────────────────────────────────────────────

function FallbackRenderer({ node, index }: { node: LexicalNode; index: number }) {
  const elementNode = node as ElementNode;
  if (Array.isArray(elementNode.children)) {
    return (
      <>
        {elementNode.children.map((child, i) => (
          <NodeRenderer key={i} node={child} index={i} />
        ))}
      </>
    );
  }
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTextStyle(format: number | undefined): object {
  if (!format) return {};

  const style: Record<string, unknown> = {};

  if (format & BOLD) style.fontFamily = fonts.sans.bold;
  if (format & ITALIC) style.fontStyle = "italic";
  if (format & UNDERLINE) style.textDecorationLine = "underline";
  if (format & STRIKETHROUGH) {
    style.textDecorationLine = style.textDecorationLine
      ? `${style.textDecorationLine} line-through`
      : "line-through";
  }

  return style;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const baseText = {
  fontFamily: fonts.sans.regular,
  fontSize: moderateScale(fontSizes.sm),
  color: colors.foreground,
  lineHeight: moderateScale(fontSizes.sm * 1.6),
};

const headingStyles: Record<string, object> = {
  h1: {
    ...baseText,
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["4xl"]),
    lineHeight: moderateScale(fontSizes["4xl"] * 1.25),
    marginTop: verticalScale(spacing[4]),
    marginBottom: verticalScale(spacing[2]),
  },
  h2: {
    ...baseText,
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["3xl"]),
    lineHeight: moderateScale(fontSizes["3xl"] * 1.25),
    marginTop: verticalScale(spacing[4]),
    marginBottom: verticalScale(spacing[2]),
  },
  h3: {
    ...baseText,
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    lineHeight: moderateScale(fontSizes["2xl"] * 1.25),
    marginTop: verticalScale(spacing[3]),
    marginBottom: verticalScale(spacing[2]),
  },
  h4: {
    ...baseText,
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xl),
    lineHeight: moderateScale(fontSizes.xl * 1.25),
    marginTop: verticalScale(spacing[3]),
    marginBottom: verticalScale(spacing[1]),
  },
  h5: {
    ...baseText,
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.lg),
    lineHeight: moderateScale(fontSizes.lg * 1.25),
    marginTop: verticalScale(spacing[2]),
    marginBottom: verticalScale(spacing[1]),
  },
  h6: {
    ...baseText,
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    lineHeight: moderateScale(fontSizes.base * 1.25),
    marginTop: verticalScale(spacing[2]),
    marginBottom: verticalScale(spacing[1]),
  },
};

const styles = StyleSheet.create({
  paragraph: {
    ...baseText,
    marginBottom: verticalScale(spacing[3]),
  },
  inlineCode: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: moderateScale(fontSizes.xs),
    backgroundColor: `${colors.muted}80`,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  list: {
    marginVertical: verticalScale(spacing[2]),
  },
  listItem: {
    flexDirection: "row",
    marginBottom: verticalScale(spacing[1]),
  },
  listBullet: {
    ...baseText,
    fontFamily: fonts.sans.medium,
    width: moderateScale(20),
    marginRight: moderateScale(spacing[1]),
  },
  listItemText: {
    ...baseText,
    flex: 1,
  },
  link: {
    ...baseText,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  quote: {
    flexDirection: "row",
    marginVertical: verticalScale(spacing[2]),
  },
  quoteBar: {
    width: 3,
    backgroundColor: colors.primary,
    marginRight: moderateScale(spacing[2]),
  },
  quoteContent: {
    flex: 1,
  },
});
