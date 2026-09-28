"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CitizenNav from "@/components/CitizenNav";
import { supabase } from "@/lib/supabase";

const MapComponent = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 550,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e5e7eb",
        borderRadius: 14,
        color: "#6b7280",
      }}
    >
      🗺️ Initializing GIS Geographic Mapping System...
    </div>
  ),
});

export default function CitizenMapPage() {
  const [assets, setAssets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showAssets, setShowAssets] = useState(true);

  useEffect(() => {
    async function loadGIS() {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([
        supabase
          .from("assets")
          .select("*, location:locations(latitude, longitude, district, city), category:asset_categories(name, icon)")
          .eq("is_public", true),
        supabase
          .from("complaints")
          .select("*, asset:assets(name)"),
      ]);

      if (aRes.data) setAssets(aRes.data);
      if (cRes.data) setComplaints(cRes.data);
      setLoading(false);
    }
    loadGIS();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <CitizenNav />

      <main className="citizen-main">
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h2>🗺️ Public GIS Infrastructure &amp; Grievance Map</h2>
          <p className="subtitle">
            Interactive map displaying surveyed government infrastructure and civic reports across Gujarat.
          </p>
        </div>

        <div className="card mb-3" style={{ padding: "12px 20px" }}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-2 items-center">
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showAssets}
                  onChange={(e) => setShowAssets(e.target.checked)}
                />
                🏛️ Show Public Assets ({assets.length})
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showComplaints}
                  onChange={(e) => setShowComplaints(e.target.checked)}
                />
                ⚠️ Show Citizen Grievances ({complaints.length})
              </label>
            </div>
            <div className="text-xs text-muted">
              📌 Click any icon on the map to view asset details, health condition, or grievance status.
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <MapComponent
            assets={showAssets ? assets : []}
            complaints={showComplaints ? complaints : []}
          />
        </div>
      </main>
    </div>
  );
}
