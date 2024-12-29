<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Collaborators</h1>
      <div class="flex space-x-4">
        <!-- Add Collaborator Button -->
        <button
          v-tippy="{ content: 'Ajouter un collaborateur', placement: 'bottom' }"
          @click="openAddModal"
          class="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <!-- Back Button -->
        <button
          v-tippy="{ content: 'Retour', placement: 'bottom' }"
          @click="backToAdmin"
          class="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
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
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2">First Name</th>
            <th class="border border-gray-300 px-4 py-2">Last Name</th>
            <th class="border border-gray-300 px-4 py-2">Email</th>
            <th class="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="collaborator in collaborators"
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
                class="bg-red-500 text-white px-3 py-1 rounded-md shadow hover:bg-red-600 transition"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-md shadow-lg">
        <p class="text-lg font-bold mb-4">
          Are you sure you want to delete this collaborator?
        </p>
        <div class="flex justify-end space-x-4">
          <button
            @click="isModalOpen = false"
            class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            @click="deleteCollaborator(selectedCollaboratorId)"
            class="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Add Collaborator Modal -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-md shadow-lg">
        <h2 class="text-xl font-bold mb-4">Ajout d'un collaborateur</h2>
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
              class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";

const supabase = useSupabaseClient();
const toast = useToast();

const collaborators = ref([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isAddModalOpen = ref(false);
const selectedCollaboratorId = ref(null);

const newCollaborator = ref({
  first_name: "",
  last_name: "",
  email: "",
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
        "Erreur lors de la récupération des collaborateurs: ",
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
      console.error("Erreur lors de la mise à jour du collaborateur:", error);
    } else {
      toast.success("Collaborateur mis à jour avec succès.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Échec de la mise à jour du collaborateur.");
  }
};

const confirmDelete = (id) => {
  selectedCollaboratorId.value = id;
  isModalOpen.value = true;
};

const deleteCollaborator = async (id) => {
  isModalOpen.value = false;
  try {
    const { error } = await supabase
      .from("collaborators")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la suppression du collaborateur:", error);
    } else {
      collaborators.value = collaborators.value.filter(
        (collaborator) => collaborator.id !== id
      );
      toast.success("Collaborateur supprimé avec succès.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Échec de la suppression du collaborateur.");
  }
};

const openAddModal = () => {
  newCollaborator.value = { first_name: "", last_name: "", email: "" };
  isAddModalOpen.value = true;
};

const addCollaborator = async () => {
  try {
    const { error } = await supabase
      .from("collaborators")
      .insert([newCollaborator.value]);

    if (error) {
      console.error("Erreur lors de l'ajout: ", error);
      toast.error("Erreur lors de l'ajout du collaborateur.");
    } else {
      toast.success("Collaborateur ajouté avec succès.");
      isAddModalOpen.value = false;
      fetchCollaborators();
    }
  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de l'ajout du collaborateur.");
  }
};

const backToAdmin = () => {
  navigateTo("/admin");
};
</script>
