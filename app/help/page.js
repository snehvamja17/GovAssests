"use client";
import Shell from "@/components/Shell";

export default function HelpPage() {
  return (
    <Shell>
      <div className="page-header">
        <h2>❓ Help, Standard Operating Procedures &amp; User Manual</h2>
        <p className="subtitle">
          Operational guide, workflow definitions, user roles, and support matrix for GovAssets.
        </p>
      </div>

      <div className="grid-2 mb-3">
        <div className="card">
          <h3>🏛️ System Overview</h3>
          <p className="text-secondary mt-1 text-sm">
            GovAssets is an enterprise-grade digital inventory and lifecycle management platform
            engineered for Government Public Works &amp; Roads &amp; Buildings departments. It maintains
            an unbroken chain of custody from initial planning, DPR, sanction, tendering,
            construction, operation, periodic inspection, to decommissioning.
          </p>
          <div className="mt-2 text-sm">
            <strong>Key Lifecycle Milestones:</strong>
            <ul style={{ paddingLeft: 20, marginTop: 8, color: "var(--text-secondary)" }}>
              <li><strong>1. Planning &amp; AA:</strong> Creation of project concept, site survey, Administrative Approval (AA).</li>
              <li><strong>2. Technical Sanction (TS):</strong> Engineering design, BOQ verification, and TS order.</li>
              <li><strong>3. Tendering &amp; Award:</strong> Contractor bidding, bid evaluation, and Work Order contract.</li>
              <li><strong>4. Construction &amp; Inspection:</strong> Physical progress tracking, milestone verification, geotagged photos.</li>
              <li><strong>5. Handover to Asset Registry:</strong> Project completion converted into active operational asset.</li>
              <li><strong>6. Maintenance &amp; Public Grievance:</strong> Defect liability tracking, routine repair, and citizen complaint resolution.</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h3>👥 Role-Based Access Control (RBAC)</h3>
          <div className="table-responsive mt-1">
            <table className="text-sm">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Permitted Capabilities</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Super Admin</td>
                  <td>User management, department setup, system settings, full audit log access.</td>
                </tr>
                <tr>
                  <td className="font-semibold">Department Officer</td>
                  <td>Create assets, initiate projects, approve milestones, allocate finances, manage contractors.</td>
                </tr>
                <tr>
                  <td className="font-semibold">Field Engineer</td>
                  <td>Record site inspections, condition ratings, update progress %, verify complaints.</td>
                </tr>
                <tr>
                  <td className="font-semibold">Finance Officer</td>
                  <td>Record sanctions, expenditures, vouchers, bill payments, and audit compliance.</td>
                </tr>
                <tr>
                  <td className="font-semibold">Contractor</td>
                  <td>Submit progress reports, upload milestone proof, review assigned work orders.</td>
                </tr>
                <tr>
                  <td className="font-semibold">Citizen</td>
                  <td>View public projects &amp; assets, submit road/bridge defect grievances, track status.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h3>📋 Standard Operating Procedures (SOP)</h3>
        <div className="grid-3 gap-2 mt-2">
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8 }}>
            <h4 style={{ color: "var(--navy-900)", marginBottom: 8 }}>1. Registering an Asset</h4>
            <p className="text-xs text-secondary">
              Navigate to <strong>All Assets → + New Asset</strong>. Fill in asset category, district, custodian, year built, and dimensions (road length/building area). The asset is assigned a unique government inventory code (e.g. <code>AST-GJ-001</code>).
            </p>
          </div>

          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8 }}>
            <h4 style={{ color: "var(--navy-900)", marginBottom: 8 }}>2. Creating a Project &amp; Tendering</h4>
            <p className="text-xs text-secondary">
              Go to <strong>Projects → + New Project</strong>. Associate the project with an existing or proposed asset, assign contractor, enter estimated vs sanctioned budget, and record milestone timeline.
            </p>
          </div>

          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8 }}>
            <h4 style={{ color: "var(--navy-900)", marginBottom: 8 }}>3. Grievance Redressal SLA</h4>
            <p className="text-xs text-secondary">
              Complaints received from citizens must be triaged within <strong>48 hours</strong>. Critical defects (collapsed culvert, hazardous potholes) require field inspection dispatch within <strong>24 hours</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>💡 Frequently Asked Questions (FAQ)</h3>
          <div className="mt-2 text-sm">
            <details style={{ marginBottom: 12, cursor: "pointer" }}>
              <summary className="font-semibold">How do I generate an asset QR / unique ID?</summary>
              <p className="text-secondary text-xs mt-1">
                Asset IDs are auto-generated according to Gujarat R&amp;B standardization rules (State - Department - Serial). You can view the asset detail page for printable barcodes/identifiers.
              </p>
            </details>
            <details style={{ marginBottom: 12, cursor: "pointer" }}>
              <summary className="font-semibold">What happens when a project completes?</summary>
              <p className="text-secondary text-xs mt-1">
                Marking a project status as &quot;Completed&quot; triggers a prompt to update the linked asset&apos;s condition to &quot;Excellent&quot; and state to &quot;Operational&quot;, generating an audit entry.
              </p>
            </details>
            <details style={{ marginBottom: 12, cursor: "pointer" }}>
              <summary className="font-semibold">Can citizens see financial expenditure?</summary>
              <p className="text-secondary text-xs mt-1">
                In compliance with public transparency mandates, sanctioned amounts and progress percentages for public projects are visible on the citizen portal. Internal voucher numbers remain restricted.
              </p>
            </details>
          </div>
        </div>

        <div className="card">
          <h3>📞 Department Helpdesk &amp; Technical Support</h3>
          <p className="text-secondary text-sm mt-1">
            For system issues, data import assistance, or GIS coordinate verification:
          </p>
          <div className="mt-2 text-sm" style={{ lineHeight: 1.8 }}>
            <div>🏢 <strong>Nodal Department:</strong> Roads &amp; Buildings Dept, Government of Gujarat</div>
            <div>📍 <strong>Address:</strong> Block No. 14, 2nd Floor, New Sachivalaya, Gandhinagar - 382010</div>
            <div>📞 <strong>Toll-Free Helpline:</strong> 1800-233-1234 (09:30 AM to 06:00 PM)</div>
            <div>✉️ <strong>Technical Support:</strong> helpdesk-govassets@gujarat.gov.in</div>
            <div>🌐 <strong>Portal Version:</strong> GovAssets v1.0.4 Enterprise Build</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
