import { Fragment, type ComponentType } from "react";
import { View } from "react-native";

import { verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";
import { ArchiveBlock } from "./ArchiveBlock";
import { BannerBlock } from "./BannerBlock";
import { CallToActionBlock } from "./CallToActionBlock";
import { CarouselBlock } from "./CarouselBlock";
import { CollectionsStripBlock } from "./CollectionsStripBlock";
import { ContentBlock } from "./ContentBlock";
import { FiveItemGridBlock } from "./FiveItemGridBlock";
import { FourItemGridBlock } from "./FourItemGridBlock";
import { MediaBlock } from "./MediaBlock";
import { TabsBlock } from "./TabsBlock";
import { ThreeItemGridBlock } from "./ThreeItemGridBlock";
import type { Block } from "./types";

const blockComponents: Record<string, ComponentType<any>> = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  cta: CallToActionBlock,
  carousel: CarouselBlock,
  collectionsStrip: CollectionsStripBlock,
  content: ContentBlock,
  mediaBlock: MediaBlock,
  threeItemGrid: ThreeItemGridBlock,
  fourItemGrid: FourItemGridBlock,
  fiveItemGrid: FiveItemGridBlock,
  tabs: TabsBlock,
};

type RenderBlocksProps = {
  blocks: Block[];
};

export function RenderBlocks({ blocks }: RenderBlocksProps) {
  if (!blocks?.length) return null;

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const Block =
          blockComponents[block.blockType as keyof typeof blockComponents];
        if (!Block) return null;

        return (
          <View
            key={index}
            style={{ paddingVertical: verticalScale(spacing[2]) }}
          >
            <Block {...block} />
          </View>
        );
      })}
    </Fragment>
  );
}
