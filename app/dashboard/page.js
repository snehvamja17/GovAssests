"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { inr, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";
import Link from "next/link";

const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

const COLORS = ["#E8772E", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#14B8A6", "#EC4899", "#6366F1", "#84CC16"];

function groupBy(arr, key) {
  return arr.reduce((o, item) => {
    const k = item[key] || "Unknown";
    o[k] = (o[k] || 0) + 1;
    return o;
  }, {});
}

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("assets").select("*"),
      supabase.from("projects").select("*"),
      supabase.from("complaints").select("*"),
      supabase.from("maintenance_records").select("*"),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
    ]).then(([a, p, c, m, al]) => {
      setAssets(a.data || []);
      setProjects(p.data || []);
      setComplaints(c.data || []);
      setMaintenance(m.data || []);
      setAudit(al.data || []);
      setLoaded(true);
    });
  }, []);

  if (!loaded)
    return (
      <Shell>
        <div className="loader-overlay" style={{ position: "relative", background: "transparent", minHeight: 300 }}>
          <div className="loader-shape" />
          <span className="loader-text" style={{ color: "#6b7280" }}>Loading dashboard...</span>
        </div>
      </Shell>
    );

  const activeProjects = projects.filter((p) => ["Under Construction", "Approved", "Tendering", "Contract Awarded"].includes(p.status));
  const totalSanctioned = projects.reduce((s, p) => s + Number(p.sanctioned_amount || 0), 0);
  const totalExpenditure = projects.reduce((s, p) => s + Number(p.actual_expenditure || 0), 0);
  const pendingMaint = maintenance.filter((m) => !["Completed", "Verified", "Closed"].includes(m.status));
  const openComplaints = complaints.filter((c) => !["Resolved", "Closed", "Rejected"].includes(c.status));

  // Chart data
  const statusData = Object.entries(groupBy(projects, "status")).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(groupBy(assets, "condition")).map(([name, value]) => ({ name, value }));

  const budgetData = projects
    .filter((p) => p.sanctioned_amount > 0)
    .slice(0, 8)
    .map((p) => ({
      name: p.project_id,
      sanctioned: Number(p.sanctioned_amount) / 10000000,
      spent: Number(p.actual_expenditure) / 10000000,
    }));

  return (
    <Shell>
      <div className="main-header">
        <h1>Dashboard</h1>
        <p>Overview of government infrastructure assets and projects</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#EDE9FE" }}>🏗️</div>
          <div className="stat-content">
            <div className="stat-label">Total Assets</div>
            <div className="stat-value">{assets.length}</div>
            <div className="stat-sub">Across all categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#FFF7ED" }}>📋</div>
          <div className="stat-content">
            <div className="stat-label">Active Projects</div>
            <div className="stat-value">{activeProjects.length}</div>
            <div className="stat-sub">{projects.filter((p) => p.status === "Under Construction").length} under construction</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#D1FAE5" }}>💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Sanctioned</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{inr(totalSanctioned)}</div>
            <div className="stat-sub">Spent: {inr(totalExpenditure)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#FEF3C7" }}>🔧</div>
          <div className="stat-content">
            <div className="stat-label">Pending Maintenance</div>
            <div className="stat-value">{pendingMaint.length}</div>
            <div className="stat-sub">{maintenance.filter((m) => m.priority === "Critical").length} critical</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#DBEAFE" }}>✅</div>
          <div className="stat-content">
            <div className="stat-label">Completed Projects</div>
            <div className="stat-value">{projects.filter((p) => p.status === "Completed").length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#FEE2E2" }}>📢</div>
          <div className="stat-content">
            <div className="stat-label">Open Complaints</div>
            <div className="stat-value">{openComplaints.length}</div>
            <div className="stat-sub">{complaints.length} total received</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-3">
        <div className="card">
          <div className="card-header">
            <h3>Project Status Distribution</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Budget vs Expenditure (₹ Cr)</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={budgetData} barGap={2}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => `₹${v.toFixed(1)} Cr`} />
                <Legend />
                <Bar dataKey="sanctioned" name="Sanctioned" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#E8772E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Asset Condition */}
        <div className="card">
          <div className="card-header">
            <h3>Asset Condition Overview</h3>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {categoryData.map((entry, i) => {
                    const colors = { Excellent: "#10B981", Good: "#14B8A6", Fair: "#F59E0B", Poor: "#F97316", Critical: "#EF4444" };
                    return <Cell key={i} fill={colors[entry.name] || COLORS[i]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link href="/audit" className="btn btn-sm btn-outline">View All</Link>
          </div>
          {audit.length === 0 ? (
            <div className="empty-state"><p>No recent activity</p></div>
          ) : (
            <ul className="timeline">
              {audit.slice(0, 6).map((a) => (
                <li key={a.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-date">{fmtDate(a.created_at)}</div>
                  <div className="timeline-title">{a.action}</div>
                  <div className="timeline-desc">
                    {a.previous_value && <>{a.previous_value} → </>}{a.new_value}
                  </div>
                  <div className="timeline-by">{a.performed_by}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Active Projects Table */}
      <div className="card mt-3">
        <div className="card-header">
          <h3>Active Projects</h3>
          <Link href="/projects" className="btn btn-sm btn-outline">View All Projects</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Sanctioned</th>
                <th>Spent</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.slice(0, 6).map((p) => (
                <tr key={p.id} className="clickable" onClick={() => (window.location.href = `/projects/${p.id}`)}>
                  <td style={{ fontWeight: 600, color: "#E8772E" }}>{p.project_id}</td>
                  <td className="truncate" style={{ maxWidth: 250 }}>{p.name}</td>
                  <td><span className={badgeClass(p.status)}>{p.status}</span></td>
                  <td style={{ minWidth: 120 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className={`progress-fill ${p.progress_percent === 100 ? "complete" : ""}`} style={{ width: `${p.progress_percent}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{p.progress_percent}%</span>
                    </div>
                  </td>
                  <td>{inr(p.sanctioned_amount)}</td>
                  <td>{inr(p.actual_expenditure)}</td>
                </tr>
              ))}
              {activeProjects.length === 0 && (
                <tr><td colSpan="6" className="muted" style={{ textAlign: "center" }}>No active projects</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
