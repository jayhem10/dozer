<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold">Sondage</h1>
    <p class="text-lg mt-10">
      Veuillez cliquer sur le lien que vous avez reçu par email pour accéder au
      sondage.
    </p>
    <p>Pour plus d'informations, veuillez contacter le pôle RH.</p>
    <button
      class="text-white p-4 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 mt-10"
      @click="goToHome"
    >
      Accueil
    </button>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";

const goToHome = () => {
  navigateTo("/");
};
</script>
