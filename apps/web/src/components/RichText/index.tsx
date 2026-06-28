import {
  DefaultNodeTypes,
  SerializedBlockNode,
} from "@payloadcms/richtext-lexical";
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  JSXConvertersFunction,
  RichText as RichTextWithoutBlocks,
} from "@payloadcms/richtext-lexical/react";

import { BannerBlock } from "@/blocks/Banner/Component";
import { CallToActionBlock } from "@/blocks/CallToAction/Component";
import { CodeBlock, CodeBlockProps } from "@/blocks/Code/Component";
import { MediaBlock } from "@/blocks/MediaBlock/Component";
import { textStateConfig } from "@/fields/textStateConfig";
import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from "@/payload-types";
import { cn } from "@/utilities/cn";

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps
    >;

// Lexical serializes node state under the "$" key.
const NODE_STATE_KEY = "$";

// React's style prop requires camelCase, but TextStateFeature CSS uses hyphen-case.
function hyphenToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    banner: ({ node }) => (
      <BannerBlock className="col-start-2 mb-4" {...node.fields} />
    ),
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-3xl"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },

  text: (args) => {
    const { node } = args;

    // Render standard formatting (bold, italic, etc.) using the default converter
    let text =
      typeof defaultConverters.text === "function"
        ? defaultConverters.text(args)
        : node.text;

    // Apply TextStateFeature styles from the "$" key in the serialized node
    const nodeState = (node as any)[NODE_STATE_KEY] as
      | Record<string, string>
      | undefined;
    if (nodeState) {
      const styles: React.CSSProperties = {};
      for (const [stateKey, stateValue] of Object.entries(nodeState)) {
        const css = (textStateConfig as any)[stateKey]?.[stateValue]?.css;
        if (css) {
          for (const [prop, value] of Object.entries(css)) {
            (styles as any)[hyphenToCamel(prop)] = value;
          }
        }
      }
      if (Object.keys(styles).length > 0) {
        text = <span style={styles}>{text}</span>;
      }
    }

    return text;
  },
});

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const RichText: React.FC<Props> = (props) => {
  const { className, enableProse = true, enableGutter = true, ...rest } = props;
  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      className={cn(
        {
          "container ": enableGutter,
          "max-w-none": !enableGutter,
          "mx-auto prose md:prose-md dark:prose-invert ": enableProse,
        },
        className,
      )}
      {...rest}
    />
  );
};
