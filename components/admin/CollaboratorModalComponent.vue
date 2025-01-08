<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
  >
    <div class="bg-white p-6 rounded-md shadow-lg min-w-96">
      <h2 class="text-lg font-bold mb-4">Ajouter un collaborateur</h2>
      <form @submit.prevent="onSubmit">
        <div class="mb-4">
          <label for="firstName" class="block text-sm font-medium text-gray-700"
            >Prénom</label
          >
          <input
            id="firstName"
            v-model="collaborator.first_name"
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div class="mb-4">
          <label for="lastName" class="block text-sm font-medium text-gray-700"
            >Nom</label
          >
          <input
            id="lastName"
            v-model="collaborator.last_name"
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            id="email"
            v-model="collaborator.email"
            type="email"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div class="flex justify-end space-x-4">
          <button
            @click="closeModal"
            type="button"
            class="bg-gradient-to-r from-red-300 to-red-500 text-white px-4 py-2 rounded-md shadow hover:from-red-400 hover:to-red-600 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-500 hover:to-blue-700 transition"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { Collaborator } from "@/types/collaborator";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  collaborator: {
    type: Object as () => Collaborator,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);

const closeModal = () => {
  emit("close");
};

const onSubmit = () => {
  emit("save", props.collaborator);
};
</script>
