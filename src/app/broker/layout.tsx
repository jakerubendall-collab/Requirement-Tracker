import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Nav } from "@/components/shared/Nav";

export default async function BrokerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "BROKER") redirect("/login");

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Nav role="BROKER" userName={session.name} />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
