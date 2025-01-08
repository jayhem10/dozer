<template>
  <div class="h-screen bg-blue-50 flex overflow-hidden">
    <Navbar
      v-if="!authStore.isAuthenticated"
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
      class="flex-1 overflow-auto"
    >
      <div class="max-w-4xl mx-auto">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Navbar from "@/components/Navbar.vue";
import AdminNavbar from "@/components/AdminNavbar.vue";
import { useAuthStore } from "@/stores/auth";

const isSidebarOpen = ref(true);
const authStore = useAuthStore();

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>
