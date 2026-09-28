"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ICONS = {
  asset: (emoji) =>
    L.divIcon({
      html: `<div style="font-size:22px;text-align:center;line-height:32px;">${emoji || "📍"}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: "",
    }),
  complaint: L.divIcon({
    html: `<div style="font-size:20px;text-align:center;line-height:32px;">🔴</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    className: "",
  }),
};

export default function MapView({ assets = [], complaints = [], filter = "all" }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      // In case React strict mode remounted
      if (mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }

      const map = L.map(mapRef.current).setView([22.3, 72.0], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      layerGroup.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        layerGroup.current = null;
      }
    };
  }, []);

  // 2. Update markers when data or filter changes without destroying the map
  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;

    layerGroup.current.clearLayers();

    // Add Assets
    if (filter !== "complaints") {
      assets.forEach((a) => {
        const loc = a.locations || a.location;
        const lat = Number(loc?.latitude);
        const lng = Number(loc?.longitude);
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        const catObj = a.asset_categories || a.category;
        const catName = catObj?.name || "";
        const catIcon = catObj?.icon || "📍";

        if (
          filter === "roads" &&
          ![
            "National Highway",
            "State Highway",
            "District Road",
            "Village Road",
            "Bridge",
            "Flyover",
            "Culvert",
            "Footpath",
          ].includes(catName)
        )
          return;

        if (
          filter === "buildings" &&
          ![
            "Government Office",
            "Hospital",
            "School",
            "Police Station",
            "Government Residence",
            "Community Hall",
          ].includes(catName)
        )
          return;

        const marker = L.marker([lat, lng], { icon: ICONS.asset(catIcon) });
        marker.bindPopup(`
          <div style="min-width:200px;font-family:Inter,sans-serif;padding:4px;">
            <b style="font-size:14px;color:#0B1120;">${a.name}</b><br/>
            <span style="font-size:12px;color:#6b7280;">${a.asset_id || ""} · ${catName}</span><br/>
            <div style="margin: 6px 0; font-size:12px;">
              <span>Status: <b>${a.status || "Operational"}</b></span><br/>
              <span>Condition: <b>${a.condition || "Good"}</b></span>
            </div>
            <span style="font-size:12px;color:#6b7280;">📍 ${loc.district || "Gujarat"}${loc.city ? `, ${loc.city}` : ""}</span><br/>
            <a href="/assets/${a.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:#E8772E;font-weight:600;">View Full Asset Lifecycle →</a>
          </div>
        `);
        layerGroup.current.addLayer(marker);
      });
    }

    // Add Complaints
    if (filter !== "assets" && filter !== "roads" && filter !== "buildings") {
      complaints.forEach((c) => {
        const lat = Number(c.latitude);
        const lng = Number(c.longitude);
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng], { icon: ICONS.complaint });
        marker.bindPopup(`
          <div style="min-width:190px;font-family:Inter,sans-serif;padding:4px;">
            <b style="font-size:14px;color:#EF4444;">🔴 ${c.issue_type}</b><br/>
            <span style="font-size:12px;font-weight:600;font-family:monospace;">${c.complaint_id || ""}</span><br/>
            <p style="font-size:12px;color:#4b5563;margin:4px 0;">${(c.description || "").substring(0, 90)}...</p>
            <span style="font-size:12px;">Status: <b>${c.status || "Submitted"}</b></span><br/>
            <span style="font-size:12px;color:#6b7280;">📍 ${c.location_text || "Gujarat"}</span>
          </div>
        `);
        layerGroup.current.addLayer(marker);
      });
    }
  }, [assets, complaints, filter]);

  return <div ref={mapRef} className="map-container" style={{ height: 550, width: "100%" }} />;
}
