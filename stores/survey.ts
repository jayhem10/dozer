import { SupabaseClient } from "@supabase/supabase-js";
import { defineStore } from "pinia";

export interface AccessKey {
  key: string;
  id: string;
  email: string;
  is_used: boolean;
  is_sent: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  point_multiplier: number;
  questions: Question[];
  access_keys: AccessKey[];
}

export interface Question {
  id?: string;
  survey_id?: string;
  rating?: string;
  weighting?: string;
  created_at?: string;
}

export interface Response {
  id: string;
  answers: {
    ratings: Record<string, FormattedAnswer>;
    weights: Record<string, FormattedAnswer>;
  };
  submitted_at: string;
  surveys: {
    title: string;
    description: string;
  };
}

export interface FilteredSurvey {
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
  questions: Question[];
}

interface FormattedAnswer {
  value: number;
  text: string;
}

export interface SurveyState {
  currentStep: number;
  surveys: Survey[];
  filteredSurveys: FilteredSurvey[];
  keys: AccessKey[];
  questions: Question[];
  surveyTitle: string;
  surveyId: string;
  isSubmitted: boolean;
  weights: Record<string, number>;
  weightingTexts: Record<string, string>;
  ratings: Record<string, number>;
  totalPoints: number;
  pointMultiplier: number;
  accessKeyId: string;
  searchText: string;
  searchTextSurvey: string;
  accessKeys: AccessKey[];
  currentSurvey?: Survey;
}

interface CreateSurveyPayload {
  title: string;
  description: string;
  questions: Partial<Question>[];
  point_multiplier: number;
}

export const useSurveyStore = defineStore("survey", {
  state: (): SurveyState => ({
    currentStep: 1,
    surveys: [],
    filteredSurveys: [],
    keys: [],
    questions: [],
    surveyTitle: "",
    surveyId: "",
    isSubmitted: false,
    weights: {},
    weightingTexts: {},
    ratings: {},
    totalPoints: 0,
    pointMultiplier: 0,
    accessKeyId: "",
    searchText: "",
    searchTextSurvey: "",
    accessKeys: [],
    currentSurvey: undefined,
  }),

  getters: {
    isValidPoints(): boolean {
      return this.totalPoints >= 102 && this.totalPoints <= 103;
    },
    hasActiveSurvey(): boolean {
      return this.surveys.some((survey) => survey.is_active);
    },
    areAllWeightsSet(): boolean {
      return this.questions.every(
        (q) =>
          typeof this.weights[q.id] === "number" && this.weights[q.id] !== null
      );
    },
    areAllRatingsSet(): boolean {
      return this.questions.every(
        (q) =>
          typeof this.ratings[q.id] === "number" && this.ratings[q.id] !== null
      );
    },
    filteredKeys(): AccessKey[] {
      return this.keys.filter((key) =>
        this.searchText
          ? key.key.toLowerCase().includes(this.searchText.toLowerCase())
          : true
      );
    },
  },

  actions: {
    setCurrentStep(step: number): void {
      this.currentStep = step;
    },
    setSurveyTitle(title: string): void {
      this.surveyTitle = title;
    },
    setSurveyId(id: string): void {
      this.surveyId = id;
    },
    setAccessKeyId(id: string): void {
      this.accessKeyId = id;
    },
    setSearchText(search: string): void {
      this.searchText = search;
    },
    setPointMultiplier(multiplier: number): void {
      this.pointMultiplier = multiplier;
    },
    nextStep(): void {
      if (this.currentStep < 4) this.currentStep++;
    },

    async fetchSurveys(): Promise<Survey[]> {
      const client = useSupabaseClient<SupabaseClient>();
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

        if (error) {
          throw new Error(error.message);
        }

        this.surveys = (data as Survey[]) || [];
        this.filteredSurveys = this.formatSurveys(this.surveys);

        return this.surveys;
      } catch (err) {
        console.error("Erreur lors de fetchSurveys:", err);
        return [];
      }
    },

    async fetchSurveyById(
      id: string,
      fetchResponses: boolean = false
    ): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();

      try {
        const selectFields = [
          "id",
          "title",
          "description",
          "point_multiplier",
          "questions (id, weighting, rating)",
          "is_active",
          "access_keys (*)",
        ];

        if (fetchResponses) {
          selectFields.push("responses (id, answers, submitted_at)");
        }

        const { data: survey, error } = await client
          .from("surveys")
          .select(selectFields.join(", "))
          .eq("id", id)
          .single();

        if (error || !survey) {
          throw new Error("Erreur lors de la récupération du sondage.");
        }

        this.currentSurvey = survey;

        if (survey.questions) {
          this.questions = survey.questions;

          survey.questions.forEach((q) => {
            if (q.id) {
              this.weights[q.id] = 0;
              this.ratings[q.id] = 0;
            }
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        throw error;
      }
    },
    async createSurvey(payload: CreateSurveyPayload): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { data: survey, error: surveyError } = await client
          .from("surveys")
          .insert({
            title: payload.title,
            description: payload.description,
            point_multiplier: payload.point_multiplier,
          })
          .select()
          .single();

        if (surveyError) throw surveyError;

        const questions = payload.questions.map((q) => ({
          survey_id: survey.id,
          weighting: q.weighting || null,
          rating: q.rating || null,
        }));

        const { data: createdQuestions, error: questionsError } = await client
          .from("questions")
          .insert(questions)
          .select();

        if (questionsError) throw questionsError;

        this.surveyId = survey.id;
        this.surveyTitle = survey.title;
        this.questions = createdQuestions;

        this.questions.forEach((q) => {
          if (q.id) {
            this.weights[q.id] = 0;
            this.ratings[q.id] = 0;
          }
        });
      } catch (error) {
        console.error("Erreur lors de la création du sondage :", error);
        throw error;
      }
    },

    formatSurveys(surveys: Survey[]): FilteredSurvey[] {
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
        access_keys: survey.access_keys || [],
        questions: survey.questions || [],
      }));
    },

    async submitSurvey(): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        if (!this.surveyId || !this.accessKeyId) {
          throw new Error("Survey ID ou Access Key ID manquant.");
        }

        const formattedAnswers = {
          ratings: Object.entries(this.ratings).reduce<
            Record<string, FormattedAnswer>
          >((acc, [id, value]) => {
            const question = this.questions.find((q) => q.id === id);
            if (question?.rating) {
              acc[id] = {
                value,
                text: question.rating,
              };
            }
            return acc;
          }, {}),
          weights: Object.entries(this.weights).reduce<
            Record<string, FormattedAnswer>
          >((acc, [id, value]) => {
            const question = this.questions.find((q) => q.id === id);
            if (question?.weighting) {
              acc[id] = {
                value,
                text: question.weighting,
              };
            }
            return acc;
          }, {}),
        };

        const { error: insertError } = await client.from("responses").insert({
          survey_id: this.surveyId,
          answers: formattedAnswers,
          submitted_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;

        const { error: updateError } = await client
          .from("access_keys")
          .update({ is_used: true })
          .eq("id", this.accessKeyId);

        if (updateError) throw updateError;

        this.isSubmitted = true;
      } catch (error) {
        console.error("Erreur lors de l'envoi :", error);
        throw error;
      } finally {
        this.resetStore();
      }
    },

    async deleteSurvey(id: string): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { error } = await client.from("surveys").delete().eq("id", id);

        if (error) {
          console.error("Erreur lors de la suppression du sondage :", error);
          throw new Error("La suppression du sondage a échoué.");
        }

        // Rafraîchit la liste des sondages après suppression
        await this.fetchSurveys();
      } catch (error) {
        console.error("Erreur lors de la suppression du sondage :", error);
        throw error;
      }
    },
    async toggleActiveSurvey(id: string, isActive: boolean): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        if (!isActive) {
          await client
            .from("surveys")
            .update({ is_active: false })
            .eq("is_active", true);

          await client.from("surveys").update({ is_active: true }).eq("id", id);
        } else {
          await client
            .from("surveys")
            .update({ is_active: false })
            .eq("id", id);
        }

        await this.fetchSurveys();
      } catch (error) {
        console.error(
          "Erreur lors de la modification de l'état actif du sondage :",
          error
        );
        throw error;
      }
    },
    async deactivateAll(): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        // Désactiver tous les sondages actifs
        await client
          .from("surveys")
          .update({ is_active: false })
          .eq("is_active", true);

        await this.fetchSurveys();
      } catch (error) {
        console.error("Erreur lors de la désactivation des sondages :", error);
        throw error;
      }
    },
    async generateAndSendKeys(emails: string[]): Promise<AccessKey[]> {
      const client = useSupabaseClient<SupabaseClient>();
      if (!this.surveyId) {
        throw new Error("ID du sondage manquant.");
      }

      try {
        const keys = emails.map((email) => ({
          key: crypto.randomUUID(),
          survey_id: this.surveyId,
          is_used: false,
          is_sent: false,
          email,
        }));

        const { data: savedKeys, error: dbError } = await client
          .from("access_keys")
          .insert(keys.map(({ email, ...rest }) => rest))
          .select("key, id");

        if (dbError) {
          console.error(
            "Erreur lors de l'enregistrement des clés d'accès :",
            dbError
          );
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
    },

    async generateKey(id: string): Promise<string> {
      const newKey = crypto.randomUUID();
      try {
        await this.addKey(id, newKey);
      } catch (error) {
        console.error(error);
      } finally {
        return newKey;
      }
    },
    filterSurveys(searchText: string): void {
      const search = searchText.toLowerCase();
      this.filteredSurveys = this.formatSurveys(
        this.surveys.filter(
          (survey) =>
            survey.title.toLowerCase().includes(search) ||
            (survey.description &&
              survey.description.toLowerCase().includes(search))
        )
      );
    },

    calculateTotalPoints(): void {
      this.totalPoints = Object.values(this.weights).reduce(
        (sum, weight) => sum + weight * this.pointMultiplier,
        0
      );
    },

    async fetchQuestions(): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { data: survey, error: surveyError } = await client
          .from("surveys")
          .select("id, title, point_multiplier")
          .eq("is_active", true)
          .single();

        if (surveyError || !survey) {
          throw new Error("Erreur lors de la récupération du sondage actif.");
        }

        this.setSurveyId(survey.id);
        this.setSurveyTitle(survey.title);
        this.setPointMultiplier(survey.point_multiplier || 200 / 39);

        const { data: surveyQuestions, error: questionsError } = await client
          .from("questions")
          .select("id, weighting, rating")
          .eq("survey_id", survey.id);

        if (questionsError || !surveyQuestions) {
          throw new Error("Erreur lors de la récupération des questions.");
        }

        this.questions = surveyQuestions;
        surveyQuestions.forEach((q) => {
          if (q.id) {
            this.weights[q.id] = 0;
            this.ratings[q.id] = 0;
          }
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async addKey(surveyId: string, newKey: string): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { error } = await client.from("access_keys").insert({
          survey_id: surveyId,
          key: newKey,
          is_used: false,
          is_sent: false,
        });

        if (error) {
          throw new Error("Erreur lors de l'ajout de la clé.");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout de la clé :", error);
        throw error;
      }
    },

    async removeKey(keyId: string): Promise<void> {
      const client = useSupabaseClient<SupabaseClient>();
      try {
        const { error } = await client
          .from("access_keys")
          .delete()
          .eq("id", keyId);

        if (error) {
          throw new Error("Erreur lors de la suppression de la clé.");
        }

        // Mise à jour locale des clés
        this.keys = this.keys.filter((key) => key.id !== keyId);
      } catch (error) {
        console.error("Erreur lors de la suppression de la clé :", error);
        throw error;
      }
    },
    filterKeys(searchQuery: string, filterStatus: string): AccessKey[] {
      let filtered = this.keys;

      if (searchQuery.trim()) {
        filtered = filtered.filter((key) =>
          key.key.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filterStatus === "used") {
        filtered = filtered.filter((key) => key.is_used);
      } else if (filterStatus === "available") {
        filtered = filtered.filter((key) => !key.is_used);
      } else if (filterStatus === "sent") {
        filtered = filtered.filter((key) => key.is_sent);
      }

      return filtered;
    },

    getKeyStatistics(): { total: number; used: number } {
      const total = this.keys.length;
      const used = this.keys.filter((key) => key.is_used).length;

      return { total, used };
    },
    resetStore(): void {
      this.surveyId = "";
      this.surveyTitle = "";
      this.questions = [];
      this.weights = {};
      this.ratings = {};
      this.accessKeyId = "";
      this.accessKeys = [];
      this.totalPoints = 0;
      this.isSubmitted = false;
    },
  },
});
