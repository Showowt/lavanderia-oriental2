import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST: Create admin user
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const body = await request.json();
    const email = body.email || 'admin@lavanderiaoriental.com';
    const password = body.password || 'LavanderiaAdmin2024!';

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      // If user already exists, return success
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({
          success: true,
          message: 'User already exists',
          email,
          note: 'Use this email and your password to login'
        });
      }
      throw authError;
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email,
      password: password,
      userId: authData.user?.id,
      note: 'Save these credentials! You can now login at /login'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create user'
    }, { status: 500 });
  }
}

// GET: Check setup status
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'public' },
  });

  try {
    // Check if employees table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('employees')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST205') {
      // Table doesn't exist - we need to create it via SQL
      // Unfortunately we can't run raw SQL via the JS client
      // Return instructions
      return NextResponse.json({
        status: 'table_missing',
        message: 'Employees table does not exist. Please run the SQL below in Supabase SQL Editor.',
        sql: `-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/scfgxnjqqdcpyjttxlxo/sql)

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  auth_id uuid NOT NULL UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_employees_auth_id ON public.employees(auth_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees are viewable by authenticated users"
  ON public.employees FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage employees"
  ON public.employees FOR ALL
  USING (true);

-- Add your admin user (replace with your auth UUID from Supabase Auth dashboard)
INSERT INTO public.employees (auth_id, email, name, role)
VALUES (
  '2829f29b-dc6d-4654-9bd2-d2ddc8cbda43',
  'xclusive0516@yahoo.com',
  'Administrator',
  'admin'
);`
      });
    }

    // Table exists - check if there are any employees
    const { data: employees, error: listError } = await supabase
      .from('employees')
      .select('id, email, name, role')
      .limit(10);

    if (listError) {
      return NextResponse.json({
        status: 'error',
        error: listError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ready',
      message: 'Employees table exists',
      employees: employees || [],
      count: employees?.length || 0
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
