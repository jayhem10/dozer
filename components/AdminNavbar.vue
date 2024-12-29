<template>
  <aside
    :class="{ 'w-80': isSidebarOpen, 'w-24': !isSidebarOpen }"
    class="fixed h-screen bg-white border-r shadow-sm flex flex-col justify-between transition-all duration-300"
  >
    <!-- Sidebar Content -->
    <div class="flex flex-col h-full">
      <!-- Admin App Name -->
      <div class="p-4 text-center border-b border-gray-200">
        <h1
          :class="{
            'text-xl font-bold': isSidebarOpen,
            'text-lg font-bold': !isSidebarOpen,
          }"
          class="text-gray-700 cursor-pointer"
          @click="navigate('/admin')"
        >
          Echo
        </h1>
        <h2 v-if="isSidebarOpen" class="text-sm text-gray-500">Admin</h2>
      </div>

      <!-- Admin Navigation -->
      <ul class="text-center space-y-4 mt-6">
        <li>
          <div
            v-if="!isSidebarOpen"
            v-tippy="{ content: 'Sondages', placement: 'right' }"
          >
            <button
              @click="navigate('/admin/surveys')"
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
            @click="navigate('/admin/surveys')"
            class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <font-awesome-icon
              :icon="['fas', 'clipboard-list']"
              class="mr-2 text-xl"
            />
            <span class="flex-1 text-left">Sondages</span>
          </button>
        </li>
        <li>
          <div
            v-if="!isSidebarOpen"
            v-tippy="{ content: 'Résultats', placement: 'right' }"
          >
            <button
              @click="navigate('/admin/results')"
              class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon
                :icon="['fas', 'chart-bar']"
                class="mx-auto text-2xl"
              />
            </button>
          </div>
          <button
            v-else
            @click="navigate('/admin/results')"
            class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <font-awesome-icon
              :icon="['fas', 'chart-bar']"
              class="mr-2 text-xl"
            />
            <span class="flex-1 text-left">Résultats</span>
          </button>
        </li>
        <li>
          <div
            v-if="!isSidebarOpen"
            v-tippy="{ content: 'Collaborateurs', placement: 'right' }"
          >
            <button
              @click="navigate('/admin/collaborators')"
              class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon
                :icon="['fas', 'users']"
                class="mx-auto text-2xl"
              />
            </button>
          </div>
          <button
            v-else
            @click="navigate('/admin/collaborators')"
            class="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'users']" class="mr-2 text-xl" />
            <span class="flex-1 text-left">Collaborateurs</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Logout, Back, and Toggle Buttons -->
    <div class="p-4 border-t border-gray-200 text-center space-y-4">
      <div
        v-if="!isSidebarOpen"
        v-tippy="{ content: 'Retour', placement: 'right' }"
      >
        <button
          @click="goBack"
          class="flex items-center w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded transition-colors"
        >
          <font-awesome-icon
            :icon="['fas', 'arrow-left']"
            class="mx-auto text-2xl"
          />
        </button>
      </div>
      <button
        v-else
        @click="goBack"
        class="flex items-center w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2 text-xl" />
        <span class="flex-1 text-left">Retour</span>
      </button>

      <!-- Toggle Button -->
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

      <div
        v-if="!isSidebarOpen"
        v-tippy="{ content: 'Déconnexion', placement: 'right' }"
      >
        <button
          @click="logout"
          class="flex items-center w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded transition-colors"
        >
          <font-awesome-icon
            :icon="['fas', 'sign-out-alt']"
            class="mx-auto text-2xl"
          />
        </button>
      </div>
      <button
        v-else
        @click="logout"
        class="flex items-center w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded transition-colors"
      >
        <font-awesome-icon
          :icon="['fas', 'sign-out-alt']"
          class="mr-2 text-xl"
        />
        <span class="flex-1 text-left">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps(["isSidebarOpen"]);
defineEmits(["toggle"]);

const supabase = useSupabaseClient();
const router = useRouter();

const navigate = (route) => {
  navigateTo(route);
};

const logout = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};

const goBack = () => {
  router.back();
};
</script>
