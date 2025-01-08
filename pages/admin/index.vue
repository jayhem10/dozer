<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Tableau de bord Admin</h1>
      <button
        @click="logout"
        class="py-2 px-4 rounded font-bold text-white shadow transition transform hover:scale-105 bg-gradient-to-r from-pink-500 to-red-500"
      >
        Déconnexion
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        @click="navigate('/admin/surveys')"
        class="p-4 rounded-md shadow cursor-pointer transition transform hover:scale-105 bg-gradient-to-r from-blue-400 to-blue-500"
      >
        <h2 class="text-xl font-semibold text-white">Gestion des sondages</h2>
        <p class="text-sm text-white">
          Créer, modifier et consulter vos sondages.
        </p>
      </div>

      <div
        @click="navigate('/admin/results')"
        class="p-4 rounded-md shadow cursor-pointer transition transform hover:scale-105 bg-gradient-to-r from-green-400 to-teal-500"
      >
        <h2 class="text-xl font-semibold text-white">Résultats</h2>
        <p class="text-sm text-white">Consulter les résultats des sondages.</p>
      </div>

      <div
        @click="navigate('/admin/collaborators')"
        class="p-4 rounded-md shadow cursor-pointer transition transform hover:scale-105 bg-gradient-to-r from-yellow-400 to-yellow-500"
      >
        <h2 class="text-xl font-semibold text-white">Collaborateurs</h2>
        <p class="text-sm text-white">Gérer les collaborateurs.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";

const supabase = useSupabaseClient();

const logout = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};

const navigate = (route: string) => {
  navigateTo(route);
};
</script>
