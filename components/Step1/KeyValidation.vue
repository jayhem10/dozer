<template>
  <div>
    <div v-if="isValidating" class="text-center text-2xl font-bold">
      Validation de la clé en cours...
    </div>
    <div v-else-if="validationError" class="text-center text-red-500">
      <div class="flex justify-center items-center mb-4 text-xl">
        {{ validationError }}
      </div>
      <div class="flex justify-center items-center">
        <button
          @click="goToHome"
          class="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded mt-4 hover:scale-105 transform transition"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>

    <div
      v-else-if="keyData && !keyData.is_used && keyData.survey.is_active"
      class="text-center"
    >
      <button
        @click="proceedToSurvey"
        class="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded"
      >
        Accéder au sondage
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { navigateTo } from "nuxt/app";
interface KeyData {
  id: string;
  key: string;
  is_used: boolean;
  survey: {
    is_active: boolean;
  };
}

const props = defineProps<{
  surveyKey: string;
}>();

const supabase = useSupabaseClient();
const store = useSurveyStore();

const isValidating = ref(true);
const keyData = ref<KeyData | null>(null);
const validationError = ref<string>("");

onMounted(async () => {
  await validateKey();
});

async function validateKey() {
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
      .eq("key", props.surveyKey)
      .single();

    if (error) {
      validationError.value = "Clé invalide ou sondage inactif.";
      return;
    }

    keyData.value = data;

    if (data.is_used) {
      validationError.value = "Cette clé a déjà été utilisée.";
    } else if (!data.survey.is_active) {
      validationError.value = "Le sondage associé à cette clé est inactif.";
    }
  } catch (err) {
    console.error(err);
    validationError.value = "Une erreur est survenue. Veuillez réessayer.";
  } finally {
    isValidating.value = false;
  }
}

const proceedToSurvey = () => {
  if (keyData.value) {
    store.setAccessKeyId(keyData.value.id);
    store.nextStep();
  }
};

const goToHome = () => {
  navigateTo("/");
};
</script>
