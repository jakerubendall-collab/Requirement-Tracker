"use client";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Database, Edit3, Plus, Loader2 } from "lucide-react";

type Signal = {
  id: string;
  sourceType: string;
  rawSnippet: string;
  capturedAt: Date | string;
};

const sourceIcon: Record<string, React.ElementType> = {
  GMAIL: Mail,
  GRANOLA: Phone,
  PIPEDRIVE: Database,
  MANUAL: Edit3,
};

const sourceColor: Record<string, string> = {
  GMAIL: "bg-red-50 text-red-700 border-red-100",
  GRANOLA: "bg-green-50 text-green-700 border-green-100",
  PIPEDRIVE: "bg-orange-50 text-orange-700 border-orange-100",
  MANUAL: "bg-gray-50 text-gray-600 border-gray-200",
};

export function SourcesTab({ signals, propertyId }: { signals: Signal[]; propertyId: string }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [localSignals, setLocalSignals] = useState(signals);

  async function handleAdd() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${propertyId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawSnippet: text }),
      });
      const newSignal = await res.json();
      setLocalSignals((prev) => [newSignal, ...prev]);
      setText("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Source signals are the raw inputs the AI uses to generate your weekly client update.
        </p>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add source
        </Button>
      </div>

      {adding && (
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Paste email, call notes, or any update</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste content here…"
            className="w-full text-sm border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none"
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleAdd} disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save source
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {localSignals.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-400">No source signals yet.</Card>
        )}
        {localSignals.map((s) => {
          const Icon = sourceIcon[s.sourceType] ?? Edit3;
          const colorClass = sourceColor[s.sourceType] ?? "bg-gray-50 text-gray-600 border-gray-200";
          return (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
                      {s.sourceType}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(s.capturedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.rawSnippet}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
