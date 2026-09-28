"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { APPROVAL_TYPES, APPROVAL_STATUSES, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    project_id: "",
    approval_type: "Administrative Approval",
    authority: "Superintending Engineer, R&B",
    designation: "Chief Engineer",
    reference_number: "",
    approval_date: new Date().toISOString().split("T")[0],
    status: "Pending",
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [appRes, pRes] = await Promise.all([
      supabase
        .from("approvals")
        .select("*, project:projects(id, project_id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, project_id, name").order("name"),
    ]);

    if (appRes.data) setApprovals(appRes.data);
    if (pRes.data) setProjects(pRes.data);
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from("approvals")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      loadData();
    }
  }

  async function handleAddApproval(e) {
    e.preventDefault();
    if (!form.project_id) {
      alert("Please select a project.");
      return;
    }
    setSubmitting(true);
    const refNum = form.reference_number || `APP/GJ/${Date.now().toString().slice(-6)}`;
    const payload = {
      project_id: form.project_id,
      approval_type: form.approval_type,
      authority: form.authority,
      designation: form.designation,
      reference_number: refNum,
      approval_date: form.approval_date,
      status: form.status,
      remarks: form.remarks || null,
    };

    const { error } = await supabase.from("approvals").insert([payload]);
    setSubmitting(false);

    if (error) {
      alert("Error creating approval: " + error.message);
    } else {
      setShowModal(false);
      setForm({
        project_id: "",
        approval_type: "Administrative Approval",
        authority: "Superintending Engineer, R&B",
        designation: "Chief Engineer",
        reference_number: "",
        approval_date: new Date().toISOString().split("T")[0],
        status: "Pending",
        remarks: "",
      });
      loadData();
    }
  }

  const filtered = approvals.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchType = typeFilter === "all" || a.approval_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.reference_number?.toLowerCase().includes(q) ||
      a.authority?.toLowerCase().includes(q) ||
      a.designation?.toLowerCase().includes(q) ||
      a.project?.name?.toLowerCase().includes(q) ||
      a.project?.project_id?.toLowerCase().includes(q);
    return matchStatus && matchType && matchSearch;
  });

  const total = approvals.length;
  const pendingCount = approvals.filter((a) => a.status === "Pending").length;
  const approvedCount = approvals.filter((a) => a.status === "Approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "Rejected").length;

  return (
    <Shell>
      <div className="page-header flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2>✅ Approvals &amp; Clearances</h2>
          <p className="subtitle">
            Statutory, technical, administrative sanctions and NOC clearances for infrastructure projects.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ New Approval Request
        </button>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card">
          <div className="label">Total Records</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Action</div>
          <div className="value" style={{ color: "var(--amber)" }}>
            {pendingCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Sanctioned / Approved</div>
          <div className="value" style={{ color: "var(--green)" }}>
            {approvedCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Rejected / Revoked</div>
          <div className="value" style={{ color: "var(--red)" }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
        <input
          type="text"
          className="search-input"
          placeholder="Search by ref number, authority, project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 320 }}
        />

        <div className="flex gap-1 flex-wrap">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Approval Types</option>
            {APPROVAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            <button
              className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            {APPROVAL_STATUSES.map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            Loading approvals workflow...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            No approval records found matching criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Reference &amp; Type</th>
                  <th>Project</th>
                  <th>Authority &amp; Designation</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold">{a.approval_type}</div>
                      <div className="text-xs text-muted" style={{ fontFamily: "monospace" }}>
                        # {a.reference_number || "REF-NOT-SET"}
                      </div>
                    </td>
                    <td>
                      {a.project ? (
                        <div>
                          <div className="font-semibold text-sm">{a.project.name}</div>
                          <span className="text-xs text-secondary">{a.project.project_id}</span>
                        </div>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm font-semibold">{a.authority}</div>
                      <div className="text-xs text-muted">{a.designation || "Competent Authority"}</div>
                    </td>
                    <td className="text-sm">{fmtDate(a.approval_date)}</td>
                    <td>
                      <span className={badgeClass(a.status)}>{a.status}</span>
                    </td>
                    <td className="text-sm text-secondary" style={{ maxWidth: 220 }}>
                      {a.remarks || "—"}
                    </td>
                    <td>
                      {a.status === "Pending" ? (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-sm btn-success"
                            style={{
                              background: "var(--green)",
                              color: "#fff",
                              padding: "4px 8px",
                              fontSize: 12,
                            }}
                            onClick={() => updateStatus(a.id, "Approved")}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            style={{
                              background: "var(--red)",
                              color: "#fff",
                              padding: "4px 8px",
                              fontSize: 12,
                            }}
                            onClick={() => updateStatus(a.id, "Rejected")}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          onClick={() => {
                            const next = a.status === "Approved" ? "Revoked" : "Approved";
                            if (confirm(`Change status from ${a.status} to ${next}?`)) {
                              updateStatus(a.id, next);
                            }
                          }}
                        >
                          Modify Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="flex justify-between items-center mb-2">
              <h3>Create Approval Record</h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddApproval}>
              <div className="form-group mb-2">
                <label>Target Project *</label>
                <select
                  required
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Approval Type *</label>
                  <select
                    value={form.approval_type}
                    onChange={(e) => setForm({ ...form, approval_type: e.target.value })}
                  >
                    {APPROVAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {APPROVAL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Sanctioning Authority *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Engineer, R&B"
                    value={form.authority}
                    onChange={(e) => setForm({ ...form, authority: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Authority Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Secretary, Urban Works"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Reference / Order Number</label>
                  <input
                    type="text"
                    placeholder="e.g. GOR/RNB/2026/AA-89"
                    value={form.reference_number}
                    onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sanction Date</label>
                  <input
                    type="date"
                    value={form.approval_date}
                    onChange={(e) => setForm({ ...form, approval_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group mb-2">
                <label>Remarks &amp; Conditions</label>
                <textarea
                  rows={2}
                  placeholder="Subject to environmental clearance and tree felling permissions..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Submit Approval Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
