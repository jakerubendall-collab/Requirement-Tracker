import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatSF, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientMarketingChart } from "@/components/client/ClientMarketingChart";
import {
  Building2, MapPin, Ruler, DoorOpen, Calendar,
  FileText, Users, Eye, Download, Mail, TrendingUp,
  FileDown, Key, CheckCircle2, Clock, Star
} from "lucide-react";

async function getClientProperty(userId: string) {
  return prisma.property.findFirst({
    where: { primaryContactId: userId },
    include: {
      buyers: { include: { offers: true }, orderBy: { lastActivityAt: "desc" } },
      offers: { include: { buyer: true }, orderBy: { amount: "desc" } },
      tenants: { include: { lois: true }, orderBy: { lastActivityAt: "desc" } },
      lois: { include: { tenant: true }, orderBy: { receivedAt: "desc" } },
      ddRoomActivity: { include: { buyer: true }, orderBy: { occurredAt: "desc" }, take: 15 },
      marketingMetrics: { orderBy: { date: "asc" } },
      weeklyUpdates: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 1,
      },
    },
  });
}

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

const offerStatusColor: Record<string, string> = {
  SUBMITTED: "text-blue-600",
  COUNTERED: "text-amber-600",
  ACCEPTED: "text-emerald-600",
  REJECTED: "text-gray-400",
  WITHDRAWN: "text-gray-400",
};

const ddActionIcon: Record<string, React.ElementType> = {
  "Downloaded Full OM Package": FileDown,
  "Downloaded T12 Financials": FileDown,
  "Downloaded Title Report": FileDown,
  "Downloaded Brochure": Download,
  "Viewed Rent Roll": Eye,
  "Viewed Floor Plans": Eye,
  "Granted Secure DD Access": Key,
  "Reviewed Title Report": FileText,
  "Completed Physical Inspection": CheckCircle2,
};

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const property = await getClientProperty(session.userId);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Building2 className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No listing found</h2>
        <p className="text-gray-500 text-sm mt-2">Contact your broker to set up your listing portal.</p>
      </div>
    );
  }

  const isSale = property.transactionType === "SALE";
  const latestUpdate = property.weeklyUpdates[0];
  const latestMetric = property.marketingMetrics.at(-1);
  const daysOnMarket = latestMetric?.daysOnMarket ?? 0;

  const totals = property.marketingMetrics.reduce(
    (acc, m) => ({
      views: acc.views + m.listingViews,
      omDownloads: acc.omDownloads + m.omDownloads,
      tours: acc.tours + m.tours,
      blasts: acc.blasts + m.emailBlastsSent,
    }),
    { views: 0, omDownloads: 0, tours: 0, blasts: 0 }
  );

  const SALE_STAGES = ["PROSPECT", "TOURED", "NDA_SIGNED", "REVIEWING_DD", "OFFER_SUBMITTED"];
  const LEASE_STAGES = ["PROSPECT", "TOURED", "NDA_SIGNED", "REVIEWING_TERMS", "LOI_SUBMITTED"];
  const stages = isSale ? SALE_STAGES : LEASE_STAGES;
  const counterparties = isSale ? property.buyers : property.tenants;
  const activeCounterparties = counterparties.filter((c) => c.stage !== "PASSED");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {property.heroImageUrl && (
          <div className="h-56 w-full overflow-hidden">
            <img src={property.heroImageUrl} alt={property.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                <StatusBadge status={property.status} />
              </div>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {property.addressLine} · {property.submarket}
              </p>
            </div>
            <div className="text-right">
              {isSale && property.askingPrice && (
                <div className="text-3xl font-bold text-[#003087]">{formatCurrency(property.askingPrice)}</div>
              )}
              {!isSale && property.askingRateNNN && (
                <div className="text-3xl font-bold text-[#003087]">${property.askingRateNNN.toFixed(2)}<span className="text-lg font-normal text-gray-500">/SF NNN</span></div>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {formatSF(property.buildingSF)} · {daysOnMarket} days on market
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-5 text-sm text-gray-600">
            {property.clearHeightFt && (
              <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4 text-gray-400" />{property.clearHeightFt}′ clear</span>
            )}
            {property.dockDoors !== null && property.dockDoors !== undefined && (
              <span className="flex items-center gap-1.5"><DoorOpen className="h-4 w-4 text-gray-400" />{property.dockDoors} dock doors</span>
            )}
            {property.gradeLevelDoors !== null && property.gradeLevelDoors !== undefined && (
              <span>{property.gradeLevelDoors} grade-level</span>
            )}
            {property.yearBuilt && <span>Built {property.yearBuilt}</span>}
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" />Listed {formatDate(property.listedDate)}</span>
          </div>
        </div>
      </div>

      {latestUpdate && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <h2 className="font-semibold text-gray-900">This week from your broker</h2>
            </div>
            <span className="text-xs text-gray-400">Week of {formatDate(latestUpdate.weekOf)}</span>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{latestUpdate.finalBody}</p>
          </div>
        </Card>
      )}

      {!latestUpdate && (
        <Card className="p-6 border border-dashed text-center">
          <p className="text-sm text-gray-400">Your broker's weekly update will appear here once published.</p>
        </Card>
      )}

      {isSale && property.offers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Offers</h2>
          <div className="space-y-3">
            {property.offers.map((offer, i) => {
              const isLead = i === 0 && (offer.status === "SUBMITTED" || offer.status === "COUNTERED");
              return (
                <Card key={offer.id} className={`p-5 ${isLead ? "ring-2 ring-[#003087]/20" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {isLead && (
                        <div className="flex items-center gap-1 text-xs text-[#003087] font-semibold mb-1">
                          <Star className="h-3 w-3 fill-[#003087]" />
                          Lead offer
                        </div>
                      )}
                      <div className="font-semibold text-gray-900">{offer.buyer.name}</div>
                      <div className="text-sm text-gray-500">{offer.buyer.firm}</div>
                      {offer.termsSummary && <p className="text-sm text-gray-600 mt-1.5">{offer.termsSummary}</p>}
                      {offer.brokerResponse && (
                        <div className="mt-2 bg-[#003087]/5 rounded-md p-2 text-xs text-[#003087]">
                          <span className="font-medium">Broker note: </span>{offer.brokerResponse}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(offer.amount)}</div>
                      <div className="text-sm text-gray-500">${offer.pricePerSF.toFixed(2)}/SF</div>
                      <div className={`text-xs font-medium mt-1 ${offerStatusColor[offer.status] ?? "text-gray-500"}`}>
                        {offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!isSale && property.lois.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Letters of Intent</h2>
          <div className="space-y-3">
            {property.lois.map((loi) => (
              <Card key={loi.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{loi.tenant.name}</div>
                    <div className="text-sm text-gray-500">{loi.tenant.company}</div>
                    {loi.termsSummary && <p className="text-sm text-gray-600 mt-1.5">{loi.termsSummary}</p>}
                    {loi.brokerResponse && (
                      <div className="mt-2 bg-[#003087]/5 rounded-md p-2 text-xs text-[#003087]">
                        <span className="font-medium">Broker note: </span>{loi.brokerResponse}
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
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{isSale ? "Buyer" : "Tenant"} Pipeline</h2>
        <Card className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {stages.map((stage) => {
              const count = counterparties.filter((c) => c.stage === stage).length;
              return (
                <div key={stage} className="text-center">
                  <div className={`text-2xl font-bold ${count > 0 ? "text-gray-900" : "text-gray-300"}`}>{count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stageLabel[stage]}</div>
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            {activeCounterparties.filter((c) => c.stage !== "PASSED").slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    {"firm" in c && c.firm && <span className="text-xs text-gray-400 ml-1.5">{c.firm}</span>}
                    {"company" in c && c.company && <span className="text-xs text-gray-400 ml-1.5">{c.company}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor[c.stage]}`}>
                  {stageLabel[c.stage]}
                </span>
              </div>
            ))}
            {counterparties.filter((c) => c.stage === "PASSED").length > 0 && (
              <p className="text-xs text-gray-400 pt-2">
                + {counterparties.filter((c) => c.stage === "PASSED").length} passed
              </p>
            )}
          </div>
        </Card>
      </div>

      {property.ddRoomActivity.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Due Diligence Activity</h2>
          <Card>
            <div className="divide-y divide-gray-50">
              {property.ddRoomActivity.slice(0, 10).map((a) => {
                const Icon = ddActionIcon[a.action] ?? FileText;
                return (
                  <div key={a.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="font-medium text-gray-900">{a.actorLabel}</span>
                      <span className="text-gray-500"> {a.action.toLowerCase()}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.occurredAt)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Marketing Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Views", value: totals.views, icon: Eye, color: "text-blue-600" },
            { label: "OM Downloads", value: totals.omDownloads, icon: Download, color: "text-[#003087]" },
            { label: "Tours Completed", value: totals.tours, icon: MapPin, color: "text-emerald-600" },
            { label: "Email Blasts", value: totals.blasts, icon: Mail, color: "text-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>
        {property.marketingMetrics.length > 0 && (
          <ClientMarketingChart metrics={property.marketingMetrics} />
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Listing Timeline</h2>
        <Card className="p-6">
          <div className="space-y-4">
            {[
              { label: "Listed", date: property.listedDate, done: true },
              { label: "First Tour", date: counterparties.filter((c) => c.stage !== "PROSPECT").at(0)?.lastActivityAt, done: true },
              { label: "First Offer / LOI", date: isSale ? property.offers.at(-1)?.receivedAt : property.lois.at(-1)?.receivedAt, done: !!(isSale ? property.offers.length : property.lois.length) },
              { label: "In Escrow / LOI Accepted", done: ["IN_ESCROW", "LEASED"].includes(property.status) },
              { label: "Closed", done: ["CLOSED", "LEASED"].includes(property.status) },
            ].map(({ label, date, done }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-[#003087] text-white" : "bg-gray-100 text-gray-400"}`}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className={`text-sm font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                  {date && <span className="text-xs text-gray-400">{formatDate(date)}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
