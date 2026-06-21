"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Sparkles, Loader2, Check, Save, RotateCcw, Eye, EyeOff, Plus } from "lucide-react";

interface WeeklyUpdate {
  id: string;
  weekOf: Date | string;
  status: string;
  aiDraftBody: string | null;
  finalBody: string | null;
  publishedAt: Date | string | null;
}

export function WeeklyUpdateEditor({
  propertyId,
  latestUpdate,
}: {
  propertyId: string;
  latestUpdate: WeeklyUpdate | null;
}) {
  const [update, setUpdate] = useState<WeeklyUpdate | null>(latestUpdate);
  const [finalBody, setFinalBody] = useState(latestUpdate?.finalBody ?? "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [published, setPublished] = useState(latestUpdate?.status === "PUBLISHED");
  const [expanded, setExpanded] = useState(latestUpdate?.status !== "PUBLISHED");
  const [addingSource, setAddingSource] = useState(false);
  const [sourceText, setSourceText] = useState("");

  async function generate() {
    setGenerating(true);
    setExpanded(true);
    try {
      const res = await fetch(`/api/generate/${propertyId}`, { method: "POST" });
      const data = await res.json();
      setUpdate((prev) => prev
        ? { ...prev, aiDraftBody: data.draft, finalBody: data.draft, id: data.updateId }
        : { id: data.updateId, weekOf: new Date(), status: "DRAFT", aiDraftBody: data.draft, finalBody: data.draft, publishedAt: null }
      );
      setFinalBody(data.draft);
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!update) return;
    setSaving(true);
    try {
      await fetch(`/api/weekly-updates/${update.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalBody }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!update) return;
    setPublishing(true);
    try {
      await fetch(`/api/weekly-updates/${update.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalBody, action: "publish" }),
      });
      setUpdate((prev) => prev ? { ...prev, status: "PUBLISHED", publishedAt: new Date() } : prev);
      setPublished(true);
      setExpanded(false);
    } finally {
      setPublishing(false);
    }
  }

  async function addSource() {
    if (!sourceText.trim()) return;
    await fetch(`/api/listings/${propertyId}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawSnippet: sourceText }),
    });
    setSourceText("");
    setAddingSource(false);
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#003087]/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#003087]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Weekly Client Update</h2>
            <p className="text-xs text-gray-500">
              {update ? `Week of ${formatDate(update.weekOf)}` : "No update this week yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {update && <StatusBadge status={update.status} />}
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); generate(); }}
            disabled={generating}
          >
            {generating ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />AI is reading your sources…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" />{update?.aiDraftBody ? "Regenerate" : "Generate update"}</>
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          {generating && (
            <div className="px-6 py-8 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#003087]" />
              <div>
                <p className="font-medium text-gray-900 text-sm">AI is reading your emails, calls, and CRM…</p>
                <p className="text-xs text-gray-500 mt-1">Synthesizing source signals into your weekly update</p>
              </div>
              <div className="flex gap-1 mt-1">
                {["📧 Gmail", "📞 Call Notes", "📊 Pipedrive"].map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {!generating && update && (
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Draft</h3>
                  <button
                    onClick={() => setShowAI((s) => !s)}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    {showAI ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showAI ? "Hide" : "Show"}
                  </button>
                </div>
                {showAI && (
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 min-h-[200px]">
                    {update.aiDraftBody ?? "Generate a draft to see AI output here."}
                  </div>
                )}
                {showAI && update.aiDraftBody && (
                  <button
                    className="mt-2 text-xs text-[#003087] hover:underline flex items-center gap-1"
                    onClick={() => setFinalBody(update.aiDraftBody ?? "")}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Copy to editor
                  </button>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Final (editable)</h3>
                  <span className="text-xs text-gray-400">{finalBody.split(" ").length} words</span>
                </div>
                <textarea
                  value={finalBody}
                  onChange={(e) => setFinalBody(e.target.value)}
                  rows={10}
                  placeholder="Write or paste your client update here…"
                  className="w-full text-sm text-gray-900 leading-relaxed border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none min-h-[200px]"
                />
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={save} disabled={saving}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save draft
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={publish}
                    disabled={publishing || !finalBody.trim()}
                  >
                    {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Publish to client
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!generating && !update && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              Click "Generate update" to create this week's AI-drafted client update.
            </div>
          )}

          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
            {addingSource ? (
              <div className="flex gap-2">
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste an email, call notes, or any update…"
                  rows={3}
                  className="flex-1 text-sm border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none"
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={addSource}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingSource(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingSource(true)}
                className="text-xs text-gray-500 hover:text-[#003087] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add source signal (email, call notes, CRM update)
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
