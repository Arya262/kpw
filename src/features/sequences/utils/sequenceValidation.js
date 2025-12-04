import { z } from "zod";

// Delivery preferences schema
export const deliveryPreferenceSchema = z
  .object({
    days: z.array(z.string()).min(1, "Select at least one day"),
    time_type: z.enum(["Any Time", "Time Range"]),
    time_from: z.string().optional(),
    time_to: z.string().optional(),
    timezone: z.string().optional(),
    allow_once: z.boolean().optional(),
    continue_after_delivery: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.time_type === "Any Time" ||
      (data.time_type === "Time Range" && data.time_from && data.time_to),
    { message: "Please select a valid time range." }
  );

// Step schema (drip message)
export const stepSchema = z
  .object({
    step_name: z.string().optional(),
    step_order: z.number().optional(),
    delay_value: z.number().min(1, "Delay must be at least 1"),
    delay_unit: z.enum(["minutes", "hours", "days"]),
    template: z.any().nullable(),
    parameters: z
      .array(z.object({ param: z.string(), mappedTo: z.string() }))
      .optional(),
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
    { message: "If custom time is enabled, select day(s) or valid time range." }
  );

// Full sequence schema
export const sequenceSchema = z.object({
  drip_name: z
    .string()
    .min(1, "Sequence name is required")
    .refine((val) => val.trim().length > 0, "Sequence name cannot be empty or just spaces"),
  tag: z.array(z.number()).min(1, "Please select a tag to trigger this drip"),
  trigger_type: z.string().min(1, "Please select trigger type"),
  delivery_preferences: z.array(deliveryPreferenceSchema),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
});

// Initial sequence data
export const getInitialSeqData = (customerId) => ({
  drip_name: "",
  drip_description: "",
  tag: [], 
  selectedTagObjects: [],
  target_type: "", 
  trigger_type: "",
  status: "active",
  color: "bg-teal-500",
  icon: "📧",
  customer_id: customerId ?? null,
  delivery_preferences: [
    {
      days: [], 
      time_type: "Any Time",
      time_from: "",
      time_to: "",
      timezone: "",
      allow_once: true,
      continue_after_delivery: false,
    },
  ],
  retry_settings: {
    max_attempts: 3,
    retry_delay_minutes: 10,
  },
  steps: [],
  updated_at: new Date().toLocaleString(),
});

// Steps config for wizard
export const WIZARD_STEPS = [
  { number: 1, title: "Sequence Info" },
  { number: 2, title: "Trigger & Schedule" },
  { number: 3, title: "Drip Messages" },
];
