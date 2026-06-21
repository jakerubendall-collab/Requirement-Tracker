"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Phone, Mail, Building2, X, Loader2 } from "lucide-react";

type Requirement = {
  id: string;
  contactName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  minSF: number | null;
  maxSF: number | null;
  submarkets: string | null;
  industry: string | null;
  timeline: string | null;
  budget: string | null;
  type: string;
  stage: string;
  notes: string | null;
  source: string | null;
  lastContactAt: Date | string | null;
  createdAt: Date | string;
};

const typeColors: Record<string, string> = {
  LEASE: "bg-blue-50 text-blue-700",
  PURCHASE: "bg-purple-50 text-purple-700",
  EITHER: "bg-emerald-50 text-emerald-700",
};

const typeLabel: Record<string, string> = {
  LEASE: "Lease", PURCHASE: "Purchase", EITHER: "Lease or Buy",
};

const stageLabel: Record<string, string> = {
  ACTIVE: "Active", MATCHED: "Matched", CLOSED: "Closed", DEAD: "Dead",
};

const stageVariant: Record<string, "blue" | "purple" | "success" | "secondary"> = {
  ACTIVE: "blue", MATCHED: "purple", CLOSED: "success", DEAD: "secondary",
};

function RequirementCard({ req }: { req: Requirement }) {
  const sfRange = req.minSF || req.maxSF
    ? `${req.minSF ? new Intl.NumberFormat("en-US").format(req.minSF) : ""}${req.maxSF ? "–" + new Intl.NumberFormat("en-US").format(req.maxSF) + " SF" : "+ SF"}`
    : null;

  return (
    <Card className={`p-5 ${req.stage === "DEAD" ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-gray-900">{req.contactName}</span>
            <Badge variant={stageVariant[req.stage] ?? "secondary"}>{stageLabel[req.stage]}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[req.type]}`}>
              {typeLabel[req.type]}
            </span>
          </div>

          {req.company && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
              <Building2 className="h-3.5 w-3.5 text-gray-400" />
              {req.company}
              {req.industry && <span className="text-gray-400">· {req.industry}</span>}
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
            {sfRange && <span className="font-medium text-[#003087]">{sfRange}</span>}
            {req.submarkets && <span className="text-gray-500">{req.submarkets}</span>}
            {req.timeline && <span className="text-gray-500">Timeline: {req.timeline}</span>}
            {req.budget && <span className="text-gray-500">Budget: {req.budget}</span>}
          </div>

          {req.notes && <p className="text-xs text-gray-400 mt-2 italic">{req.notes}</p>}

          <div className="flex items-center gap-4 mt-3">
            {req.email && (
              <a href={`mailto:${req.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#003087] transition-colors">
                <Mail className="h-3 w-3" />
                {req.email}
              </a>
            )}
            {req.phone && (
              <a href={`tel:${req.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#003087] transition-colors">
                <Phone className="h-3 w-3" />
                {req.phone}
              </a>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0 text-xs text-gray-400">
          {req.lastContactAt && <div>Last: {formatDate(req.lastContactAt)}</div>}
          {req.source && <div className="mt-0.5 text-gray-300">via {req.source}</div>}
        </div>
      </div>
    </Card>
  );
}

function AddRequirementModal({ onClose, onAdd }: { onClose: () => void; onAdd: (r: Requirement) => void }) {
  const [form, setForm] = useState({
    contactName: "", company: "", email: "", phone: "",
    minSF: "", maxSF: "", submarkets: "", industry: "",
    timeline: "", budget: "", type: "LEASE", notes: "", source: "",
  });
  const [saving, setSaving] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minSF: form.minSF ? parseInt(form.minSF) : null,
          maxSF: form.maxSF ? parseInt(form.maxSF) : null,
          stage: "ACTIVE",
        }),
      });
      const req = await res.json();
      onAdd(req);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Requirement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "contactName", label: "Contact Name *", required: true },
              { key: "company", label: "Company" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone" },
              { key: "minSF", label: "Min SF", type: "number" },
              { key: "maxSF", label: "Max SF", type: "number" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  required={required}
                  type={type ?? "text"}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Submarkets</label>
            <input value={form.submarkets} onChange={(e) => set("submarkets", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select required value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option value="LEASE">Lease</option>
                <option value="PURCHASE">Purchase</option>
                <option value="EITHER">Either</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
              <input value={form.industry} onChange={(e) => set("industry", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Timeline</label>
              <input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="Q1 2025"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Budget</label>
              <input value={form.budget} onChange={(e) => set("budget", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
            <input value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="Referral, CoStar, cold call…"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add requirement
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RequirementsBoard({ initialRequirements }: { initialRequirements: Requirement[] }) {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ACTIVE");
  const [showModal, setShowModal] = useState(false);

  const filtered = requirements.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [r.contactName, r.company, r.industry, r.submarkets, r.notes].some(
      (f) => f?.toLowerCase().includes(q)
    );
    const matchType = typeFilter === "ALL" || r.type === typeFilter;
    const matchStage = stageFilter === "ALL" || r.stage === stageFilter;
    return matchSearch && matchType && matchStage;
  });

  const activeCount = requirements.filter((r) => r.stage === "ACTIVE").length;
  const matchedCount = requirements.filter((r) => r.stage === "MATCHED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirements Board</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} active · {matchedCount} matched · {requirements.length} total market requirements
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add requirement
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contact, company, submarket…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
          />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]">
          <option value="ALL">All Stages</option>
          <option value="ACTIVE">Active</option>
          <option value="MATCHED">Matched</option>
          <option value="CLOSED">Closed</option>
          <option value="DEAD">Dead</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]">
          <option value="ALL">All Types</option>
          <option value="LEASE">Lease</option>
          <option value="PURCHASE">Purchase</option>
          <option value="EITHER">Either</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-400">No requirements match your filters.</Card>
        )}
        {filtered.map((req) => <RequirementCard key={req.id} req={req} />)}
      </div>

      {showModal && (
        <AddRequirementModal
          onClose={() => setShowModal(false)}
          onAdd={(r) => setRequirements((prev) => [r, ...prev])}
        />
      )}
    </div>
  );
}
