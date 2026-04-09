import Image from "next/image";
import Link from "next/link";

import { DefaultDocumentIDType } from "payload";

import type {
  Category,
  FourItemGridBlock as FourItemGridBlockProps,
} from "@/payload-types";

export const FourItemGridItem: React.FC<{
  item: Category;
}> = ({ item }) => {
  return (
    <div>
      <Link
        className="relative block aspect-286/531 max-h-[531px] h-full w-full"
        href={`/shop?category=${item.slug}`}
      >
        {item.image && typeof item.image === "object" && (
          <Image
            fill
            src={item.image.url as string}
            alt={item.image.alt as string}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/50 flex items-end p-8">
          <span className="text-white text-2xl md:text-3xl font-serif capitalize drop-shadow-xs">
            {item.title}
          </span>
        </div>
      </Link>
    </div>
  );
};

export const FourItemGridBlock: React.FC<
  FourItemGridBlockProps & {
    id?: DefaultDocumentIDType;
    className?: string;
  }
> = async ({ categories }) => {
  const populatedCategories = (categories ?? []).filter(
    (category): category is Category =>
      typeof category === "object" && category !== null,
  );
  if (populatedCategories.length < 4) return null;

  const [firstCategory, secondCategory, thirdCategory, fourthCategory] =
    populatedCategories;

  return (
    <section className="container grid gap-4 pb-4 md:grid-cols-4">
      <FourItemGridItem item={firstCategory as Category} />
      <FourItemGridItem item={secondCategory as Category} />
      <FourItemGridItem item={thirdCategory as Category} />
      <FourItemGridItem item={fourthCategory as Category} />
    </section>
  );
};
