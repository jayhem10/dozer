<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Collaborateurs</h1>
      <div class="flex space-x-4">
        <!-- Add Collaborator Button -->
        <button
          v-tippy="{ content: 'Ajouter un collaborateur', placement: 'bottom' }"
          @click="openAddModal"
          class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-500 hover:to-blue-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <!-- Back Button -->
        <button
          v-tippy="{ content: 'Retour', placement: 'bottom' }"
          @click="backToAdmin"
          class="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 rounded-md shadow hover:from-gray-500 hover:to-gray-700 transition"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mb-6">
      <input
        v-model="searchText"
        @input="filterCollaborators"
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

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Collaborators Table -->
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
                v-tippy="{ content: 'Supprimer', placement: 'bottom' }"
                class="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1 rounded-md shadow hover:from-red-500 hover:to-red-700 transition"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Collaborator Modal -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-md shadow-lg">
        <h2 class="text-lg font-bold mb-4">Ajouter un collaborateur</h2>
        <form @submit.prevent="addCollaborator">
          <div class="mb-4">
            <label
              for="firstName"
              class="block text-sm font-medium text-gray-700"
              >Prénom</label
            >
            <input
              id="firstName"
              v-model="newCollaborator.first_name"
              type="text"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="lastName"
              class="block text-sm font-medium text-gray-700"
              >Nom</label
            >
            <input
              id="lastName"
              v-model="newCollaborator.last_name"
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
              v-model="newCollaborator.email"
              type="email"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div class="flex justify-end space-x-4">
            <button
              @click="isAddModalOpen = false"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient, navigateTo } from "#imports";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";

const supabase = useSupabaseClient();
const toast = useToast();

const collaborators = ref([]);
const isLoading = ref(true);
const isAddModalOpen = ref(false);
const newCollaborator = ref({ first_name: "", last_name: "", email: "" });
const searchText = ref("");
const selectedCollaboratorId = ref(null);

const filteredCollaborators = computed(() => {
  if (!searchText.value) return collaborators.value;
  return collaborators.value.filter(
    (collaborator) =>
      collaborator.first_name
        .toLowerCase()
        .includes(searchText.value.toLowerCase()) ||
      collaborator.last_name
        .toLowerCase()
        .includes(searchText.value.toLowerCase()) ||
      collaborator.email.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

onMounted(() => {
  fetchCollaborators();
});

const fetchCollaborators = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("collaborators")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      console.error(
        "Erreur lors de la récupération des collaborateurs :",
        error
      );
    } else {
      collaborators.value = data || [];
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const addCollaborator = async () => {
  try {
    const { error } = await supabase
      .from("collaborators")
      .insert([newCollaborator.value]);
    if (error) {
      console.error("Erreur lors de l'ajout :", error);
      toast.error("Erreur lors de l'ajout du collaborateur.");
    } else {
      toast.success("Collaborateur ajouté avec succès.");
      isAddModalOpen.value = false;
      await fetchCollaborators();
    }
  } catch (err) {
    console.error("Erreur lors de l'ajout du collaborateur :", err);
    toast.error("Erreur lors de l'ajout du collaborateur.");
  }
};

const updateCollaborator = async (collaborator) => {
  try {
    const { error } = await supabase
      .from("collaborators")
      .update({
        first_name: collaborator.first_name,
        last_name: collaborator.last_name,
        email: collaborator.email,
      })
      .eq("id", collaborator.id);

    if (error) {
      console.error("Erreur lors de la mise à jour :", error);
      toast.error("Erreur lors de la mise à jour du collaborateur.");
    } else {
      toast.success("Collaborateur mis à jour avec succès.");
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour du collaborateur :", err);
    toast.error("Erreur lors de la mise à jour du collaborateur.");
  }
};

const confirmDelete = (id) => {
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
      await deleteCollaborator(id);
      Swal.fire("Supprimé !", "Le collaborateur a été supprimé.", "success");
    }
  });
};

const deleteCollaborator = async (id) => {
  try {
    const { error } = await supabase
      .from("collaborators")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la suppression du collaborateur :", error);
      toast.error("Erreur lors de la suppression du collaborateur.");
    } else {
      collaborators.value = collaborators.value.filter(
        (collaborator) => collaborator.id !== id
      );
      toast.success("Collaborateur supprimé avec succès.");
    }
  } catch (err) {
    console.error("Erreur lors de la suppression du collaborateur :", err);
    toast.error("Erreur lors de la suppression du collaborateur.");
  }
};

const clearSearch = () => {
  searchText.value = "";
};

const openAddModal = () => {
  newCollaborator.value = { first_name: "", last_name: "", email: "" };
  isAddModalOpen.value = true;
};

const backToAdmin = () => {
  navigateTo("/admin");
};
</script>
