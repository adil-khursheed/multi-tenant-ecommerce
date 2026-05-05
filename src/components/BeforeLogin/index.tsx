import { redirect } from "next/navigation";

export const BeforeLogin: React.FC = () => {
  redirect("/login");
};
