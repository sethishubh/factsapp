import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iwezvvakdtlojvejccgi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXp2dmFrZHRsb2p2ZWpjY2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyMDE5NzMsImV4cCI6MjAxMDc3Nzk3M30.Of-LZf8LbItU1iGnrlw_aG_LTP40QK1its1ADC3Pw0M";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
