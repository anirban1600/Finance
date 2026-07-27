// config.js
// -----------------------------------------------------------------------
// This file is loaded directly in the browser (see index.html), so only
// PUBLIC values belong here: the Supabase project URL and the ANON key.
// The anon key is designed by Supabase to be public — access is controlled
// by Row Level Security (RLS) policies on the database side, not by hiding
// this key. NEVER put your Supabase "service_role" key here or anywhere
// that ships to the browser — that key bypasses RLS entirely and must only
// be used inside the /api serverless functions (via environment variables).
// -----------------------------------------------------------------------

const SUPABASE_URL = 'https://ttuagnghqirmekptaeai.supabase.co';
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocmJ0Zmp5YXJxaWV1aG1iYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzA0NzIsImV4cCI6MjEwMDc0NjQ3Mn0.HxUgWsO6t1QHfhS3aW5s74c5wKniB_E4nqRP0-NIWXg;

// Requires the Supabase JS SDK to be loaded first (see the <script> tag
// in index.html that loads it from unpkg before this file).
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Saves a visitor's details as a new row in the "leads" table.
 * Only INSERT is allowed for the anon key (see schema.sql RLS policy) —
 * so this key can never be used to read, edit, or delete existing leads.
 */
async function saveLead(lead) {
  const { data, error } = await supabaseClient
    .from('leads')
    .insert([{
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      age: lead.age || null,
      income: lead.income || null,
      expenses: lead.expenses || null,
      goal: lead.goal || null,
      risk: lead.risk || null
    }])
    .select('id')
    .single();

  if (error) throw new Error(error.message || 'Could not save your details.');
  return data.id;
}
