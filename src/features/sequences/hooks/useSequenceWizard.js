import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { sequenceSchema, getInitialSeqData } from "../utils/sequenceValidation";
import { useDrip } from "../../../hooks/useDrip";
import { useAuth } from "../../../context/AuthContext";

export const useSequenceWizard = (onSuccess, dripId = null) => {
  const { actions: { createDrip, updateDrip, fetchDripById } } = useDrip();
  const { user } = useAuth();
  const customerId = user?.customer_id;
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(!!dripId);
  const [seqData, setSeqDataInternal] = useState(() => getInitialSeqData(customerId));
  const initialDataRef = useRef(JSON.stringify(getInitialSeqData(customerId)));
  const isEditMode = !!dripId;

  // Fetch existing drip data for edit mode
  useEffect(() => {
    if (dripId) {
      setIsLoading(true);
      fetchDripById(dripId).then((result) => {
        if (result.success) {
          setSeqDataInternal(result.data);
          initialDataRef.current = JSON.stringify(result.data);
        } else {
          toast.error(result.error || "Failed to load sequence");
        }
        setIsLoading(false);
      });
    }
  }, [dripId, fetchDripById]);

  // Only consider it "unsaved" if user has entered meaningful data
  const hasUnsavedChanges =
    seqData.drip_name?.trim().length > 0 ||
    seqData.drip_description?.trim().length > 0 ||
    seqData.trigger_type?.length > 0 ||
    seqData.steps?.length > 0 ||
    seqData.delivery_preferences?.[0]?.days?.length > 0;

  
  const setSeqData = useCallback(
    (newData) => {
      
      const dataChanged =
        typeof newData === "function"
          ? true
          : JSON.stringify(newData) !== JSON.stringify(seqData);

      if (dataChanged && (error || Object.keys(fieldErrors).length > 0)) {
        setError("");
        setFieldErrors({});
      }
      setSeqDataInternal(newData);
    },
    [error, fieldErrors, seqData]
  );

  const validateStep = useCallback((currentStep) => {
    const errors = {};
    let result;

    if (currentStep === 1) {
      result = sequenceSchema.pick({ drip_name: true, tag: true }).safeParse(seqData);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          if (err.path.includes("drip_name")) {
            errors.drip_name = err.message;
          }
          if (err.path.includes("tag")) {
            errors.tag = err.message;
          }
        });
      }
    } else if (currentStep === 2) {
      result = sequenceSchema
        .pick({ trigger_type: true, delivery_preferences: true })
        .safeParse(seqData);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          if (err.path.includes("trigger_type")) {
            errors.trigger_type = err.message;
          }
          if (err.path.includes("days")) {
            errors.days = err.message;
          }
          if (err.message.includes("time range")) {
            errors.time_range = err.message;
          }
        });
      }
    } else if (currentStep === 3) {
      if (!seqData.steps.length) {
        errors.steps = "Please add at least one drip step.";
        return { success: false, error: errors.steps, fieldErrors: errors };
      }
      const missingTemplate = seqData.steps.some((s) => !s.template);
      if (missingTemplate) {
        errors.template = "Each drip step must have a template selected!";
        return { success: false, error: errors.template, fieldErrors: errors };
      }
      // Check if all template variables are mapped
      for (let i = 0; i < seqData.steps.length; i++) {
        const step = seqData.steps[i];
        if (step.parameters && step.parameters.length > 0) {
          const unmappedParams = step.parameters.filter((p) => !p.mappedTo || !p.mappedTo.trim());
          if (unmappedParams.length > 0) {
            const stepName = step.step_name || `Step ${i + 1}`;
            errors.parameters = `Please map all variables in "${stepName}"`;
            return { success: false, error: errors.parameters, fieldErrors: errors };
          }
        }
      }
      result = sequenceSchema.pick({ steps: true }).safeParse(seqData);
    }

    if (result && !result.success) {
      const firstError = result.error.errors[0].message;
      return { success: false, error: firstError, fieldErrors: errors };
    }

    return { success: true, fieldErrors: {} };
  }, [seqData]);

  const handleNext = useCallback(() => {
    const validation = validateStep(step);
    if (!validation.success) {
      toast.error(validation.error);
      setError(validation.error);
      setFieldErrors(validation.fieldErrors || {});
      return;
    }
    setError("");
    setFieldErrors({});
    setStep((prev) => prev + 1);
  }, [step, validateStep]);

  const handlePrev = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
      setFieldErrors({});
    }
  }, [step]);

  const handleFinish = useCallback(async () => {
    const validationResult = sequenceSchema.safeParse(seqData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0].message;
      toast.error(firstError);
      setError(firstError);
      return;
    }

    const missingTemplate = seqData.steps.some((s) => !s.template);
    if (missingTemplate) {
      toast.error("Each drip step must have a template selected!");
      return;
    }

    // Check if all template variables are mapped
    for (let i = 0; i < seqData.steps.length; i++) {
      const stepData = seqData.steps[i];
      if (stepData.parameters && stepData.parameters.length > 0) {
        const unmappedParams = stepData.parameters.filter((p) => !p.mappedTo || !p.mappedTo.trim());
        if (unmappedParams.length > 0) {
          const stepName = stepData.step_name || `Step ${i + 1}`;
          const errorMsg = `Please map all variables in "${stepName}"`;
          toast.error(errorMsg);
          setError(errorMsg);
          setFieldErrors({ parameters: errorMsg });
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError("");

    const apiResult = isEditMode
      ? await updateDrip(dripId, { ...seqData, status: "active" })
      : await createDrip({ ...seqData, status: "active" });
      
    if (apiResult.success) {
      initialDataRef.current = JSON.stringify(seqData);
      onSuccess?.();
    } else {
      setError(apiResult.error || `Failed to ${isEditMode ? "update" : "create"} sequence`);
    }
    setIsSubmitting(false);
  }, [seqData, createDrip, updateDrip, onSuccess, isEditMode, dripId]);

  const handleSaveDraft = useCallback(async () => {
    if (!seqData.drip_name || !seqData.drip_name.trim()) {
      toast.error("Please enter a valid sequence name first");
      return;
    }

    setIsSavingDraft(true);
    const apiResult = isEditMode
      ? await updateDrip(dripId, { ...seqData, status: "draft" })
      : await createDrip({ ...seqData, status: "draft" });
      
    if (apiResult.success) {
      toast.success("Draft saved successfully!");
      initialDataRef.current = JSON.stringify(seqData);
    } else {
      toast.error(apiResult.error || "Failed to save draft");
    }
    setIsSavingDraft(false);
  }, [seqData, createDrip, updateDrip, isEditMode, dripId]);

  return {
    step,
    error,
    fieldErrors,
    isSubmitting,
    isSavingDraft,
    isLoading,
    isEditMode,
    seqData,
    setSeqData,
    handleNext,
    handlePrev,
    handleFinish,
    handleSaveDraft,
    hasUnsavedChanges,
  };
};
