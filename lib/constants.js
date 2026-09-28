// ============================================================
// GovAssets — Constants & Configuration
// ============================================================

// Asset categories grouped
export const ASSET_CATEGORIES = {
  Roads: ['National Highway', 'State Highway', 'District Road', 'Village Road', 'Bridge', 'Flyover', 'Culvert', 'Footpath'],
  Buildings: ['Government Office', 'Hospital', 'School', 'Police Station', 'Government Residence', 'Community Hall'],
  Other: ['Government Land', 'Public Facility', 'Drainage', 'Water Tank'],
};

export const ALL_CATEGORIES = Object.values(ASSET_CATEGORIES).flat();

// Project lifecycle stages
export const PROJECT_STATUSES = [
  'Proposed',
  'Under Review',
  'Approved',
  'Tendering',
  'Contract Awarded',
  'Under Construction',
  'Completed',
  'Operational',
  'Closed',
  'On Hold',
];

// Asset statuses
export const ASSET_STATUSES = [
  'Proposed',
  'Under Review',
  'Approved',
  'Under Construction',
  'Completed',
  'Operational',
  'Under Maintenance',
  'Condemned',
  'Demolished',
  'Retired',
];

// Conditions
export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

// Departments
export const DEPARTMENTS = [
  'Roads & Buildings',
  'Public Works',
  'Health & Family Welfare',
  'Education',
  'Revenue',
  'Urban Development',
  'Rural Development',
  'Police & Home',
  'Narmada Water Resources',
];

// Priorities
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// Contractor categories
export const CONTRACTOR_CATEGORIES = ['Class A', 'Class B', 'Class C', 'Class D'];

// Contractor statuses
export const CONTRACTOR_STATUSES = ['Active', 'Suspended', 'Blacklisted', 'Inactive'];

// Complaint types
export const COMPLAINT_TYPES = [
  'Pothole',
  'Road Damage',
  'Building Damage',
  'Water Logging',
  'Street Light',
  'Drainage',
  'Bridge Damage',
  'Footpath Damage',
  'Encroachment',
  'Other',
];

// Complaint statuses
export const COMPLAINT_STATUSES = [
  'Submitted',
  'Received',
  'Assigned',
  'Inspection',
  'Work Started',
  'Resolved',
  'Closed',
  'Rejected',
];

// Document categories
export const DOC_CATEGORIES = [
  'Planning',
  'Approval',
  'Tender',
  'Contract',
  'Construction',
  'Completion',
  'Maintenance',
  'Other',
];

// Financial record types
export const FIN_RECORD_TYPES = [
  'Allocation',
  'Expenditure',
  'Revised Estimate',
  'Payment',
  'Advance',
];

// Maintenance statuses
export const MAINT_STATUSES = [
  'Reported',
  'Assigned',
  'In Progress',
  'Completed',
  'Verified',
  'Closed',
];

// Approval types
export const APPROVAL_TYPES = [
  'Administrative Approval',
  'Technical Sanction',
  'Financial Approval',
  'Environmental Clearance',
  'Completion Certificate',
  'Handover Approval',
];

// Approval statuses
export const APPROVAL_STATUSES = ['Pending', 'Approved', 'Rejected', 'Revoked'];

// Inspection conditions
export const INSPECTION_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

// Gujarat districts
export const DISTRICTS = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar',
  'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar',
  'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana',
  'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot',
  'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad',
];

// Currency formatter
export const inr = (n) => {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + ' L';
  return '₹' + num.toLocaleString('en-IN');
};

// Date formatter
export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// DateTime formatter
export const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Status color mapping
export const statusColor = (status) => {
  const map = {
    'Proposed': '#7c8db5',
    'Under Review': '#b07cc1',
    'Approved': '#2e86de',
    'Tendering': '#8854d0',
    'Contract Awarded': '#3867d6',
    'Under Construction': '#e67e22',
    'Completed': '#20bf6b',
    'Operational': '#0fb9b1',
    'Closed': '#636e72',
    'On Hold': '#d35400',
    'Under Maintenance': '#f39c12',
    'Condemned': '#e74c3c',
    'Demolished': '#7f8c8d',
    'Retired': '#95a5a6',
    // Conditions
    'Excellent': '#00b894',
    'Good': '#00cec9',
    'Fair': '#fdcb6e',
    'Poor': '#e17055',
    'Critical': '#d63031',
    // Maintenance
    'Reported': '#a29bfe',
    'Assigned': '#74b9ff',
    'In Progress': '#ffeaa7',
    'Verified': '#55efc4',
    // Complaints
    'Submitted': '#a29bfe',
    'Received': '#74b9ff',
    'Inspection': '#fdcb6e',
    'Work Started': '#fab1a0',
    'Resolved': '#55efc4',
    'Rejected': '#ff7675',
  };
  return map[status] || '#b2bec3';
};

// Priority color
export const priorityColor = (p) => {
  const map = { Low: '#00b894', Medium: '#fdcb6e', High: '#e17055', Critical: '#d63031' };
  return map[p] || '#b2bec3';
};
