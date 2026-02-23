import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_STORE_SETTINGS, normalizeStoreSettings, StoreSettings } from "@/lib/store-settings";

const SETTINGS_ID = 1;
const SETTINGS_QUERY_KEY = ["store-settings"];

export const useStoreSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").eq("id", SETTINGS_ID).maybeSingle();

      if (error) {
        // During fresh setup or before migration, keep storefront working with defaults.
        if (error.code === "PGRST205" || error.message?.toLowerCase().includes("store_settings")) {
          return DEFAULT_STORE_SETTINGS;
        }

        throw error;
      }

      return normalizeStoreSettings(data as Partial<StoreSettings> | null);
    },
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StoreSettings) => {
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const upsertPayload = {
        ...payload,
        id: SETTINGS_ID,
        updated_by: userResult.user?.id ?? null,
      };

      const { data, error } = await supabase
        .from("store_settings")
        .upsert(upsertPayload, { onConflict: "id" })
        .select("*")
        .single();

      if (error) throw error;

      return normalizeStoreSettings(data as Partial<StoreSettings>);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, settings);
    },
  });
};
