<template>
  <aside
    :class="{ 'w-80': isSidebarOpen, 'w-24': !isSidebarOpen }"
    class="fixed h-screen bg-white border-r shadow-sm flex flex-col justify-between transition-all duration-300"
  >
    <!-- Sidebar Content -->
    <div class="flex flex-col h-full">
      <!-- App Name -->
      <div class="p-4 text-center border-b border-gray-200">
        <h1
          :class="{
            'text-xl font-bold': isSidebarOpen,
            'text-lg font-bold': !isSidebarOpen,
          }"
          class="text-gray-700 cursor-pointer"
          @click="goToStep(1, '/')"
        >
          Echo
        </h1>
      </div>

      <!-- Navigation Links -->
      <ul class="text-center space-y-4 mt-6">
        <li>
          <div
            v-tippy="{ content: 'Sondage', placement: 'right' }"
            v-if="!isSidebarOpen"
          >
            <button
              @click="goToStep(1, '/')"
              class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon
                :icon="['fas', 'clipboard-list']"
                class="mx-auto text-2xl"
              />
            </button>
          </div>
          <button
            v-else
            @click="goToStep(1, '/')"
            class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'clipboard-list']" class="mr-2" />
            <span class="flex-1 text-left">Sondage</span>
          </button>
        </li>
        <li>
          <div
            v-tippy="{ content: 'Admin', placement: 'right' }"
            v-if="!isSidebarOpen"
          >
            <button
              @click="goToStep(0, '/admin')"
              class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon
                :icon="['fas', 'cogs']"
                class="mx-auto text-2xl"
              />
            </button>
          </div>
          <button
            v-else
            @click="goToStep(0, '/admin')"
            class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'cogs']" class="mr-2" />
            <span class="flex-1 text-left">Admin</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Score -->
    <div class="p-4 text-center border-t border-gray-200">
      <p
        v-if="store.totalPoints !== null"
        :class="[
          store.totalPoints > 0 && !store.isValidPoints
            ? 'text-red-500'
            : store.isValidPoints
            ? 'text-green-500'
            : 'text-black',
          isSidebarOpen ? 'text-lg font-bold' : 'text-sm font-bold',
        ]"
      >
        Score: {{ store.totalPoints.toFixed(2) || 0 }}
      </p>
    </div>

    <!-- Toggle Button -->
    <div class="p-4 border-t border-gray-200 text-center">
      <div
        v-if="!isSidebarOpen"
        v-tippy="{ content: 'Réduire/Agrandir', placement: 'right' }"
      >
        <button
          @click="$emit('toggle')"
          class="flex items-center w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded transition-colors"
        >
          <font-awesome-icon
            :icon="['fas', 'arrows-alt-h']"
            class="mx-auto text-2xl"
          />
        </button>
      </div>
      <button
        v-else
        @click="$emit('toggle')"
        class="flex items-center w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded transition-colors"
      >
        <font-awesome-icon
          :icon="['fas', 'arrows-alt-h']"
          class="mr-2 text-xl"
        />
        <span class="flex-1 text-left">{{
          isSidebarOpen ? "Réduire" : "Agrandir"
        }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useSurveyStore } from "@/stores/survey";

const store = useSurveyStore();
defineProps(["isSidebarOpen"]);
defineEmits(["toggle"]);

const goToStep = (step, route) => {
  store.currentStep = step;
  navigateTo(route);
};
</script>
