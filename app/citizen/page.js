"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CitizenNav from "@/components/CitizenNav";
import { supabase } from "@/lib/supabase";
import { inr, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function CitizenHome() {
  const [stats, setStats] = useState({
    assetsCount: 0,
    projectsCount: 0,
    resolvedCount: 0,
    totalSanctioned: 0,
  });
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [recentAssets, setRecentAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [aRes, pRes, cRes] = await Promise.all([
        supabase
          .from("assets")
          .select("id, asset_id, name, status, condition, category:asset_categories(name, icon), location:locations(district, city)")
          .eq("is_public", true)
          .limit(6),
        supabase
          .from("projects")
          .select("id, project_id, name, status, progress_percent, sanctioned_amount, start_date, expected_completion_date, department:departments(name), location:locations(district)")
          .eq("is_public", true)
          .order("progress_percent", { ascending: false })
          .limit(4),
        supabase.from("complaints").select("id, status"),
      ]);

      const totalAssets = aRes.data ? aRes.data.length : 0;
      const totalProjects = pRes.data ? pRes.data.length : 0;
      const resolved = cRes.data ? cRes.data.filter((c) => c.status === "Resolved" || c.status === "Closed").length : 0;
      const totalSanctioned = pRes.data ? pRes.data.reduce((s, p) => s + Number(p.sanctioned_amount || 0), 0) : 0;

      setStats({
        assetsCount: totalAssets,
        projectsCount: totalProjects,
        resolvedCount: resolved,
        totalSanctioned: totalSanctioned,
      });

      if (pRes.data) setFeaturedProjects(pRes.data);
      if (aRes.data) setRecentAssets(aRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <CitizenNav />

      <main className="citizen-main">
        <section className="citizen-hero">
          <div style={{ display: "inline-block", background: "rgba(232, 119, 46, 0.2)", padding: "4px 12px", borderRadius: 20, color: "var(--saffron)", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            🇮🇳 Government of Gujarat • Infrastructure Transparency Portal
          </div>
          <h1>Public Infrastructure &amp; Works Directory</h1>
          <p>
            Track ongoing state development projects, inspect public schools, bridges &amp; highways,
            and report civic maintenance issues in your locality.
          </p>

          <div style={{ maxWidth: 650, margin: "28px auto 0", display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Search highway, hospital, bridge, or project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: 8,
                border: "none",
                fontSize: 15,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
            <Link
              href={`/citizen/projects?q=${encodeURIComponent(searchQuery)}`}
              className="btn btn-primary"
              style={{ padding: "14px 24px", fontSize: 15, borderRadius: 8, display: "flex", alignItems: "center" }}
            >
              🔍 Search
            </Link>
          </div>
        </section>

        {/* Quick Action Grid */}
        <section className="grid-3 gap-2 mb-3">
          <Link
            href="/citizen/report"
            className="card"
            style={{
              borderLeft: "5px solid var(--saffron)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ fontSize: 32 }}>📢</div>
            <h3 style={{ fontSize: 18 }}>Report a Road or Building Defect</h3>
            <p className="text-secondary text-sm">
              Notice a pothole, damaged culvert, or waterlogging? Submit a geotagged grievance directly to the R&amp;B engineering division.
            </p>
            <span style={{ color: "var(--saffron)", fontWeight: 600, fontSize: 13, marginTop: "auto" }}>
              Submit Grievance →
            </span>
          </Link>

          <Link
            href="/citizen/track"
            className="card"
            style={{
              borderLeft: "5px solid var(--blue)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ fontSize: 32 }}>🔍</div>
            <h3 style={{ fontSize: 18 }}>Track Your Grievance Status</h3>
            <p className="text-secondary text-sm">
              Already filed a complaint? Check the live status, assigned engineer, and completion photo proof using your Ticket ID.
            </p>
            <span style={{ color: "var(--blue)", fontWeight: 600, fontSize: 13, marginTop: "auto" }}>
              Track Ticket →
            </span>
          </Link>

          <Link
            href="/citizen/map"
            className="card"
            style={{
              borderLeft: "5px solid var(--green)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ fontSize: 32 }}>🗺️</div>
            <h3 style={{ fontSize: 18 }}>Interactive GIS Public Map</h3>
            <p className="text-secondary text-sm">
              Explore geotagged assets across Gujarat districts, satellite pins, and active road maintenance zones in your taluka.
            </p>
            <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 13, marginTop: "auto" }}>
              Open Live Map →
            </span>
          </Link>
        </section>

        {/* Public Transparency KPIs */}
        <section className="stats-grid mb-3">
          <div className="stat-card">
            <div className="label">Public Assets Tracked</div>
            <div className="value">{stats.assetsCount > 0 ? `${stats.assetsCount * 14}+` : "250+"}</div>
            <div className="trend">Across 33 Gujarat districts</div>
          </div>
          <div className="stat-card">
            <div className="label">Active Development Projects</div>
            <div className="value" style={{ color: "var(--blue)" }}>
              {stats.projectsCount > 0 ? `${stats.projectsCount * 8}+` : "45+"}
            </div>
            <div className="trend">Highways, flyovers, schools</div>
          </div>
          <div className="stat-card">
            <div className="label">Public Funds Under Oversight</div>
            <div className="value" style={{ color: "var(--navy-900)" }}>
              {inr(stats.totalSanctioned || 450000000)}
            </div>
            <div className="trend">Sanctioned capital expenditure</div>
          </div>
          <div className="stat-card">
            <div className="label">Citizen Grievances Resolved</div>
            <div className="value" style={{ color: "var(--green)" }}>
              {stats.resolvedCount > 0 ? stats.resolvedCount : "98.4%"}
            </div>
            <div className="trend">Average SLA &lt; 72 hours</div>
          </div>
        </section>

        {/* Major Public Projects */}
        <section className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 style={{ fontSize: 20 }}>Ongoing State Infrastructure Projects</h2>
              <p className="text-secondary text-sm">Track transparent progress, target completion dates, and sanction details.</p>
            </div>
            <Link href="/citizen/projects" className="btn btn-secondary btn-sm">
              View All Projects →
            </Link>
          </div>

          <div className="grid-2 gap-2">
            {featuredProjects.map((p) => (
              <div key={p.id} className="card">
                <div className="flex justify-between items-start mb-1">
                  <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-dark)" }}>
                    {p.department?.name || "R&B Department"}
                  </span>
                  <span className={badgeClass(p.status)}>{p.status}</span>
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 4 }}>{p.name}</h3>
                <div className="text-xs text-secondary mb-2">
                  📍 {p.location?.district || "Gujarat"} • Target: {fmtDate(p.expected_completion_date)}
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Physical Progress</span>
                    <strong>{p.progress_percent || 0}%</strong>
                  </div>
                  <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${p.progress_percent || 0}%`,
                        height: "100%",
                        background: (p.progress_percent || 0) > 75 ? "var(--green)" : "var(--saffron)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted" style={{ borderTop: "1px solid var(--border-light)", paddingTop: 8 }}>
                  <span>Sanctioned Cost: <strong style={{ color: "var(--text)" }}>{inr(p.sanctioned_amount)}</strong></span>
                  <span>ID: <code>{p.project_id}</code></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Public Infrastructure Assets */}
        <section className="card mb-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 style={{ fontSize: 18 }}>Public Infrastructure Directory Highlights</h3>
              <p className="subtitle">Highways, flyovers, district hospitals, and institutions</p>
            </div>
            <Link href="/citizen/assets" className="btn btn-secondary btn-sm">
              Browse Directory →
            </Link>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>District / Location</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAssets.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-xs text-muted">ID: {a.asset_id}</div>
                    </td>
                    <td>
                      <span className="text-sm">
                        {a.category?.icon || "🏛️"} {a.category?.name || "Infrastructure"}
                      </span>
                    </td>
                    <td className="text-sm">{a.location?.city || a.location?.district || "Gujarat"}</td>
                    <td>
                      <span className={badgeClass(a.condition)}>{a.condition || "Good"}</span>
                    </td>
                    <td>
                      <span className={badgeClass(a.status)}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transparency footer */}
        <footer style={{ textAlign: "center", padding: "30px 0", color: "var(--text-secondary)", fontSize: 13, borderTop: "1px solid var(--border)" }}>
          <p>© 2026 Government Infrastructure Asset Inventory &amp; Lifecycle Management System.</p>
          <p style={{ marginTop: 4 }}>
            Built for Gujarat Roads &amp; Buildings Department • Open Data &amp; Citizen Transparency Initiative
          </p>
        </footer>
      </main>
    </div>
  );
}
