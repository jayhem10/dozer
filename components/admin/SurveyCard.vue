<template>
  <div
    class="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-lg transition"
    @click="$emit('click')"
  >
    <h2 class="text-xl font-semibold mb-2">{{ survey.title }}</h2>
    <p class="text-gray-600">{{ survey.description }}</p>
    <p v-if="survey.is_active" class="text-green-500 font-bold mt-2">Active</p>
    <p v-else class="text-red-500 font-bold mt-2">Inactive</p>
  </div>
</template>

<script setup>
defineProps(["survey"]);
</script>
