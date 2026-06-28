import { Suspense } from "react";

import { getPayload } from "payload";

import configPromise from "@payload-config";
import clsx from "clsx";

import { CategoryItem } from "./Categories.client";

async function CategoryList() {
  const payload = await getPayload({ config: configPromise });

  const categories = await payload.find({
    collection: "categories",
    sort: "name",
  });

  return (
    <div>
      <h3 className="text-xs mb-2 text-neutral-500 dark:text-neutral-400">
        Category
      </h3>

      <ul>
        {categories.docs.map((category) => {
          return (
            <li key={category.id}>
              <CategoryItem category={category} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const skeleton = "mb-3 h-4 w-5/6 animate-pulse rounded";
const activeAndTitles = "bg-muted";
const items = "bg-muted";

export function Categories() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CategoryList />
    </Suspense>
  );
}
