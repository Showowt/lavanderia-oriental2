-- =============================================
-- EMPLOYEES TABLE - Links Supabase Auth to roles
-- Run this in Supabase SQL Editor
-- =============================================

-- Employees table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  auth_id uuid NOT NULL UNIQUE, -- References auth.users.id
  email varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  phone varchar(50),
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_auth_id ON public.employees(auth_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policy - authenticated users can read employees
CREATE POLICY "Employees are viewable by authenticated users"
  ON public.employees FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete employees
CREATE POLICY "Admins can manage employees"
  ON public.employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.auth_id = auth.uid() AND e.role = 'admin'
    )
  );

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CREATE YOUR ADMIN USER
-- Replace with your actual email and Supabase Auth user ID
-- =============================================

-- First, go to Supabase Dashboard > Authentication > Users
-- Create a user with email: admin@lavanderiaoriental.com
-- Copy the user's UUID from the dashboard
-- Then run:

-- INSERT INTO public.employees (auth_id, email, name, role)
-- VALUES (
--   'YOUR-AUTH-USER-UUID-HERE',  -- From Supabase Auth dashboard
--   'admin@lavanderiaoriental.com',
--   'Administrador',
--   'admin'
-- );

-- Example employee:
-- INSERT INTO public.employees (auth_id, email, name, role, location_id)
-- SELECT
--   'EMPLOYEE-AUTH-UUID',
--   'empleado@lavanderiaoriental.com',
--   'Juan Empleado',
--   'employee',
--   id
-- FROM public.locations WHERE name LIKE '%Centro%' LIMIT 1;
