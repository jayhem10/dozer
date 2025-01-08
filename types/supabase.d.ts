declare module "#supabase" {
  import { SupabaseClient } from "@supabase/supabase-js";

  export const useSupabaseClient: () => SupabaseClient;
  export const useSupabaseUser: () => any;
  export const useSupabaseAuth: () => any;
}
