<template>
  <div class="min-h-screen bg-blue-50 flex">
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
const user = useSupabaseUser();

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const isAdmin = computed(() => !!user.value);
</script>
