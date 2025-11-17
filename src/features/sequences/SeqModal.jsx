import React, { Fragment, useState } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import SequenceInfoStep from "./SequenceInfoStep";
import TriggerConditionStep from "./TriggerConditionStep";
import DripMessageStep from "./DripMessageStep";

const SeqModal = ({ onClose, isOpen }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [seqData, setSeqData] = useState({
    sequence_name: "",
    sequence_description: "",
    trigger_type: "",
    // trigger_conditions: {
    //   start_conditions: [],
    //   stop_conditions: [],
    // },
    target_type: "",
    target_ids: "",
    status: "active",
    customer_id: 1000,
    delivery_preferences: [
      {
        days: [],
        time_type: "Any Time",
        time_from: "",
        time_to: "",
        allow_once: true,
        continue_after_delivery: false,
      },
    ],
    steps: [],
    updated_at: new Date().toLocaleString(),
  });

  // Delivery preferences schema
  const deliveryPreferenceSchema = z
    .object({
      days: z.array(z.string()).min(1, "Select at least one day"),
      time_type: z.enum(["Any Time", "Time Range"]),
      time_from: z.string().optional(),
      time_to: z.string().optional(),
    })
    .refine(
      (data) =>
        data.time_type === "Any Time" ||
        (data.time_type === "Time Range" && data.time_from && data.time_to),
      {
        message: "Please select a valid time range.",
      }
    );

  // Step schema (drip message)
  const stepSchema = z
    .object({
      delay_value: z.number().min(1, "Delay must be at least 1"),
      delay_unit: z.enum(["minutes", "hours", "days"]),
      template: z.any().nullable(),
      use_custom_time: z.boolean().optional(),
      custom_days: z.array(z.string()).optional(),
      custom_time_from: z.string().optional(),
      custom_time_to: z.string().optional(),
      custom_time_type: z.enum(["Any Time", "Time Range"]),
    })
    .refine(
      (data) => {
        if (!data.use_custom_time) return true;
        if (data.custom_time_type === "Any Time")
          return Array.isArray(data.custom_days) && data.custom_days.length > 0;
        if (data.custom_time_type === "Time Range")
          return data.custom_time_from && data.custom_time_to;
        return true;
      },
      {
        message:
          "If custom time is enabled, select day(s) or valid time range.",
      }
    );

  // Whole sequence schema
  const sequenceSchema = z.object({
    sequence_name: z.string().min(1, "Sequence name is required"),
    target_type: z.string().min(1, "Please select target type"),
    trigger_type: z.string().min(1, "Please select trigger type"),
    delivery_preferences: z.array(deliveryPreferenceSchema),
    steps: z.array(stepSchema).min(1, "At least one step is required"),
  });

  // Step progress indicator
  const stepsConfig = [
    { number: 1, title: "Sequence Info" },
    { number: 2, title: "Trigger & Schedule" },
    { number: 3, title: "Drip Messages" },
  ];

  // Step validations
  const handleNext = () => {
    let result;

    if (step === 1) {
      result = sequenceSchema
        .pick({
          sequence_name: true,
          target_type: true,
        })
        .safeParse(seqData);
    } else if (step === 2) {
      result = sequenceSchema
        .pick({ trigger_type: true, delivery_preferences: true })
        .safeParse(seqData);
    } else if (step === 3) {
      if (!seqData.steps.length) {
        toast.error("Please add at least one drip step.");
        return;
      }
      const missingTemplate = seqData.steps.some(
        (s) => !s.template || s.template === null
      );
      if (missingTemplate) {
        toast.error("Each drip step must have a template selected!");
        return;
      }
      result = sequenceSchema.pick({ steps: true }).safeParse(seqData);
    }

    if (result && !result.success) {
      const firstError = result.error.errors[0].message;
      toast.error(firstError);
      setError(firstError);
      return;
    }

    setError("");
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const handleFinish = () => {
    const result = sequenceSchema.safeParse(seqData);

    if (!result.success) {
      const firstError = result.error.errors[0].message;
      toast.error(firstError);
      setError(firstError);
      return;
    }

    const missingTemplate = seqData.steps.some(
      (s) => !s.template || s.template === null
    );
    if (missingTemplate) {
      toast.error("Each drip step must have a template selected!");
      return;
    }

    toast.success("Sequence created successfully!");
    console.log("Final Sequence Data:", seqData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl relative shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Create Drip Sequence
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of {stepsConfig.length}:{" "}
                {stepsConfig[step - 1]?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl font-semibold">×</span>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-4">
              {stepsConfig.map((stepItem, index) => (
                <Fragment key={stepItem.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        step >= stepItem.number
                          ? "bg-teal-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step > stepItem.number ? "✓" : stepItem.number}
                    </div>
                    <span
                      className={`text-xs mt-1 hidden sm:block ${
                        step >= stepItem.number
                          ? "text-teal-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {stepItem.title}
                    </span>
                  </div>
                  {index < stepsConfig.length - 1 && (
                    <div
                      className={`w-12 h-1 rounded ${
                        step > stepItem.number ? "bg-teal-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            {step === 1 && (
              <SequenceInfoStep seqData={seqData} setSeqData={setSeqData} />
            )}
            {step === 2 && (
              <TriggerConditionStep seqData={seqData} setSeqData={setSeqData} />
            )}
            {step === 3 && (
              <DripMessageStep seqData={seqData} setSeqData={setSeqData} />
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium text-center">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="w-full sm:w-auto">
              {step !== 1 && (
                <button
                  className="w-full sm:w-32 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-lg py-3 px-4 transition-colors border border-gray-300"
                  onClick={handlePrev}
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {step === 3 ? (
                <button
                  onClick={handleFinish}
                  className="w-full sm:w-32 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg py-3 px-4 transition-colors shadow-sm"
                >
                  Finish & Create
                </button>
              ) : (
                <button
                  className="w-full sm:w-32 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg py-3 px-4 transition-colors shadow-sm"
                  onClick={handleNext}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeqModal;
