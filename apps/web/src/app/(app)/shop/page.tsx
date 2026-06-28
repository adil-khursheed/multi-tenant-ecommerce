import type { Metadata } from "next";

import { getPayload } from "payload";

import configPromise from "@payload-config";

import { Grid } from "@/components/Grid";
import { ProductGridItem } from "@/components/ProductGridItem";

export const metadata: Metadata = {
  description: "Search for products in the store.",
  title: "Shop",
};

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams;
  const payload = await getPayload({ config: configPromise });

  const products = await payload.find({
    collection: "products",
    draft: false,
    overrideAccess: false,
    context: {
      isStorefront: true,
    },
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInINR: true,
      tenant: true,
      ratings: true,
      discountPercent: true,
      effectivePrice: true,
      flags: true,
    },
    populate: {
      tenants: {
        storeName: true,
        storeSlug: true,
      },
    },
    ...(sort ? { sort } : { sort: "title" }),
    ...(searchValue || category
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: "published",
                },
              },
              ...(searchValue
                ? [
                    {
                      or: [
                        {
                          title: {
                            like: searchValue,
                          },
                        },
                        {
                          description: {
                            like: searchValue,
                          },
                        },
                      ],
                    },
                  ]
                : []),
              ...(category
                ? [
                    {
                      categories: {
                        contains: category,
                      },
                    },
                  ]
                : []),
            ],
          },
        }
      : {}),
  });

  const resultsText = products.docs.length > 1 ? "results" : "result";

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {products.docs?.length === 0
            ? "There are no products that match "
            : `Showing ${products.docs.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products.docs?.length === 0 && (
        <p className="mb-4">No products found. Please try different filters.</p>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} product={product} />;
          })}
        </Grid>
      ) : null}
    </div>
  );
}
