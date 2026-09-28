"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Shell from "@/components/Shell";
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
        background: "var(--bg-card)",
        borderRadius: 12,
        color: "var(--text-secondary)",
      }}
    >
      🗺️ Initializing GIS Map...
    </div>
  ),
});

export default function MapPage() {
  const [assets, setAssets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase
        .from("assets")
        .select(
          "*, category:asset_categories(name, icon), location:locations(district, city, latitude, longitude), locations(district, city, latitude, longitude), asset_categories(name, icon)"
        ),
      supabase.from("complaints").select("*"),
    ]).then(([a, c]) => {
      const validAssets = (a.data || []).filter(
        (x) => x.location?.latitude || x.locations?.latitude
      );
      const validComplaints = (c.data || []).filter((x) => x.latitude);

      setAssets(validAssets);
      setComplaints(validComplaints);
      setLoading(false);
    });
  }, []);

  return (
    <Shell>
      <div className="page-header flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2>🗺️ Geographic Information System (GIS) Asset Map</h2>
          <p className="subtitle">
            Spatial distribution of public works assets, bridges, highways, and field complaint reports across Gujarat.
          </p>
        </div>
      </div>

      <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
          style={{ minWidth: 220 }}
        >
          <option value="all">All Assets &amp; Complaints</option>
          <option value="assets">Assets Only</option>
          <option value="complaints">Complaints Only</option>
          <option value="roads">Roads &amp; Bridges Only</option>
          <option value="buildings">Civil Buildings Only</option>
        </select>

        <span className="text-sm text-secondary">
          {assets.length} assets · {complaints.length} complaints geocoded
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <MapComponent assets={assets} complaints={complaints} filter={filter} />
      </div>
    </Shell>
  );
}
