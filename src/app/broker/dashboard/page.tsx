import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatSF, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, FileText, TrendingUp, ChevronRight, AlertCircle, CheckCircle2, Edit3
} from "lucide-react";

async function getPortfolioData() {
  const properties = await prisma.property.findMany({
    include: {
      primaryContact: true,
      buyers: true,
      offers: true,
      tenants: true,
      lois: true,
      weeklyUpdates: { orderBy: { createdAt: "desc" }, take: 1 },
      marketingMetrics: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { listedDate: "desc" },
  });
  return properties;
}

const statusOrder: Record<string, number> = {
  OFFERS_IN: 0, IN_ESCROW: 1, ON_MARKET: 2, COMING_SOON: 3, LEASED: 4, CLOSED: 5,
};

export default async function BrokerDashboard() {
  const properties = await getPortfolioData();
  const sorted = [...properties].sort((a, b) =>
    (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
  );

  const totalListings = properties.length;
  const activeListings = properties.filter((p) => !["CLOSED", "LEASED"].includes(p.status)).length;
  const totalOffers = properties.reduce((s, p) => s + p.offers.length, 0);
  const pendingDrafts = properties.filter(
    (p) => p.weeklyUpdates[0]?.status === "DRAFT" || !p.weeklyUpdates[0]
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: activeListings, icon: Building2, color: "text-[#003087]" },
          { label: "Total Offers", value: totalOffers, icon: FileText, color: "text-amber-600" },
          { label: "Total Listings", value: totalListings, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Updates Needed", value: pendingDrafts, icon: AlertCircle, color: "text-red-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <Icon className={`h-6 w-6 ${color} opacity-70`} />
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Listings</h2>
        <div className="grid gap-4">
          {sorted.map((property) => {
            const latestUpdate = property.weeklyUpdates[0];
            const updateStatus = latestUpdate?.status ?? "NONE";
            const counterpartyCount = property.buyers.length + property.tenants.length;
            const offerCount = property.offers.length + property.lois.length;
            const latestMetric = property.marketingMetrics[0];
            const daysOnMarket = latestMetric?.daysOnMarket ?? 0;

            return (
              <Link key={property.id} href={`/broker/listings/${property.id}`} className="block">
                <Card className="hover:shadow-md hover:border-[#003087]/30 transition-all cursor-pointer group">
                  <div className="p-6 flex items-start gap-6">
                    <div className="hidden sm:block w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {property.heroImageUrl ? (
                        <img src={property.heroImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#003087] transition-colors">
                              {property.name}
                            </h3>
                            <StatusBadge status={property.status} />
                            <Badge variant="outline" className="text-xs">
                              {property.transactionType === "SALE" ? "For Sale" : "For Lease"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{property.addressLine} · {property.submarket}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {property.transactionType === "SALE" && property.askingPrice && (
                            <p className="font-semibold text-gray-900">{formatCurrency(property.askingPrice, true)}</p>
                          )}
                          {property.transactionType === "LEASE" && property.askingRateNNN && (
                            <p className="font-semibold text-gray-900">${property.askingRateNNN.toFixed(2)}/SF NNN</p>
                          )}
                          <p className="text-xs text-gray-400">{formatSF(property.buildingSF)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {counterpartyCount} {property.transactionType === "SALE" ? "buyers" : "prospects"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {offerCount} {property.transactionType === "SALE" ? "offers" : "LOIs"}
                        </span>
                        <span>{daysOnMarket} DOM</span>
                        <span>Client: {property.primaryContact.name}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      {updateStatus === "PUBLISHED" ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Update sent
                        </span>
                      ) : updateStatus === "DRAFT" ? (
                        <span className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                          <Edit3 className="h-3.5 w-3.5" />
                          Draft ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Needs update
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#003087] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
