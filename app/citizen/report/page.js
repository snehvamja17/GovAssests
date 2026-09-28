"use client";
import { useState } from "react";
import Link from "next/link";
import CitizenNav from "@/components/CitizenNav";
import { supabase } from "@/lib/supabase";
import { COMPLAINT_TYPES, DISTRICTS } from "@/lib/constants";

export default function CitizenReportPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [form, setForm] = useState({
    citizen_name: "",
    citizen_phone: "",
    citizen_email: "",
    issue_type: "Pothole",
    district: "Ahmedabad",
    location_text: "",
    latitude: "",
    longitude: "",
    description: "",
    photo_url: "",
  });

  function handleGetLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGettingLocation(false);
      },
      (err) => {
        alert("Unable to retrieve location: " + err.message);
        setGettingLocation(false);
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const ticketId = `CMP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payload = {
      complaint_id: ticketId,
      citizen_name: form.citizen_name || "Concerned Citizen",
      citizen_phone: form.citizen_phone || null,
      citizen_email: form.citizen_email || null,
      issue_type: form.issue_type,
      description: form.description,
      location_text: `${form.location_text}${form.district ? ` (${form.district} District)` : ""}`,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      photo_url: form.photo_url || null,
      priority: form.issue_type === "Bridge Damage" || form.issue_type === "Road Damage" ? "High" : "Medium",
      status: "Submitted",
    };

    const { data, error } = await supabase.from("complaints").insert([payload]).select().single();

    if (error) {
      alert("Error submitting grievance: " + error.message);
      setSubmitting(false);
      return;
    }

    if (data) {
      // Record initial update event
      await supabase.from("complaint_updates").insert([
        {
          complaint_id: data.id,
          status: "Submitted",
          notes: "Grievance lodged through Public Citizen Portal.",
          updated_by: "Citizen",
        },
      ]);
    }

    setSubmitting(false);
    setSubmittedTicket(ticketId);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <CitizenNav />

      <main className="citizen-main">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {submittedTicket ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
              <h2 style={{ color: "var(--green-dark)", marginBottom: 8 }}>
                Grievance Submitted Successfully!
              </h2>
              <p className="text-secondary" style={{ marginBottom: 24 }}>
                Your infrastructure issue has been recorded and assigned to the local R&amp;B divisional executive engineer.
              </p>

              <div
                style={{
                  background: "var(--bg)",
                  border: "2px dashed var(--saffron)",
                  borderRadius: 12,
                  padding: "20px",
                  display: "inline-block",
                  marginBottom: 24,
                }}
              >
                <div className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                  Your Official Tracking Ticket ID
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy-900)", marginTop: 4, fontFamily: "monospace" }}>
                  {submittedTicket}
                </div>
                <div className="text-xs text-secondary mt-1">
                  Please save this ID to track inspection status and repair progress.
                </div>
              </div>

              <div className="flex justify-center gap-2" style={{ justifyContent: "center" }}>
                <Link
                  href={`/citizen/track?id=${submittedTicket}`}
                  className="btn btn-primary"
                >
                  🔍 Track This Grievance Now
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setForm({
                      citizen_name: "",
                      citizen_phone: "",
                      citizen_email: "",
                      issue_type: "Pothole",
                      district: "Ahmedabad",
                      location_text: "",
                      latitude: "",
                      longitude: "",
                      description: "",
                      photo_url: "",
                    });
                  }}
                >
                  ➕ Report Another Issue
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="page-header" style={{ marginBottom: 20 }}>
                <h2>📢 Report Infrastructure Defect or Grievance</h2>
                <p className="subtitle">
                  Help maintain Gujarat&apos;s roads, bridges, and public facilities by reporting damages directly to authorities.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card mb-3" style={{ background: "var(--border-light)", border: "none" }}>
                  <h4 style={{ marginBottom: 12, fontSize: 15 }}>1. Citizen Contact Information (For SMS/Call Updates)</h4>
                  <div className="grid-2 gap-2 mb-2">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={form.citizen_name}
                        onChange={(e) => setForm({ ...form, citizen_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={form.citizen_phone}
                        onChange={(e) => setForm({ ...form, citizen_phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="ramesh@gmail.com"
                      value={form.citizen_email}
                      onChange={(e) => setForm({ ...form, citizen_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="card mb-3" style={{ background: "var(--border-light)", border: "none" }}>
                  <h4 style={{ marginBottom: 12, fontSize: 15 }}>2. Defect &amp; Location Details</h4>
                  <div className="grid-2 gap-2 mb-2">
                    <div className="form-group">
                      <label>Issue Type *</label>
                      <select
                        value={form.issue_type}
                        onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
                      >
                        {COMPLAINT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>District *</label>
                      <select
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-2">
                    <label>Specific Landmark / Road / Location Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Iscon Circle, SG Highway flyover pillar #14, Bodakdev"
                      value={form.location_text}
                      onChange={(e) => setForm({ ...form, location_text: e.target.value })}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <label>GPS Geolocation (Lat, Long)</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleGetLocation}
                        disabled={gettingLocation}
                      >
                        {gettingLocation ? "Detecting GPS..." : "📍 Capture My Current GPS"}
                      </button>
                    </div>
                    <div className="grid-2 gap-2">
                      <input
                        type="text"
                        placeholder="Latitude (e.g. 23.0225)"
                        value={form.latitude}
                        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Longitude (e.g. 72.5714)"
                        value={form.longitude}
                        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group mb-2">
                    <label>Detailed Problem Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain the defect, hazard to motorists, depth of pothole, or structural crack observed..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Photo Evidence URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or cloud photo link"
                      value={form.photo_url}
                      onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                    />
                    <small className="text-xs text-muted">
                      Paste an image URL of the damaged road/infrastructure for faster triage.
                    </small>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <Link href="/citizen" className="btn btn-secondary">
                    ← Back to Home
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Registering Grievance..." : "🚀 Submit Grievance"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
