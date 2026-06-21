import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "BROKER" ? "/broker/dashboard" : "/client/dashboard");
  }
  redirect("/login");
}
