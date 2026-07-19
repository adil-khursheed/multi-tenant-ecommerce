import { Skeleton } from "@/components/ui/skeleton";
import { SidebarGroup } from "./SidebarGroup";

export const SidebarSkeleton = () => {
  return (
    <aside className="w-[260px] shrink-0 sticky top-10 h-[calc(100vh-80px)] overflow-y-auto pr-6 hidden md:block">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-9 w-full rounded-none border-b" />
      </div>

      <SidebarGroup title="Categories">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <ul className="space-y-1 border-l border-border/50 ml-2 pl-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="py-1">
                  <Skeleton className="h-3 w-full max-w-[140px]" />
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <ul className="space-y-1 border-l border-border/50 ml-2 pl-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="py-1">
                  <Skeleton className="h-3 w-full max-w-[120px]" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SidebarGroup>

      <SidebarGroup title="Price Range">
        <div className="px-1 pt-2 pb-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-[72px] rounded-[2px]" />
            ))}
          </div>
        </div>
      </SidebarGroup>

      <SidebarGroup title="Size">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-[2px]" />
          ))}
        </div>
      </SidebarGroup>

      <SidebarGroup title="Color">
        <div className="grid grid-cols-6 gap-y-4 gap-x-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </SidebarGroup>

      <SidebarGroup title="Ratings">
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-2 p-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-8" />
            </li>
          ))}
        </ul>
      </SidebarGroup>

      <SidebarGroup title="Occasion" defaultOpen={false}>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </SidebarGroup>

      <SidebarGroup title="Fabric/Material" defaultOpen={false}>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </SidebarGroup>

      <SidebarGroup title="Brand" defaultOpen={false}>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </SidebarGroup>
    </aside>
  );
};
