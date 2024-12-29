<template>
  <div>
    <p class="mb-4 text-gray-600">
      Veuillez entrer la clé pour commencer le sondage :
    </p>
    <input
      v-model="keyInput"
      type="text"
      placeholder="Entrez votre clé"
      class="w-full border rounded px-4 py-2 mb-4"
    />
    <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

    <div class="flex justify-end">
      <button
        :disabled="!keyInput"
        @click="validateKey"
        class="px-6 py-2 rounded text-white font-bold transition-all"
        :class="{
          'bg-blue-600 hover:bg-blue-700': keyInput,
          'bg-gray-400 cursor-not-allowed': !keyInput,
        }"
      >
        Valider la clé
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const supabase = useSupabaseClient();
const store = useSurveyStore();

const keyInput = ref("");
const errorMessage = ref("");

const validateKey = async () => {
  try {
    const { data, error } = await supabase
      .from("access_keys")
      .select(
        `
        id,
        key,
        is_used,
        survey:surveys (is_active)
      `
      )
      .eq("key", keyInput.value)
      .single();

    if (error || !data) {
      errorMessage.value = "Clé invalide ou sondage inactif.";
      return;
    }

    const { id, is_used, survey } = data;

    if (is_used) {
      errorMessage.value = "Cette clé a déjà été utilisée.";
    } else if (!survey.is_active) {
      errorMessage.value = "Le sondage associé à cette clé est inactif.";
    } else {
      store.setAccessKey(id); // Save key in the store
      store.nextStep();
    }
  } catch (err) {
    console.error(err);
    errorMessage.value = "Une erreur est survenue. Veuillez réessayer.";
  }
};
</script>
