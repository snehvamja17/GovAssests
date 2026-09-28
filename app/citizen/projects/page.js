"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CitizenNav from "@/components/CitizenNav";
import { supabase } from "@/lib/supabase";
import { inr, fmtDate, DISTRICTS } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

function PublicProjectsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      const { data } = await supabase
        .from("projects")
        .select(
          "*, department:departments(name), location:locations(district, city), contractor:contractors(company_name)"
        )
        .eq("is_public", true)
        .order("progress_percent", { ascending: false });

      if (data) setProjects(data);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const matchDistrict = districtFilter === "all" || p.location?.district === districtFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.project_id?.toLowerCase().includes(q) ||
      p.department?.name?.toLowerCase().includes(q) ||
      p.contractor?.company_name?.toLowerCase().includes(q);
    return matchDistrict && matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h2>📋 Gujarat Public Infrastructure Projects Directory</h2>
        <p className="subtitle">
          Transparent public oversight of major state highways, flyovers, civil buildings, and water infrastructure.
        </p>
      </div>

      <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
        <input
          type="text"
          className="search-input"
          placeholder="Search by project name, contractor, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280 }}
        />

        <div className="flex gap-1 flex-wrap">
          <select
            className="filter-select"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {["Under Construction", "Completed", "Approved", "Tendering", "Operational"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
          Loading public infrastructure initiatives...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
          No public projects found matching the filter criteria.
        </div>
      ) : (
        <div className="grid-2 gap-2">
          {filtered.map((p) => (
            <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div className="flex justify-between items-start mb-2">
                <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-dark)" }}>
                  {p.department?.name || "R&B Department"}
                </span>
                <span className={badgeClass(p.status)}>{p.status}</span>
              </div>

              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{p.name}</h3>
              <p className="text-secondary text-xs mb-2 truncate" style={{ maxHeight: 38 }}>
                {p.description || "Public infrastructure development undertaken by state works department."}
              </p>

              <div className="grid-2 gap-1 text-xs text-secondary mb-3" style={{ background: "var(--bg)", padding: 10, borderRadius: 6 }}>
                <div>📍 <strong>District:</strong> {p.location?.district || "Gujarat"}</div>
                <div>🏢 <strong>Builder:</strong> {p.contractor?.company_name || "State Agency"}</div>
                <div>📅 <strong>Start:</strong> {fmtDate(p.start_date)}</div>
                <div>🎯 <strong>Target:</strong> {fmtDate(p.expected_completion_date)}</div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Physical Completion</span>
                  <strong>{p.progress_percent || 0}%</strong>
                </div>
                <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${p.progress_percent || 0}%`,
                      height: "100%",
                      background: (p.progress_percent || 0) >= 100 ? "var(--green)" : "var(--saffron)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>

              <div
                className="flex justify-between items-center text-xs mt-auto pt-2"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <div>
                  <span className="text-muted">Sanctioned Outlay:</span>{" "}
                  <strong style={{ color: "var(--navy-900)", fontSize: 13 }}>
                    {inr(p.sanctioned_amount)}
                  </strong>
                </div>
                <span className="text-xs text-muted" style={{ fontFamily: "monospace" }}>
                  ID: {p.project_id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CitizenProjectsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <CitizenNav />
      <main className="citizen-main">
        <Suspense fallback={<div className="card" style={{ textAlign: "center", padding: 40 }}>Loading projects...</div>}>
          <PublicProjectsContent />
        </Suspense>
      </main>
    </div>
  );
}
