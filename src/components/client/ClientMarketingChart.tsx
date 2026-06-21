"use client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

type Metric = {
  id: string;
  date: Date | string;
  listingViews: number;
  omDownloads: number;
  tours: number;
  daysOnMarket: number;
};

export function ClientMarketingChart({ metrics }: { metrics: Metric[] }) {
  const data = metrics.map((m) => ({
    week: `Week ${Math.ceil(m.daysOnMarket / 7) || 1}`,
    "Listing Views": m.listingViews,
    "OM Downloads": m.omDownloads,
    "Tours": m.tours,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#003087]" />
        Activity trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="Listing Views" stroke="#003087" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="OM Downloads" stroke="#059669" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Tours" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
