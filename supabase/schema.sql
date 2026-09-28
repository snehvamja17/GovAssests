-- ============================================================
-- GovAssets — Government Infrastructure Asset Inventory
-- Complete Schema — Run in Supabase SQL Editor
-- ============================================================

-- Clean slate
drop table if exists audit_logs cascade;
drop table if exists notifications cascade;
drop table if exists complaint_updates cascade;
drop table if exists complaints cascade;
drop table if exists inspection_records cascade;
drop table if exists maintenance_records cascade;
drop table if exists documents cascade;
drop table if exists financial_records cascade;
drop table if exists approvals cascade;
drop table if exists project_events cascade;
drop table if exists project_bids cascade;
drop table if exists contracts cascade;
drop table if exists contractors cascade;
drop table if exists projects cascade;
drop table if exists assets cascade;
drop table if exists asset_categories cascade;
drop table if exists locations cascade;
drop table if exists departments cascade;
drop table if exists user_profiles cascade;
drop function if exists log_audit cascade;
drop function if exists update_updated_at cascade;

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
create table departments (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  code text unique not null,
  description text,
  created_at timestamptz default now()
);

insert into departments(name, code, description) values
('Roads & Buildings', 'RNB', 'Roads and Buildings Department'),
('Public Works', 'PWD', 'Public Works Department'),
('Health & Family Welfare', 'HFW', 'Health and Family Welfare Department'),
('Education', 'EDU', 'Education Department'),
('Revenue', 'REV', 'Revenue Department'),
('Urban Development', 'UDD', 'Urban Development Department'),
('Rural Development', 'RDD', 'Rural Development Department'),
('Police & Home', 'POL', 'Police and Home Department'),
('Narmada Water Resources', 'NWR', 'Narmada Water Resources Department');

-- ============================================================
-- 2. LOCATIONS
-- ============================================================
create table locations (
  id uuid primary key default gen_random_uuid(),
  state text not null default 'Gujarat',
  district text not null,
  taluka text,
  city text,
  address text,
  pincode text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

insert into locations(district, taluka, city, address, pincode, latitude, longitude) values
('Ahmedabad', 'Ahmedabad City', 'Ahmedabad', 'SG Highway, Bodakdev', '380054', 23.0225, 72.5714),
('Gandhinagar', 'Gandhinagar', 'Gandhinagar', 'Sector 10, CH Road', '382010', 23.2156, 72.6369),
('Surat', 'Surat City', 'Surat', 'Ring Road, Vesu', '395007', 21.1702, 72.8311),
('Vadodara', 'Vadodara City', 'Vadodara', 'Racecourse Road', '390007', 22.3072, 73.1812),
('Rajkot', 'Rajkot City', 'Rajkot', 'Kalavad Road', '360005', 22.3039, 70.8022),
('Bhavnagar', 'Bhavnagar', 'Bhavnagar', 'Waghawadi Road', '364001', 21.7645, 72.1519),
('Junagadh', 'Junagadh', 'Junagadh', 'MG Road, Junagadh', '362001', 21.5222, 70.4579),
('Mehsana', 'Mehsana', 'Mehsana', 'Highway Road', '384002', 23.5880, 72.3693),
('Anand', 'Anand', 'Anand', 'Station Road', '388001', 22.5645, 72.9289),
('Kutch', 'Bhuj', 'Bhuj', 'Jubilee Ground Area', '370001', 23.2420, 69.6669),
('Patan', 'Patan', 'Patan', 'NH-14, Patan', '384265', 23.8493, 72.1266),
('Navsari', 'Navsari', 'Navsari', 'Tower Road', '396445', 20.9467, 72.9520);

-- ============================================================
-- 3. ASSET CATEGORIES
-- ============================================================
create table asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  code text unique not null,
  parent_category text,
  icon text,
  created_at timestamptz default now()
);

insert into asset_categories(name, code, parent_category, icon) values
('National Highway', 'NH', 'Roads', '🛣️'),
('State Highway', 'SH', 'Roads', '🛣️'),
('District Road', 'DR', 'Roads', '🛤️'),
('Village Road', 'VR', 'Roads', '🛤️'),
('Bridge', 'BRG', 'Roads', '🌉'),
('Flyover', 'FLY', 'Roads', '🌉'),
('Culvert', 'CLV', 'Roads', '🔲'),
('Footpath', 'FTP', 'Roads', '🚶'),
('Government Office', 'GOF', 'Buildings', '🏛️'),
('Hospital', 'HSP', 'Buildings', '🏥'),
('School', 'SCH', 'Buildings', '🏫'),
('Police Station', 'PST', 'Buildings', '🚔'),
('Government Residence', 'GRS', 'Buildings', '🏠'),
('Community Hall', 'CMH', 'Buildings', '🏘️'),
('Government Land', 'GLD', 'Other', '🗺️'),
('Public Facility', 'PBF', 'Other', '🏗️'),
('Drainage', 'DRN', 'Other', '💧'),
('Water Tank', 'WTK', 'Other', '🚰');

-- ============================================================
-- 4. USER PROFILES (extends Supabase auth.users)
-- ============================================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'citizen'
    check (role in ('admin','department_officer','engineer','finance_officer','contractor','citizen')),
  department_id uuid references departments(id),
  designation text,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 5. CONTRACTORS
-- ============================================================
create table contractors (
  id uuid primary key default gen_random_uuid(),
  contractor_id text unique not null,
  company_name text not null,
  contact_person text not null,
  email text,
  phone text,
  address text,
  registration_number text,
  registration_date date,
  pan_number text,
  gst_number text,
  category text default 'Class A'
    check (category in ('Class A','Class B','Class C','Class D')),
  status text default 'Active'
    check (status in ('Active','Suspended','Blacklisted','Inactive')),
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into contractors(contractor_id, company_name, contact_person, email, phone, address, registration_number, category, status) values
('CON-001', 'ABC Infrastructure Pvt. Ltd.', 'Rajesh Sharma', 'rajesh@abcinfra.demo', '+91-79-26543210', 'Navrangpura, Ahmedabad', 'REG-GJ-2018-001', 'Class A', 'Active'),
('CON-002', 'Gujarat Civil Works Ltd.', 'Amit Patel', 'amit@gcworks.demo', '+91-79-26543211', 'CG Road, Ahmedabad', 'REG-GJ-2019-002', 'Class A', 'Active'),
('CON-003', 'UrbanBuild Contractors', 'Priya Desai', 'priya@urbanbuild.demo', '+91-261-2543210', 'Adajan, Surat', 'REG-GJ-2020-003', 'Class B', 'Active'),
('CON-004', 'Saurashtra Road Builders', 'Kiran Joshi', 'kiran@srbuilders.demo', '+91-281-2543210', 'University Road, Rajkot', 'REG-GJ-2017-004', 'Class A', 'Active'),
('CON-005', 'Narmada Construction Co.', 'Suresh Mehta', 'suresh@narmadacon.demo', '+91-265-2543210', 'Alkapuri, Vadodara', 'REG-GJ-2016-005', 'Class B', 'Active'),
('CON-006', 'Bharat Infratech Solutions', 'Deepak Chauhan', 'deepak@bharatinfra.demo', '+91-79-26543212', 'Satellite, Ahmedabad', 'REG-GJ-2021-006', 'Class A', 'Active'),
('CON-007', 'Patel & Associates Builders', 'Nilesh Patel', 'nilesh@patelbuilders.demo', '+91-2692-254321', 'VV Nagar, Anand', 'REG-GJ-2019-007', 'Class C', 'Active'),
('CON-008', 'Western India Engineers', 'Manoj Trivedi', 'manoj@wiengg.demo', '+91-79-26543213', 'Paldi, Ahmedabad', 'REG-GJ-2015-008', 'Class A', 'Active'),
('CON-009', 'Shree Ganesh Construction', 'Ramesh Solanki', 'ramesh@sgconstruction.demo', '+91-2832-254321', 'Bhuj, Kutch', 'REG-GJ-2020-009', 'Class B', 'Active'),
('CON-010', 'New Era Buildcon Pvt. Ltd.', 'Vinay Raval', 'vinay@newerabuild.demo', '+91-261-2543211', 'Athwalines, Surat', 'REG-GJ-2022-010', 'Class B', 'Active');

-- ============================================================
-- 6. ASSETS
-- ============================================================
create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_id text unique not null,
  name text not null,
  category_id uuid references asset_categories(id),
  location_id uuid references locations(id),
  department_id uuid references departments(id),
  description text,
  status text not null default 'Operational'
    check (status in ('Proposed','Under Review','Approved','Under Construction','Completed','Operational','Under Maintenance','Condemned','Demolished','Retired')),
  condition text default 'Good'
    check (condition in ('Excellent','Good','Fair','Poor','Critical')),
  length_km numeric,
  width_m numeric,
  area_sqm numeric,
  floors int,
  year_built int,
  completion_date date,
  current_value numeric,
  custodian text,
  remarks text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 7. PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  project_id text unique not null,
  name text not null,
  description text,
  category_id uuid references asset_categories(id),
  location_id uuid references locations(id),
  department_id uuid references departments(id),
  asset_id uuid references assets(id),
  contractor_id uuid references contractors(id),
  estimated_cost numeric,
  sanctioned_amount numeric,
  allocated_amount numeric,
  revised_estimate numeric,
  actual_expenditure numeric default 0,
  start_date date,
  expected_completion_date date,
  actual_completion_date date,
  status text not null default 'Proposed'
    check (status in ('Proposed','Under Review','Approved','Tendering','Contract Awarded','Under Construction','Completed','Operational','Closed','On Hold')),
  progress_percent int default 0 check (progress_percent between 0 and 100),
  priority text default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  approving_authority text,
  is_public boolean default true,
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 8. PROJECT EVENTS (Timeline)
-- ============================================================
create table project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  event_type text not null,
  event_date date not null,
  title text not null,
  description text,
  performed_by text,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. CONTRACTS
-- ============================================================
create table contracts (
  id uuid primary key default gen_random_uuid(),
  contract_id text unique not null,
  project_id uuid references projects(id),
  contractor_id uuid references contractors(id),
  contract_value numeric,
  start_date date,
  end_date date,
  agreement_number text,
  work_order_number text,
  status text default 'Active' check (status in ('Active','Completed','Terminated','Suspended')),
  remarks text,
  created_at timestamptz default now()
);

-- ============================================================
-- 9B. PROJECT BIDS / TENDER APPLICATIONS (e-Procurement)
-- ============================================================
create table project_bids (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  contractor_id uuid references contractors(id) on delete cascade,
  bid_amount numeric not null,
  bidder_rank text, -- 'L1', 'L2', 'L3', 'Disqualified'
  technical_score int check (technical_score between 0 and 100),
  emd_amount numeric,
  submission_date date default current_date,
  status text not null default 'Submitted' check (status in ('Awarded', 'Qualified', 'Outbid', 'Disqualified', 'Under Review')),
  remarks text,
  created_at timestamptz default now()
);

-- ============================================================
-- 10. APPROVALS
-- ============================================================
create table approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  asset_id uuid references assets(id),
  approval_type text not null,
  authority text not null,
  designation text,
  approval_date date not null,
  status text default 'Approved' check (status in ('Pending','Approved','Rejected','Revoked')),
  reference_number text,
  remarks text,
  created_at timestamptz default now()
);

-- ============================================================
-- 11. FINANCIAL RECORDS
-- ============================================================
create table financial_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  record_type text not null check (record_type in ('Allocation','Expenditure','Revised Estimate','Payment','Advance')),
  amount numeric not null,
  financial_year text,
  description text,
  voucher_number text,
  payment_date date,
  paid_to text,
  recorded_by text,
  created_at timestamptz default now()
);

-- ============================================================
-- 12. DOCUMENTS
-- ============================================================
create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  asset_id uuid references assets(id),
  doc_category text not null check (doc_category in ('Planning','Approval','Tender','Contract','Construction','Completion','Maintenance','Other')),
  title text not null,
  file_name text,
  file_url text,
  file_size_kb int,
  uploaded_by text,
  remarks text,
  created_at timestamptz default now()
);

-- ============================================================
-- 13. MAINTENANCE RECORDS
-- ============================================================
create table maintenance_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  project_id uuid references projects(id),
  issue text not null,
  description text,
  priority text default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  reported_date date default current_date,
  assigned_to text,
  contractor_id uuid references contractors(id),
  estimated_cost numeric,
  actual_cost numeric,
  status text default 'Reported' check (status in ('Reported','Assigned','In Progress','Completed','Verified','Closed')),
  expected_completion date,
  completed_at timestamptz,
  remarks text,
  created_at timestamptz default now()
);

-- ============================================================
-- 14. INSPECTION RECORDS
-- ============================================================
create table inspection_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  project_id uuid references projects(id),
  inspection_date date not null default current_date,
  inspector_name text not null,
  inspector_designation text,
  condition_rating text check (condition_rating in ('Excellent','Good','Fair','Poor','Critical')),
  progress_percent int,
  observations text,
  recommendations text,
  location_notes text,
  photo_urls text[],
  created_at timestamptz default now()
);

-- ============================================================
-- 15. COMPLAINTS (Citizen)
-- ============================================================
create table complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_id text unique not null,
  citizen_name text,
  citizen_email text,
  citizen_phone text,
  issue_type text not null check (issue_type in ('Pothole','Road Damage','Building Damage','Water Logging','Street Light','Drainage','Bridge Damage','Footpath Damage','Encroachment','Other')),
  description text not null,
  location_text text,
  latitude numeric,
  longitude numeric,
  photo_url text,
  asset_id uuid references assets(id),
  priority text default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  status text default 'Submitted' check (status in ('Submitted','Received','Assigned','Inspection','Work Started','Resolved','Closed','Rejected')),
  assigned_to text,
  assigned_department_id uuid references departments(id),
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 16. COMPLAINT UPDATES
-- ============================================================
create table complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  status text not null,
  notes text,
  updated_by text,
  created_at timestamptz default now()
);

-- ============================================================
-- 17. AUDIT LOGS
-- ============================================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  previous_value text,
  new_value text,
  performed_by text,
  reason text,
  ip_address text,
  created_at timestamptz default now()
);

-- ============================================================
-- 18. NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info','warning','success','error')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ============================================================
-- UTILITY: auto-update updated_at
-- ============================================================
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger assets_updated before update on assets for each row execute function update_updated_at();
create trigger projects_updated before update on projects for each row execute function update_updated_at();
create trigger complaints_updated before update on complaints for each row execute function update_updated_at();

-- ============================================================
-- UTILITY: audit log helper
-- ============================================================
create or replace function log_audit() returns trigger as $$
begin
  if tg_op = 'UPDATE' then
    if tg_table_name = 'projects' and new.status is distinct from old.status then
      insert into audit_logs(entity_type, entity_id, action, previous_value, new_value, performed_by)
      values ('project', new.id, 'Status changed', old.status, new.status, 'System');
    end if;
    if tg_table_name = 'assets' and new.status is distinct from old.status then
      insert into audit_logs(entity_type, entity_id, action, previous_value, new_value, performed_by)
      values ('asset', new.id, 'Status changed', old.status, new.status, 'System');
    end if;
    if tg_table_name = 'assets' and new.condition is distinct from old.condition then
      insert into audit_logs(entity_type, entity_id, action, previous_value, new_value, performed_by)
      values ('asset', new.id, 'Condition updated', old.condition, new.condition, 'System');
    end if;
    if tg_table_name = 'projects' and new.actual_expenditure is distinct from old.actual_expenditure then
      insert into audit_logs(entity_type, entity_id, action, previous_value, new_value, performed_by)
      values ('project', new.id, 'Budget updated', old.actual_expenditure::text, new.actual_expenditure::text, 'System');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger audit_assets after update on assets for each row execute function log_audit();
create trigger audit_projects after update on projects for each row execute function log_audit();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table assets enable row level security;
alter table projects enable row level security;
alter table project_events enable row level security;
alter table contractors enable row level security;
alter table contracts enable row level security;
alter table approvals enable row level security;
alter table financial_records enable row level security;
alter table documents enable row level security;
alter table maintenance_records enable row level security;
alter table inspection_records enable row level security;
alter table complaints enable row level security;
alter table complaint_updates enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table departments enable row level security;
alter table locations enable row level security;
alter table asset_categories enable row level security;
alter table user_profiles enable row level security;

-- Authenticated users can access internal tables
create policy "auth_all" on assets for all to authenticated using (true) with check (true);
create policy "auth_all" on projects for all to authenticated using (true) with check (true);
create policy "auth_all" on project_events for all to authenticated using (true) with check (true);
create policy "auth_all" on contractors for all to authenticated using (true) with check (true);
create policy "auth_all" on contracts for all to authenticated using (true) with check (true);
create policy "auth_all" on approvals for all to authenticated using (true) with check (true);
create policy "auth_all" on financial_records for all to authenticated using (true) with check (true);
create policy "auth_all" on documents for all to authenticated using (true) with check (true);
create policy "auth_all" on maintenance_records for all to authenticated using (true) with check (true);
create policy "auth_all" on inspection_records for all to authenticated using (true) with check (true);
create policy "auth_all" on complaints for all to authenticated using (true) with check (true);
create policy "auth_all" on complaint_updates for all to authenticated using (true) with check (true);
create policy "auth_read" on audit_logs for select to authenticated using (true);
create policy "auth_all" on notifications for all to authenticated using (true) with check (true);
create policy "auth_all" on departments for all to authenticated using (true) with check (true);
create policy "auth_all" on locations for all to authenticated using (true) with check (true);
create policy "auth_all" on asset_categories for all to authenticated using (true) with check (true);
create policy "auth_all" on user_profiles for all to authenticated using (true) with check (true);
alter table project_bids enable row level security;
create policy "auth_all_bids" on project_bids for all to authenticated using (true) with check (true);
create policy "public_read_bids" on project_bids for select to anon using (true);

-- Public (anon) access for citizen portal — read only on public assets/projects
create policy "public_read_assets" on assets for select to anon using (is_public = true);
create policy "public_read_projects" on projects for select to anon using (is_public = true);
create policy "public_read_events" on project_events for select to anon using (true);
create policy "public_read_categories" on asset_categories for select to anon using (true);
create policy "public_read_locations" on locations for select to anon using (true);
create policy "public_read_departments" on departments for select to anon using (true);
-- Citizens can insert complaints
create policy "public_insert_complaints" on complaints for insert to anon with check (true);
create policy "public_read_complaints" on complaints for select to anon using (true);
create policy "public_read_updates" on complaint_updates for select to anon using (true);

-- ============================================================
-- DEMO DATA — Assets
-- ============================================================
-- We'll reference location & category IDs by subquery

insert into assets(asset_id, name, category_id, location_id, department_id, description, status, condition, length_km, width_m, area_sqm, year_built, current_value, custodian, is_public) values
('RNB-NH-00001', 'Ahmedabad-Gandhinagar Expressway Section', (select id from asset_categories where code='NH'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='RNB'), 'Six-lane expressway connecting Ahmedabad to the capital Gandhinagar. Major arterial route.', 'Operational', 'Good', 28.5, 24, null, 2012, 850000000, 'Executive Engineer, RNB Ahmedabad', true),
('RNB-SH-00002', 'Surat-Navsari State Highway', (select id from asset_categories where code='SH'), (select id from locations where district='Surat' limit 1), (select id from departments where code='RNB'), 'State highway connecting Surat to Navsari. Two lanes with paved shoulders.', 'Operational', 'Fair', 38.0, 10, null, 2005, 420000000, 'Executive Engineer, RNB Surat', true),
('RNB-BRG-00003', 'Sabarmati River Bridge (Ellisbridge)', (select id from asset_categories where code='BRG'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='RNB'), 'Heritage bridge over Sabarmati River in central Ahmedabad.', 'Operational', 'Fair', 0.32, 12, null, 1892, 180000000, 'Executive Engineer, RNB Ahmedabad', true),
('RNB-DR-00004', 'Mehsana-Patan District Road', (select id from asset_categories where code='DR'), (select id from locations where district='Mehsana' limit 1), (select id from departments where code='RNB'), 'District road connecting Mehsana to Patan. Single carriageway.', 'Under Maintenance', 'Poor', 52.0, 7, null, 1998, 195000000, 'Executive Engineer, RNB Mehsana', true),
('RNB-CLV-00005', 'Anand Bypass Culvert Set (6 units)', (select id from asset_categories where code='CLV'), (select id from locations where district='Anand' limit 1), (select id from departments where code='RNB'), 'Set of 6 box culverts along Anand bypass road for drainage management.', 'Operational', 'Good', null, null, null, 2018, 12000000, 'Sub-Divisional Engineer, Anand', true),
('HFW-HSP-00006', 'District Civil Hospital Ahmedabad', (select id from asset_categories where code='HSP'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='HFW'), '500-bed district hospital providing secondary and tertiary healthcare.', 'Operational', 'Fair', null, null, 42000, 1985, 180000000, 'Dr. R. Mehta (Medical Superintendent)', true),
('EDU-SCH-00007', 'Government Higher Secondary School, Surat', (select id from asset_categories where code='SCH'), (select id from locations where district='Surat' limit 1), (select id from departments where code='EDU'), 'Higher secondary school with science and commerce streams. 1200 students.', 'Operational', 'Poor', null, null, 18000, 1972, 45000000, 'Smt. N. Shah (Principal)', true),
('REV-GOF-00008', 'Collectorate Office Gandhinagar', (select id from asset_categories where code='GOF'), (select id from locations where district='Gandhinagar' limit 1), (select id from departments where code='REV'), 'District Collectorate housing revenue, land records, and administrative offices.', 'Operational', 'Good', null, null, 30000, 1998, 120000000, 'Shri A. Patel (District Collector)', true),
('POL-PST-00009', 'City Police Station Vadodara', (select id from asset_categories where code='PST'), (select id from locations where district='Vadodara' limit 1), (select id from departments where code='POL'), 'Main city police station with control room and lockup facilities.', 'Operational', 'Good', null, null, 6500, 2004, 32000000, 'Insp. K. Desai (SHO)', true),
('RNB-FLY-00010', 'Rajkot 150 Ft Ring Road Flyover', (select id from asset_categories where code='FLY'), (select id from locations where district='Rajkot' limit 1), (select id from departments where code='RNB'), 'Four-lane flyover at the busiest junction of 150ft Ring Road.', 'Completed', 'Excellent', 1.2, 16, null, 2025, 350000000, 'Executive Engineer, RNB Rajkot', true),
('UDD-GLD-00011', 'Vacant Plot – Civic Centre Gandhinagar', (select id from asset_categories where code='GLD'), (select id from locations where district='Gandhinagar' limit 1), (select id from departments where code='UDD'), 'Government land earmarked for future civic centre development.', 'Proposed', 'Good', null, null, 50000, null, 950000000, 'Estate Officer, Gandhinagar', true),
('RNB-NH-00012', 'Vadodara-Ahmedabad Expressway Section', (select id from asset_categories where code='NH'), (select id from locations where district='Vadodara' limit 1), (select id from departments where code='RNB'), 'Section of National Expressway connecting Vadodara to Ahmedabad.', 'Operational', 'Excellent', 95.0, 30, null, 2020, 4200000000, 'Executive Engineer, NHAI Gujarat', true),
('HFW-HSP-00013', 'Community Health Centre Bhavnagar', (select id from asset_categories where code='HSP'), (select id from locations where district='Bhavnagar' limit 1), (select id from departments where code='HFW'), '100-bed community health centre serving rural Bhavnagar district.', 'Under Maintenance', 'Poor', null, null, 8500, 1995, 42000000, 'Dr. M. Parmar (MO)', true),
('RDD-CMH-00014', 'Community Hall Junagadh', (select id from asset_categories where code='CMH'), (select id from locations where district='Junagadh' limit 1), (select id from departments where code='RDD'), 'Multi-purpose community hall for public events and gatherings.', 'Operational', 'Fair', null, null, 2200, 2008, 18000000, 'Taluka Development Officer', true),
('RNB-BRG-00015', 'Kutch Creek Bridge', (select id from asset_categories where code='BRG'), (select id from locations where district='Kutch' limit 1), (select id from departments where code='RNB'), 'Strategic bridge over tidal creek connecting Bhuj to coastal areas.', 'Operational', 'Good', 0.85, 10, null, 2015, 280000000, 'Executive Engineer, RNB Kutch', true),
('PWD-GOF-00016', 'PWD Circle Office Surat', (select id from asset_categories where code='GOF'), (select id from locations where district='Surat' limit 1), (select id from departments where code='PWD'), 'Circle-level PWD office managing south Gujarat infrastructure.', 'Operational', 'Good', null, null, 4500, 2010, 65000000, 'Superintending Engineer, Surat Circle', true),
('EDU-SCH-00017', 'Primary School Patan', (select id from asset_categories where code='SCH'), (select id from locations where district='Patan' limit 1), (select id from departments where code='EDU'), 'Government primary school serving 3 surrounding villages.', 'Operational', 'Poor', null, null, 3200, 1968, 8500000, 'Headmaster', true),
('NWR-WTK-00018', 'Overhead Water Tank Navsari', (select id from asset_categories where code='WTK'), (select id from locations where district='Navsari' limit 1), (select id from departments where code='NWR'), '500 KL capacity overhead water storage tank for municipal supply.', 'Operational', 'Fair', null, null, null, 2001, 22000000, 'Water Supply Engineer', true),
('RNB-FTP-00019', 'Riverfront Footpath Ahmedabad', (select id from asset_categories where code='FTP'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='RNB'), 'Paved pedestrian footpath along Sabarmati Riverfront promenade.', 'Operational', 'Excellent', 4.5, 3, null, 2015, 45000000, 'Riverfront Development Corporation', true),
('RNB-DRN-00020', 'Surat Drainage System Sector 7-12', (select id from asset_categories where code='DRN'), (select id from locations where district='Surat' limit 1), (select id from departments where code='RNB'), 'Underground storm water drainage network covering 6 sectors.', 'Under Maintenance', 'Fair', 12.0, null, null, 2010, 85000000, 'Drainage Division Engineer', true);

-- ============================================================
-- DEMO DATA — Projects
-- ============================================================
insert into projects(project_id, name, description, category_id, location_id, department_id, contractor_id, estimated_cost, sanctioned_amount, allocated_amount, actual_expenditure, start_date, expected_completion_date, actual_completion_date, status, progress_percent, priority, approving_authority, is_public) values
('PRJ-001', 'Ahmedabad Ring Road Widening Phase-II', 'Widening of Ahmedabad Ring Road from 4-lane to 6-lane from SP Ring Road to SG Highway junction. Length: 14.5 km including service roads.', (select id from asset_categories where code='NH'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='RNB'), (select id from contractors where contractor_id='CON-001'), 4200000000, 4000000000, 3800000000, 2800000000, '2025-03-15', '2027-03-14', null, 'Under Construction', 67, 'High', 'Secretary, RNB Department', true),
('PRJ-002', 'District Hospital Renovation Surat', 'Complete renovation of Surat Civil Hospital including new OPD wing, upgraded ICU, modern diagnostic centre, and seismic retrofitting.', (select id from asset_categories where code='HSP'), (select id from locations where district='Surat' limit 1), (select id from departments where code='HFW'), (select id from contractors where contractor_id='CON-003'), 1200000000, 1150000000, 1100000000, 0, null, '2027-12-31', null, 'Approved', 0, 'High', 'Commissioner, Health', true),
('PRJ-003', 'Government School Reconstruction Vadodara', 'Demolition and reconstruction of earthquake-damaged government school building with modern classrooms, laboratory, library, and playground.', (select id from asset_categories where code='SCH'), (select id from locations where district='Vadodara' limit 1), (select id from departments where code='EDU'), (select id from contractors where contractor_id='CON-005'), 800000000, 780000000, 780000000, 780000000, '2024-01-10', '2025-12-31', '2025-11-28', 'Completed', 100, 'Medium', 'Director, Primary Education', true),
('PRJ-004', 'Rajkot-Junagadh Highway Resurfacing', 'Resurfacing and shoulder improvement of 85 km stretch of SH-25 between Rajkot and Junagadh with hot-mix asphalt overlay.', (select id from asset_categories where code='SH'), (select id from locations where district='Rajkot' limit 1), (select id from departments where code='RNB'), (select id from contractors where contractor_id='CON-004'), 950000000, 920000000, 880000000, 440000000, '2026-01-20', '2027-01-19', null, 'Under Construction', 45, 'Medium', 'Chief Engineer, RNB', true),
('PRJ-005', 'Sabarmati River Bridge Strengthening', 'Structural strengthening and restoration of heritage Ellisbridge including deck replacement, pier grouting, and seismic retrofitting.', (select id from asset_categories where code='BRG'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='RNB'), null, 380000000, 365000000, 0, 0, null, null, null, 'Tendering', 0, 'High', 'Secretary, RNB Department', true),
('PRJ-006', 'Bhavnagar CHC Roof Repair', 'Emergency roof replacement and waterproofing of Community Health Centre Bhavnagar after monsoon damage.', (select id from asset_categories where code='HSP'), (select id from locations where district='Bhavnagar' limit 1), (select id from departments where code='HFW'), (select id from contractors where contractor_id='CON-007'), 15000000, 14500000, 14500000, 8200000, '2026-07-01', '2026-10-30', null, 'Under Construction', 58, 'Critical', 'District Collector, Bhavnagar', true),
('PRJ-007', 'Gandhinagar Civic Centre Development', 'Construction of new civic centre on government land in Sector 24 including municipal offices, public service hall, and parking.', (select id from asset_categories where code='GOF'), (select id from locations where district='Gandhinagar' limit 1), (select id from departments where code='UDD'), null, 2500000000, 0, 0, 0, null, null, null, 'Under Review', 0, 'Medium', 'Chief Town Planner', true),
('PRJ-008', 'Kutch Rural Road Network Phase-I', 'Construction of 120 km all-weather rural road network connecting 15 villages in Kutch district under PMGSY scheme.', (select id from asset_categories where code='VR'), (select id from locations where district='Kutch' limit 1), (select id from departments where code='RDD'), (select id from contractors where contractor_id='CON-009'), 680000000, 650000000, 620000000, 310000000, '2025-11-01', '2027-04-30', null, 'Under Construction', 38, 'High', 'Secretary, RDD', true),
('PRJ-009', 'Patan School Compound Wall & Toilets', 'Construction of boundary wall, toilet block, and rainwater harvesting system at Government Primary School Patan.', (select id from asset_categories where code='SCH'), (select id from locations where district='Patan' limit 1), (select id from departments where code='EDU'), (select id from contractors where contractor_id='CON-007'), 8500000, 8200000, 8200000, 5600000, '2026-04-01', '2026-09-30', null, 'Under Construction', 72, 'Medium', 'DEO, Patan', true),
('PRJ-010', 'Navsari Water Distribution Pipeline', 'Laying of 8 km water distribution pipeline from overhead tank to 4 municipal wards.', (select id from asset_categories where code='WTK'), (select id from locations where district='Navsari' limit 1), (select id from departments where code='NWR'), (select id from contractors where contractor_id='CON-010'), 95000000, 92000000, 90000000, 88000000, '2025-06-15', '2026-06-14', '2026-05-30', 'Completed', 100, 'High', 'Chief Engineer, Water Supply', true),
('PRJ-011', 'Surat Drainage Desilting 2026', 'Pre-monsoon desilting and repair of storm water drainage system in Surat sectors 7-12.', (select id from asset_categories where code='DRN'), (select id from locations where district='Surat' limit 1), (select id from departments where code='RNB'), (select id from contractors where contractor_id='CON-003'), 42000000, 40000000, 40000000, 32000000, '2026-03-01', '2026-05-31', null, 'Under Construction', 80, 'Critical', 'Municipal Commissioner, Surat', true),
('PRJ-012', 'Mehsana-Patan Road Resurfacing', 'Complete resurfacing of 52 km district road with drainage improvement and road marking.', (select id from asset_categories where code='DR'), (select id from locations where district='Mehsana' limit 1), (select id from departments where code='RNB'), (select id from contractors where contractor_id='CON-002'), 320000000, 310000000, 0, 0, null, null, null, 'Approved', 0, 'Medium', 'Chief Engineer, RNB', true),
('PRJ-013', 'Anand Bypass Extension', 'Extension of Anand bypass road by 5.5 km with grade-separated intersection and 3 new culverts.', (select id from asset_categories where code='DR'), (select id from locations where district='Anand' limit 1), (select id from departments where code='RNB'), null, 580000000, 0, 0, 0, null, null, null, 'Proposed', 0, 'Medium', 'Secretary, RNB Department', true),
('PRJ-014', 'Riverfront Footpath Extension Ahmedabad', 'Extension of Sabarmati Riverfront footpath by 3.2 km on west bank with landscaping, lighting, and seating.', (select id from asset_categories where code='FTP'), (select id from locations where district='Ahmedabad' limit 1), (select id from departments where code='UDD'), (select id from contractors where contractor_id='CON-006'), 125000000, 120000000, 115000000, 48000000, '2026-02-01', '2026-12-31', null, 'Under Construction', 42, 'Low', 'MD, SRFDCL', true),
('PRJ-015', 'Vadodara Police Station Renovation', 'Interior renovation, CCTV installation, and parking area development at City Police Station.', (select id from asset_categories where code='PST'), (select id from locations where district='Vadodara' limit 1), (select id from departments where code='POL'), (select id from contractors where contractor_id='CON-005'), 28000000, 27000000, 27000000, 12000000, '2026-06-01', '2026-11-30', null, 'Under Construction', 45, 'Medium', 'DGP Office', true);

-- ============================================================
-- DEMO DATA — Project Events (Timeline)
-- ============================================================
insert into project_events(project_id, event_type, event_date, title, description, performed_by) values
-- PRJ-001
((select id from projects where project_id='PRJ-001'), 'Proposal', '2024-06-15', 'Project Proposed', 'Ring Road widening proposal submitted to RNB Department.', 'SE, Ahmedabad Circle'),
((select id from projects where project_id='PRJ-001'), 'Survey', '2024-08-20', 'Detailed Survey Completed', 'Topographic and traffic survey completed for all 14.5 km.', 'Survey Division'),
((select id from projects where project_id='PRJ-001'), 'DPR', '2024-11-10', 'DPR Submitted', 'Detailed Project Report with cost estimates submitted.', 'Consultant: RITES Ltd'),
((select id from projects where project_id='PRJ-001'), 'Admin Approval', '2025-01-08', 'Administrative Approval Granted', 'AA granted for ₹42 Cr by Secretary, RNB.', 'Secretary, RNB'),
((select id from projects where project_id='PRJ-001'), 'Tech Sanction', '2025-01-25', 'Technical Sanction Issued', 'Technical sanction with ₹40 Cr by Chief Engineer.', 'Chief Engineer, RNB'),
((select id from projects where project_id='PRJ-001'), 'Tender', '2025-02-05', 'Tender Published', 'e-Tender published on government portal.', 'SE, Ahmedabad Circle'),
((select id from projects where project_id='PRJ-001'), 'Contract', '2025-02-28', 'Contract Awarded', 'Contract awarded to ABC Infrastructure Pvt. Ltd.', 'Tender Committee'),
((select id from projects where project_id='PRJ-001'), 'Construction', '2025-03-15', 'Construction Started', 'Ground breaking and construction commenced.', 'EE, Ahmedabad'),
((select id from projects where project_id='PRJ-001'), 'Progress', '2025-09-20', 'Milestone: 25% Completed', 'First 3.6 km section completed. Service roads in progress.', 'Site Engineer'),
((select id from projects where project_id='PRJ-001'), 'Progress', '2026-03-15', 'Milestone: 50% Completed', 'Major utility shifting completed. 7.2 km road widened.', 'Site Engineer'),
((select id from projects where project_id='PRJ-001'), 'Progress', '2026-09-15', 'Current: 67% Completed', 'Bituminous layer being laid on southern section.', 'Site Engineer'),
-- PRJ-003
((select id from projects where project_id='PRJ-003'), 'Proposal', '2023-06-10', 'Project Proposed', 'School reconstruction proposal after structural audit.', 'DEO, Vadodara'),
((select id from projects where project_id='PRJ-003'), 'Admin Approval', '2023-09-15', 'Administrative Approval', 'AA granted by Director, Primary Education.', 'Director, Primary Education'),
((select id from projects where project_id='PRJ-003'), 'Contract', '2023-12-05', 'Contract Awarded', 'Contract awarded to Narmada Construction Co.', 'Tender Committee'),
((select id from projects where project_id='PRJ-003'), 'Construction', '2024-01-10', 'Construction Started', 'Old building demolition commenced.', 'Site Engineer'),
((select id from projects where project_id='PRJ-003'), 'Progress', '2024-06-15', '50% Completed', 'Structure completed up to second floor.', 'Site Engineer'),
((select id from projects where project_id='PRJ-003'), 'Completion', '2025-11-28', 'Project Completed', 'Building handed over. Occupancy certificate received.', 'EE, Vadodara'),
-- PRJ-004
((select id from projects where project_id='PRJ-004'), 'Proposal', '2025-08-01', 'Project Proposed', 'Highway resurfacing proposal after condition survey.', 'SE, Rajkot Circle'),
((select id from projects where project_id='PRJ-004'), 'Admin Approval', '2025-10-20', 'Administrative Approval', 'AA for ₹9.5 Cr granted.', 'Chief Engineer, RNB'),
((select id from projects where project_id='PRJ-004'), 'Construction', '2026-01-20', 'Resurfacing Started', 'Work commenced from Rajkot end.', 'EE, Rajkot'),
((select id from projects where project_id='PRJ-004'), 'Progress', '2026-06-30', '45% Completed', '38 km resurfacing completed.', 'Site Engineer');

-- ============================================================
-- DEMO DATA — Project Bids / Tender Comparative Statements (CSQ)
-- ============================================================
insert into project_bids(project_id, contractor_id, bid_amount, bidder_rank, technical_score, emd_amount, submission_date, status, remarks) values
-- PRJ-001 Bidders
((select id from projects where project_id='PRJ-001'), (select id from contractors where contractor_id='CON-001'), 4000000000, 'L1', 94, 84000000, '2025-02-18', 'Awarded', 'Lowest valid responsive financial bid. Awarded Work Order WO/RNB/2025/089.'),
((select id from projects where project_id='PRJ-001'), (select id from contractors where contractor_id='CON-002'), 4150000000, 'L2', 91, 84000000, '2025-02-18', 'Outbid', 'Technically qualified. Financial quote was +3.75% above L1.'),
((select id from projects where project_id='PRJ-001'), (select id from contractors where contractor_id='CON-006'), 4280000000, 'L3', 88, 84000000, '2025-02-17', 'Outbid', 'Technically qualified. Financial quote was +7.00% above L1.'),
((select id from projects where project_id='PRJ-001'), (select id from contractors where contractor_id='CON-008'), 4420000000, 'L4', 82, 84000000, '2025-02-18', 'Outbid', 'Higher quotation (+10.5% above L1).'),
((select id from projects where project_id='PRJ-001'), (select id from contractors where contractor_id='CON-004'), 3920000000, 'Disqualified', 54, 0, '2025-02-16', 'Disqualified', 'Rejected in Stage-I Technical Evaluation: Did not meet required annual turnover criteria.'),

-- PRJ-003 Bidders
((select id from projects where project_id='PRJ-003'), (select id from contractors where contractor_id='CON-005'), 780000000, 'L1', 92, 16000000, '2023-11-20', 'Awarded', 'Lowest bidder. Awarded contract and successfully completed construction.'),
((select id from projects where project_id='PRJ-003'), (select id from contractors where contractor_id='CON-007'), 820000000, 'L2', 85, 16000000, '2023-11-21', 'Outbid', 'Qualified bidder, quoted +5.1% over L1.'),
((select id from projects where project_id='PRJ-003'), (select id from contractors where contractor_id='CON-003'), 840000000, 'L3', 80, 16000000, '2023-11-19', 'Outbid', 'Higher financial quotation.');

-- ============================================================
-- DEMO DATA — Documents (Across All 8 Categories)
-- ============================================================
insert into documents(project_id, asset_id, doc_category, title, file_name, file_url, file_size_kb, uploaded_by, remarks) values
-- Planning
((select id from projects where project_id='PRJ-001'), null, 'Planning', 'Detailed Project Report (DPR) Vol 1 — Technical Feasibility', 'DPR_Vol1_Technical_RingRoad.pdf', 'https://example.gov.in/docs/DPR_RingRoad.pdf', 14200, 'Consultant: RITES Ltd', 'Complete geometric alignment and traffic projection studies.'),
((select id from projects where project_id='PRJ-001'), null, 'Planning', 'Environmental Impact Assessment (EIA) & Social Management Plan', 'EIA_EMP_Study_2024.pdf', 'https://example.gov.in/docs/EIA_Study.pdf', 8500, 'State Pollution Board', 'Includes air, noise, and roadside ecosystem protection directives.'),
(null, (select id from assets where asset_id='RNB-BRG-00003'), 'Planning', 'Geotechnical Soil Investigation & Deep Core Drilling Report', 'Geotech_Borehole_Ellisbridge.pdf', 'https://example.gov.in/docs/Geotech_Ellisbridge.pdf', 6200, 'GERI Vadodara', 'Foundation bearing capacity analysis for bridge piers.'),

-- Approval
((select id from projects where project_id='PRJ-001'), null, 'Approval', 'Government Resolution (GR) — Administrative Approval (AA) Sanction', 'GR_AA_RNB_2025_042.pdf', 'https://example.gov.in/docs/GR_AA_042.pdf', 1250, 'Secretary, RNB', 'Administrative Sanction for ₹42.00 Cr capital outlay.'),
((select id from projects where project_id='PRJ-001'), null, 'Approval', 'Technical Sanction (TS) Letter & Schedule of Rates Approval', 'TS_Order_CE_RNB_018.pdf', 'https://example.gov.in/docs/TS_Order_018.pdf', 2400, 'Chief Engineer, RNB', 'Technical sanction order under Gujarat R&B SOR-2024.'),
((select id from projects where project_id='PRJ-002'), null, 'Approval', 'Health Department AA & Hospital Modernization NOC', 'HFW_AA_2026_015.pdf', 'https://example.gov.in/docs/HFW_AA_015.pdf', 980, 'Commissioner, Health', 'Special clearance for emergency ICU modernization.'),

-- Tender
((select id from projects where project_id='PRJ-001'), null, 'Tender', 'Notice Inviting Tender (NIT) & Bid Qualification Document', 'NIT_RNB_GJ_2025_001.pdf', 'https://example.gov.in/docs/NIT_001.pdf', 3500, 'SE, Ahmedabad Circle', 'Published on Gujarat (n)Procure portal.'),
((select id from projects where project_id='PRJ-001'), null, 'Tender', 'Volume II — Bill of Quantities (BOQ) & Technical Specifications', 'BOQ_ItemRates_Specifications.pdf', 'https://example.gov.in/docs/BOQ_Specs.pdf', 5800, 'Executive Engineer, RNB', 'Comprehensive item-wise pricing envelope.'),
((select id from projects where project_id='PRJ-001'), null, 'Tender', 'Comparative Statement of Quotations (CSQ) & Evaluation Report', 'CSQ_Evaluation_Committee_Report.pdf', 'https://example.gov.in/docs/CSQ_Report.pdf', 1950, 'Tender Committee', 'Evaluated 5 bids, recommended L1 bidder.'),

-- Contract
((select id from projects where project_id='PRJ-001'), null, 'Contract', 'Signed Contract Agreement & Letter of Acceptance (LOA)', 'Contract_Agreement_ABC_Infra.pdf', 'https://example.gov.in/docs/Contract_ABC.pdf', 4200, 'Legal Cell, RNB', 'Executed with ABC Infrastructure Pvt. Ltd.'),
((select id from projects where project_id='PRJ-001'), null, 'Contract', 'Official Work Order & Notice to Proceed (NTP)', 'Work_Order_WO_RNB_2025_089.pdf', 'https://example.gov.in/docs/WO_089.pdf', 1100, 'EE, Ahmedabad', 'Formal order to commence physical construction.'),
((select id from projects where project_id='PRJ-001'), null, 'Contract', 'Performance Bank Guarantee (PBG) Verification Letter', 'PBG_SBI_Verification_84Cr.pdf', 'https://example.gov.in/docs/PBG_Verification.pdf', 3100, 'Finance Division', 'Verified with State Bank of India Commercial Branch.'),

-- Construction
((select id from projects where project_id='PRJ-001'), null, 'Construction', 'Quality Control & Lab Test Report (Concrete Cube & Bitumen)', 'QC_Lab_Report_Batch_1to12.pdf', 'https://example.gov.in/docs/QC_Report.pdf', 7400, 'Quality Control Division', 'M-40 grade compressive test passed standards.'),
((select id from projects where project_id='PRJ-001'), null, 'Construction', 'Milestone 50% Structural Inspection & Field Audit Certificate', 'Milestone_50pct_Inspection.pdf', 'https://example.gov.in/docs/Milestone_50pct.pdf', 9100, 'Superintending Engineer', 'Utility shifting and main carriageway verified.'),
((select id from projects where project_id='PRJ-003'), null, 'Construction', 'Reinforced Concrete Structural Drawings & Column Grid Map', 'RCC_Column_Layout_Drawings.pdf', 'https://example.gov.in/docs/RCC_Drawings.pdf', 12800, 'Design Wing, RNB', 'Seismic Zone-III compliant drawings.'),

-- Completion
((select id from projects where project_id='PRJ-003'), null, 'Completion', 'Project Completion Certificate & Handover Note', 'Completion_Certificate_Vadodara_School.pdf', 'https://example.gov.in/docs/Completion_School.pdf', 1850, 'EE, Vadodara', 'Full building commissioned and handed over.'),
((select id from projects where project_id='PRJ-003'), null, 'Completion', 'Comprehensive As-Built Drawings & Fire Safety Clearance', 'As_Built_Drawings_FireNOC.pdf', 'https://example.gov.in/docs/AsBuilt_FireNOC.pdf', 24500, 'Vadodara Municipal Fire', 'Fire safety and building stability certification.'),
((select id from projects where project_id='PRJ-010'), null, 'Completion', 'Joint Commissioning & Water Flow Verification Note', 'Joint_Commissioning_Water_Tank.pdf', 'https://example.gov.in/docs/Water_Commissioning.pdf', 2100, 'NWR Water Supply Wing', 'Pressure testing and supply verification passed.'),

-- Maintenance
(null, (select id from assets where asset_id='RNB-NH-00001'), 'Maintenance', 'Annual Maintenance Contract (AMC) & Routine Pothole Repair Schedule', 'AMC_Routine_Maintenance_2026.pdf', 'https://example.gov.in/docs/AMC_Roads.pdf', 2800, 'Executive Engineer, RNB', 'Pre-monsoon maintenance plan.'),
((select id from projects where project_id='PRJ-003'), null, 'Maintenance', 'Defect Liability Period (DLP) Final Inspection Audit', 'DLP_Final_Inspection_Report.pdf', 'https://example.gov.in/docs/DLP_Report.pdf', 3400, 'Quality Control Wing', 'Zero structural defects observed after 12 months.'),
(null, (select id from assets where asset_id='RNB-BRG-00003'), 'Maintenance', 'Ultrasonic Non-Destructive Pulse Velocity (UPV) Test Report', 'UPV_NDT_Testing_Ellisbridge.pdf', 'https://example.gov.in/docs/NDT_Report.pdf', 5100, 'Structural Consultant', 'Bridge piers integrity confirmed stable.'),

-- Other
((select id from projects where project_id='PRJ-001'), null, 'Other', 'Utility Line Shifting NOC from GETCO & Torrent Power', 'GETCO_Utility_Shifting_NOC.pdf', 'https://example.gov.in/docs/GETCO_NOC.pdf', 1450, 'GETCO Gujarat', 'High tension power line clearance granted.'),
((select id from projects where project_id='PRJ-001'), null, 'Other', 'Forest Department Tree Felling Permission & Afforestation Plan', 'Forest_Clearance_Afforestation.pdf', 'https://example.gov.in/docs/Forest_Clearance.pdf', 2200, 'Deputy Conservator of Forests', 'Plantation of 1500 saplings along corridor.'),
((select id from projects where project_id='PRJ-001'), null, 'Other', 'Right-of-Way (RoW) Demarcation Map & Land Revenue Gazette', 'RoW_Gazette_Notification.pdf', 'https://example.gov.in/docs/RoW_Gazette.pdf', 4600, 'District Collector, Revenue', 'Land record demarcation along 14.5 km corridor.');

-- ============================================================
-- DEMO DATA — Approvals
-- ============================================================
insert into approvals(project_id, approval_type, authority, designation, approval_date, status, reference_number, remarks) values
((select id from projects where project_id='PRJ-001'), 'Administrative Approval', 'Shri M. K. Rao', 'Secretary, RNB', '2025-01-08', 'Approved', 'RNB/AA/2025/042', 'Approved with condition to minimize traffic disruption'),
((select id from projects where project_id='PRJ-001'), 'Technical Sanction', 'Shri P. S. Desai', 'Chief Engineer, RNB', '2025-01-25', 'Approved', 'RNB/TS/2025/018', 'Technical sanction for ₹40 Cr'),
((select id from projects where project_id='PRJ-001'), 'Financial Approval', 'Smt. R. Joshi', 'Finance Secretary', '2025-02-01', 'Approved', 'FIN/PRJ/2025/104', 'Budget provision confirmed under Plan expenditure'),
((select id from projects where project_id='PRJ-002'), 'Administrative Approval', 'Dr. A. K. Shah', 'Commissioner, Health', '2026-05-10', 'Approved', 'HFW/AA/2026/015', 'Priority renovation approved'),
((select id from projects where project_id='PRJ-003'), 'Administrative Approval', 'Shri V. D. Patel', 'Director, Primary Education', '2023-09-15', 'Approved', 'EDU/AA/2023/088', null),
((select id from projects where project_id='PRJ-003'), 'Completion Certificate', 'Shri R. Solanki', 'EE, Vadodara', '2025-12-02', 'Approved', 'RNB/CC/2025/194', 'Building meets all structural and safety norms'),
((select id from projects where project_id='PRJ-005'), 'Administrative Approval', 'Shri M. K. Rao', 'Secretary, RNB', '2026-06-20', 'Approved', 'RNB/AA/2026/028', 'Heritage structure — AMC coordination required'),
((select id from projects where project_id='PRJ-008'), 'Administrative Approval', 'Shri N. B. Trivedi', 'Secretary, RDD', '2025-09-10', 'Approved', 'RDD/AA/2025/052', 'Under PMGSY scheme');

-- ============================================================
-- DEMO DATA — Financial Records
-- ============================================================
insert into financial_records(project_id, record_type, amount, financial_year, description, payment_date, paid_to, recorded_by) values
((select id from projects where project_id='PRJ-001'), 'Allocation', 3800000000, '2025-26', 'Budget allocation for FY 2025-26', '2025-04-01', null, 'Finance Division'),
((select id from projects where project_id='PRJ-001'), 'Expenditure', 800000000, '2025-26', 'RA Bill No. 1 — Foundation and earthwork', '2025-06-15', 'ABC Infrastructure Pvt. Ltd.', 'AE, Ahmedabad'),
((select id from projects where project_id='PRJ-001'), 'Expenditure', 1200000000, '2025-26', 'RA Bill No. 2 — Sub-base and base course', '2025-10-20', 'ABC Infrastructure Pvt. Ltd.', 'AE, Ahmedabad'),
((select id from projects where project_id='PRJ-001'), 'Expenditure', 800000000, '2026-27', 'RA Bill No. 3 — Bituminous work and drainage', '2026-04-12', 'ABC Infrastructure Pvt. Ltd.', 'AE, Ahmedabad'),
((select id from projects where project_id='PRJ-004'), 'Allocation', 880000000, '2026-27', 'Budget allocation', '2026-04-01', null, 'Finance Division'),
((select id from projects where project_id='PRJ-004'), 'Expenditure', 220000000, '2026-27', 'RA Bill No. 1 — Milling and base preparation', '2026-04-15', 'Saurashtra Road Builders', 'AE, Rajkot'),
((select id from projects where project_id='PRJ-004'), 'Expenditure', 220000000, '2026-27', 'RA Bill No. 2 — Overlay and marking', '2026-07-20', 'Saurashtra Road Builders', 'AE, Rajkot'),
((select id from projects where project_id='PRJ-003'), 'Allocation', 780000000, '2024-25', 'Full allocation', '2024-04-01', null, 'Finance Division'),
((select id from projects where project_id='PRJ-003'), 'Expenditure', 780000000, '2024-25', 'Final bill — project completed', '2025-12-15', 'Narmada Construction Co.', 'AE, Vadodara'),
((select id from projects where project_id='PRJ-006'), 'Allocation', 14500000, '2026-27', 'Emergency allocation', '2026-06-28', null, 'Finance Division'),
((select id from projects where project_id='PRJ-006'), 'Expenditure', 8200000, '2026-27', 'RA Bill No. 1 — Demolition and new truss work', '2026-08-15', 'Patel & Associates Builders', 'AE, Bhavnagar'),
((select id from projects where project_id='PRJ-010'), 'Allocation', 90000000, '2025-26', 'Full allocation', '2025-04-01', null, 'Finance Division'),
((select id from projects where project_id='PRJ-010'), 'Expenditure', 88000000, '2025-26', 'Final bill — pipeline laying completed', '2026-06-10', 'New Era Buildcon Pvt. Ltd.', 'AE, Navsari');

-- ============================================================
-- DEMO DATA — Maintenance Records
-- ============================================================
insert into maintenance_records(asset_id, issue, description, priority, reported_date, assigned_to, estimated_cost, actual_cost, status, expected_completion) values
((select id from assets where asset_id='RNB-DR-00004'), 'Multiple potholes on km 12-18', 'Deep potholes reported after monsoon. Causing accidents.', 'Critical', '2026-08-15', 'Maintenance Wing, Mehsana', 2500000, null, 'Assigned', '2026-10-15'),
((select id from assets where asset_id='RNB-DR-00004'), 'Road shoulder erosion km 30-35', 'Shoulder eroded due to drainage failure. Width reduced.', 'High', '2026-08-20', 'Maintenance Wing, Mehsana', 1800000, null, 'In Progress', '2026-11-01'),
((select id from assets where asset_id='HFW-HSP-00006'), 'Water leakage in Ward-3', 'Ceiling water leakage in general ward. Patients relocated.', 'High', '2026-07-10', 'Hospital Maintenance', 350000, 280000, 'Completed', '2026-08-01'),
((select id from assets where asset_id='HFW-HSP-00006'), 'Elevator malfunction', 'Service elevator not operational. Awaiting spare parts.', 'Medium', '2026-09-05', 'Lift Maintenance Contractor', 180000, null, 'In Progress', '2026-10-15'),
((select id from assets where asset_id='EDU-SCH-00007'), 'Classroom roof leakage', 'Roof tiles damaged in rooms 4-6. Leaking during rain.', 'High', '2026-07-25', 'PWD Maintenance', 420000, null, 'Assigned', '2026-10-30'),
((select id from assets where asset_id='HFW-HSP-00013'), 'Roof replacement needed', 'Major roof damage from monsoon. Multiple wards affected.', 'Critical', '2026-06-20', 'Patel & Associates Builders', 12000000, null, 'In Progress', '2026-10-30'),
((select id from assets where asset_id='RNB-SH-00002'), 'Pothole cluster near km 15', 'Multiple potholes on both lanes near Kamrej junction.', 'High', '2026-09-10', 'Maintenance Wing, Surat', 650000, null, 'Reported', '2026-10-30'),
((select id from assets where asset_id='RNB-DRN-00020'), 'Blocked drain near Sector 9', 'Storm drain blocked causing waterlogging during rains.', 'Critical', '2026-06-01', 'Drainage Division, Surat', 850000, 780000, 'Completed', '2026-06-15'),
((select id from assets where asset_id='RNB-BRG-00003'), 'Railing corrosion on south side', 'Metal railing showing severe corrosion. Safety hazard.', 'Medium', '2026-09-20', 'Bridge Maintenance Division', 950000, null, 'Reported', '2026-12-31'),
((select id from assets where asset_id='EDU-SCH-00017'), 'Toilet block plumbing failure', 'Complete plumbing overhaul needed in toilet block.', 'High', '2026-08-01', 'PWD Maintenance, Patan', 280000, 260000, 'Completed', '2026-09-15');

-- ============================================================
-- DEMO DATA — Inspection Records
-- ============================================================
insert into inspection_records(asset_id, inspection_date, inspector_name, inspector_designation, condition_rating, progress_percent, observations, recommendations) values
((select id from assets where asset_id='RNB-NH-00001'), '2026-09-15', 'Shri R. K. Shah', 'Executive Engineer', 'Good', null, 'Road surface in good condition. Minor shoulder damage near km 12.', 'Schedule shoulder repair before monsoon 2027.'),
((select id from assets where asset_id='RNB-DR-00004'), '2026-08-10', 'Shri M. B. Patel', 'Sub-Divisional Engineer', 'Poor', null, 'Severe surface damage observed at multiple locations. Potholes, cracks, and edge failures. Drainage culverts partially blocked.', 'Immediate resurfacing required. Recommend closure of heavy vehicle traffic on affected sections.'),
((select id from assets where asset_id='HFW-HSP-00006'), '2026-09-01', 'Dr. S. N. Trivedi', 'Civil Surgeon', 'Fair', null, 'Building structurally sound. Cosmetic damage in outpatient block. Elevator requires attention. Water leakage repaired in Ward-3.', 'Plan comprehensive maintenance before next monsoon.'),
((select id from assets where asset_id='EDU-SCH-00007'), '2026-07-20', 'Smt. K. Joshi', 'Deputy DEO', 'Poor', null, 'Roof tiles damaged. Walls showing dampness. Electrical wiring exposed in 2 classrooms. Playground surface uneven.', 'Urgent roof repair. Complete rewiring of affected classrooms.'),
((select id from assets where asset_id='RNB-FLY-00010'), '2026-09-10', 'Shri A. K. Chauhan', 'Bridge Engineer', 'Excellent', null, 'Recently completed flyover. All joints, bearings, and expansion gaps in perfect condition. Road marking clear.', 'Schedule first routine inspection after 12 months.'),
((select id from assets where asset_id='RNB-BRG-00015'), '2026-08-25', 'Shri D. P. Raval', 'Bridge Inspector', 'Good', null, 'Bridge deck in good condition. Pier foundations stable. Minor vegetation growth on abutments.', 'Clear vegetation. Apply protective coating on exposed steel.');

-- ============================================================
-- DEMO DATA — Complaints
-- ============================================================
insert into complaints(complaint_id, citizen_name, citizen_email, citizen_phone, issue_type, description, location_text, latitude, longitude, priority, status, assigned_to, assigned_department_id) values
('CMP-2026-001', 'Ramesh Kumar', 'ramesh@demo.test', '+91-9876543001', 'Pothole', 'Large pothole on main road near school entrance. Very dangerous for children.', 'Near Sardar Patel School, SG Highway, Ahmedabad', 23.0301, 72.5282, 'High', 'Work Started', 'Maintenance Wing, Ahmedabad', (select id from departments where code='RNB')),
('CMP-2026-002', 'Priti Shah', 'priti@demo.test', '+91-9876543002', 'Water Logging', 'Severe waterlogging after every rain. Water enters ground floor shops.', 'Vesu Circle, Surat', 21.1592, 72.7840, 'Critical', 'Assigned', 'Drainage Division, Surat', (select id from departments where code='RNB')),
('CMP-2026-003', 'Ajay Patel', 'ajay@demo.test', '+91-9876543003', 'Street Light', 'Street lights not working for past 2 weeks on entire stretch. Very dark at night.', 'Kalavad Road, Rajkot', 22.3102, 70.7885, 'Medium', 'Resolved', 'Electrical Division, Rajkot', (select id from departments where code='PWD')),
('CMP-2026-004', 'Meena Joshi', 'meena@demo.test', '+91-9876543004', 'Road Damage', 'Road surface completely damaged after pipeline work. Not restored for months.', 'Race Course Road, Vadodara', 22.3112, 73.1898, 'High', 'Inspection', 'EE, Vadodara', (select id from departments where code='RNB')),
('CMP-2026-005', 'Sunil Mehta', 'sunil@demo.test', '+91-9876543005', 'Bridge Damage', 'Guard stones missing on bridge approach. Accident risk at night.', 'Near Sabarmati Bridge, Ahmedabad', 23.0360, 72.5710, 'High', 'Received', 'Bridge Division, Ahmedabad', (select id from departments where code='RNB')),
('CMP-2026-006', 'Anita Desai', null, '+91-9876543006', 'Drainage', 'Open drain overflowing onto road. Causing health hazard and foul smell.', 'Tower Road, Navsari', 20.9480, 72.9535, 'Critical', 'Assigned', 'Drainage Wing, Navsari', (select id from departments where code='NWR')),
('CMP-2026-007', 'Kirit Solanki', 'kirit@demo.test', '+91-9876543007', 'Footpath Damage', 'Footpath tiles broken and uneven. Senior citizens tripping frequently.', 'Sabarmati Riverfront, Ahmedabad', 23.0280, 72.5690, 'Medium', 'Submitted', null, null),
('CMP-2026-008', 'Hema Trivedi', 'hema@demo.test', '+91-9876543008', 'Building Damage', 'Government hospital boundary wall collapsed. Debris on footpath.', 'Civil Hospital Road, Bhavnagar', 21.7610, 72.1508, 'Critical', 'Work Started', 'Maintenance Wing, Bhavnagar', (select id from departments where code='HFW')),
('CMP-2026-009', 'Vijay Chauhan', null, '+91-9876543009', 'Pothole', 'Multiple potholes near bus stand. Buses are getting damaged.', 'ST Bus Stand, Junagadh', 21.5195, 70.4602, 'High', 'Assigned', 'Maintenance Wing, Junagadh', (select id from departments where code='RNB')),
('CMP-2026-010', 'Kavita Raval', 'kavita@demo.test', '+91-9876543010', 'Encroachment', 'Footpath completely encroached by vendors. Pedestrians forced to walk on road.', 'MG Road, Junagadh', 21.5230, 70.4555, 'Medium', 'Received', null, (select id from departments where code='UDD')),
('CMP-2026-011', 'Dinesh Parmar', 'dinesh@demo.test', '+91-9876543011', 'Road Damage', 'Large trench cut across road for cable laying. Not filled properly.', 'Highway Road, Mehsana', 23.5900, 72.3710, 'High', 'Work Started', 'Maintenance Wing, Mehsana', (select id from departments where code='RNB')),
('CMP-2026-012', 'Lakshmi Nair', null, '+91-9876543012', 'Other', 'Public toilet near bus stand in very poor condition. No water supply.', 'Near ST Stand, Anand', 22.5630, 72.9270, 'Medium', 'Submitted', null, null),
('CMP-2026-013', 'Rohit Sharma', 'rohit@demo.test', '+91-9876543013', 'Pothole', 'Deep pothole near Bhuj-Mandvi road junction. Two-wheeler accident yesterday.', 'Bhuj-Mandvi Junction, Kutch', 23.2400, 69.6700, 'Critical', 'Assigned', 'Maintenance Wing, Kutch', (select id from departments where code='RNB')),
('CMP-2026-014', 'Fatima Begum', 'fatima@demo.test', '+91-9876543014', 'Water Logging', 'Entire area submerged after moderate rain. Drainage choked with silt.', 'Ring Road, Surat', 21.1750, 72.8350, 'Critical', 'Work Started', 'Drainage Division, Surat', (select id from departments where code='RNB')),
('CMP-2026-015', 'Ashwin Patel', 'ashwin@demo.test', '+91-9876543015', 'Street Light', 'Broken street light pole leaning dangerously over road.', 'Sector 10, Gandhinagar', 23.2170, 72.6380, 'Critical', 'Resolved', 'Electrical Division, Gandhinagar', (select id from departments where code='PWD'));

-- ============================================================
-- DEMO DATA — Audit Logs
-- ============================================================
insert into audit_logs(entity_type, entity_id, action, previous_value, new_value, performed_by, reason, created_at) values
('project', (select id from projects where project_id='PRJ-001'), 'Status changed', 'Approved', 'Under Construction', 'EE, Ahmedabad', 'Construction commenced', '2025-03-15 10:00:00+05:30'),
('project', (select id from projects where project_id='PRJ-001'), 'Budget updated', '0', '800000000', 'AE, Ahmedabad', 'RA Bill No. 1 processed', '2025-06-15 14:30:00+05:30'),
('project', (select id from projects where project_id='PRJ-001'), 'Budget updated', '800000000', '2000000000', 'AE, Ahmedabad', 'RA Bill No. 2 processed', '2025-10-20 11:15:00+05:30'),
('project', (select id from projects where project_id='PRJ-003'), 'Status changed', 'Under Construction', 'Completed', 'EE, Vadodara', 'Project completed within timeline', '2025-11-28 16:00:00+05:30'),
('asset', (select id from assets where asset_id='RNB-DR-00004'), 'Status changed', 'Operational', 'Under Maintenance', 'SE, Mehsana Circle', 'Road condition deteriorated post-monsoon', '2026-08-15 09:30:00+05:30'),
('asset', (select id from assets where asset_id='RNB-DR-00004'), 'Condition updated', 'Fair', 'Poor', 'SDE, Mehsana', 'Inspection revealed extensive damage', '2026-08-10 15:45:00+05:30'),
('project', (select id from projects where project_id='PRJ-006'), 'Status changed', 'Approved', 'Under Construction', 'EE, Bhavnagar', 'Emergency repairs commenced', '2026-07-01 08:00:00+05:30'),
('asset', (select id from assets where asset_id='HFW-HSP-00006'), 'Condition updated', 'Good', 'Fair', 'Hospital Maintenance', 'Post-monsoon inspection', '2026-09-01 12:00:00+05:30');

-- ============================================================
-- DONE — Schema ready for GovAssets
-- ============================================================
