"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const NAV = [
  { section: "Overview" },
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { section: "Infrastructure" },
  { href: "/assets", icon: "🏗️", label: "All Assets" },
  { href: "/projects", icon: "📋", label: "Projects" },
  { href: "/map", icon: "🗺️", label: "Map View" },
  { section: "Operations" },
  { href: "/contractors", icon: "🏢", label: "Contractors" },
  { href: "/finance", icon: "💰", label: "Finance" },
  { href: "/maintenance", icon: "🔧", label: "Maintenance" },
  { href: "/inspections", icon: "🔍", label: "Inspections" },
  { section: "Records" },
  { href: "/documents", icon: "📄", label: "Documents" },
  { href: "/approvals", icon: "✅", label: "Approvals" },
  { href: "/complaints", icon: "📢", label: "Complaints" },
  { href: "/audit", icon: "📜", label: "Audit Logs" },
  { section: "System" },
  { href: "/reports", icon: "📈", label: "Reports" },
  { href: "/profile", icon: "👤", label: "My Profile" },
  { href: "/help", icon: "❓", label: "Help & Support" },
];

export default function Shell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/");
      else setUser(data.session.user);
    });
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (!user)
    return (
      <div className="loader-overlay">
        <div className="loader-shape" />
        <span className="loader-text">Loading GovAssets...</span>
      </div>
    );

  const initials = (user.email || "U").substring(0, 2).toUpperCase();

  return (
    <div className="layout">
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>
            <span className="logo-icon">🏛️</span>
            GovAssets
          </h2>
          <small>Infrastructure Management System</small>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className="sidebar-section">
                {item.section}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${
                  path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href))
                    ? "active"
                    : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <Link
            href="/profile"
            className="user-info"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <div className="avatar">{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.user_metadata?.full_name || user.email}
              </div>
              <div className="user-role">
                {user.user_metadata?.designation || "Executive Engineer"} ⚙️
              </div>
            </div>
          </Link>
          <button className="logout-btn" onClick={logout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
