"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { inr, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

export default function Finance() {
  const [projects, setProjects] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("project_id, name, estimated_cost, sanctioned_amount, allocated_amount, actual_expenditure, status"),
      supabase.from("financial_records").select("*, projects(project_id, name)").order("created_at", { ascending: false }),
    ]).then(([p, r]) => {
      setProjects(p.data || []);
      setRecords(r.data || []);
    });
  }, []);

  const totalEstimated = projects.reduce((s, p) => s + Number(p.estimated_cost || 0), 0);
  const totalSanctioned = projects.reduce((s, p) => s + Number(p.sanctioned_amount || 0), 0);
  const totalAllocated = projects.reduce((s, p) => s + Number(p.allocated_amount || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + Number(p.actual_expenditure || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;

  const chartData = projects
    .filter((p) => p.sanctioned_amount > 0)
    .map((p) => ({
      name: p.project_id,
      sanctioned: Number(p.sanctioned_amount) / 10000000,
      spent: Number(p.actual_expenditure) / 10000000,
      remaining: (Number(p.sanctioned_amount) - Number(p.actual_expenditure || 0)) / 10000000,
    }));

  return (
    <Shell>
      <div className="main-header">
        <h1>Financial Overview</h1>
        <p>Budget tracking, allocations, and expenditure</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: "#EDE9FE" }}>📊</div><div className="stat-content"><div className="stat-label">Total Estimated</div><div className="stat-value" style={{ fontSize: 20 }}>{inr(totalEstimated)}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "#DBEAFE" }}>✅</div><div className="stat-content"><div className="stat-label">Total Sanctioned</div><div className="stat-value" style={{ fontSize: 20 }}>{inr(totalSanctioned)}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "#FFF7ED" }}>💰</div><div className="stat-content"><div className="stat-label">Total Allocated</div><div className="stat-value" style={{ fontSize: 20 }}>{inr(totalAllocated)}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "#FEE2E2" }}>📉</div><div className="stat-content"><div className="stat-label">Total Expenditure</div><div className="stat-value" style={{ fontSize: 20, color: "#E8772E" }}>{inr(totalSpent)}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "#D1FAE5" }}>💵</div><div className="stat-content"><div className="stat-label">Remaining</div><div className="stat-value" style={{ fontSize: 20, color: totalRemaining < 0 ? "#EF4444" : "#10B981" }}>{inr(totalRemaining)}</div></div></div>
      </div>

      <div className="card mb-3">
        <div className="card-header"><h3>Budget vs Expenditure by Project (₹ Cr)</h3></div>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} barGap={2}>
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => `₹${v.toFixed(2)} Cr`} />
              <Legend />
              <Bar dataKey="sanctioned" name="Sanctioned" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#E8772E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="remaining" name="Remaining" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Project Budget Summary</h3></div>
          <div className="table-wrap" style={{ boxShadow: "none", border: "none" }}>
            <table>
              <thead><tr><th>Project</th><th>Sanctioned</th><th>Spent</th><th>Utilization</th></tr></thead>
              <tbody>
                {projects.filter((p) => p.sanctioned_amount > 0).map((p) => {
                  const pct = Math.round((Number(p.actual_expenditure || 0) / Number(p.sanctioned_amount)) * 100);
                  return (
                    <tr key={p.project_id}>
                      <td><span style={{ fontWeight: 600, color: "#E8772E" }}>{p.project_id}</span><br /><span className="text-xs text-muted">{p.name?.substring(0, 35)}</span></td>
                      <td>{inr(p.sanctioned_amount)}</td>
                      <td>{inr(p.actual_expenditure)}</td>
                      <td style={{ minWidth: 100 }}>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : "#10B981" }} /></div>
                        <span className="text-xs">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Transactions</h3></div>
          <div className="table-wrap" style={{ boxShadow: "none", border: "none" }}>
            <table>
              <thead><tr><th>Type</th><th>Amount</th><th>Project</th><th>Date</th></tr></thead>
              <tbody>
                {records.slice(0, 10).map((r) => (
                  <tr key={r.id}>
                    <td><span className={badgeClass(r.record_type)}>{r.record_type}</span></td>
                    <td style={{ fontWeight: 600 }}>{inr(r.amount)}</td>
                    <td className="text-sm">{r.projects?.project_id || "—"}</td>
                    <td className="text-sm">{fmtDate(r.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
