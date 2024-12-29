<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <div v-else-if="responses.length === 0" class="text-gray-600 text-center">
      Aucune réponse enregistrée pour cette enquête.
    </div>
    <div v-else class="space-y-6">
      <ResponseCard
        v-for="response in responses"
        :key="response.id"
        :response="response"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ResponseCard from "@/components/admin/ResponseCard.vue";

const props = defineProps({
  surveyId: {
    type: String,
    required: true,
  },
});
const { surveyId } = props;

const supabase = useSupabaseClient();
const responses = ref([]);
const isLoading = ref(true);

// Fetch responses based on the provided `surveyId`
onMounted(async () => {
  console.log("Survey ID in ResponseList:", surveyId); // Debugging to ensure `surveyId` is received

  try {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("survey_id", surveyId) // Use the prop `surveyId` to filter responses
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des réponses :", error);
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
