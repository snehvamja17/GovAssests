"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import {
  COMPLAINT_TYPES,
  COMPLAINT_STATUSES,
  PRIORITIES,
  fmtDateTime,
  fmtDate,
} from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function ComplaintsAdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Update modal state
  const [statusInput, setStatusInput] = useState("");
  const [assignedToInput, setAssignedToInput] = useState("");
  const [assignedDeptInput, setAssignedDeptInput] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [cRes, dRes] = await Promise.all([
      supabase
        .from("complaints")
        .select("*, asset:assets(asset_id, name), department:departments(name)")
        .order("created_at", { ascending: false }),
      supabase.from("departments").select("id, name").order("name"),
    ]);

    if (cRes.data) setComplaints(cRes.data);
    if (dRes.data) setDepartments(dRes.data);
    setLoading(false);
  }

  function openDetail(c) {
    setSelectedComplaint(c);
    setStatusInput(c.status);
    setAssignedToInput(c.assigned_to || "");
    setAssignedDeptInput(c.assigned_department_id || "");
    setResolutionNotes(c.resolution_notes || "");
  }

  async function handleSaveUpdate(e) {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);

    const isResolved = statusInput === "Resolved" || statusInput === "Closed";
    const updatePayload = {
      status: statusInput,
      assigned_to: assignedToInput || null,
      assigned_department_id: assignedDeptInput || null,
      resolution_notes: resolutionNotes || null,
      resolved_at: isResolved ? new Date().toISOString() : null,
    };

    const { error: compError } = await supabase
      .from("complaints")
      .update(updatePayload)
      .eq("id", selectedComplaint.id);

    // Also record update in complaint_updates
    await supabase.from("complaint_updates").insert([
      {
        complaint_id: selectedComplaint.id,
        status: statusInput,
        notes: resolutionNotes || `Status updated to ${statusInput}`,
        updated_by: "Department Officer",
      },
    ]);

    setUpdating(false);
    if (compError) {
      alert("Error updating complaint: " + compError.message);
    } else {
      setSelectedComplaint(null);
      loadData();
    }
  }

  const filtered = complaints.filter((c) => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.complaint_id?.toLowerCase().includes(q) ||
      c.citizen_name?.toLowerCase().includes(q) ||
      c.citizen_phone?.toLowerCase().includes(q) ||
      c.issue_type?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.location_text?.toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === "Submitted" || c.status === "Received" || c.status === "Assigned"
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === "Inspection" || c.status === "Work Started"
  ).length;
  const resolved = complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length;

  return (
    <Shell>
      <div className="page-header flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2>📢 Citizen Grievance &amp; Complaints Desk</h2>
          <p className="subtitle">
            Triage, investigate, dispatch field teams, and resolve citizen-reported infrastructure issues.
          </p>
        </div>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card">
          <div className="label">Total Grievances</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Open / Triage</div>
          <div className="value" style={{ color: "var(--red)" }}>
            {pending}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Work In Progress</div>
          <div className="value" style={{ color: "var(--amber)" }}>
            {inProgress}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Resolved &amp; Closed</div>
          <div className="value" style={{ color: "var(--green)" }}>
            {resolved}
          </div>
        </div>
      </div>

      <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
        <input
          type="text"
          className="search-input"
          placeholder="Search by ID, citizen, phone, road, issue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 320 }}
        />

        <div className="flex gap-1 flex-wrap">
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            Loading complaints registry...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            No complaints found matching the active filter.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Issue &amp; Description</th>
                  <th>Citizen &amp; Contact</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-semibold text-sm" style={{ fontFamily: "monospace" }}>
                        {c.complaint_id}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-sm">{c.issue_type}</div>
                      <div
                        className="text-xs text-secondary truncate"
                        style={{ maxWidth: 220 }}
                      >
                        {c.description}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{c.citizen_name || "Anonymous"}</div>
                      <div className="text-xs text-muted">
                        📞 {c.citizen_phone || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-secondary" style={{ maxWidth: 180 }}>
                        📍 {c.location_text || (c.asset ? c.asset.name : "Gujarat")}
                      </div>
                      {c.latitude && c.longitude && (
                        <div className="text-xs text-muted">
                          GPS: {Number(c.latitude).toFixed(4)}, {Number(c.longitude).toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={badgeClass(c.priority)}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={badgeClass(c.status)}>{c.status}</span>
                    </td>
                    <td className="text-sm">{fmtDate(c.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openDetail(c)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 650 }}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3>Manage Complaint: {selectedComplaint.complaint_id}</h3>
                <span className="text-xs text-muted">
                  Submitted on {fmtDateTime(selectedComplaint.created_at)}
                </span>
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setSelectedComplaint(null)}
              >
                ✕
              </button>
            </div>

            <div
              className="card mb-3"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <div className="grid-2 gap-2 text-sm">
                <div>
                  <strong>Citizen:</strong> {selectedComplaint.citizen_name || "Anonymous"}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedComplaint.citizen_phone || "N/A"}
                </div>
                <div>
                  <strong>Issue Type:</strong> {selectedComplaint.issue_type}
                </div>
                <div>
                  <strong>Priority:</strong>{" "}
                  <span className={badgeClass(selectedComplaint.priority)}>
                    {selectedComplaint.priority}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <strong>Description:</strong>
                <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>
                  {selectedComplaint.description}
                </p>
              </div>
              <div className="mt-2 text-sm">
                <strong>Location:</strong> {selectedComplaint.location_text || "Not specified"}
                {selectedComplaint.latitude && selectedComplaint.longitude && (
                  <span className="text-xs text-muted" style={{ marginLeft: 8 }}>
                    ({selectedComplaint.latitude}, {selectedComplaint.longitude})
                  </span>
                )}
              </div>
              {selectedComplaint.photo_url && (
                <div className="mt-2">
                  <strong className="text-sm">Attached Photo:</strong>
                  <div style={{ marginTop: 6 }}>
                    <img
                      src={selectedComplaint.photo_url}
                      alt="Grievance evidence"
                      style={{
                        maxHeight: 180,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveUpdate}>
              <div className="grid-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Update Status *</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                  >
                    {COMPLAINT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign Department</label>
                  <select
                    value={assignedDeptInput}
                    onChange={(e) => setAssignedDeptInput(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group mb-2">
                <label>Assigned Officer / Field Engineer</label>
                <input
                  type="text"
                  placeholder="e.g. Er. Hardik Patel (Executive Engineer, R&B)"
                  value={assignedToInput}
                  onChange={(e) => setAssignedToInput(e.target.value)}
                />
              </div>

              <div className="form-group mb-2">
                <label>Resolution Action / Inspection Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe field inspection conducted, contractor dispatched, or work completion details..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? "Saving Update..." : "Update Grievance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
