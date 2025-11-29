import { useState, useCallback } from "react";

export const useFormValidation = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState({});

  const validateField = useCallback((fieldName, value, rules = {}) => {
    let error = "";

    if (rules.required && (!value || !value.toString().trim())) {
      error = `${rules.label || fieldName} is required`;
    } else if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Please enter a valid email address";
    } else if (rules.minLength && value && value.length < rules.minLength) {
      error = `${rules.label || fieldName} must be at least ${rules.minLength} characters`;
    } else if (rules.maxLength && value && value.length > rules.maxLength) {
      error = `${rules.label || fieldName} must be no more than ${rules.maxLength} characters`;
    } else if (rules.pattern && value && !rules.pattern.test(value)) {
      error = rules.patternMessage || `${rules.label || fieldName} format is invalid`;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error === "";
  }, []);

  const validateForm = useCallback((formData, validationRules) => {
    let isValid = true;
    const newErrors = {};

    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const fieldValue = formData[fieldName];
      const fieldValid = validateField(fieldName, fieldValue, rules);
      
      if (!fieldValid) {
        isValid = false;
        newErrors[fieldName] = errors[fieldName];
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [errors, validateField]);

  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);


  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
};
