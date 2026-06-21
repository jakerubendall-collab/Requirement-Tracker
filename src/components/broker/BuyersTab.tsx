import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Buyer = {
  id: string;
  name: string;
  firm: string | null;
  type: string;
  stage: string;
  lastActivityAt: Date | string;
  notes: string | null;
};

type Tenant = {
  id: string;
  name: string;
  company: string | null;
  industry: string | null;
  requirementSF: number | null;
  stage: string;
  lastActivityAt: Date | string;
  notes: string | null;
};

const SALE_STAGES = ["PROSPECT", "TOURED", "NDA_SIGNED", "REVIEWING_DD", "OFFER_SUBMITTED", "PASSED"] as const;
const LEASE_STAGES = ["PROSPECT", "TOURED", "NDA_SIGNED", "REVIEWING_TERMS", "LOI_SUBMITTED", "PASSED"] as const;

const stageLabel: Record<string, string> = {
  PROSPECT: "Prospect", TOURED: "Toured", NDA_SIGNED: "NDA Signed",
  REVIEWING_DD: "Reviewing DD", REVIEWING_TERMS: "Reviewing Terms",
  OFFER_SUBMITTED: "Offer Submitted", LOI_SUBMITTED: "LOI Submitted", PASSED: "Passed",
};

const stageColor: Record<string, string> = {
  PROSPECT: "bg-gray-100 text-gray-600",
  TOURED: "bg-blue-100 text-blue-700",
  NDA_SIGNED: "bg-indigo-100 text-indigo-700",
  REVIEWING_DD: "bg-amber-100 text-amber-700",
  REVIEWING_TERMS: "bg-amber-100 text-amber-700",
  OFFER_SUBMITTED: "bg-emerald-100 text-emerald-700",
  LOI_SUBMITTED: "bg-emerald-100 text-emerald-700",
  PASSED: "bg-gray-100 text-gray-400",
};

const buyerTypeLabel: Record<string, string> = {
  OWNER_USER: "Owner-User", PRIVATE_INVESTOR: "Private Investor", SYNDICATOR: "Syndicator",
  FAMILY_OFFICE: "Family Office", EXCHANGE_1031: "1031 Exchange", INSTITUTIONAL: "Institutional",
};

export function BuyersTab({
  buyers,
  tenants,
  type,
}: {
  buyers?: Buyer[];
  tenants?: Tenant[];
  type: "SALE" | "LEASE";
}) {
  const stages = type === "SALE" ? SALE_STAGES : LEASE_STAGES;
  const items = type === "SALE" ? (buyers ?? []) : (tenants ?? []);
  const activeItems = items.filter((i) => i.stage !== "PASSED");
  const passedItems = items.filter((i) => i.stage === "PASSED");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.filter(s => s !== "PASSED").map((stage) => {
          const count = items.filter((i) => i.stage === stage).length;
          return (
            <div key={stage} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${count > 0 ? "text-gray-900" : "text-gray-300"}`}>{count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stageLabel[stage]}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-2">
        {activeItems.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-400">No active {type === "SALE" ? "buyers" : "tenants"} yet.</Card>
        )}
        {activeItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor[item.stage]}`}>
                    {stageLabel[item.stage]}
                  </span>
                  {"type" in item && item.type && (
                    <span className="text-xs text-gray-400">{buyerTypeLabel[item.type] ?? item.type}</span>
                  )}
                  {"industry" in item && item.industry && (
                    <span className="text-xs text-gray-400">{item.industry}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {"firm" in item ? item.firm : ("company" in item ? item.company : "")}
                  {"requirementSF" in item && item.requirementSF && (
                    <span> · {new Intl.NumberFormat("en-US").format(item.requirementSF)} SF requirement</span>
                  )}
                </div>
                {item.notes && <p className="text-xs text-gray-400 mt-1 italic">{item.notes}</p>}
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">Last: {formatDate(item.lastActivityAt)}</div>
            </div>
          </Card>
        ))}
      </div>

      {passedItems.length > 0 && (
        <details className="group">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600 select-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            {passedItems.length} passed / inactive
          </summary>
          <div className="mt-2 grid gap-2 opacity-60">
            {passedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-500">{item.name}</span>
                  <span className="text-xs text-gray-400">
                    {"firm" in item ? item.firm : ("company" in item ? item.company : "")}
                  </span>
                  {item.notes && <span className="text-xs text-gray-400 italic">— {item.notes}</span>}
                </div>
              </Card>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
