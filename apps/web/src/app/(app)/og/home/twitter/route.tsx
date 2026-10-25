import { renderHomeOg } from "@/utilities/og/render";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  return renderHomeOg();
}
