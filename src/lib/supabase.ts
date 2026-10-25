import { createClient } from '@supabase/supabase-js';

// Supabase credentials — anon key is safe to expose, protected by RLS
const supabaseUrl = 'https://jnulqcfkvzevzgczhxis.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWxxY2ZrdnpldnpnY3poeGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODQ0NTUsImV4cCI6MjA4OTc2MDQ1NX0.bzNFdJ96D-GOnhQjkQMIlve1Bl0uHt_5gNqwSMTi788';

// Always configured since values are hardcoded
export const isSupabaseConfigured = () => true;

// Singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our Public Resonance Wall
export interface ResonanceEntry {
  id: number;
  created_at: string;
  emoji: string;
  energy: string;
  tags: string[]; // Stored as JSONB or text array
}

// Types for Survey Responses
export interface SurveyResponse {
  response_id?: string; // UUID
  created_at?: string;
  locale?: string;
  duration_seconds?: number;
  user_agent?: string;
  age_group: string;
  work_status: string;
  work_status_other?: string;
  country_region: string;
  nd_self_id: string;
  nd_diagnosis: string;
  time_fragmentation: string;
  task_switch_effort: string;
  main_tools_todo_apps: boolean;
  main_tools_note_tools: boolean;
  main_tools_digital_calendar: boolean;
  main_tools_paper_planner: boolean;
  main_tools_chat_apps: boolean;
  main_tools_physical_reminders: boolean;
  main_tools_in_my_head: boolean;
  main_tools_other: boolean;
  main_tools_other_text?: string;
  system_resets_12m: string;
  satisfaction_0_10: number;
  nps_recommend_0_10: number;
  sla1_crumble_weeks: number;
  sla2_energy_on_system: number;
  sla3_wrong_brain_assumption: number;
  sla4_self_blame: number;
  sla5_shadow_systems: number;
  sla6_life_interruptions_vs_tools: number;
  sla7_rules_lead_to_collapse: number;
  chasing_system_freq: string;
  missed_due_system_freq: string;
  burden_vs_relief: string;
  tools_work_why?: string;
}
