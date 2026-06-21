import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";

type Offer = {
  id: string;
  amount: number;
  pricePerSF: number;
  status: string;
  termsSummary: string | null;
  contingencies: string | null;
  closeOfEscrowDays: number | null;
  brokerResponse: string | null;
  receivedAt: Date | string;
  buyer: { name: string; firm: string | null; type: string };
};

type LOI = {
  id: string;
  proposedRateNNN: number;
  leaseTerm: number;
  status: string;
  termsSummary: string | null;
  brokerResponse: string | null;
  receivedAt: Date | string;
  tenant: { name: string; company: string | null };
};

function buyerTypeLabel(t: string) {
  const m: Record<string, string> = {
    OWNER_USER: "Owner-User", PRIVATE_INVESTOR: "Private Investor", SYNDICATOR: "Syndicator",
    FAMILY_OFFICE: "Family Office", EXCHANGE_1031: "1031 Exchange", INSTITUTIONAL: "Institutional",
  };
  return m[t] ?? t;
}

export function OffersTab({
  offers = [],
  lois = [],
  propertyId,
  isLease = false,
}: {
  offers?: Offer[];
  lois?: LOI[];
  propertyId: string;
  isLease?: boolean;
}) {
  if (!isLease) {
    const sorted = [...offers].sort((a, b) => b.amount - a.amount);
    const best = sorted.find((o) => o.status === "SUBMITTED" || o.status === "COUNTERED");

    return (
      <div className="space-y-3">
        {sorted.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-400">No offers submitted yet.</Card>
        )}
        {sorted.map((offer) => (
          <Card key={offer.id} className={`p-5 ${offer.id === best?.id ? "ring-2 ring-[#003087]/20 border-[#003087]/30" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {offer.id === best?.id && (
                    <Badge variant="default" className="text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Lead offer
                    </Badge>
                  )}
                  <StatusBadge status={offer.status} />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Received {formatDate(offer.receivedAt)}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-semibold text-gray-900">{offer.buyer.name}</div>
                  <div className="text-sm text-gray-500">{offer.buyer.firm} · {buyerTypeLabel(offer.buyer.type)}</div>
                </div>
                {offer.termsSummary && <p className="text-sm text-gray-600 mt-2">{offer.termsSummary}</p>}
                {offer.contingencies && <p className="text-xs text-gray-400 mt-1">Contingencies: {offer.contingencies}</p>}
                {offer.brokerResponse && (
                  <div className="mt-2 bg-[#003087]/5 rounded-md p-2 text-xs text-[#003087]">
                    <span className="font-medium">Broker response: </span>{offer.brokerResponse}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{formatCurrency(offer.amount)}</div>
                <div className="text-sm text-gray-500">${offer.pricePerSF.toFixed(2)}/SF</div>
                {offer.closeOfEscrowDays && <div className="text-xs text-gray-400 mt-1">{offer.closeOfEscrowDays}-day COE</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const sorted = [...lois].sort((a, b) => b.proposedRateNNN - a.proposedRateNNN);
  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <Card className="p-8 text-center text-sm text-gray-400">No LOIs submitted yet.</Card>
      )}
      {sorted.map((loi) => (
        <Card key={loi.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={loi.status} />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Received {formatDate(loi.receivedAt)}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-semibold text-gray-900">{loi.tenant.name}</div>
                <div className="text-sm text-gray-500">{loi.tenant.company}</div>
              </div>
              {loi.termsSummary && <p className="text-sm text-gray-600 mt-2">{loi.termsSummary}</p>}
              {loi.brokerResponse && (
                <div className="mt-2 bg-[#003087]/5 rounded-md p-2 text-xs text-[#003087]">
                  <span className="font-medium">Broker response: </span>{loi.brokerResponse}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-gray-900">${loi.proposedRateNNN.toFixed(2)}/SF NNN</div>
              <div className="text-sm text-gray-500">{loi.leaseTerm}-month term</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
