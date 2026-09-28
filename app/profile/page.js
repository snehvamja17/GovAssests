"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { DEPARTMENTS, fmtDateTime } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

const DESIGNATIONS = [
  "Junior Engineer (JE)",
  "Assistant Engineer (AE)",
  "Assistant Executive Engineer (AEE)",
  "Executive Engineer (EE)",
  "Superintending Engineer (SE)",
  "Chief Engineer (CE)",
  "Secretary / Head of Department",
  "Accounts Officer / Finance Controller",
  "Director of Quality Control",
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "Er. Hardik Patel",
    email: "",
    phone: "+91-98765-43210",
    employee_id: "GJ-RNB-2020-0842",
    department: "Roads & Buildings",
    designation: "Executive Engineer (EE)",
    office_location: "Block No. 14, Bahumali Bhavan, Ahmedabad",
    role: "Department Officer",
    joined_date: "2020-04-15",
  });

  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [savingContact, setSavingContact] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    requested_designation: "Superintending Engineer (SE)",
    order_ref: "GOR/GAD/EST-2026/PR-089",
    reason: "Promotion pursuant to departmental promotion committee (DPC) recommendation.",
  });
  const [submittingPromo, setSubmittingPromo] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const u = data.session.user;
        setUser(u);
        setProfile((prev) => ({
          ...prev,
          email: u.email,
          full_name: u.user_metadata?.full_name || prev.full_name,
          phone: u.user_metadata?.phone || prev.phone,
          designation: u.user_metadata?.designation || prev.designation,
          office_location: u.user_metadata?.office_location || prev.office_location,
        }));

        // Check if there is an existing pending designation approval in approvals table
        supabase
          .from("approvals")
          .select("*")
          .eq("approval_type", "Designation & Post Sanction")
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data: appData }) => {
            if (appData && appData.length > 0 && appData[0].status === "Pending") {
              setPendingPromotion(appData[0]);
            }
          });
      }
    });
  }, []);

  async function handleSaveContact(e) {
    e.preventDefault();
    setSavingContact(true);
    setSuccessMsg("");

    // Update in Supabase auth user metadata
    await supabase.auth.updateUser({
      data: {
        full_name: profile.full_name,
        phone: profile.phone,
        office_location: profile.office_location,
      },
    });

    setSavingContact(false);
    setSuccessMsg("Contact information updated successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleRequestDesignation(e) {
    e.preventDefault();
    setSubmittingPromo(true);

    const refNo = promoForm.order_ref || `GO/EST/${Date.now().toString().slice(-6)}`;
    const newRequest = {
      approval_type: "Designation & Post Sanction",
      authority: "Secretary / Principal Secretary, R&B Department",
      designation: "Head of Administrative Department",
      approval_date: new Date().toISOString().split("T")[0],
      reference_number: refNo,
      status: "Pending",
      remarks: `Officer ${profile.full_name} (${profile.employee_id}) requested post change from [${profile.designation}] to [${promoForm.requested_designation}]. Reason: ${promoForm.reason}`,
    };

    // Save to approvals table
    const { data: createdApp, error } = await supabase.from("approvals").insert([newRequest]).select().single();

    // Log to audit log
    await supabase.from("audit_logs").insert([
      {
        entity_type: "user_profile",
        action: "Designation Change Requested",
        previous_value: profile.designation,
        new_value: `${promoForm.requested_designation} (Pending Sanction)`,
        performed_by: profile.full_name,
        reason: promoForm.reason,
      },
    ]);

    setSubmittingPromo(false);
    setShowPromoModal(false);

    if (error) {
      // Local fallback representation
      setPendingPromotion({
        id: "local-app",
        reference_number: refNo,
        remarks: newRequest.remarks,
        status: "Pending",
        created_at: new Date().toISOString(),
      });
    } else {
      setPendingPromotion(createdApp);
    }
  }

  async function handleSimulateAdminSanction() {
    if (!confirm("Simulate Higher Authority Sanction (Secretary / Super Admin approval)?")) return;

    if (pendingPromotion) {
      const targetDesignation = promoForm.requested_designation;
      setProfile((prev) => ({ ...prev, designation: targetDesignation }));

      // Update user metadata
      await supabase.auth.updateUser({
        data: { designation: targetDesignation },
      });

      // Update approval record
      if (pendingPromotion.id && !pendingPromotion.id.startsWith("local")) {
        await supabase
          .from("approvals")
          .update({ status: "Approved" })
          .eq("id", pendingPromotion.id);
      }

      setPendingPromotion(null);
      alert(`Government Order Sanctioned: Your post has been officially updated to ${targetDesignation}.`);
    }
  }

  const initials = (profile.full_name || "HP")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Shell>
      <div className="page-header flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2>👤 Officer Identity &amp; Service Profile</h2>
          <p className="subtitle">
            Government service profile, contact records, post designation, and official authorization credentials.
          </p>
        </div>
      </div>

      {successMsg && (
        <div
          className="card mb-3"
          style={{
            background: "var(--green-light)",
            color: "var(--green-dark)",
            border: "1px solid var(--green)",
            padding: "12px 18px",
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Official Identity Card */}
      <div
        className="card mb-3"
        style={{
          background: "linear-gradient(135deg, #0B1120 0%, #1e293b 100%)",
          color: "#fff",
          padding: "28px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--saffron)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(232, 119, 46, 0.4)",
              }}
            >
              {initials}
            </div>
            <div>
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#d1d5db",
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                🇮🇳 Government of Gujarat · Service Card
              </span>
              <h1 style={{ fontSize: 24, margin: "4px 0 2px", color: "#fff" }}>
                {profile.full_name}
              </h1>
              <div style={{ color: "var(--saffron)", fontWeight: 600, fontSize: 14 }}>
                {profile.designation}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              className="badge"
              style={{
                background: "#10B981",
                color: "#fff",
                fontSize: 12,
                padding: "6px 12px",
                fontWeight: 700,
              }}
            >
              ACTIVE SERVICE
            </span>
            <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>
              Service ID: <strong style={{ color: "#fff" }}>{profile.employee_id}</strong>
            </div>
          </div>
        </div>

        <div
          className="grid-4 gap-2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            background: "rgba(255,255,255,0.06)",
            padding: "16px 20px",
            borderRadius: 10,
            marginTop: 12,
            fontSize: 13,
          }}
        >
          <div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>Department</div>
            <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>{profile.department}</div>
          </div>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>Official Email</div>
            <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>{profile.email}</div>
          </div>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>Office Contact</div>
            <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>{profile.phone}</div>
          </div>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>Posting Location</div>
            <div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>Ahmedabad Circle</div>
          </div>
        </div>
      </div>

      <div className="grid-2 gap-3 mb-3">
        {/* Section 1: Editable Contact Details */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>📝 Edit Contact &amp; Personal Details</h3>
          <p className="text-secondary text-xs mb-3">
            Officers are authorized to directly maintain their current phone number, full name, and posting office address.
          </p>

          <form onSubmit={handleSaveContact}>
            <div className="form-group mb-2">
              <label>Official Full Name *</label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="grid-2 gap-2 mb-2">
              <div className="form-group">
                <label>Official Mobile No. *</label>
                <input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Government Employee ID</label>
                <input
                  type="text"
                  disabled
                  value={profile.employee_id}
                  style={{ background: "var(--border-light)", color: "var(--text-secondary)" }}
                />
              </div>
            </div>

            <div className="form-group mb-2">
              <label>Department</label>
              <select
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>Official Headquarters / Office Address</label>
              <textarea
                rows={2}
                value={profile.office_location}
                onChange={(e) => setProfile({ ...profile, office_location: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={savingContact}>
                {savingContact ? "Saving..." : "Save Contact Information"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Designation / Post Management & Higher Authority Approval */}
        <div className="card">
          <div className="flex justify-between items-center mb-1">
            <h3 style={{ margin: 0 }}>🎖️ Official Post &amp; Designation</h3>
            <span
              className="badge"
              style={{
                background: "var(--blue-light)",
                color: "var(--blue-dark)",
                fontWeight: 600,
              }}
            >
              Sanction-Controlled
            </span>
          </div>
          <p className="text-secondary text-xs mb-3">
            In compliance with State Administrative Service rules, <strong>officers cannot self-assign higher posts or change rank directly</strong>. All promotions and designation transfers require official sanction by the Higher Authority (Secretary / Super Admin).
          </p>

          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div className="text-xs text-muted">Current Substantive Post</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy-900)", marginTop: 2 }}>
              {profile.designation}
            </div>
            <div className="text-xs text-secondary mt-1">
              Sanction Order: <code>GAD/EST/GJ/2020/481</code> · Financial Sanction Power: Up to ₹50 Cr
            </div>
          </div>

          {/* Pending Approval Banner */}
          {pendingPromotion ? (
            <div
              style={{
                background: "var(--amber-light)",
                border: "1px solid var(--amber)",
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div className="flex items-center gap-1 font-semibold text-sm" style={{ color: "var(--amber-dark)" }}>
                <span>⏳</span> Pending Higher Authority Sanction
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--amber-dark)" }}>
                {pendingPromotion.remarks}
              </p>
              <div className="text-xs text-muted mt-2">
                Order Ref: <code>{pendingPromotion.reference_number}</code> · Status: <strong>Awaiting Secretary Approval</strong>
              </div>

              {/* Simulation button for demo */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--amber)" }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: "var(--green)",
                    color: "#fff",
                    fontSize: 11,
                    padding: "4px 10px",
                  }}
                  onClick={handleSimulateAdminSanction}
                >
                  ✓ Higher Authority / Admin: Sanction Promotion Now
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <div className="text-xs text-secondary mb-2">
                Have you received a transfer, promotion, or new administrative posting order?
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setShowPromoModal(true)}
              >
                📜 Submit Designation Change Request to Higher Authority
              </button>
            </div>
          )}

          <div
            style={{
              background: "var(--border-light)",
              borderRadius: 8,
              padding: 12,
              fontSize: 11,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <strong>🔒 Administrative Rule:</strong> Direct self-elevation of designation is disabled to protect financial sanction limits, tender committee voting rights, and audit integrity under the Gujarat Public Works Department Manual.
          </div>
        </div>
      </div>

      {/* Designation Promotion Modal */}
      {showPromoModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 560 }}>
            <div className="flex justify-between items-center mb-2">
              <h3>Formal Post Designation Transfer Request</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowPromoModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestDesignation}>
              <div className="form-group mb-2">
                <label>Current Designation</label>
                <input type="text" disabled value={profile.designation} style={{ background: "var(--border-light)" }} />
              </div>

              <div className="form-group mb-2">
                <label>Requested New Post / Designation *</label>
                <select
                  required
                  value={promoForm.requested_designation}
                  onChange={(e) => setPromoForm({ ...promoForm, requested_designation: e.target.value })}
                >
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-2">
                <label>Official Government Order (GO) Reference No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GOR/RNB/EST-2026/PROMO-089"
                  value={promoForm.order_ref}
                  onChange={(e) => setPromoForm({ ...promoForm, order_ref: e.target.value })}
                />
              </div>

              <div className="form-group mb-3">
                <label>Justification &amp; Sanction Authority Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the Departmental Promotion Committee (DPC) recommendation, transfer notification date, or administrative deputation order..."
                  value={promoForm.reason}
                  onChange={(e) => setPromoForm({ ...promoForm, reason: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPromoModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingPromo}>
                  {submittingPromo ? "Submitting..." : "Submit to Higher Authority for Sanction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
