"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { CONDITIONS, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_id: "", inspection_date: new Date().toISOString().split("T")[0], inspector_name: "", inspector_designation: "", condition_rating: "Good", observations: "", recommendations: "" });
  const [msg, setMsg] = useState("");

  async function load() {
    const [i, a] = await Promise.all([
      supabase.from("inspection_records").select("*, assets(asset_id, name)").order("inspection_date", { ascending: false }),
      supabase.from("assets").select("id, asset_id, name").order("name"),
    ]);
    setInspections(i.data || []);
    setAssets(a.data || []);
  }
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function addInspection(e) {
    e.preventDefault();
    const row = { ...form };
    Object.keys(row).forEach((k) => row[k] === "" && (row[k] = null));
    const { error } = await supabase.from("inspection_records").insert(row);
    if (error) return setMsg(error.message);
    if (row.condition_rating && row.asset_id) {
      await supabase.from("assets").update({ condition: row.condition_rating }).eq("id", row.asset_id);
    }
    setForm({ asset_id: "", inspection_date: new Date().toISOString().split("T")[0], inspector_name: "", inspector_designation: "", condition_rating: "Good", observations: "", recommendations: "" });
    setShowForm(false);
    setMsg("");
    load();
  }

  return (
    <Shell>
      <div className="main-header">
        <h1>Field Inspections</h1>
        <p>Record and track field inspection observations</p>
      </div>

      <div className="toolbar">
        <span className="text-sm text-muted">{inspections.length} inspections recorded</span>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Record Inspection</button>
      </div>

      {showForm && (
        <form className="form-grid mb-2" onSubmit={addInspection}>
          <div className="form-group"><label>Asset *</label><select value={form.asset_id} onChange={set("asset_id")} required><option value="">Select Asset</option>{assets.map((a) => <option key={a.id} value={a.id}>{a.asset_id} — {a.name}</option>)}</select></div>
          <div className="form-group"><label>Inspection Date *</label><input type="date" value={form.inspection_date} onChange={set("inspection_date")} required /></div>
          <div className="form-group"><label>Inspector Name *</label><input value={form.inspector_name} onChange={set("inspector_name")} required /></div>
          <div className="form-group"><label>Designation</label><input value={form.inspector_designation} onChange={set("inspector_designation")} /></div>
          <div className="form-group"><label>Condition Rating</label><select value={form.condition_rating} onChange={set("condition_rating")}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Observations</label><textarea value={form.observations} onChange={set("observations")} placeholder="Describe what was observed..." /></div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Recommendations</label><textarea value={form.recommendations} onChange={set("recommendations")} placeholder="Recommended actions..." /></div>
          <div className="form-actions">
            <button className="btn btn-success">Save Inspection</button>
            <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            {msg && <span className="err">{msg}</span>}
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Asset</th><th>Inspector</th><th>Condition</th><th>Observations</th><th>Recommendations</th></tr></thead>
          <tbody>
            {inspections.map((ins) => (
              <tr key={ins.id}>
                <td className="text-sm" style={{ whiteSpace: "nowrap" }}>{fmtDate(ins.inspection_date)}</td>
                <td><span style={{ fontWeight: 600, color: "#E8772E" }}>{ins.assets?.asset_id || "—"}</span><br /><span className="text-xs text-muted">{ins.assets?.name?.substring(0, 30)}</span></td>
                <td>{ins.inspector_name}<br /><span className="text-xs text-muted">{ins.inspector_designation}</span></td>
                <td><span className={badgeClass(ins.condition_rating)}>{ins.condition_rating}</span></td>
                <td className="text-sm" style={{ maxWidth: 220 }}>{ins.observations?.substring(0, 100) || "—"}{ins.observations?.length > 100 ? "..." : ""}</td>
                <td className="text-sm" style={{ maxWidth: 180 }}>{ins.recommendations?.substring(0, 80) || "—"}{ins.recommendations?.length > 80 ? "..." : ""}</td>
              </tr>
            ))}
            {inspections.length === 0 && <tr><td colSpan="6" className="muted" style={{ textAlign: "center" }}>No inspections recorded</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
