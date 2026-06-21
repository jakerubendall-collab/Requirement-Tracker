"use client";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Eye, Download, Mail, MapPin, TrendingUp } from "lucide-react";

type Metric = {
  id: string;
  date: Date | string;
  listingViews: number;
  omDownloads: number;
  emailBlastsSent: number;
  brochureDownloads: number;
  tours: number;
  daysOnMarket: number;
};

export function MarketingTab({ metrics }: { metrics: Metric[] }) {
  const totals = metrics.reduce(
    (acc, m) => ({
      views: acc.views + m.listingViews,
      omDownloads: acc.omDownloads + m.omDownloads,
      blasts: acc.blasts + m.emailBlastsSent,
      tours: acc.tours + m.tours,
      brochure: acc.brochure + m.brochureDownloads,
    }),
    { views: 0, omDownloads: 0, blasts: 0, tours: 0, brochure: 0 }
  );

  const chartData = metrics.map((m) => ({
    week: `W${Math.ceil(m.daysOnMarket / 7) || 1}`,
    "Listing Views": m.listingViews,
    "OM Downloads": m.omDownloads,
    "Tours": m.tours,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Views", value: totals.views, icon: Eye, color: "text-blue-600" },
          { label: "OM Downloads", value: totals.omDownloads, icon: Download, color: "text-[#003087]" },
          { label: "Email Blasts", value: totals.blasts, icon: Mail, color: "text-purple-600" },
          { label: "Brochures", value: totals.brochure, icon: Download, color: "text-indigo-600" },
          { label: "Tours", value: totals.tours, icon: MapPin, color: "text-emerald-600" },
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

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#003087]" />
          Weekly marketing activity
        </h3>
        {metrics.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Listing Views" stroke="#003087" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="OM Downloads" stroke="#059669" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Tours" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
