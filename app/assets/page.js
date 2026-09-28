"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { ASSET_STATUSES, CONDITIONS, DISTRICTS, inr } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function Assets() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [distFilter, setDistFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");

  async function load() {
    const [a, c, d] = await Promise.all([
      supabase.from("assets").select("*, asset_categories(name, parent_category), locations(district, city), departments(name)").order("created_at", { ascending: false }),
      supabase.from("asset_categories").select("*").order("name"),
      supabase.from("departments").select("*").order("name"),
    ]);
    setAssets(a.data || []);
    setCategories(c.data || []);
    setDepartments(d.data || []);
  }

  useEffect(() => { load(); }, []);

  const shown = assets.filter((a) => {
    if (catFilter && a.category_id !== catFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (condFilter && a.condition !== condFilter) return false;
    if (distFilter && a.locations?.district !== distFilter) return false;
    if (q) {
      const search = q.toLowerCase();
      return (a.name + a.asset_id + (a.locations?.district || "") + (a.description || "")).toLowerCase().includes(search);
    }
    return true;
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function addAsset(e) {
    e.preventDefault();
    const count = assets.length + 1;
    const row = {
      ...form,
      asset_id: `AST-${String(count).padStart(5, "0")}`,
    };
    Object.keys(row).forEach((k) => row[k] === "" && (row[k] = null));
    const { error } = await supabase.from("assets").insert(row);
    if (error) return setMsg(error.message);
    setForm({});
    setShowForm(false);
    setMsg("");
    load();
  }

  return (
    <Shell>
      <div className="main-header">
        <h1>Infrastructure Assets</h1>
        <p>Centralized inventory of all government infrastructure</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Total Assets</div>
            <div className="stat-value">{assets.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Operational</div>
            <div className="stat-value" style={{ color: "#10B981" }}>{assets.filter((a) => a.status === "Operational").length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Under Maintenance</div>
            <div className="stat-value" style={{ color: "#F59E0B" }}>{assets.filter((a) => a.status === "Under Maintenance").length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Poor/Critical</div>
            <div className="stat-value" style={{ color: "#EF4444" }}>{assets.filter((a) => ["Poor", "Critical"].includes(a.condition)).length}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input className="search-input" placeholder="Search assets..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {ASSET_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={condFilter} onChange={(e) => setCondFilter(e.target.value)}>
          <option value="">All Conditions</option>
          {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={distFilter} onChange={(e) => setDistFilter(e.target.value)}>
          <option value="">All Districts</option>
          {[...new Set(assets.map((a) => a.locations?.district).filter(Boolean))].sort().map((d) => <option key={d}>{d}</option>)}
        </select>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Register Asset</button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form className="form-grid mb-2" onSubmit={addAsset}>
          <div className="form-group"><label>Asset Name *</label><input placeholder="e.g. District Road Mehsana-Patan" value={form.name || ""} onChange={set("name")} required /></div>
          <div className="form-group"><label>Category</label><select value={form.category_id || ""} onChange={set("category_id")}><option value="">Select</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="form-group"><label>Department</label><select value={form.department_id || ""} onChange={set("department_id")}><option value="">Select</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status || "Proposed"} onChange={set("status")}>{ASSET_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Condition</label><select value={form.condition || "Good"} onChange={set("condition")}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group"><label>Description</label><textarea value={form.description || ""} onChange={set("description")} placeholder="Brief description..." /></div>
          <div className="form-group"><label>Length (km)</label><input type="number" step="0.01" value={form.length_km || ""} onChange={set("length_km")} /></div>
          <div className="form-group"><label>Area (sq m)</label><input type="number" value={form.area_sqm || ""} onChange={set("area_sqm")} /></div>
          <div className="form-group"><label>Year Built</label><input type="number" value={form.year_built || ""} onChange={set("year_built")} /></div>
          <div className="form-group"><label>Current Value (₹)</label><input type="number" value={form.current_value || ""} onChange={set("current_value")} /></div>
          <div className="form-group"><label>Custodian</label><input value={form.custodian || ""} onChange={set("custodian")} placeholder="Officer in charge" /></div>
          <div className="form-actions">
            <button className="btn btn-success" type="submit">Save Asset</button>
            <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            {msg && <span className="err">{msg}</span>}
          </div>
        </form>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>District</th>
              <th>Department</th>
              <th>Condition</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id} className="clickable" onClick={() => router.push(`/assets/${a.id}`)}>
                <td style={{ fontWeight: 600, color: "#E8772E", whiteSpace: "nowrap" }}>{a.asset_id}</td>
                <td className="truncate" style={{ maxWidth: 280 }}>{a.name}</td>
                <td>{a.asset_categories?.name || "—"}</td>
                <td>{a.locations?.district || "—"}</td>
                <td className="text-sm">{a.departments?.name || "—"}</td>
                <td><span className={badgeClass(a.condition)}>{a.condition}</span></td>
                <td><span className={badgeClass(a.status)}>{a.status}</span></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", color: "#9ca3af" }}>No assets found.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted mt-1">Showing {shown.length} of {assets.length} assets</p>
    </Shell>
  );
}
