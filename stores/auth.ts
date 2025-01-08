import { defineStore } from "pinia";
import { User } from "@supabase/supabase-js";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const supabase = useSupabaseClient();

  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!user.value?.email);

  const fetchUser = async (): Promise<void> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      user.value = null;
      return;
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
        user.value = null;
        return;
      }
      user.value = data?.user || null;
    } catch (err) {
      console.error("Erreur inattendue lors de fetchUser :", err);
      user.value = null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      user.value = null;
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    } finally {
      navigateTo("/");
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return {
    user,
    isAuthenticated,
    fetchUser,
    logout,
  };
});
