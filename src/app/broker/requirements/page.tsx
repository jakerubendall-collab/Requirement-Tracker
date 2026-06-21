import { prisma } from "@/lib/prisma";
import { RequirementsBoard } from "@/components/broker/RequirementsBoard";

async function getRequirements() {
  return prisma.requirement.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function RequirementsPage() {
  const requirements = await getRequirements();
  return <RequirementsBoard initialRequirements={requirements} />;
}
