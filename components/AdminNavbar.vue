<template>
  <aside
    :class="{ 'w-80': isSidebarOpen, 'w-24': !isSidebarOpen }"
    class="fixed h-screen bg-gray-900 text-white flex flex-col justify-between shadow-md transition-all duration-300"
  >
    <div class="flex flex-col h-full">
      <div class="p-4 text-center border-b border-gray-700">
        <h1
          :class="{
            'text-xl font-bold': isSidebarOpen,
            'text-lg font-bold': !isSidebarOpen,
          }"
          class="cursor-pointer text-white"
          @click="navigateTo('/admin')"
        >
          Dozer
        </h1>
        <h2 v-if="isSidebarOpen" class="text-sm text-gray-400">Admin</h2>
      </div>

      <ul class="mt-6 space-y-1">
        <li v-for="link in navLinks" :key="link.path" class="group">
          <div
            v-if="!isSidebarOpen"
            v-tippy="{ content: link.label, placement: 'right' }"
          >
            <button
              @click="navigateTo(link.path)"
              class="w-full flex items-center justify-center h-12 transition-colors rounded-md group-hover:bg-gray-800"
            >
              <font-awesome-icon
                :icon="link.icon"
                class="text-2xl text-gray-300 group-hover:text-white"
              />
            </button>
          </div>
          <button
            v-else
            @click="navigateTo(link.path)"
            class="flex items-center px-4 py-3 w-full rounded-md group-hover:bg-gray-800 transition-colors"
          >
            <span class="flex items-center min-w-[24px] justify-center">
              <font-awesome-icon
                :icon="link.icon"
                class="text-xl text-gray-300 group-hover:text-white"
              />
            </span>
            <span class="ml-4 text-gray-300 group-hover:text-white">{{
              link.label
            }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="p-4 border-t border-gray-700">
      <div
        v-if="!isSidebarOpen"
        v-tippy="{
          content: isSidebarOpen ? 'Réduire' : 'Agrandir',
          placement: 'right',
        }"
      >
        <button
          @click="$emit('toggle')"
          class="w-full flex items-center justify-center h-12 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 transform transition"
        >
          <font-awesome-icon
            :icon="['fas', 'arrows-alt-h']"
            class="text-xl text-white"
          />
        </button>
      </div>
      <div v-else>
        <button
          @click="$emit('toggle')"
          class="w-full flex items-center h-12 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 transform transition px-4"
        >
          <font-awesome-icon
            :icon="['fas', 'arrows-alt-h']"
            class="mr-2 text-xl text-white"
          />
          <span class="text-white font-bold">Réduire</span>
        </button>
      </div>

      <div
        v-if="!isSidebarOpen"
        v-tippy="{ content: 'Déconnexion', placement: 'right' }"
      >
        <button
          @click="logout"
          class="w-full flex items-center justify-center h-12 mt-4 rounded-md bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 transform transition"
        >
          <font-awesome-icon
            :icon="['fas', 'sign-out-alt']"
            class="text-xl text-white"
          />
        </button>
      </div>
      <div v-else>
        <button
          @click="logout"
          class="w-full flex items-center h-12 mt-4 rounded-md bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 transform transition px-4"
        >
          <font-awesome-icon
            :icon="['fas', 'sign-out-alt']"
            class="mr-2 text-xl text-white"
          />
          <span class="text-white font-bold">Déconnexion</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { logout } = useAuthStore();

defineProps(["isSidebarOpen"]);
defineEmits(["toggle"]);

const navLinks = ref([
  { label: "Sondage", path: "/", icon: ["fas", "clipboard"] },
  {
    label: "Sondages",
    path: "/admin/surveys",
    icon: ["fas", "clipboard-list"],
  },
  { label: "Résultats", path: "/admin/results", icon: ["fas", "chart-bar"] },
  {
    label: "Collaborateurs",
    path: "/admin/collaborators",
    icon: ["fas", "users"],
  },
]);

const navigateTo = (path) => {
  window.location.href = path;
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
