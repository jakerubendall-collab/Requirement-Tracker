import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileDown, Eye, Key, FileText, Download } from "lucide-react";

type Activity = {
  id: string;
  actorLabel: string;
  action: string;
  occurredAt: Date | string;
  buyer?: { name: string; firm: string | null } | null;
};

const actionIcon: Record<string, typeof FileDown> = {
  "Downloaded Full OM Package": FileDown,
  "Downloaded T12 Financials": FileDown,
  "Downloaded Title Report": FileDown,
  "Downloaded Brochure": Download,
  "Downloaded Environmental Report": FileDown,
  "Viewed Rent Roll": Eye,
  "Viewed Floor Plans": Eye,
  "Granted Secure DD Access": Key,
  "Reviewed Title Report": FileText,
  "Completed Physical Inspection": FileText,
  "Viewed Environmental Reports": Eye,
};

export function DDActivityTab({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <div className="divide-y divide-gray-100">
        {activities.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">No DD room activity yet.</div>
        )}
        {activities.map((a) => {
          const Icon = actionIcon[a.action] ?? FileText;
          return (
            <div key={a.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-900">{a.actorLabel}</span>
                <span className="text-sm text-gray-500"> {a.action.toLowerCase()}</span>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.occurredAt)}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
