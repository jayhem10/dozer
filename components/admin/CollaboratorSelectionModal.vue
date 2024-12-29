<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl font-bold mb-4">Collaborateurs</h2>
      <p class="mb-4 text-sm text-gray-600">
        Sélectionnez les collaborateurs pour envoyer les clés d'accès :
      </p>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="flex items-center"
        >
          <input
            type="checkbox"
            v-model="selectedCollaborators"
            :value="collaborator.id"
            class="mr-2"
          />
          <span
            >{{ collaborator.first_name }} {{ collaborator.last_name }} ({{
              collaborator.email
            }})</span
          >
        </div>
      </div>
      <div class="flex justify-end mt-4 space-x-2">
        <button
          @click="closeModal"
          class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
        <button
          @click="continueWithoutKeys"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Continuer sans clés
        </button>
        <button
          @click="generateKeysAndSendEmails"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Générer et envoyer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import sendEmail from "@/utils/emailService";

// Define props
const props = defineProps({
  isOpen: Boolean,
  collaborators: Array,
  surveyId: String,
  surveyTitle: String,
});

console.log(collaborators, surveyId, surveyTitle, isOpen);
// Emit events
defineEmits(["close", "keysGenerated"]);

const selectedCollaborators = ref([]);

// Automatically select all collaborators when the modal opens
watch(
  () => collaborators,
  (newCollaborators) => {
    selectedCollaborators.value = newCollaborators.map((c) => c.id); // Select all by default
  },
  { immediate: true }
);

const closeModal = () => {
  selectedCollaborators.value = [];
  emit("close");
};

const continueWithoutKeys = () => {
  emit("close");
};

const generateKeysAndSendEmails = async () => {
  try {
    const keys = selectedCollaborators.value.map((collaboratorId) => {
      const collaborator = collaborators.find((c) => c.id === collaboratorId);
      return {
        key: crypto.randomUUID(),
        email: collaborator.email,
        survey_id: surveyId,
        collaborator_id: collaboratorId,
      };
    });

    // Save keys to the database
    const supabase = useSupabaseClient();
    const { error: dbError } = await supabase.from("access_keys").insert(keys);

    if (dbError) throw new Error("Error saving access keys to the database.");

    // Send emails
    for (const key of keys) {
      await sendEmail(key.email, surveyTitle, key.key);
    }

    emit("keysGenerated", keys);
    emit("close");
  } catch (err) {
    console.error("Error generating keys or sending emails:", err);
    alert(
      "Une erreur est survenue lors de l'envoi des emails. Veuillez réessayer."
    );
  }
};
</script>
