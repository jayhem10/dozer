<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-2xl w-full p-6">
      <div class="flex items-center justify-center">
        <div>
          <h1 class="text-2xl md:text-7xl font-bold text-center">
            DOZER x QANTIS
          </h1>
          <p class="text-center text-gray-500 my-4">
            Application de sondage made in Qantis
          </p>
        </div>
      </div>
      <div class="mt-10 text-gray-600">
        <p class="text-justify">
          Bienvenue sur <strong>DOZER by QANTIS</strong>, l'application de
          sondage interne développée par Qantis pour recueillir vos avis en
          toute simplicité et confidentialité.
        </p>
        <ul class="mt-4 space-y-4">
          <li class="flex gap-3 items-start">
            <font-awesome-icon
              :icon="['fas', 'user-secret']"
              class="text-blue-600 mt-1"
            />
            <div>
              <strong>Anonyme</strong> :
              <span class="text-justify"
                >Vos réponses restent strictement confidentielles.</span
              >
            </div>
          </li>
          <li class="flex gap-3 items-start">
            <font-awesome-icon
              :icon="['fas', 'shield-alt']"
              class="text-red-600 mt-1"
            />
            <div>
              <strong>Sécurisé</strong> :
              <span class="text-justify"
                >Protection avancée des données pour une totale tranquillité
                d'esprit.</span
              >
            </div>
          </li>
          <li class="flex gap-3 items-start">
            <font-awesome-icon
              :icon="['fas', 'bolt']"
              class="text-yellow-600 mt-1"
            />
            <div>
              <strong>Rapide & Intuitif</strong> :
              <span class="text-justify"
                >Répondez en quelques clics et contribuez à l'amélioration
                continue de votre environnement.</span
              >
            </div>
          </li>
        </ul>
        <p class="mt-4 font-bold text-justify">
          <font-awesome-icon
            :icon="['fas', 'bullhorn']"
            class="text-green-600 mr-2"
          />
          Votre voix compte ! Participez aux sondages et faites entendre vos
          idées et vos ressentis en toute confiance.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>
