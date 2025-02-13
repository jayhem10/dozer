import { defineStore } from "pinia";
import { SupabaseClient } from "@supabase/supabase-js";

export interface Collaborator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CollaboratorState {
  collaborators: Collaborator[];
  filteredCollaborators: Collaborator[];
  searchText: string;
  isLoading: boolean;
}

export const useCollaboratorStore = defineStore("collaborator", {
  state: (): CollaboratorState => ({
    collaborators: [],
    filteredCollaborators: [],
    searchText: "",
    isLoading: true,
  }),

  getters: {
    getFilteredCollaborators(state): Collaborator[] {
      if (!state.searchText) return state.collaborators;
      return state.collaborators.filter((collaborator) =>
        [collaborator.first_name, collaborator.last_name, collaborator.email]
          .join(" ")
          .toLowerCase()
          .includes(state.searchText.toLowerCase())
      );
    },
  },

  actions: {
    setSearchText(search: string): void {
      this.searchText = search;
    },

    async fetchCollaborators(): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      this.isLoading = true;
      try {
        const { data, error } = await client
          .from("collaborators")
          .select("*")
          .order("last_name", { ascending: true });

        if (error) {
          console.error(
            "Erreur lors de la récupération des collaborateurs :",
            error
          );
          throw error;
        }

        this.collaborators = data || [];
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des collaborateurs :",
          error
        );
      } finally {
        this.isLoading = false;
      }
    },

    async addCollaborator(
      newCollaborator: Omit<Collaborator, "id">
    ): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { error, data } = await client
          .from("collaborators")
          .insert([newCollaborator])
          .select()
          .single();

        if (error) {
          console.error("Erreur lors de l'ajout du collaborateur :", error);
          if (error.code === "23505") {
            throw new Error("Cet email est déjà utilisé.");
          } else {
            throw new Error("Erreur lors de l'ajout du collaborateur.");
          }
        }
        await this.fetchCollaborators();
      } catch (error) {
        console.error("Erreur lors de l'ajout du collaborateur :", error);
        throw error;
      }
    },

    async updateCollaborator(updatedCollaborator: Collaborator): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { error } = await client
          .from("collaborators")
          .update({
            first_name: updatedCollaborator.first_name,
            last_name: updatedCollaborator.last_name,
            email: updatedCollaborator.email,
          })
          .eq("id", updatedCollaborator.id);

        if (error) {
          console.error(
            "Erreur lors de la mise à jour du collaborateur :",
            error
          );
          if (error.code === "23505") {
            throw new Error("Cet email est déjà utilisé.");
          } else {
            throw new Error("Erreur lors de la mise à jour du collaborateur.");
          }
        }

        await this.fetchCollaborators();
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour du collaborateur :",
          error
        );
        throw error;
      }
    },

    async deleteCollaborator(id: string): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { error } = await client
          .from("collaborators")
          .delete()
          .eq("id", id);

        if (error) {
          console.error(
            "Erreur lors de la suppression du collaborateur :",
            error
          );
          throw new Error("Erreur lors de la suppression du collaborateur.");
        }

        await this.fetchCollaborators();
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du collaborateur :",
          error
        );
        throw error;
      }
    },

    clearSearch(): void {
      this.searchText = "";
    },
  },
});
