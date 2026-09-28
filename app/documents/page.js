"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { supabase } from "@/lib/supabase";
import { DOC_CATEGORIES, fmtDate } from "@/lib/constants";
import { badgeClass } from "@/lib/badge";

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    doc_category: "Planning",
    project_id: "",
    asset_id: "",
    file_name: "",
    file_url: "",
    file_size_kb: 512,
    uploaded_by: "Department Officer",
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [dRes, pRes, aRes] = await Promise.all([
      supabase
        .from("documents")
        .select("*, project:projects(id, project_id, name), asset:assets(id, asset_id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, project_id, name").order("name"),
      supabase.from("assets").select("id, asset_id, name").order("name"),
    ]);

    const defaultDocs = [
      {
        id: "doc-1",
        title: "Detailed Project Report (DPR) Vol 1 — Technical Feasibility",
        doc_category: "Planning",
        file_name: "DPR_Vol1_Technical_RingRoad.pdf",
        file_url: "https://example.gov.in/docs/DPR_RingRoad.pdf",
        file_size_kb: 14200,
        uploaded_by: "Consultant: RITES Ltd",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2024-11-10T10:00:00Z",
      },
      {
        id: "doc-2",
        title: "Environmental Impact Assessment (EIA) & Social Management Plan",
        doc_category: "Planning",
        file_name: "EIA_EMP_Study_2024.pdf",
        file_url: "https://example.gov.in/docs/EIA_Study.pdf",
        file_size_kb: 8500,
        uploaded_by: "State Pollution Board",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2024-09-15T11:30:00Z",
      },
      {
        id: "doc-3",
        title: "Geotechnical Soil Investigation & Deep Core Drilling Report",
        doc_category: "Planning",
        file_name: "Geotech_Borehole_Ellisbridge.pdf",
        file_url: "https://example.gov.in/docs/Geotech_Ellisbridge.pdf",
        file_size_kb: 6200,
        uploaded_by: "GERI Vadodara",
        asset: { asset_id: "RNB-BRG-00003", name: "Sabarmati River Bridge (Ellisbridge)" },
        created_at: "2024-08-20T14:15:00Z",
      },
      {
        id: "doc-4",
        title: "Government Resolution (GR) — Administrative Approval (AA) Sanction",
        doc_category: "Approval",
        file_name: "GR_AA_RNB_2025_042.pdf",
        file_url: "https://example.gov.in/docs/GR_AA_042.pdf",
        file_size_kb: 1250,
        uploaded_by: "Secretary, RNB",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-01-08T09:00:00Z",
      },
      {
        id: "doc-5",
        title: "Chief Engineer Technical Sanction (TS) Memo & Schedule of Rates Approval",
        doc_category: "Approval",
        file_name: "TS_Order_CE_RNB_018.pdf",
        file_url: "https://example.gov.in/docs/TS_Order_018.pdf",
        file_size_kb: 2400,
        uploaded_by: "Chief Engineer, RNB",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-01-25T15:00:00Z",
      },
      {
        id: "doc-6",
        title: "Notice Inviting Tender (NIT) & Bid Qualification Document",
        doc_category: "Tender",
        file_name: "NIT_RNB_GJ_2025_001.pdf",
        file_url: "https://example.gov.in/docs/NIT_001.pdf",
        file_size_kb: 3500,
        uploaded_by: "SE, Ahmedabad Circle",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-02-05T12:00:00Z",
      },
      {
        id: "doc-7",
        title: "Volume II — Bill of Quantities (BOQ) & Technical Specifications",
        doc_category: "Tender",
        file_name: "BOQ_ItemRates_Specifications.pdf",
        file_url: "https://example.gov.in/docs/BOQ_Specs.pdf",
        file_size_kb: 5800,
        uploaded_by: "Executive Engineer, RNB",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-02-06T14:30:00Z",
      },
      {
        id: "doc-8",
        title: "Comparative Statement of Quotations (CSQ) & Bid Evaluation Report",
        doc_category: "Tender",
        file_name: "CSQ_Evaluation_Committee_Report.pdf",
        file_url: "https://example.gov.in/docs/CSQ_Report.pdf",
        file_size_kb: 1950,
        uploaded_by: "Tender Committee",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-02-22T16:00:00Z",
      },
      {
        id: "doc-9",
        title: "Signed Contract Agreement & Letter of Acceptance (LOA)",
        doc_category: "Contract",
        file_name: "Contract_Agreement_ABC_Infra.pdf",
        file_url: "https://example.gov.in/docs/Contract_ABC.pdf",
        file_size_kb: 4200,
        uploaded_by: "Legal Cell, RNB",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-02-28T11:00:00Z",
      },
      {
        id: "doc-10",
        title: "Official Work Order & Notice to Proceed (NTP)",
        doc_category: "Contract",
        file_name: "Work_Order_WO_RNB_2025_089.pdf",
        file_url: "https://example.gov.in/docs/WO_089.pdf",
        file_size_kb: 1100,
        uploaded_by: "EE, Ahmedabad",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-03-01T10:00:00Z",
      },
      {
        id: "doc-11",
        title: "Performance Bank Guarantee (PBG) Verification Letter",
        doc_category: "Contract",
        file_name: "PBG_SBI_Verification_84Cr.pdf",
        file_url: "https://example.gov.in/docs/PBG_Verification.pdf",
        file_size_kb: 3100,
        uploaded_by: "Finance Division",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-03-05T12:00:00Z",
      },
      {
        id: "doc-12",
        title: "Quality Control & Lab Test Report (Concrete Cube & Bitumen)",
        doc_category: "Construction",
        file_name: "QC_Lab_Report_Batch_1to12.pdf",
        file_url: "https://example.gov.in/docs/QC_Report.pdf",
        file_size_kb: 7400,
        uploaded_by: "Quality Control Division",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-08-15T15:00:00Z",
      },
      {
        id: "doc-13",
        title: "Milestone 50% Structural Inspection & Field Audit Certificate",
        doc_category: "Construction",
        file_name: "Milestone_50pct_Inspection.pdf",
        file_url: "https://example.gov.in/docs/Milestone_50pct.pdf",
        file_size_kb: 9100,
        uploaded_by: "Superintending Engineer",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2026-03-15T16:00:00Z",
      },
      {
        id: "doc-14",
        title: "Project Completion Certificate & Handover Note",
        doc_category: "Completion",
        file_name: "Completion_Certificate_Vadodara_School.pdf",
        file_url: "https://example.gov.in/docs/Completion_School.pdf",
        file_size_kb: 1850,
        uploaded_by: "EE, Vadodara",
        project: { project_id: "PRJ-003", name: "Government School Reconstruction Vadodara" },
        created_at: "2025-11-28T17:00:00Z",
      },
      {
        id: "doc-15",
        title: "Comprehensive As-Built Drawings & Fire Safety Clearance",
        doc_category: "Completion",
        file_name: "As_Built_Drawings_FireNOC.pdf",
        file_url: "https://example.gov.in/docs/AsBuilt_FireNOC.pdf",
        file_size_kb: 24500,
        uploaded_by: "Vadodara Municipal Fire",
        project: { project_id: "PRJ-003", name: "Government School Reconstruction Vadodara" },
        created_at: "2025-12-05T14:00:00Z",
      },
      {
        id: "doc-16",
        title: "Defect Liability Period (DLP) Final Inspection Audit",
        doc_category: "Maintenance",
        file_name: "DLP_Final_Inspection_Report.pdf",
        file_url: "https://example.gov.in/docs/DLP_Report.pdf",
        file_size_kb: 3400,
        uploaded_by: "Quality Control Wing",
        project: { project_id: "PRJ-003", name: "Government School Reconstruction Vadodara" },
        created_at: "2026-05-10T11:00:00Z",
      },
      {
        id: "doc-17",
        title: "Annual Maintenance Contract (AMC) & Routine Pothole Repair Schedule",
        doc_category: "Maintenance",
        file_name: "AMC_Routine_Maintenance_2026.pdf",
        file_url: "https://example.gov.in/docs/AMC_Roads.pdf",
        file_size_kb: 2800,
        uploaded_by: "Executive Engineer, RNB",
        asset: { asset_id: "RNB-NH-00001", name: "Ahmedabad-Gandhinagar Expressway Section" },
        created_at: "2026-02-01T10:00:00Z",
      },
      {
        id: "doc-18",
        title: "Utility Line Shifting NOC from GETCO & Torrent Power",
        doc_category: "Other",
        file_name: "GETCO_Utility_Shifting_NOC.pdf",
        file_url: "https://example.gov.in/docs/GETCO_NOC.pdf",
        file_size_kb: 1450,
        uploaded_by: "GETCO Gujarat",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-01-18T13:00:00Z",
      },
      {
        id: "doc-19",
        title: "Forest Department Tree Felling Permission & Afforestation Plan",
        doc_category: "Other",
        file_name: "Forest_Clearance_Afforestation.pdf",
        file_url: "https://example.gov.in/docs/Forest_Clearance.pdf",
        file_size_kb: 2200,
        uploaded_by: "Deputy Conservator of Forests",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2025-01-20T11:00:00Z",
      },
      {
        id: "doc-20",
        title: "Right-of-Way (RoW) Demarcation Map & Land Revenue Gazette",
        doc_category: "Other",
        file_name: "RoW_Gazette_Notification.pdf",
        file_url: "https://example.gov.in/docs/RoW_Gazette.pdf",
        file_size_kb: 4600,
        uploaded_by: "District Collector, Revenue",
        project: { project_id: "PRJ-001", name: "Ahmedabad Ring Road Widening Phase-II" },
        created_at: "2024-12-05T10:00:00Z",
      },
    ];

    if (dRes.data && dRes.data.length > 0) {
      setDocs(dRes.data);
    } else {
      setDocs(defaultDocs);
    }
    if (pRes.data) setProjects(pRes.data);
    if (aRes.data) setAssets(aRes.data);
    setLoading(false);
  }

  async function handleAddDoc(e) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      title: form.title,
      doc_category: form.doc_category,
      project_id: form.project_id || null,
      asset_id: form.asset_id || null,
      file_name: form.file_name || `${form.title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      file_url: form.file_url || "https://example.gov.in/docs/sample.pdf",
      file_size_kb: Number(form.file_size_kb) || 512,
      uploaded_by: form.uploaded_by || "Department Officer",
      remarks: form.remarks || null,
    };

    const { error } = await supabase.from("documents").insert([payload]);
    setSubmitting(false);

    if (error) {
      alert("Error adding document: " + error.message);
    } else {
      setShowModal(false);
      setForm({
        title: "",
        doc_category: "Planning",
        project_id: "",
        asset_id: "",
        file_name: "",
        file_url: "",
        file_size_kb: 512,
        uploaded_by: "Department Officer",
        remarks: "",
      });
      loadData();
    }
  }

  const filtered = docs.filter((d) => {
    const matchCat = categoryFilter === "all" || d.doc_category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.title?.toLowerCase().includes(q) ||
      d.file_name?.toLowerCase().includes(q) ||
      d.project?.name?.toLowerCase().includes(q) ||
      d.asset?.name?.toLowerCase().includes(q) ||
      d.uploaded_by?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const totalSizeMb = (
    docs.reduce((acc, d) => acc + (d.file_size_kb || 0), 0) / 1024
  ).toFixed(1);

  return (
    <Shell>
      <div className="page-header flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2>📄 Document Management</h2>
          <p className="subtitle">
            Repository for DPRs, administrative sanctions, tender contracts, completion certificates, and inspection records.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Upload Document
        </button>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card">
          <div className="label">Total Documents</div>
          <div className="value">{docs.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Storage Utilized</div>
          <div className="value">{totalSizeMb} MB</div>
        </div>
        <div className="stat-card">
          <div className="label">Document Categories</div>
          <div className="value">{DOC_CATEGORIES.length} Types</div>
        </div>
        <div className="stat-card">
          <div className="label">Compliance Status</div>
          <div className="value text-success" style={{ color: "var(--green)" }}>Verified</div>
        </div>
      </div>

      <div className="toolbar flex flex-wrap gap-2 items-center justify-between mb-3">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, file name, project, asset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 320 }}
        />

        <div className="flex gap-1 flex-wrap">
          <button
            className={`btn btn-sm ${categoryFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setCategoryFilter("all")}
          >
            All
          </button>
          {DOC_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${categoryFilter === cat ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            Loading document repository...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            No documents found matching the selected filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title &amp; File</th>
                  <th>Category</th>
                  <th>Associated Entity</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="font-semibold">{d.title}</div>
                      <div className="text-xs text-muted" style={{ fontFamily: "monospace" }}>
                        📎 {d.file_name || "document.pdf"}
                      </div>
                    </td>
                    <td>
                      <span className={badgeClass(d.doc_category)}>{d.doc_category}</span>
                    </td>
                    <td>
                      {d.project ? (
                        <div className="text-sm">
                          <span className="text-muted">Proj:</span> <strong>{d.project.project_id}</strong> - {d.project.name}
                        </div>
                      ) : d.asset ? (
                        <div className="text-sm">
                          <span className="text-muted">Asset:</span> <strong>{d.asset.asset_id}</strong> - {d.asset.name}
                        </div>
                      ) : (
                        <span className="text-muted text-sm">General Gov Record</span>
                      )}
                    </td>
                    <td className="text-sm">
                      {d.file_size_kb ? `${(d.file_size_kb / 1024).toFixed(2)} MB` : "—"}
                    </td>
                    <td className="text-sm">{d.uploaded_by || "Officer"}</td>
                    <td className="text-sm">{fmtDate(d.created_at)}</td>
                    <td>
                      <a
                        href={d.file_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                          if (!d.file_url) {
                            e.preventDefault();
                            alert("This is a demo document record.");
                          }
                        }}
                      >
                        📥 Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="flex justify-between items-center mb-2">
              <h3>Upload &amp; Register Document</h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddDoc}>
              <div className="form-group mb-2">
                <label>Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Detailed Project Report (DPR) Rev 2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.doc_category}
                    onChange={(e) => setForm({ ...form, doc_category: e.target.value })}
                  >
                    {DOC_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Size (KB)</label>
                  <input
                    type="number"
                    value={form.file_size_kb}
                    onChange={(e) => setForm({ ...form, file_size_kb: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2 gap-2 mb-2">
                <div className="form-group">
                  <label>Link to Project (Optional)</label>
                  <select
                    value={form.project_id}
                    onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  >
                    <option value="">None / Not linked</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.project_id} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Link to Asset (Optional)</label>
                  <select
                    value={form.asset_id}
                    onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                  >
                    <option value="">None / Not linked</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group mb-2">
                <label>File URL / Cloud Storage Path</label>
                <input
                  type="text"
                  placeholder="https://assets.gujarat.gov.in/docs/sample.pdf"
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                />
              </div>

              <div className="form-group mb-2">
                <label>Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Authorized signatories, revision notes..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Uploading..." : "Save Document Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
