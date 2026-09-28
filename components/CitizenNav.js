"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CitizenNav() {
  const path = usePathname();

  return (
    <header className="citizen-nav">
      <Link href="/citizen" className="nav-logo">
        <div className="logo-box">🏛️</div>
        <span>GovAssets Citizen Portal</span>
      </Link>

      <nav style={{ display: "flex", gap: "8px", flex: 1, overflowX: "auto" }}>
        <Link href="/citizen" className={path === "/citizen" ? "active" : ""}>
          🏠 Home
        </Link>
        <Link href="/citizen/report" className={path === "/citizen/report" ? "active" : ""}>
          📢 Report Issue
        </Link>
        <Link href="/citizen/track" className={path === "/citizen/track" ? "active" : ""}>
          🔍 Track Grievance
        </Link>
        <Link href="/citizen/projects" className={path === "/citizen/projects" ? "active" : ""}>
          📋 Public Projects
        </Link>
        <Link href="/citizen/assets" className={path === "/citizen/assets" ? "active" : ""}>
          🏗️ Infrastructure Directory
        </Link>
        <Link href="/citizen/map" className={path === "/citizen/map" ? "active" : ""}>
          🗺️ Public Map
        </Link>
      </nav>

      <div style={{ marginLeft: "auto" }}>
        <Link
          href="/"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
            background: "var(--navy-900)",
            color: "#fff",
            borderRadius: 6,
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          🔐 Officer Sign In
        </Link>
      </div>
    </header>
  );
}
