import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useStudentForm, useStudentData } from "../../hooks/useStudentForm";
import ProgressBar from "../../components/setup/ProgressBar";
import Step1Identity from "../../components/students/form/Step1Identity";
import Step2Academic from "../../components/students/form/Step2Academic";
import Step3Contacts from "../../components/students/form/Step3Contacts";
import Step4Confirm from "../../components/students/form/Step4Confirm";
import { useSchoolStore } from "../../stores/school.store";

const STEPS = [
  { id: 1, title: "Identité", component: Step1Identity },
  { id: 2, title: "Scolarité", component: Step2Academic },
  { id: 3, title: "Contacts", component: Step3Contacts },
  { id: 4, title: "Confirmation", component: Step4Confirm },
];

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const { formData, validateStep, loadStudentData, resetForm } = useStudentForm();
  const activeAcademicYearId = useSchoolStore(
    (state) => state.activeAcademicYearId,
  );

  // Fetch student data if editing
  const { data: student, isLoading: isLoadingStudent } = useStudentData(id);

  useEffect(() => {
    if (isEdit && student) {
      loadStudentData(student);
    }
  }, [isEdit, student, loadStudentData]);

  // Clean form on unmount OR if switching from edit to new
  useEffect(() => {
    return () => resetForm();
  }, [resetForm]);



  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = new FormData();

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "photoFile" && value instanceof File) {
          payload.append("photo", value);
        } else if (
          key !== "photoPreview" &&
          value !== undefined &&
          value !== null
        ) {
          payload.append(key, String(value));
        }
      });

      // Ensure academicYearId is present — fall back to API if store not yet loaded
      let yearId = activeAcademicYearId;
      if (!yearId) {
        try {
          const ctx = await api.get('/settings/context');
          const ctxData = ctx.data.data ?? ctx.data;
          yearId = ctxData.academicYear?.id ?? null;
        } catch {
          // ignore
        }
      }
      if (yearId) {
        payload.append('academicYearId', yearId);
      } else {
        throw new Error("Aucune année scolaire active trouvée. Configurez l'année scolaire dans les paramètres.");
      }

      if (isEdit) {
        return api.put(`/students/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.post("/students", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });

      if (isEdit) {
        toast.success("Élève modifié avec succès", { duration: 4000 });
        navigate("/students");
      } else {
        const newStudent = response.data.data;
        toast.success(`Élève inscrit ! Matricule : ${newStudent.matricule}`, {
          duration: 6000,
          icon: "🎓",
        });
        resetForm();
        navigate(`/students/${newStudent.id}`);
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(message);
    },
  });

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      submitMutation.mutate(formData);
    } else {
      toast.error("Veuillez corriger les erreurs avant de soumettre");
    }
  };

  if (isEdit && isLoadingStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 text-neutral-500 font-medium">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        Chargement des données de l'élève...
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/students")}
            className="flex items-center gap-2 text-sm text-neutral-600 
                                   hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Retour à la liste
          </button>

          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            {isEdit ? "Modifier l'élève" : "Nouvelle inscription"}
          </h1>

          <ProgressBar
            currentStep={currentStep}
            steps={STEPS.map((s) => ({ id: s.id, label: s.title }))}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <CurrentStepComponent />
        </div>
      </div>

      {/* Footer Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 
                            shadow-lg z-10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium 
                                   text-neutral-700 hover:text-neutral-900 disabled:opacity-40 
                                   disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          <div className="text-xs sm:text-sm text-neutral-600 font-medium">
            Étape {currentStep}/{STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 bg-primary 
                                       text-white rounded-lg hover:bg-primary-dark font-medium 
                                       text-sm transition-colors w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Suivant</span>
              <span className="sm:hidden">Suit.</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 bg-green-600 
                                       text-white rounded-lg hover:bg-green-700 font-medium 
                                       text-sm transition-colors disabled:opacity-60 
                                       disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {submitMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span className="hidden sm:inline">{isEdit ? "Enregistrer" : "Inscrire l'élève"}</span>
              <span className="sm:hidden">{isEdit ? "Enreg." : "Terminer"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
