"use client";
import { useEffect, useState } from "react";
import CitizenNav from "@/components/CitizenNav";
import { supabase } from "@/lib/supabase";
import { DISTRICTS, ASSET_CATEGORIES } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function CitizenAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [parentCatFilter, setParentCatFilter] = useState("all");

  useEffect(() => {
    async function loadAssets() {
      setLoading(true);
      const { data } = await supabase
        .from("assets")
        .select(
          "*, category:asset_categories(name, parent_category, icon), location:locations(district, city, address)"
        )
        .eq("is_public", true)
        .order("name", { ascending: true });

      if (data) setAssets(data);
      setLoading(false);
    }
    loadAssets();
  }, []);

  const filtered = assets.filter((a) => {
    const matchDistrict = districtFilter === "all" || a.location?.district === districtFilter;
    const matchCat =
      parentCatFilter === "all" ||
      a.category?.parent_category?.toLowerCase() === parentCatFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name?.toLowerCase().includes(q) ||
      a.asset_id?.toLowerCase().includes(q) ||
      a.category?.name?.toLowerCase().includes(q) ||
      a.custodian?.toLowerCase().includes(q);
    return matchDistrict && matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <CitizenNav />

      <main className="citizen-main">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h2>🏗️ State Public Infrastructure &amp; Civic Asset Directory</h2>
          <p className="subtitle">
            Searchable digital inventory of government-owned physical assets across Gujarat.
          </p>
        </div>

        <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
          <input
            type="text"
            className="search-input"
            placeholder="Search by asset name, ID, category, custodian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />

          <div className="flex gap-1 flex-wrap">
            <select
              className="filter-select"
              value={parentCatFilter}
              onChange={(e) => setParentCatFilter(e.target.value)}
            >
              <option value="all">All Sectors</option>
              <option value="Roads">Roads &amp; Bridges</option>
              <option value="Buildings">Civil Buildings</option>
              <option value="Other">Public Utilities</option>
            </select>

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
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
              Loading public asset records...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
              No infrastructure assets found matching your criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Asset Name &amp; ID</th>
                    <th>Classification</th>
                    <th>District / Address</th>
                    <th>Dimensions / Capacity</th>
                    <th>Year Built</th>
                    <th>Condition</th>
                    <th>Custodian Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="font-semibold">{a.name}</div>
                        <span className="text-xs text-muted" style={{ fontFamily: "monospace" }}>
                          {a.asset_id}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm">
                          {a.category?.icon || "🏛️"} {a.category?.name || "General"}
                        </span>
                      </td>
                      <td className="text-sm">
                        <div>{a.location?.city || a.location?.district}</div>
                        <div className="text-xs text-muted">{a.location?.address}</div>
                      </td>
                      <td className="text-sm">
                        {a.length_km ? (
                          <span>{a.length_km} km ({a.width_m || 7}m width)</span>
                        ) : a.area_sqm ? (
                          <span>{a.area_sqm} sq.m ({a.floors || 1} Floors)</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-sm">{a.year_built || "—"}</td>
                      <td>
                        <span className={badgeClass(a.condition)}>{a.condition || "Good"}</span>
                      </td>
                      <td className="text-sm text-secondary">{a.custodian || "R&B Department"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
