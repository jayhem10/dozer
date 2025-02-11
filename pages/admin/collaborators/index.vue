<template>
  <div class="max-w-4xl mx-auto p-6 mt-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Collaborateurs</h1>
      <div class="flex space-x-4">
        <button
          v-tippy="'Exporter en CSV'"
          @click="exportToCSV"
          class="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md shadow hover:from-green-500 hover:to-green-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'file-export']" />
          Exporter les collaborateurs
        </button>
        <button
          v-tippy="'Ajouter un collaborateur'"
          @click="openAddModal"
          class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-500 hover:to-blue-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <button
          v-tippy="'Retour'"
          @click="backToAdmin"
          class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else>
      <div class="relative mb-6">
        <input
          v-model="searchText"
          type="text"
          placeholder="Rechercher par prénom, nom ou email"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          v-if="searchText"
          @click="clearSearch"
          class="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <table
        class="w-full border-collapse border border-gray-300 rounded-md shadow bg-white"
      >
        <thead class="bg-gray-900 text-white">
          <tr>
            <th class="border border-gray-300 px-4 py-2">Prénom</th>
            <th class="border border-gray-300 px-4 py-2">Nom</th>
            <th class="border border-gray-300 px-4 py-2">Email</th>
            <th class="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="collaborator in filteredCollaborators"
            :key="collaborator.id"
            class="hover:bg-gray-100 transition"
          >
            <td class="border border-gray-300 px-4 py-2">
              <input
                v-model="collaborator.first_name"
                class="w-full px-2 py-1 border border-gray-300 rounded-md"
                @blur="updateCollaborator(collaborator)"
              />
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <input
                v-model="collaborator.last_name"
                class="w-full px-2 py-1 border border-gray-300 rounded-md"
                @blur="updateCollaborator(collaborator)"
              />
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <input
                v-model="collaborator.email"
                class="w-full px-2 py-1 border border-gray-300 rounded-md"
                @blur="updateCollaborator(collaborator)"
              />
            </td>
            <td class="border border-gray-300 px-4 py-2 text-center">
              <button
                @click="confirmDelete(collaborator.id)"
                v-tippy="'Supprimer'"
                class="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-md shadow hover:from-red-500 hover:to-red-700 transition"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CollaboratorModalComponent
      :isOpen="isAddModalOpen"
      :collaborator="newCollaborator"
      @close="isAddModalOpen = false"
      @save="addCollaborator"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import CollaboratorModalComponent from "@/components/admin/CollaboratorModalComponent.vue";
import { navigateTo } from "nuxt/app";
import { Collaborator } from "@/types/index";

const store = useCollaboratorStore();
const toast = useToast();

const isAddModalOpen = ref(false);
const newCollaborator = ref({ first_name: "", last_name: "", email: "" });

const searchText = computed({
  get: () => store.searchText,
  set: (value: string) => store.setSearchText(value),
});
const isLoading = computed(() => store.isLoading);
const filteredCollaborators = computed(() => store.getFilteredCollaborators);

onMounted(async () => {
  await store.fetchCollaborators();
});

interface ErrorWithMessage {
  message: string;
}

const addCollaborator = async () => {
  try {
    await store.addCollaborator(newCollaborator.value);
    isAddModalOpen.value = false;
    toast.success("Collaborateur ajouté avec succès !");
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    toast.error(err.message || "Erreur lors de l'ajout du collaborateur.");
  }
};

const updateCollaborator = async (collaborator: Collaborator) => {
  try {
    await store.updateCollaborator(collaborator);
    toast.success("Collaborateur mis à jour avec succès !");
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    toast.error(
      err.message || "Erreur lors de la mise à jour du collaborateur."
    );
  }
};

const confirmDelete = (id: string) => {
  Swal.fire({
    title: "Êtes-vous sûr ?",
    text: "Cette action est irréversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await store.deleteCollaborator(id);
        toast.success("Collaborateur supprimé avec succès !");
      } catch (error: unknown) {
        const err = error as ErrorWithMessage;
        toast.error(
          err.message || "Erreur lors de la suppression du collaborateur."
        );
      }
    }
  });
};

const clearSearch = () => {
  store.clearSearch();
};

const openAddModal = () => {
  newCollaborator.value = { first_name: "", last_name: "", email: "" };
  isAddModalOpen.value = true;
};

const backToAdmin = () => {
  navigateTo("/admin");
};

const exportToCSV = async () => {
  if (searchText.value) {
    const result = await Swal.fire({
      title: "Export avec filtres",
      text: "Des filtres sont actuellement appliqués. Que souhaitez-vous exporter ?",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Liste filtrée",
      denyButtonText: "Liste complète",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#3085d6",
      denyButtonColor: "#2c5282",
      cancelButtonColor: "#6b7280",
    });

    if (result.isDismissed) return;

    const dataToExport = result.isConfirmed
      ? filteredCollaborators.value
      : store.collaborators;

    const csvContent = dataToExport.map(
      (collaborator: Collaborator) =>
        `${collaborator.first_name},${collaborator.last_name},${collaborator.email}`
    );

    csvContent.unshift("Prénom,Nom,Email");

    const blob = new Blob([csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "collaborateurs.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export CSV généré avec succès !");
  } else {
    // Si pas de filtre, exporter directement toute la liste
    const csvContent = store.collaborators.map(
      (collaborator: Collaborator) =>
        `${collaborator.first_name},${collaborator.last_name},${collaborator.email}`
    );

    csvContent.unshift("Prénom,Nom,Email");

    const blob = new Blob([csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "collaborateurs.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export CSV généré avec succès !");
  }
};
</script>
