<template>
  <div class="mb-10 p-4">
    <h2 class="text-2xl font-bold mb-4">Règles de l'enquête</h2>
    <div class="space-y-4 text-gray-600">
      <p>
        Cette enquête de satisfaction se déroule en deux étapes principales :
      </p>

      <div class="ml-4">
        <h3 class="font-semibold text-gray-800 mb-2">
          1. Pondération des critères
        </h3>
        <p>Vous devrez noter l'importance de chaque critère de 0 à 3 :</p>
        <ul class="list-disc ml-6 space-y-1">
          <li>0 - Pas important du tout</li>
          <li>1 - Peu important</li>
          <li>2 - Important</li>
          <li>3 - Très important</li>
        </ul>
      </div>

      <div class="ml-4">
        <h3 class="font-semibold text-gray-800 mb-2">
          2. Évaluation de satisfaction
        </h3>
        <p>Vous évaluerez votre satisfaction pour chaque critère de 1 à 10.</p>
      </div>

      <div class="bg-blue-50 p-4 rounded-md">
        <p class="font-semibold text-blue-800">Important :</p>
        <ul class="list-disc ml-6 text-blue-700">
          <li>Vos réponses resteront anonymes</li>
          <li>
            Le total des points de pondération doit être entre 102 et 103 points
          </li>
          <li>Prenez votre temps pour répondre sincèrement</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
