"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { ASSET_STATUSES, CONDITIONS, MAINT_STATUSES, PRIORITIES, inr, fmtDate, fmtDateTime } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function AssetDetail({ params }) {
  const { id } = params;
  const [asset, setAsset] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [audit, setAudit] = useState([]);
  const [tab, setTab] = useState("details");
  const [maintForm, setMaintForm] = useState({ issue: "", priority: "Medium", estimated_cost: "" });
  const [msg, setMsg] = useState("");

  async function load() {
    const [a, m, ins, au] = await Promise.all([
      supabase.from("assets").select("*, asset_categories(name, parent_category, icon), locations(district, city, state, address, latitude, longitude), departments(name)").eq("id", id).single(),
      supabase.from("maintenance_records").select("*").eq("asset_id", id).order("created_at", { ascending: false }),
      supabase.from("inspection_records").select("*").eq("asset_id", id).order("inspection_date", { ascending: false }),
      supabase.from("audit_logs").select("*").eq("entity_id", id).order("created_at", { ascending: false }),
    ]);
    setAsset(a.data);
    setMaintenance(m.data || []);
    setInspections(ins.data || []);
    setAudit(au.data || []);
  }

  useEffect(() => { load(); }, [id]);

  async function updateAsset(changes) {
    await supabase.from("assets").update(changes).eq("id", id);
    load();
  }

  async function addMaintenance(e) {
    e.preventDefault();
    const row = { asset_id: id, ...maintForm };
    if (!row.estimated_cost) row.estimated_cost = null;
    const { error } = await supabase.from("maintenance_records").insert(row);
    if (error) return setMsg(error.message);
    setMaintForm({ issue: "", priority: "Medium", estimated_cost: "" });
    setMsg("");
    load();
  }

  async function updateMaintStatus(mId, newStatus) {
    const updates = { status: newStatus };
    if (newStatus === "Completed") updates.completed_at = new Date().toISOString();
    await supabase.from("maintenance_records").update(updates).eq("id", mId);
    load();
  }

  if (!asset) return <Shell><div className="loader-overlay" style={{ position: "relative", background: "transparent", minHeight: 300 }}><div className="loader-shape" /><span className="loader-text" style={{ color: "#6b7280" }}>Loading...</span></div></Shell>;

  const row = (label, value) => (
    <tr><td style={{ fontWeight: 600, color: "#6b7280", width: 180, padding: "10px 0" }}>{label}</td><td style={{ padding: "10px 0" }}>{value || "—"}</td></tr>
  );

  return (
    <Shell>
      <div className="breadcrumb">
        <Link href="/assets">Assets</Link> <span>›</span> <span>{asset.asset_id}</span>
      </div>

      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>
            {asset.asset_categories?.icon} {asset.name}
          </h1>
          <p className="text-secondary text-sm" style={{ marginTop: 4 }}>{asset.asset_id} · {asset.asset_categories?.name} · {asset.locations?.district || "Unknown"}</p>
        </div>
        <span className={badgeClass(asset.status)}>{asset.status}</span>
        <span className={badgeClass(asset.condition)}>{asset.condition}</span>
      </div>

      {/* Quick Actions */}
      <div className="card mb-2" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label className="text-sm font-semibold" style={{ marginRight: 4 }}>Quick Actions:</label>
        <select value={asset.status} onChange={(e) => updateAsset({ status: e.target.value })} style={{ height: 36 }}>
          {ASSET_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={asset.condition} onChange={(e) => updateAsset({ condition: e.target.value })} style={{ height: 36 }}>
          {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-danger btn-sm" onClick={() => confirm("Condemn this asset?") && updateAsset({ status: "Condemned" })}>
          Condemn Asset
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["details", "maintenance", "inspections", "history"].map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === "details" && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Asset Information</h3>
            <table className="info-table"><tbody>
              {row("Asset ID", asset.asset_id)}
              {row("Name", asset.name)}
              {row("Category", asset.asset_categories?.name)}
              {row("Parent Category", asset.asset_categories?.parent_category)}
              {row("Department", asset.departments?.name)}
              {row("Description", asset.description)}
            </tbody></table>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Location & Physical</h3>
            <table className="info-table"><tbody>
              {row("District", asset.locations?.district)}
              {row("City", asset.locations?.city)}
              {row("Address", asset.locations?.address)}
              {row("Coordinates", asset.locations?.latitude ? `${asset.locations.latitude}, ${asset.locations.longitude}` : null)}
              {row("Length", asset.length_km ? `${asset.length_km} km` : null)}
              {row("Width", asset.width_m ? `${asset.width_m} m` : null)}
              {row("Area", asset.area_sqm ? `${Number(asset.area_sqm).toLocaleString()} sq m` : null)}
              {row("Floors", asset.floors)}
              {row("Year Built", asset.year_built)}
              {row("Current Value", inr(asset.current_value))}
              {row("Custodian", asset.custodian)}
            </tbody></table>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {tab === "maintenance" && (
        <div>
          <form className="form-grid mb-2" onSubmit={addMaintenance} style={{ gridTemplateColumns: "2fr 1fr 1fr auto" }}>
            <div className="form-group"><label>Issue *</label><input placeholder="Describe the issue..." value={maintForm.issue} onChange={(e) => setMaintForm({ ...maintForm, issue: e.target.value })} required /></div>
            <div className="form-group"><label>Priority</label><select value={maintForm.priority} onChange={(e) => setMaintForm({ ...maintForm, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></div>
            <div className="form-group"><label>Est. Cost (₹)</label><input type="number" value={maintForm.estimated_cost} onChange={(e) => setMaintForm({ ...maintForm, estimated_cost: e.target.value })} /></div>
            <div className="form-actions"><button className="btn btn-warning">Log Issue</button></div>
          </form>
          {msg && <p className="err mb-1">{msg}</p>}
          <div className="table-wrap">
            <table>
              <thead><tr><th>Issue</th><th>Priority</th><th>Reported</th><th>Assigned To</th><th>Est. Cost</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.id}>
                    <td style={{ maxWidth: 250 }}>{m.issue}</td>
                    <td><span className={badgeClass(m.priority)}>{m.priority}</span></td>
                    <td className="text-sm">{fmtDate(m.reported_date || m.created_at)}</td>
                    <td className="text-sm">{m.assigned_to || "—"}</td>
                    <td>{inr(m.estimated_cost)}</td>
                    <td><span className={badgeClass(m.status)}>{m.status}</span></td>
                    <td>
                      <select value={m.status} onChange={(e) => updateMaintStatus(m.id, e.target.value)} style={{ fontSize: 12, padding: "4px 8px" }}>
                        {MAINT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {maintenance.length === 0 && <tr><td colSpan="7" className="muted" style={{ textAlign: "center" }}>No maintenance records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspections Tab */}
      {tab === "inspections" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Inspector</th><th>Designation</th><th>Condition</th><th>Observations</th><th>Recommendations</th></tr></thead>
            <tbody>
              {inspections.map((ins) => (
                <tr key={ins.id}>
                  <td className="text-sm" style={{ whiteSpace: "nowrap" }}>{fmtDate(ins.inspection_date)}</td>
                  <td>{ins.inspector_name}</td>
                  <td className="text-sm">{ins.inspector_designation || "—"}</td>
                  <td><span className={badgeClass(ins.condition_rating)}>{ins.condition_rating}</span></td>
                  <td className="text-sm" style={{ maxWidth: 250 }}>{ins.observations || "—"}</td>
                  <td className="text-sm" style={{ maxWidth: 200 }}>{ins.recommendations || "—"}</td>
                </tr>
              ))}
              {inspections.length === 0 && <tr><td colSpan="6" className="muted" style={{ textAlign: "center" }}>No inspections recorded</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="card">
          {audit.length === 0 ? (
            <div className="empty-state"><div className="icon">📜</div><p>No history entries yet</p></div>
          ) : (
            <ul className="timeline">
              {audit.map((a) => (
                <li key={a.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-date">{fmtDateTime(a.created_at)}</div>
                  <div className="timeline-title">{a.action}</div>
                  <div className="timeline-desc">{a.previous_value && <>{a.previous_value} → </>}{a.new_value}</div>
                  {a.performed_by && <div className="timeline-by">by {a.performed_by}</div>}
                  {a.reason && <div className="text-xs text-muted">Reason: {a.reason}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Shell>
  );
}
