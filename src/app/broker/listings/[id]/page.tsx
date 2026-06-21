import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatSF, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OffersTab } from "@/components/broker/OffersTab";
import { BuyersTab } from "@/components/broker/BuyersTab";
import { DDActivityTab } from "@/components/broker/DDActivityTab";
import { MarketingTab } from "@/components/broker/MarketingTab";
import { SourcesTab } from "@/components/broker/SourcesTab";
import { WeeklyUpdateEditor } from "@/components/broker/WeeklyUpdateEditor";
import { Building2, MapPin, Ruler, DoorOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getProperty(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      primaryContact: true,
      buyers: { include: { offers: true }, orderBy: { lastActivityAt: "desc" } },
      offers: { include: { buyer: true }, orderBy: { receivedAt: "desc" } },
      tenants: { include: { lois: true }, orderBy: { lastActivityAt: "desc" } },
      lois: { include: { tenant: true }, orderBy: { receivedAt: "desc" } },
      ddRoomActivity: { include: { buyer: true }, orderBy: { occurredAt: "desc" } },
      marketingMetrics: { orderBy: { date: "asc" } },
      weeklyUpdates: { orderBy: { createdAt: "desc" } },
      sourceSignals: { orderBy: { capturedAt: "desc" } },
    },
  });
}

export default async function BrokerListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const isSale = property.transactionType === "SALE";
  const latestMetric = property.marketingMetrics.at(-1);
  const daysOnMarket = latestMetric?.daysOnMarket ?? 0;
  const latestUpdate = property.weeklyUpdates[0];

  return (
    <div className="space-y-6">
      <Link
        href="/broker/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003087] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Portfolio
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {property.heroImageUrl && (
          <div className="h-48 w-full overflow-hidden">
            <img src={property.heroImageUrl} alt={property.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{property.name}</h1>
                <StatusBadge status={property.status} />
                <Badge variant="outline">{isSale ? "For Sale" : "For Lease"}</Badge>
              </div>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.addressLine} · {property.submarket}
              </p>
            </div>
            <div className="text-right">
              {isSale && property.askingPrice && (
                <div className="text-2xl font-bold text-[#003087]">{formatCurrency(property.askingPrice)}</div>
              )}
              {!isSale && property.askingRateNNN && (
                <div className="text-2xl font-bold text-[#003087]">${property.askingRateNNN.toFixed(2)}/SF NNN</div>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                Listed {formatDate(property.listedDate)} · {daysOnMarket} DOM
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-gray-400" />
              {formatSF(property.buildingSF)}
            </span>
            {property.clearHeightFt && <span>{property.clearHeightFt}′ clear height</span>}
            {property.dockDoors !== null && property.dockDoors !== undefined && (
              <span className="flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4 text-gray-400" />
                {property.dockDoors} dock doors
              </span>
            )}
            {property.gradeLevelDoors !== null && property.gradeLevelDoors !== undefined && (
              <span>{property.gradeLevelDoors} grade-level</span>
            )}
            {property.yearBuilt && <span>Built {property.yearBuilt}</span>}
            {property.officeSF && <span>{formatSF(property.officeSF)} office</span>}
            <span className="ml-auto text-gray-400">Client: {property.primaryContact.name}</span>
          </div>
        </div>
      </div>

      <WeeklyUpdateEditor propertyId={property.id} latestUpdate={latestUpdate ?? null} />

      <Tabs defaultValue={isSale ? "offers" : "lois"}>
        <TabsList className="flex-wrap h-auto">
          {isSale ? (
            <>
              <TabsTrigger value="offers">Offers ({property.offers.length})</TabsTrigger>
              <TabsTrigger value="buyers">Buyers ({property.buyers.length})</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="lois">LOIs ({property.lois.length})</TabsTrigger>
              <TabsTrigger value="buyers">Tenants ({property.tenants.length})</TabsTrigger>
            </>
          )}
          <TabsTrigger value="dd">DD Activity ({property.ddRoomActivity.length})</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sources">Sources ({property.sourceSignals.length})</TabsTrigger>
        </TabsList>

        {isSale ? (
          <>
            <TabsContent value="offers">
              <OffersTab offers={property.offers} propertyId={property.id} />
            </TabsContent>
            <TabsContent value="buyers">
              <BuyersTab buyers={property.buyers} type="SALE" />
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="lois">
              <OffersTab offers={[]} lois={property.lois} propertyId={property.id} isLease />
            </TabsContent>
            <TabsContent value="buyers">
              <BuyersTab tenants={property.tenants} type="LEASE" />
            </TabsContent>
          </>
        )}

        <TabsContent value="dd">
          <DDActivityTab activities={property.ddRoomActivity} />
        </TabsContent>
        <TabsContent value="marketing">
          <MarketingTab metrics={property.marketingMetrics} />
        </TabsContent>
        <TabsContent value="sources">
          <SourcesTab signals={property.sourceSignals} propertyId={property.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
