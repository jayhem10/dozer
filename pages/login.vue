<template>
  <div
    class="flex items-center justify-center h-screen bg-blue-50 overflow-hidden"
  >
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-gray-800 text-center">Connexion</h1>
      <form @submit.prevent="login" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez votre email"
            autocomplete="current-username"
            required
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez votre mot de passe"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-sm text-red-600 text-center">
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Se connecter</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const login = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    console.error("Erreur de connexion :", error);
    errorMessage.value = "Email ou mot de passe incorrect.";
    isLoading.value = false;
    return;
  }

  const authStore = useAuthStore();
  await authStore.fetchUser();

  isLoading.value = false;
  navigateTo("/admin");
};
</script>

<style scoped>
.loader {
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
