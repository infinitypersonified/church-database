import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcujstufttdwrgwlunva.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdWpzdHVmdHRkd3Jnd2x1bnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTY4MjksImV4cCI6MjA2MTYzMjgyOX0.kAULTT3yIonWT1qdGLT8uLPM2C4-UZdcl-cJYWFCh0w';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;