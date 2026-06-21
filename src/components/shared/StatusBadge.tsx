import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "blue" | "purple" | "secondary" | "outline" }> = {
  COMING_SOON: { label: "Coming Soon", variant: "secondary" },
  ON_MARKET:   { label: "On Market", variant: "blue" },
  OFFERS_IN:   { label: "Offers In", variant: "warning" },
  IN_ESCROW:   { label: "In Escrow", variant: "purple" },
  CLOSED:      { label: "Closed", variant: "success" },
  LEASED:      { label: "Leased", variant: "success" },
  SUBMITTED:   { label: "Submitted", variant: "blue" },
  COUNTERED:   { label: "Countered", variant: "warning" },
  ACCEPTED:    { label: "Accepted", variant: "success" },
  REJECTED:    { label: "Rejected", variant: "destructive" },
  WITHDRAWN:   { label: "Withdrawn", variant: "secondary" },
  DRAFT:       { label: "Draft", variant: "secondary" },
  PUBLISHED:   { label: "Published", variant: "success" },
  ACTIVE:      { label: "Active", variant: "blue" },
  MATCHED:     { label: "Matched", variant: "purple" },
  DEAD:        { label: "Dead", variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
