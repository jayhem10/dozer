<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Navbar -->
    <Navbar
      v-if="!isAdmin"
      :isSidebarOpen="isSidebarOpen"
      @toggle="toggleSidebar"
    />
    <AdminNavbar
      v-else
      :isSidebarOpen="isSidebarOpen"
      @toggle="toggleSidebar"
    />

    <main
      :class="{ 'ml-64': isSidebarOpen, 'ml-20': !isSidebarOpen }"
      class="flex-1"
    >
      <div class="max-w-4xl mx-auto py-8">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Navbar from "@/components/Navbar.vue";
import AdminNavbar from "@/components/AdminNavbar.vue";

const isSidebarOpen = ref(true);
const user = useSupabaseUser(); // Récupère l'utilisateur connecté

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Vérifie si l'utilisateur est admin (ou simplement connecté)
const isAdmin = computed(() => !!user.value);
</script>
