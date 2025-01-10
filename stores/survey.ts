import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SupabaseClient } from "@supabase/supabase-js";

interface Question {
  id: string;
  text: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  point_multiplier: number;
  question_count: number;
  is_active: boolean;
  total_keys: number;
  used_keys: number;
  sent_keys: number;
  access_keys: AccessKey[];
}

interface AccessKey {
  key: string;
  id: string;
  email: string;
  is_used: boolean;
  is_sent: boolean;
}

interface FormattedAnswer {
  value: number;
  text: string;
}

export const useSurveyStore = defineStore("survey", () => {
  const client = useSupabaseClient<SupabaseClient>();

  const currentStep = ref<number>(1);
  const surveys = ref<Survey[]>([]);
  const filteredSurveys = ref<Survey[]>([]);
  const keys = ref<AccessKey[]>([]);
  const questions = ref<Question[]>([]);
  const surveyTitle = ref<string>("");
  const surveyId = ref<string>("");
  const isSubmitted = ref<boolean>(false);
  const weights = ref<Record<string, number>>({});
  const ratings = ref<Record<string, number>>({});
  const totalPoints = ref<number>(0);
  const pointMultiplier = ref<number>(0);
  const accessKeyId = ref<string>("");
  const searchText = ref<string>("");
  const searchTextSurvey = ref("");
  const accessKeys = ref<AccessKey[]>([]);

  const isValidPoints = computed(
    () => totalPoints.value >= 102 && totalPoints.value <= 103
  );

  const hasActiveSurvey = computed(() =>
    surveys.value.some((survey) => survey.is_active)
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

  const filteredKeys = computed(() =>
    keys.value.filter((key) =>
      searchText.value
        ? key.key.toLowerCase().includes(searchText.value.toLowerCase())
        : true
    )
  );

  const fetchSurveys = async () => {
    try {
      const { data, error } = await client
        .from("surveys")
        .select(
          `id, title, description, point_multiplier, 
       questions (id),
       is_active,
       access_keys (id, is_used, is_sent)`
        )
        .order("is_active", { ascending: false });

      if (error) throw new Error(error.message);

      surveys.value = data || [];

      filteredSurveys.value = formatSurveys(surveys.value) as Survey[];
    } catch (err) {
      console.error("Erreur lors de fetchSurveys:", err);
    }
  };

  const formatSurveys = (surveys: any[]) => {
    return surveys.map((survey) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description || "",
      point_multiplier: survey.point_multiplier || 200 / 39,
      question_count: survey.questions?.length || 0,
      is_active: survey.is_active,
      total_keys: survey.access_keys?.length || 0,
      used_keys: survey.access_keys?.filter((key) => key.is_used).length || 0,
      sent_keys: survey.access_keys?.filter((key) => key.is_sent).length || 0,
    }));
  };

  const filterSurveys = (searchText: string) => {
    const search = searchText.toLowerCase();
    filteredSurveys.value = formatSurveys(
      surveys.value.filter(
        (survey) =>
          survey.title.toLowerCase().includes(search) ||
          (survey.description &&
            survey.description.toLowerCase().includes(search))
      )
    );
  };

  const resetSearch = () => {
    searchTextSurvey.value = "";
    filteredSurveys.value = formatSurveys(surveys.value);
  };

  const fetchQuestions = async () => {
    try {
      const { data: survey, error: surveyError } = await client
        .from("surveys")
        .select("id, title, point_multiplier")
        .eq("is_active", true)
        .single();

      if (surveyError || !survey)
        throw new Error("Erreur lors de la récupération du sondage actif.");

      surveyId.value = survey.id;
      surveyTitle.value = survey.title;
      pointMultiplier.value = survey.point_multiplier || 200 / 39;

      const { data: surveyQuestions, error: questionsError } = await client
        .from("questions")
        .select("id, text")
        .eq("survey_id", survey.id);

      if (questionsError || !surveyQuestions)
        throw new Error("Erreur lors de la récupération des questions.");

      questions.value = surveyQuestions;
      surveyQuestions.forEach((q) => {
        weights.value[q.id] = 0;
        ratings.value[q.id] = 0;
      });
    } catch (error) {
      console.error(error);
    }
  };

  async function createSurvey(data: {
    title: string;
    description: string;
    questions: { text: string; type: string }[];
    point_multiplier: number;
  }): Promise<void> {
    try {
      const { data: survey, error: surveyError } = await client
        .from("surveys")
        .insert([
          {
            title: data.title,
            description: data.description,
            point_multiplier: data.point_multiplier,
          },
        ])
        .select()
        .single();

      if (surveyError || !survey) {
        throw new Error("Erreur lors de la création du sondage.");
      }

      surveyId.value = survey.id;
      surveyTitle.value = survey.title;

      const formattedQuestions = data.questions.map((q) => ({
        survey_id: survey.id,
        text: q.text,
        type: q.type,
      }));

      const { error: questionsError } = await client
        .from("questions")
        .insert(formattedQuestions);

      if (questionsError) {
        throw new Error("Erreur lors de l'enregistrement des questions.");
      }

      questions.value = formattedQuestions.map((q) => ({
        id: q.survey_id,
        text: q.text,
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  function setAccessKey(id: string): void {
    accessKeyId.value = id;
  }

  const generateKey = async (surveyId: string) => {
    const newKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      const { error } = await client.from("access_keys").insert({
        survey_id: surveyId,
        key: newKey,
        is_used: false,
        is_sent: false,
      });

      if (error) throw new Error(error.message);

      await fetchKeys(surveyId);
    } catch (err) {
      console.error("Erreur lors de generateKey:", err);
    }
  };

  const fetchKeys = async (surveyId: string) => {
    try {
      const { data, error } = await client
        .from("access_keys")
        .select("*")
        .eq("survey_id", surveyId);

      if (error) throw new Error(error.message);

      keys.value = data || [];
    } catch (err) {
      console.error("Erreur lors de fetchKeys:", err);
    }
  };

  function nextStep(): void {
    if (currentStep.value < 4) currentStep.value++;
  }

  const calculateTotalPoints = () => {
    totalPoints.value = Object.values(weights.value).reduce(
      (sum, weight) => sum + weight * pointMultiplier.value,
      0
    );
  };

  const deleteSurvey = async (id) => {
    try {
      const { error } = await client.from("surveys").delete().eq("id", id);
      if (error) {
        console.error("Erreur lors de la suppression du sondage :", error);
      } else {
        await fetchSurveys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActiveSurvey = async (id, isActive) => {
    if (!isActive) {
      await client
        .from("surveys")
        .update({ is_active: false })
        .eq("is_active", true);
      await client.from("surveys").update({ is_active: true }).eq("id", id);
    } else {
      await client.from("surveys").update({ is_active: false }).eq("id", id);
    }
    await fetchSurveys();
  };

  const deactivateAll = async () => {
    await client
      .from("surveys")
      .update({ is_active: false })
      .eq("is_active", true);
    await fetchSurveys();
  };

  const resetStore = () => {
    surveys.value = [];
    keys.value = [];
    questions.value = [];
    surveyId.value = "";
    surveyTitle.value = "";
    weights.value = {};
    ratings.value = {};
    totalPoints.value = 0;
    accessKeyId.value = "";
    accessKeys.value = [];
  };

  return {
    currentStep,
    surveys,
    filteredSurveys,
    keys,
    questions,
    surveyId,
    surveyTitle,
    weights,
    ratings,
    totalPoints,
    pointMultiplier,
    accessKeys,
    isSubmitted,
    isValidPoints,
    hasActiveSurvey,
    areAllWeightsSet,
    areAllRatingsSet,
    filteredKeys,
    fetchSurveys,
    fetchQuestions,
    createSurvey,
    fetchKeys,
    generateKey,
    calculateTotalPoints,
    nextStep,
    resetStore,
    deleteSurvey,
    toggleActiveSurvey,
    deactivateAll,
    setAccessKey,
    filterSurveys,
    resetSearch,
  };
});
