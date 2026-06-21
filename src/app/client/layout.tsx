import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Nav } from "@/components/shared/Nav";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "BROKER") redirect("/broker/dashboard");

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Nav role="SELLER" userName={session.name} />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
