"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { CONTRACTOR_CATEGORIES, CONTRACTOR_STATUSES, inr, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [projects, setProjects] = useState([]);

  async function load() {
    const { data } = await supabase.from("contractors").select("*").order("company_name");
    setContractors(data || []);
  }
  useEffect(() => { load(); }, []);

  async function viewContractor(c) {
    setSelected(c);
    const { data } = await supabase.from("projects").select("project_id, name, status, actual_expenditure").eq("contractor_id", c.id);
    setProjects(data || []);
  }

  const shown = contractors.filter((c) => {
    if (catFilter && c.category !== catFilter) return false;
    if (q) return (c.company_name + c.contact_person + c.contractor_id).toLowerCase().includes(q.toLowerCase());
    return true;
  });

  return (
    <Shell>
      <div className="main-header">
        <h1>Contractors</h1>
        <p>Registered contractors and their project history</p>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search contractors..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Classes</option>
          {CONTRACTOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.company_name}</h2>
            <table className="info-table" style={{ marginBottom: 20 }}><tbody>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Contractor ID</td><td>{selected.contractor_id}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Contact Person</td><td>{selected.contact_person}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Phone</td><td>{selected.phone || "—"}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Email</td><td>{selected.email || "—"}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Address</td><td>{selected.address || "—"}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Registration</td><td>{selected.registration_number || "—"}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>Category</td><td>{selected.category}</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#6b7280" }}>GST</td><td>{selected.gst_number || "—"}</td></tr>
            </tbody></table>
            <h3 style={{ marginBottom: 10 }}>Assigned Projects ({projects.length})</h3>
            {projects.length > 0 ? (
              <table><thead><tr><th>ID</th><th>Project</th><th>Status</th><th>Expenditure</th></tr></thead>
                <tbody>{projects.map((p) => (
                  <tr key={p.project_id}><td style={{ color: "#E8772E", fontWeight: 600 }}>{p.project_id}</td><td>{p.name}</td><td><span className={badgeClass(p.status)}>{p.status}</span></td><td>{inr(p.actual_expenditure)}</td></tr>
                ))}</tbody></table>
            ) : <p className="text-muted text-sm">No projects assigned</p>}
            <button className="btn btn-outline mt-2" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Company Name</th><th>Contact Person</th><th>Phone</th><th>Class</th><th>Status</th><th>Registration</th></tr></thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} className="clickable" onClick={() => viewContractor(c)}>
                <td style={{ fontWeight: 600, color: "#E8772E" }}>{c.contractor_id}</td>
                <td>{c.company_name}</td>
                <td>{c.contact_person}</td>
                <td className="text-sm">{c.phone || "—"}</td>
                <td><span className={badgeClass(c.category)}>{c.category}</span></td>
                <td><span className={badgeClass(c.status)}>{c.status}</span></td>
                <td className="text-sm">{c.registration_number || "—"}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="7" className="muted" style={{ textAlign: "center" }}>No contractors found</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
