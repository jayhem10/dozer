<template>
  <aside
    :class="{ 'w-80': isSidebarOpen, 'w-24': !isSidebarOpen }"
    class="fixed h-screen bg-gray-900 text-white shadow-lg flex flex-col justify-between transition-all duration-300"
  >
    <div class="flex flex-col h-full">
      <div class="p-4 text-center border-b border-gray-700">
        <h1
          :class="{
            'text-xl font-bold': isSidebarOpen,
            'text-lg font-bold': !isSidebarOpen,
          }"
          class="cursor-pointer text-white"
          @click="goToStep(1, '/')"
        >
          Dozer
        </h1>
      </div>

      <ul class="mt-6 space-y-1">
        <li v-for="link in navLinks" :key="link.path" class="group">
          <div
            v-if="!isSidebarOpen"
            v-tippy="{ content: link.label, placement: 'right' }"
          >
            <button
              @click="goToStep(link.step, link.path)"
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
            @click="goToStep(link.step, link.path)"
            class="flex items-center px-4 py-3 w-full rounded-md group-hover:bg-gray-800 transition-colors"
          >
            <font-awesome-icon
              :icon="link.icon"
              class="text-xl text-gray-300 group-hover:text-white"
            />
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
        v-tippy="{ content: 'Réduire/Agrandir', placement: 'right' }"
      >
        <button
          @click="$emit('toggle')"
          class="w-full flex items-center justify-center h-12 rounded-md bg-gradient-to-r from-teal-500 to-green-500 hover:scale-105 transform transition"
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
          class="w-full flex items-center h-12 rounded-md bg-gradient-to-r from-teal-500 to-green-500 hover:scale-105 transform transition px-4"
        >
          <font-awesome-icon
            :icon="['fas', 'arrows-alt-h']"
            class="mr-2 text-xl text-white"
          />
          <span class="text-white font-bold">Réduire</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSurveyStore } from "@/stores/survey";
import { navigateTo } from "nuxt/app";
import { ref } from "vue";

defineProps(["isSidebarOpen"]);
defineEmits(["toggle"]);

const store = useSurveyStore();

const navLinks = ref([
  {
    label: "Sondage",
    path: "/",
    icon: ["fas", "clipboard-list"],
    step: 1,
  },
  {
    label: "Admin",
    path: "/admin",
    icon: ["fas", "cogs"],
    step: 0,
  },
]);

const goToStep = (step, route) => {
  store.currentStep = step;
  navigateTo(route);
};
</script>
