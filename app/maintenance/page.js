"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { MAINT_STATUSES, PRIORITIES, inr, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  async function load() {
    const { data } = await supabase.from("maintenance_records").select("*, assets(asset_id, name)").order("created_at", { ascending: false });
    setRecords(data || []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id, newStatus) {
    const updates = { status: newStatus };
    if (newStatus === "Completed") updates.completed_at = new Date().toISOString();
    await supabase.from("maintenance_records").update(updates).eq("id", id);
    load();
  }

  const shown = records.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (q) return (r.issue + (r.assets?.name || "") + (r.assigned_to || "")).toLowerCase().includes(q.toLowerCase());
    return true;
  });

  const pending = records.filter((r) => !["Completed", "Verified", "Closed"].includes(r.status)).length;
  const critical = records.filter((r) => r.priority === "Critical" && !["Completed", "Verified", "Closed"].includes(r.status)).length;

  return (
    <Shell>
      <div className="main-header">
        <h1>Maintenance Management</h1>
        <p>Track maintenance and repair activities across all assets</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <div className="stat-card"><div className="stat-content"><div className="stat-label">Total Records</div><div className="stat-value">{records.length}</div></div></div>
        <div className="stat-card"><div className="stat-content"><div className="stat-label">Pending</div><div className="stat-value" style={{ color: "#F59E0B" }}>{pending}</div></div></div>
        <div className="stat-card"><div className="stat-content"><div className="stat-label">Critical</div><div className="stat-value" style={{ color: "#EF4444" }}>{critical}</div></div></div>
        <div className="stat-card"><div className="stat-content"><div className="stat-label">Completed</div><div className="stat-value" style={{ color: "#10B981" }}>{records.filter((r) => r.status === "Completed").length}</div></div></div>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search issues..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {MAINT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Asset</th><th>Issue</th><th>Priority</th><th>Reported</th><th>Assigned To</th><th>Est. Cost</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                <td><span style={{ fontWeight: 600, color: "#E8772E" }}>{r.assets?.asset_id || "—"}</span><br /><span className="text-xs text-muted">{r.assets?.name?.substring(0, 30)}</span></td>
                <td style={{ maxWidth: 220 }}>{r.issue}</td>
                <td><span className={badgeClass(r.priority)}>{r.priority}</span></td>
                <td className="text-sm">{fmtDate(r.reported_date)}</td>
                <td className="text-sm">{r.assigned_to || "—"}</td>
                <td>{inr(r.estimated_cost)}</td>
                <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                <td>
                  <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} style={{ fontSize: 12, padding: "4px 8px" }}>
                    {MAINT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="8" className="muted" style={{ textAlign: "center" }}>No maintenance records found</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
