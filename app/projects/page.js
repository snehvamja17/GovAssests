"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { PROJECT_STATUSES, PRIORITIES, inr, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");

  async function load() {
    const [p, c, d, l, con] = await Promise.all([
      supabase.from("projects").select("*, asset_categories(name), locations(district), departments(name), contractors(company_name)").order("created_at", { ascending: false }),
      supabase.from("asset_categories").select("*").order("name"),
      supabase.from("departments").select("*").order("name"),
      supabase.from("locations").select("*").order("district"),
      supabase.from("contractors").select("*").eq("status", "Active").order("company_name"),
    ]);
    setProjects(p.data || []);
    setCategories(c.data || []);
    setDepartments(d.data || []);
    setLocations(l.data || []);
    setContractors(con.data || []);
  }

  useEffect(() => { load(); }, []);

  const shown = projects.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (priorityFilter && p.priority !== priorityFilter) return false;
    if (q) {
      const search = q.toLowerCase();
      return (p.name + p.project_id + (p.locations?.district || "")).toLowerCase().includes(search);
    }
    return true;
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function addProject(e) {
    e.preventDefault();
    const count = projects.length + 1;
    const row = { ...form, project_id: `PRJ-${String(count).padStart(3, "0")}` };
    Object.keys(row).forEach((k) => row[k] === "" && (row[k] = null));
    const { error } = await supabase.from("projects").insert(row);
    if (error) return setMsg(error.message);
    setForm({});
    setShowForm(false);
    load();
  }

  return (
    <Shell>
      <div className="main-header">
        <h1>Projects</h1>
        <p>Track all infrastructure projects from proposal to completion</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {["Proposed", "Approved", "Under Construction", "Completed", "Tendering", "On Hold"].map((s) => (
          <div key={s} className="stat-card" style={{ cursor: "pointer" }} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}>
            <div className="stat-content">
              <div className="stat-label" style={{ fontSize: 11 }}>{s}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{projects.filter((p) => p.status === s).length}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search projects..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Project</button>
      </div>

      {showForm && (
        <form className="form-grid mb-2" onSubmit={addProject}>
          <div className="form-group"><label>Project Name *</label><input value={form.name || ""} onChange={set("name")} required /></div>
          <div className="form-group"><label>Category</label><select value={form.category_id || ""} onChange={set("category_id")}><option value="">Select</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="form-group"><label>Department</label><select value={form.department_id || ""} onChange={set("department_id")}><option value="">Select</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="form-group"><label>Location</label><select value={form.location_id || ""} onChange={set("location_id")}><option value="">Select</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.district} — {l.city}</option>)}</select></div>
          <div className="form-group"><label>Contractor</label><select value={form.contractor_id || ""} onChange={set("contractor_id")}><option value="">Select</option>{contractors.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select></div>
          <div className="form-group"><label>Priority</label><select value={form.priority || "Medium"} onChange={set("priority")}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="form-group"><label>Estimated Cost (₹)</label><input type="number" value={form.estimated_cost || ""} onChange={set("estimated_cost")} /></div>
          <div className="form-group"><label>Sanctioned Amount (₹)</label><input type="number" value={form.sanctioned_amount || ""} onChange={set("sanctioned_amount")} /></div>
          <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date || ""} onChange={set("start_date")} /></div>
          <div className="form-group"><label>Expected Completion</label><input type="date" value={form.expected_completion_date || ""} onChange={set("expected_completion_date")} /></div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description</label><textarea value={form.description || ""} onChange={set("description")} /></div>
          <div className="form-actions">
            <button className="btn btn-success">Create Project</button>
            <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            {msg && <span className="err">{msg}</span>}
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Project Name</th><th>District</th><th>Awarded Contractor</th><th>Status</th><th>Priority</th><th>Progress</th><th>Sanctioned (Final)</th><th>Spent</th></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => router.push(`/projects/${p.id}`)}>
                <td style={{ fontWeight: 600, color: "#E8772E", whiteSpace: "nowrap" }}>{p.project_id}</td>
                <td className="truncate" style={{ maxWidth: 220 }}>{p.name}</td>
                <td>{p.locations?.district || "—"}</td>
                <td className="text-sm">
                  {p.contractors?.company_name ? (
                    <span style={{ fontWeight: 500, color: "var(--navy-900)" }}>
                      🏢 {p.contractors.company_name}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">In Tendering / Open</span>
                  )}
                </td>
                <td><span className={badgeClass(p.status)}>{p.status}</span></td>
                <td><span className={badgeClass(p.priority)}>{p.priority}</span></td>
                <td style={{ minWidth: 110 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className={`progress-fill ${p.progress_percent === 100 ? "complete" : ""}`} style={{ width: `${p.progress_percent}%` }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, minWidth: 28 }}>{p.progress_percent}%</span>
                  </div>
                </td>
                <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>{inr(p.sanctioned_amount)}</td>
                <td style={{ whiteSpace: "nowrap" }}>{inr(p.actual_expenditure)}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="9" className="muted" style={{ textAlign: "center" }}>No projects found</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted mt-1">Showing {shown.length} of {projects.length} projects</p>
    </Shell>
  );
}
