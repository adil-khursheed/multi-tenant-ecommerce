import { getCachedGlobal } from "@/utilities/getGlobals";

import "./index.css";

import { getUser } from "@/utilities/getUser";
import { HeaderClient } from "./index.client";

export async function Header() {
  const header = getCachedGlobal("header", 1)();
  const user = getUser();

  const [headerData, userData] = await Promise.all([header, user]);

  return <HeaderClient header={headerData} user={userData} />;
}
