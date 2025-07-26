
// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwgwnblusqjcfmktlngv.supabase.co'; // ✅ REPLACE THIS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Z3duYmx1c3FqY2Zta3Rsbmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTQyMzAsImV4cCI6MjA2OTAzMDIzMH0.2N-mBPQa_NMAynw1mCWYm6ul_tvJ7opzmM0UTQ_9Mx0'; // ✅ REPLACE THIS

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
