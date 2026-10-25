import { renderProductOg } from "@/utilities/og/render";

export const runtime = "nodejs";
export const revalidate = 3600;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  return renderProductOg(slug);
}
