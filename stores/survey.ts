import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSurveyStore = defineStore("survey", () => {
  const client = useSupabaseClient();

  const currentStep = ref(1);
  const questions = ref<Array<{ id: string; text: string }>>([]);
  const weights = ref<Record<string, number>>({});
  const ratings = ref<Record<string, number>>({});
  const surveyId = ref<string>(""); // Active survey ID
  const surveyTitle = ref<string>(""); // Active survey title
  const accessKeyId = ref<string>(""); // Store access_key_id
  const totalPoints = ref<number>(0);
  const isSubmitted = ref(false);

  // Computed properties for validations
  const isValidPoints = computed(
    () => totalPoints.value >= 102 && totalPoints.value <= 103
  );
  const areAllWeightsSet = computed(() =>
    questions.value.every(
      (q) =>
        typeof weights.value[q.id] === "number" && weights.value[q.id] !== null
    )
  );
  const areAllRatingsSet = computed(() =>
    questions.value.every(
      (q) =>
        typeof ratings.value[q.id] === "number" && ratings.value[q.id] !== null
    )
  );

  // Fetch active survey and its questions
  async function fetchQuestions() {
    try {
      const { data: survey, error: surveyError } = await client
        .from("surveys")
        .select("id, title")
        .eq("is_active", true)
        .single();

      if (surveyError || !survey) {
        throw new Error("Erreur lors de la récupération du sondage actif.");
      }

      surveyId.value = survey.id;
      surveyTitle.value = survey.title;

      const { data: surveyQuestions, error: questionsError } = await client
        .from("questions")
        .select("id, text")
        .eq("survey_id", survey.id);

      if (questionsError || !surveyQuestions) {
        throw new Error("Erreur lors de la récupération des questions.");
      }

      questions.value = surveyQuestions;

      surveyQuestions.forEach((q) => {
        weights.value[q.id] = 0;
        ratings.value[q.id] = 0;
      });
    } catch (error) {
      console.error(error);
    }
  }

  function setWeight(questionId: string, weight: number) {
    weights.value[questionId] = weight;
    calculateTotalPoints();
  }

  function setRating(questionId: string, rating: number) {
    ratings.value[questionId] = rating;
  }

  function setAccessKey(id: string) {
    accessKeyId.value = id;
  }

  function calculateTotalPoints() {
    totalPoints.value = Object.values(weights.value).reduce(
      (sum, weight) => sum + weight * (200 / 39),
      0
    );
  }

  async function submitSurvey() {
    try {
      // Vérifications de base
      if (!surveyId.value || !accessKeyId.value) {
        throw new Error("Survey ID ou Access Key ID manquant.");
      }

      // Construction des réponses avec l'ID et le texte des questions
      const formattedAnswers = {
        ratings: Object.entries(ratings.value).reduce((acc, [id, value]) => {
          const question = questions.value.find((q) => q.id === id);
          if (question) {
            acc[id] = { value, text: question.text };
          }
          return acc;
        }, {}),
        weights: Object.entries(weights.value).reduce((acc, [id, value]) => {
          const question = questions.value.find((q) => q.id === id);
          if (question) {
            acc[id] = { value, text: question.text };
          }
          return acc;
        }, {}),
      };

      // Insertion dans la base de données
      const { error: insertError } = await client.from("responses").insert({
        survey_id: surveyId.value,
        access_key_id: accessKeyId.value,
        answers: formattedAnswers, // Insérer ratings et weights avec le texte
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // Marquer la clé comme utilisée
      const { error: updateError } = await client
        .from("access_keys")
        .update({ is_used: true })
        .eq("id", accessKeyId.value);

      if (updateError) throw updateError;

      // Réinitialisation après soumission réussie
      isSubmitted.value = true;
      resetStore(); // Réinitialiser le store
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error.message);
      throw error;
    }
  }

  function nextStep() {
    if (currentStep.value < 4) currentStep.value++;
  }

  function resetStore() {
    surveyId.value = "";
    questions.value = [];
    weights.value = {};
    ratings.value = {};
    accessKeyId.value = "";
    totalPoints.value = 0;
    isSubmitted.value = false;
  }

  return {
    currentStep,
    questions,
    weights,
    ratings,
    totalPoints,
    isSubmitted,
    accessKeyId,
    isValidPoints,
    areAllWeightsSet,
    areAllRatingsSet,
    surveyTitle,
    fetchQuestions,
    setWeight,
    setRating,
    setAccessKey,
    calculateTotalPoints,
    submitSurvey,
    nextStep,
    resetStore,
  };
});
