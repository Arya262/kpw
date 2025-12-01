import { z } from 'zod';
import { getMessageLimit, isContactLimitExceeded } from './messageLimits';

export const VALIDATION_MESSAGES = {
  BROADCAST_NAME_REQUIRED: "Campaign name is required",
  GROUP_SELECTION_REQUIRED: "Please select at least one group",
  CONTACTS_REQUIRED: "Please add at least one contact",
  TEMPLATE_REQUIRED: "Please select a template",
  TEMPLATE_VARIABLES_REQUIRED: "Please fill in all template variables",
  SCHEDULE_REQUIRED: "Please select a date and time",
  CONTACT_LIMIT_EXCEEDED: (limit) => `You can only send to a maximum of ${limit.toLocaleString()} contacts at once`,
};

// Zod schemas for broadcast validation
export const broadcastNameSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.BROADCAST_NAME_REQUIRED)
  .min(3, "Campaign name must be at least 3 characters")
  .max(100, "Campaign name must be 100 characters or less");

export const broadcastFormSchema = z.object({
  broadcastName: broadcastNameSchema,
  group_id: z.array(z.string()).optional(),
  directContacts: z.array(z.any()).optional(),
  selectedTemplate: z.any().refine((val) => val !== null && val !== undefined, {
    message: VALIDATION_MESSAGES.TEMPLATE_REQUIRED,
  }),
  schedule: z.enum(["Yes", "No"]).optional(),
  isDirectBroadcast: z.boolean().optional(),
});


export const validateBroadcastName = (broadcastName) => {
  const result = broadcastNameSchema.safeParse(broadcastName?.trim() || '');
  if (!result.success) {
    return result.error.errors[0]?.message || VALIDATION_MESSAGES.BROADCAST_NAME_REQUIRED;
  }
  return null;
};


export const validateGroupSelection = (groupIds, isDirectBroadcast) => {
  if (!isDirectBroadcast && (!Array.isArray(groupIds) || groupIds.length === 0)) {
    return VALIDATION_MESSAGES.GROUP_SELECTION_REQUIRED;
  }
  return null;
};


export const validateDirectContacts = (directContacts, isDirectBroadcast) => {
  if (isDirectBroadcast && (!directContacts || directContacts.length === 0)) {
    return VALIDATION_MESSAGES.CONTACTS_REQUIRED;
  }
  return null;
};


export const validateTemplateSelection = (selectedTemplate) => {
  if (!selectedTemplate) {
    return VALIDATION_MESSAGES.TEMPLATE_REQUIRED;
  }
  return null;
};


export const validateTemplateParameters = (templateParameters, selectedTemplate) => {
  if (!selectedTemplate) return null;

  const hasDynamicFields =
    templateParameters?.length > 0 ||
    selectedTemplate?.data?.includes("{{");

  if (hasDynamicFields) {
    const hasEmptyFields = templateParameters?.some(param => {
      if (!param) return true;

      switch (param.type) {
        case "text":
          return !param.value?.trim();
        case "image":
          return !param.image?.id && !param.image?.url;
        case "video":
          return !param.video?.id && !param.video?.url;
        default:
          return false;
      }
    });

    if (hasEmptyFields) {
      return VALIDATION_MESSAGES.TEMPLATE_VARIABLES_REQUIRED;
    }
  }

  return null;
};


export const validateSchedule = (schedule, selectedDate) => {
  if (schedule === "Yes" && !selectedDate) {
    return VALIDATION_MESSAGES.SCHEDULE_REQUIRED;
  }
  return null;
};


export const validateContactLimits = (totalContacts, wabaInfo, remainingQuota = null, contactIds = [], existingUniqueContacts = new Set()) => {
  const newUniqueContacts = contactIds.filter(id => !existingUniqueContacts.has(id));
  const uniqueContactCount = newUniqueContacts.length;
  
  if (remainingQuota !== null) {
    if (uniqueContactCount > remainingQuota) {
      return `Insufficient quota. You can send to ${remainingQuota} more unique contacts today.`;
    }
  } else if (isContactLimitExceeded(uniqueContactCount, wabaInfo)) {
    const messageLimit = getMessageLimit(wabaInfo);
    return VALIDATION_MESSAGES.CONTACT_LIMIT_EXCEEDED(messageLimit);
  }
  return null;
};


export const validateStep = (formData, step, additionalData = {}) => {
  const errors = {};
  const { selectedDate, wabaInfo, totalSelectedContacts } = additionalData;
  const isDirectBroadcast = formData.isDirectBroadcast;

  switch (step) {
    case 1:
      const nameError = validateBroadcastName(formData.broadcastName);
      if (nameError) errors.broadcastName = nameError;
      break;

    case 2:
      if (!isDirectBroadcast) {
        const groupError = validateGroupSelection(formData.group_id, isDirectBroadcast);
        if (groupError) errors.group_id = groupError;
      } else {
        const contactError = validateDirectContacts(formData.directContacts, isDirectBroadcast);
        if (contactError) errors.audience = contactError;
      }
      break;

    case 3:
      const templateError = validateTemplateSelection(formData.selectedTemplate);
      if (templateError) {
        errors.template = templateError;
      } else {
        const paramError = validateTemplateParameters(formData.templateParameters, formData.selectedTemplate);
        if (paramError) errors.template = paramError;
      }
      break;

    case 4:
      const scheduleError = validateSchedule(formData.schedule, selectedDate);
      if (scheduleError) errors.schedule = scheduleError;
      break;

    case 5:
    
      const finalNameError = validateBroadcastName(formData.broadcastName);
      if (finalNameError) errors.broadcastName = finalNameError;

      if (!isDirectBroadcast) {
        const finalGroupError = validateGroupSelection(formData.group_id, isDirectBroadcast);
        if (finalGroupError) errors.group_id = finalGroupError;
      } else {
        const finalContactError = validateDirectContacts(formData.directContacts, isDirectBroadcast);
        if (finalContactError) errors.audience = finalContactError;
      }

      const finalTemplateError = validateTemplateSelection(formData.selectedTemplate);
      if (finalTemplateError) {
        errors.template = finalTemplateError;
      } else {
        const finalParamError = validateTemplateParameters(formData.templateParameters, formData.selectedTemplate);
        if (finalParamError) errors.template = finalParamError;
      }

      const finalScheduleError = validateSchedule(formData.schedule, selectedDate);
      if (finalScheduleError) errors.schedule = finalScheduleError;

     
      if (totalSelectedContacts !== undefined && wabaInfo) {
        const contactIds = additionalData.contactIds || [];
        const existingUniqueContacts = additionalData.existingUniqueContacts || new Set();
        const limitError = validateContactLimits(totalSelectedContacts, wabaInfo, additionalData.remainingQuota, contactIds, existingUniqueContacts);
        if (limitError) errors.audience = limitError;
      }
      break;
  }

  return errors;
};
