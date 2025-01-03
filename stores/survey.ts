import { access } from "fs";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSurveyStore = defineStore("survey", () => {
  const client = useSupabaseClient();

  const currentStep = ref(1);
  const questions = ref([]);
  const selectedSurvey = ref(null);
  const weights = ref({});
  const ratings = ref({});
  const accessKeyId = ref("");
  const accessKeys = ref([]);
  const surveyId = ref("");
  const surveyTitle = ref("");
  const isSubmitted = ref(false);
  const totalPoints = ref(0);

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
      throw error;
    }
  }

  async function fetchSurveyById(id: string) {
    try {
      const { data: survey, error } = await client
        .from("surveys")
        .select("id, title")
        .eq("id", id)
        .single();

      if (error || !survey) {
        throw new Error("Erreur lors de la récupération du sondage.");
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
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function createSurvey(data) {
    try {
      const { data: survey, error: surveyError } = await client
        .from("surveys")
        .insert([{ title: data.title, description: data.description }])
        .select()
        .single();

      if (surveyError || !survey)
        throw new Error("Erreur lors de la création du sondage.");

      surveyId.value = survey.id;
      surveyTitle.value = survey.title;
      selectedSurvey.value = { id: survey.id, title: survey.title };

      const formattedQuestions = data.questions.map((q) => ({
        survey_id: survey.id,
        text: q.text,
        type: q.type,
      }));
      const { error: questionsError } = await client
        .from("questions")
        .insert(formattedQuestions);

      if (questionsError)
        throw new Error("Erreur lors de l'enregistrement des questions.");

      questions.value = formattedQuestions;
    } catch (error) {
      console.error("Erreur lors de la création du sondage :", error);
      throw error;
    }
  }

  function setWeight(questionId, weight) {
    weights.value[questionId] = weight;
    calculateTotalPoints();
  }

  function setRating(questionId, rating) {
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
      if (!surveyId.value || !accessKeyId.value) {
        throw new Error("Survey ID ou Access Key ID manquant.");
      }

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

      const { error: insertError } = await client.from("responses").insert({
        survey_id: surveyId.value,
        access_key_id: accessKeyId.value,
        answers: formattedAnswers,
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      const { error: updateError } = await client
        .from("access_keys")
        .update({ is_used: true })
        .eq("id", accessKeyId.value);

      if (updateError) throw updateError;

      isSubmitted.value = true;
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      throw error;
    } finally {
      resetStore();
    }
  }

  async function generateAndSendKeys(emails) {
    if (!surveyId.value) throw new Error("ID du sondage manquant.");

    try {
      const keys = emails.map((email) => ({
        key: crypto.randomUUID(),
        survey_id: surveyId.value,
        is_used: false,
        is_sent: false,
        email,
      }));

      const { data: savedKeys, error: dbError } = await client
        .from("access_keys")
        .insert(keys.map(({ email, ...rest }) => rest))
        .select("key, id");

      if (dbError) {
        console.error("Database insertion error:", dbError);
        throw new Error("Erreur lors de l'enregistrement des clés d'accès.");
      }

      return savedKeys.map((key, index) => ({
        ...key,
        email: emails[index],
      }));
    } catch (error) {
      console.error("Erreur lors de la génération des clés :", error);
      throw error;
    }
  }

  function nextStep() {
    if (currentStep.value < 4) currentStep.value++;
  }

  function resetStore() {
    surveyId.value = "";
    surveyTitle.value = "";
    questions.value = [];
    weights.value = {};
    ratings.value = {};
    accessKeyId.value = "";
    accessKeys.value = [];
    totalPoints.value = 0;
    isSubmitted.value = false;
  }

  return {
    currentStep,
    questions,
    weights,
    ratings,
    surveyId,
    surveyTitle,
    selectedSurvey,
    accessKeyId,
    accessKeys,
    isSubmitted,
    isValidPoints,
    areAllWeightsSet,
    areAllRatingsSet,
    totalPoints,
    generateAndSendKeys,
    fetchQuestions,
    fetchSurveyById,
    createSurvey,
    setWeight,
    setRating,
    setAccessKey,
    calculateTotalPoints,
    submitSurvey,
    nextStep,
    resetStore,
  };
});
