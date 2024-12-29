<template>
  <div class="max-w-4xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">Résultats de l'enquête ojnhojnojn</h2>
    <p class="text-gray-600 mb-6">Voici les réponses au sondage.</p>

    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Content -->
    <div v-else>
      <div v-if="responses.length === 0" class="text-gray-600 text-center">
        Aucune réponse enregistrée pour ce sondage.
      </div>

      <div v-else class="space-y-8">
        <div
          v-for="response in responses"
          :key="response.id"
          class="p-4 bg-white shadow rounded-md"
        >
          <h3 class="font-semibold mb-2">
            Réponse {{ response.id }} - {{ response.submitted_at }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Weights -->
            <div>
              <h4 class="font-bold text-gray-700 mb-2">Pondérations</h4>
              <ul class="list-disc list-inside text-gray-600">
                <li
                  v-for="(value, question) in response.answers.weights"
                  :key="question"
                >
                  {{ question }}: {{ value }}
                </li>
              </ul>
            </div>

            <!-- Ratings -->
            <div>
              <h4 class="font-bold text-gray-700 mb-2">Évaluations</h4>
              <ul class="list-disc list-inside text-gray-600">
                <li
                  v-for="(value, question) in response.answers.ratings"
                  :key="question"
                >
                  {{ question }}: {{ value }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const supabase = useSupabaseClient();
const isLoading = ref(true);
const responses = ref<any[]>([]);

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from("responses")
      .select("id, submitted_at, answers")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des réponses:", error);
    } else {
      responses.value = data || [];
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
