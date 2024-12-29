<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Tableau de bord Admin</h1>
      <button
        @click="logout"
        class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Déconnexion
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        @click="navigate('/admin/surveys')"
        class="p-4 bg-blue-500 text-white rounded-md shadow cursor-pointer hover:bg-blue-600 transition"
      >
        <h2 class="text-xl font-semibold">Gestion des sondages</h2>
        <p class="text-sm">Créer, modifier et consulter vos sondages.</p>
      </div>
      <div
        @click="navigate('/admin/results')"
        class="p-4 bg-green-500 text-white rounded-md shadow cursor-pointer hover:bg-green-600 transition"
      >
        <h2 class="text-xl font-semibold">Résultats</h2>
        <p class="text-sm">Consulter les résultats des sondages.</p>
      </div>
      <div
        @click="navigate('/admin/collaborators')"
        class="p-4 bg-yellow-500 text-white rounded-md shadow cursor-pointer hover:bg-yellow-600 transition"
      >
        <h2 class="text-xl font-semibold">Collaborateurs</h2>
        <p class="text-sm">Gérer les collaborateurs</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();

const logout = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};

const navigate = (route) => {
  navigateTo(route);
};

definePageMeta({
  middleware: "auth",
});
</script>

<style scoped>
/* Add styles if needed */
</style>
