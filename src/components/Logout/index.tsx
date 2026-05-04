import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "../ui/button";

export const Logout = () => {
  return (
    <Button variant={"ghost"} size={"icon-sm"}>
      <HugeiconsIcon icon={Logout01Icon} />
    </Button>
  );
};
