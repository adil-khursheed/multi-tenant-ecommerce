import type { MediaSource } from "@/utils/media";

export type BlockLink = {
  href: string;
  label: string;
  appearance: string;
  newTab?: boolean | null;
};

export type CarouselItem =
  | {
      type: "product";
      slug: string;
      title?: string | null;
      price: number | null;
      image: MediaSource;
    }
  | {
      type: "category";
      slug: string;
      name?: string | null;
      image: MediaSource;
    }
  | {
      type: "collection";
      slug: string;
      name?: string | null;
      coverImage: MediaSource;
    };

export type CollectionStripItem = {
  slug: string;
  name?: string | null;
  coverImage: MediaSource;
};

export type CategoryCardItem = {
  id?: string | number;
  slug: string;
  name?: string | null;
  image: MediaSource;
};

export type CategoryTab = {
  parentName?: string | null;
  parentSlug?: string | null;
  children: CategoryCardItem[];
};

export type CustomTab = {
  tab: string;
  content: unknown;
};

export type Block =
  | {
      blockType: "banner";
      id?: string | null;
      blockName?: string | null;
      style: string;
      content: unknown;
    }
  | {
      blockType: "cta";
      id?: string | null;
      blockName?: string | null;
      richText: unknown;
      links: BlockLink[];
    }
  | {
      blockType: "content";
      id?: string | null;
      blockName?: string | null;
      columns: {
        size?: string | null;
        richText?: unknown;
        link?: BlockLink | null;
      }[];
    }
  | {
      blockType: "mediaBlock";
      id?: string | null;
      blockName?: string | null;
      media: MediaSource;
      caption: unknown;
    }
  | {
      blockType: "archive";
      id?: string | null;
      blockName?: string | null;
      introContent: unknown;
      products: unknown[];
    }
  | {
      blockType: "carousel";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      items: CarouselItem[];
    }
  | {
      blockType: "collectionsStrip";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      items: CollectionStripItem[];
    }
  | {
      blockType: "threeItemGrid";
      id?: string | null;
      blockName?: string | null;
      products: unknown[];
    }
  | {
      blockType: "fourItemGrid";
      id?: string | null;
      blockName?: string | null;
      categories: CategoryCardItem[];
    }
  | {
      blockType: "fiveItemGrid";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      products: unknown[];
    }
  | {
      blockType: "tabs";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      contentType: "categories" | "custom";
      categoryTabs: CategoryTab[];
      customTabs: CustomTab[];
    };
