"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { fmtDateTime } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) setLogs(data);
    setLoading(false);
  }

  const filtered = logs.filter((log) => {
    const matchEntity = entityFilter === "all" || log.entity_type?.toLowerCase() === entityFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      log.action?.toLowerCase().includes(q) ||
      log.performed_by?.toLowerCase().includes(q) ||
      log.entity_type?.toLowerCase().includes(q) ||
      log.previous_value?.toLowerCase().includes(q) ||
      log.new_value?.toLowerCase().includes(q) ||
      log.reason?.toLowerCase().includes(q);
    return matchEntity && matchSearch;
  });

  const total = logs.length;
  const statusUpdates = logs.filter((l) => l.action?.toLowerCase().includes("status")).length;
  const budgetUpdates = logs.filter((l) => l.action?.toLowerCase().includes("budget") || l.action?.toLowerCase().includes("cost")).length;
  const conditionUpdates = logs.filter((l) => l.action?.toLowerCase().includes("condition")).length;

  return (
    <Shell>
      <div className="page-header flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2>📜 System Audit Trail &amp; Governance Log</h2>
          <p className="subtitle">
            Immutable log of all administrative actions, lifecycle state transitions, financial amendments, and inspection events.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadLogs}>
          🔄 Refresh Log
        </button>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card">
          <div className="label">Total Audited Events</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Status Transitions</div>
          <div className="value" style={{ color: "var(--blue)" }}>
            {statusUpdates}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Budget Amendments</div>
          <div className="value" style={{ color: "var(--amber)" }}>
            {budgetUpdates}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Condition Re-ratings</div>
          <div className="value" style={{ color: "var(--purple)" }}>
            {conditionUpdates}
          </div>
        </div>
      </div>

      <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
        <input
          type="text"
          className="search-input"
          placeholder="Search by action, user, old/new value..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 320 }}
        />

        <div className="flex gap-1 flex-wrap">
          {["all", "project", "asset", "finance", "contract", "maintenance"].map((ent) => (
            <button
              key={ent}
              className={`btn btn-sm ${entityFilter === ent ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setEntityFilter(ent)}
            >
              {ent === "all" ? "All Entities" : ent.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            Loading audit events from secure ledger...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            No audit log entries matching the criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Entity</th>
                  <th>Action</th>
                  <th>Previous Value</th>
                  <th>New Value</th>
                  <th>Officer / Performed By</th>
                  <th>Remarks / Context</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs" style={{ whiteSpace: "nowrap" }}>
                      {fmtDateTime(log.created_at)}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            log.entity_type === "project"
                              ? "var(--blue-light)"
                              : log.entity_type === "asset"
                              ? "var(--green-light)"
                              : "var(--amber-light)",
                          color:
                            log.entity_type === "project"
                              ? "var(--blue-dark)"
                              : log.entity_type === "asset"
                              ? "var(--green-dark)"
                              : "var(--amber-dark)",
                          fontWeight: 600,
                        }}
                      >
                        {log.entity_type?.toUpperCase() || "RECORD"}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-sm">{log.action}</span>
                    </td>
                    <td>
                      {log.previous_value ? (
                        <code
                          style={{
                            background: "var(--red-light)",
                            color: "var(--red-dark)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          {log.previous_value}
                        </code>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {log.new_value ? (
                        <code
                          style={{
                            background: "var(--green-light)",
                            color: "var(--green-dark)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          {log.new_value}
                        </code>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm font-semibold">{log.performed_by || "System Daemon"}</div>
                      <div className="text-xs text-muted">IP: {log.ip_address || "127.0.0.1"}</div>
                    </td>
                    <td className="text-sm text-secondary" style={{ maxWidth: 200 }}>
                      {log.reason || "System state transition trigger"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
