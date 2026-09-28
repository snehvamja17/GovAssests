"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CitizenNav from "@/components/CitizenNav";
import { supabase } from "@/lib/supabase";
import { fmtDateTime, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

const STAGES = [
  "Submitted",
  "Received",
  "Assigned",
  "Inspection",
  "Work Started",
  "Resolved",
];

function TrackContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const [ticketInput, setTicketInput] = useState(queryId || "");
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (queryId) {
      setTicketInput(queryId);
      searchTicket(queryId);
    }
  }, [queryId]);

  const DEMO_COMPLAINTS = [
    {
      id: "cmp-demo-1",
      complaint_id: "CMP-2026-001",
      citizen_name: "Ramesh Kumar",
      citizen_phone: "+91-9876543001",
      issue_type: "Pothole",
      description: "Large pothole on main road near school entrance. Very dangerous for children and two-wheelers.",
      location_text: "Near Sardar Patel School, SG Highway, Ahmedabad",
      priority: "High",
      status: "Work Started",
      assigned_to: "Er. Hardik Patel (Maintenance Wing)",
      department: { name: "Roads & Buildings Department" },
      created_at: "2026-09-20T10:15:00Z",
      updates: [
        { id: "u-1", status: "Submitted", notes: "Grievance lodged through Public Citizen Portal.", updated_by: "Citizen", created_at: "2026-09-20T10:15:00Z" },
        { id: "u-2", status: "Received", notes: "Triaged by Ahmedabad Division control room.", updated_by: "Desk Officer", created_at: "2026-09-20T12:00:00Z" },
        { id: "u-3", status: "Assigned", notes: "Dispatched to Executive Engineer, Maintenance Wing.", updated_by: "Control Room", created_at: "2026-09-21T09:30:00Z" },
        { id: "u-4", status: "Inspection", notes: "Site inspection completed. Cold-mix asphalt repair team scheduled.", updated_by: "Er. Hardik Patel", created_at: "2026-09-21T15:45:00Z" },
        { id: "u-5", status: "Work Started", notes: "Pothole excavation and bitumen base laying in progress.", updated_by: "Site Supervisor", created_at: "2026-09-22T08:30:00Z" },
      ],
    },
    {
      id: "cmp-demo-2",
      complaint_id: "CMP-2026-002",
      citizen_name: "Priti Shah",
      citizen_phone: "+91-9876543002",
      issue_type: "Water Logging",
      description: "Severe waterlogging after every rain. Water enters ground floor shops and chokes intersection.",
      location_text: "Vesu Circle, Ring Road, Surat",
      priority: "Critical",
      status: "Assigned",
      assigned_to: "Drainage Division, Surat",
      department: { name: "Roads & Buildings Department" },
      created_at: "2026-09-22T14:30:00Z",
      updates: [
        { id: "u-10", status: "Submitted", notes: "Grievance received.", updated_by: "Citizen", created_at: "2026-09-22T14:30:00Z" },
        { id: "u-11", status: "Assigned", notes: "Stormwater pump deployed for clearance.", updated_by: "Surat City Engineer", created_at: "2026-09-23T11:00:00Z" },
      ],
    },
    {
      id: "cmp-demo-3",
      complaint_id: "CMP-2026-003",
      citizen_name: "Ajay Patel",
      citizen_phone: "+91-9876543003",
      issue_type: "Street Light",
      description: "Street lights not working for past 2 weeks on entire stretch. Very dark and accident-prone at night.",
      location_text: "Kalavad Road, Rajkot",
      priority: "Medium",
      status: "Resolved",
      assigned_to: "Electrical Division, Rajkot",
      department: { name: "Public Works Department" },
      resolution_notes: "Replaced 6 faulty LED luminaires and underground cable junction box. 100% lighting restored.",
      resolved_at: "2026-09-25T18:00:00Z",
      created_at: "2026-09-18T09:00:00Z",
      updates: [
        { id: "u-20", status: "Submitted", notes: "Grievance lodged.", updated_by: "Citizen", created_at: "2026-09-18T09:00:00Z" },
        { id: "u-21", status: "Work Started", notes: "Cable repair van on site.", updated_by: "Electrical AE", created_at: "2026-09-24T14:00:00Z" },
        { id: "u-22", status: "Resolved", notes: "All lights operational. Verified by field engineer.", updated_by: "EE, Rajkot", created_at: "2026-09-25T18:00:00Z" },
      ],
    },
  ];

  async function searchTicket(idToSearch) {
    const q = (idToSearch || ticketInput).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    const cleanDigits = q.replace(/\D/g, "");

    // 1. Try querying Supabase
    const { data } = await supabase
      .from("complaints")
      .select("*, asset:assets(name, asset_id), department:departments(name)")
      .or(`complaint_id.ilike.%${q}%,citizen_phone.ilike.%${cleanDigits || q}%,citizen_phone.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const found = data[0];
      setComplaint(found);

      // Fetch complaint updates
      const { data: updateData } = await supabase
        .from("complaint_updates")
        .select("*")
        .eq("complaint_id", found.id)
        .order("created_at", { ascending: true });

      if (updateData && updateData.length > 0) {
        setUpdates(updateData);
      } else {
        setUpdates([
          {
            id: "init",
            status: found.status,
            notes: "Grievance recorded in system registry.",
            updated_by: "System",
            created_at: found.created_at,
          },
        ]);
      }
      setLoading(false);
      return;
    }

    // 2. Check Demo fallback complaints
    const matchedDemo = DEMO_COMPLAINTS.find(
      (c) =>
        c.complaint_id.toLowerCase().includes(q.toLowerCase()) ||
        c.citizen_phone.includes(cleanDigits || q) ||
        (cleanDigits.length >= 7 && c.citizen_phone.replace(/\D/g, "").includes(cleanDigits))
    );

    if (matchedDemo) {
      setComplaint(matchedDemo);
      setUpdates(matchedDemo.updates || []);
      setLoading(false);
      return;
    }

    setErrorMsg(`No grievance found matching ticket ID or phone "${q}". Try one of the demo records below.`);
    setComplaint(null);
    setLoading(false);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    searchTicket();
  }

  // Determine active step index
  const currentStatus = complaint?.status || "Submitted";
  const stageIndex = STAGES.indexOf(currentStatus);
  const activeStep = stageIndex >= 0 ? stageIndex : currentStatus === "Closed" ? 5 : 1;

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <div className="card mb-3">
        <h2 style={{ marginBottom: 8 }}>🔍 Track Grievance Status</h2>
        <p className="subtitle" style={{ marginBottom: 16 }}>
          Enter your official Ticket Reference Number (e.g. <code>CMP-2026-001</code>) or your registered 10-digit mobile number.
        </p>

        <form onSubmit={handleFormSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            required
            placeholder="Enter Mobile No (e.g. 9876543001) or Ticket ID (CMP-2026-001)"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 15,
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Track Status"}
          </button>
        </form>

        {/* Demo Helper Quick Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
          <span className="text-muted">💡 Try demo numbers:</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ padding: "3px 8px", fontSize: 11, borderRadius: 12 }}
            onClick={() => {
              setTicketInput("9876543001");
              searchTicket("9876543001");
            }}
          >
            📞 9876543001 (Pothole - Work Started)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ padding: "3px 8px", fontSize: 11, borderRadius: 12 }}
            onClick={() => {
              setTicketInput("9876543003");
              searchTicket("9876543003");
            }}
          >
            📞 9876543003 (Street Light - Resolved)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ padding: "3px 8px", fontSize: 11, borderRadius: 12 }}
            onClick={() => {
              setTicketInput("9876543002");
              searchTicket("9876543002");
            }}
          >
            📞 9876543002 (Water Logging)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="card mb-3" style={{ borderLeft: "4px solid var(--red)", color: "var(--red-dark)" }}>
          {errorMsg}
        </div>
      )}

      {complaint && (
        <div className="card mb-3">
          <div className="flex justify-between items-start flex-wrap gap-2 mb-3" style={{ borderBottom: "1px solid var(--border-light)", pb: 16 }}>
            <div>
              <span className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Ticket Reference
              </span>
              <h3 style={{ fontSize: 24, fontFamily: "monospace", color: "var(--navy-900)" }}>
                {complaint.complaint_id}
              </h3>
              <div className="text-xs text-secondary mt-1">
                Lodged on {fmtDateTime(complaint.created_at)} by {complaint.citizen_name || "Citizen"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={badgeClass(complaint.status)} style={{ fontSize: 14, padding: "6px 14px" }}>
                {complaint.status}
              </span>
              <div className="text-xs text-muted mt-1">
                Priority: <strong style={{ color: "var(--text)" }}>{complaint.priority}</strong>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div style={{ padding: "20px 0 30px", overflowX: "auto" }}>
            <div style={{ display: "flex", minWidth: 600, position: "relative", justifyContent: "space-between" }}>
              {STAGES.map((stage, idx) => {
                const isPassed = idx <= activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <div
                    key={stage}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: isCurrent ? "var(--saffron)" : isPassed ? "var(--green)" : "var(--border)",
                        color: isPassed ? "#fff" : "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        fontWeight: 700,
                        fontSize: 14,
                        boxShadow: isCurrent ? "0 0 0 4px var(--saffron-light)" : "none",
                      }}
                    >
                      {isPassed && idx < activeStep ? "✓" : idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: isCurrent ? 700 : 500,
                        color: isPassed ? "var(--navy-900)" : "var(--text-muted)",
                      }}
                    >
                      {stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grievance Details */}
          <div className="grid-2 gap-2 mb-3" style={{ background: "var(--bg)", padding: 16, borderRadius: 8 }}>
            <div>
              <div className="text-xs text-muted">Issue Category</div>
              <div className="font-semibold text-sm">{complaint.issue_type}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Location</div>
              <div className="font-semibold text-sm">
                📍 {complaint.location_text || (complaint.asset ? complaint.asset.name : "Gujarat")}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Assigned Department</div>
              <div className="font-semibold text-sm">{complaint.department?.name || "Roads & Buildings Department"}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Assigned Officer</div>
              <div className="font-semibold text-sm">{complaint.assigned_to || "Executive Engineer (Triage Desk)"}</div>
            </div>
          </div>

          <div className="mb-3">
            <h4 style={{ fontSize: 14, marginBottom: 4 }}>Reported Issue Description:</h4>
            <p className="text-secondary text-sm" style={{ background: "var(--bg)", padding: 12, borderRadius: 6 }}>
              {complaint.description}
            </p>
          </div>

          {complaint.resolution_notes && (
            <div className="mb-3" style={{ background: "var(--green-light)", border: "1px solid var(--green)", padding: 16, borderRadius: 8 }}>
              <h4 style={{ color: "var(--green-dark)", fontSize: 15, marginBottom: 4 }}>
                ✅ Official Resolution / Action Taken:
              </h4>
              <p style={{ color: "var(--green-dark)", fontSize: 14 }}>
                {complaint.resolution_notes}
              </p>
              {complaint.resolved_at && (
                <div className="text-xs text-muted mt-2">
                  Completed on {fmtDateTime(complaint.resolved_at)}
                </div>
              )}
            </div>
          )}

          {/* Audit History / Updates */}
          <div>
            <h4 style={{ fontSize: 15, marginBottom: 12 }}>Activity &amp; Inspection Log</h4>
            {updates.length === 0 ? (
              <p className="text-xs text-muted">Initial submission verified. Field verification pending.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {updates.map((up) => (
                  <div
                    key={up.id}
                    style={{
                      borderLeft: "3px solid var(--saffron)",
                      paddingLeft: 12,
                      paddingBottom: 4,
                    }}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold" style={{ color: "var(--navy-900)" }}>
                        {up.status}
                      </span>
                      <span className="text-muted">{fmtDateTime(up.created_at)}</span>
                    </div>
                    <div className="text-xs text-secondary mt-1">{up.notes}</div>
                    <div className="text-xs text-muted">By: {up.updated_by || "System"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CitizenTrackPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <CitizenNav />
      <main className="citizen-main">
        <Suspense fallback={<div className="card" style={{ textAlign: "center", padding: 40 }}>Loading tracking console...</div>}>
          <TrackContent />
        </Suspense>
      </main>
    </div>
  );
}
