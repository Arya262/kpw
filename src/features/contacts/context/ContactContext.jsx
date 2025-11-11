/**
 * Contact Context - Central state management for all contact-related components
 * Uses useReducer for efficient state management
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { contactReducer, initialState } from '../reducers/contactReducer';

const ContactContext = createContext(null);

export const ContactProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  // Action creators for better DX
  const actions = {
    // Modal actions
    openAddContact: useCallback(() => {
      dispatch({ type: 'OPEN_ADD_CONTACT' });
    }, []),

    closeAddContact: useCallback(() => {
      dispatch({ type: 'CLOSE_ADD_CONTACT' });
    }, []),

    openEditContact: useCallback((contact) => {
      dispatch({ type: 'OPEN_EDIT_CONTACT', payload: contact });
    }, []),

    closeEditContact: useCallback(() => {
      dispatch({ type: 'CLOSE_EDIT_CONTACT' });
    }, []),

    openDeleteContact: useCallback((contact) => {
      dispatch({ type: 'OPEN_DELETE_CONTACT', payload: contact });
    }, []),

    closeDeleteContact: useCallback(() => {
      dispatch({ type: 'CLOSE_DELETE_CONTACT' });
    }, []),

    openBulkDelete: useCallback(() => {
      dispatch({ type: 'OPEN_BULK_DELETE' });
    }, []),

    closeBulkDelete: useCallback(() => {
      dispatch({ type: 'CLOSE_BULK_DELETE' });
    }, []),

    openGroupDialog: useCallback((contacts) => {
      dispatch({ type: 'OPEN_GROUP_DIALOG', payload: contacts });
    }, []),

    closeGroupDialog: useCallback(() => {
      dispatch({ type: 'CLOSE_GROUP_DIALOG' });
    }, []),

    openExportDialog: useCallback(() => {
      dispatch({ type: 'OPEN_EXPORT_DIALOG' });
    }, []),

    closeExportDialog: useCallback(() => {
      dispatch({ type: 'CLOSE_EXPORT_DIALOG' });
    }, []),

    openFilterDialog: useCallback(() => {
      dispatch({ type: 'OPEN_FILTER_DIALOG' });
    }, []),

    closeFilterDialog: useCallback(() => {
      dispatch({ type: 'CLOSE_FILTER_DIALOG' });
    }, []),

    openPlansModal: useCallback((action) => {
      dispatch({ type: 'OPEN_PLANS_MODAL', payload: action });
    }, []),

    closePlansModal: useCallback(() => {
      dispatch({ type: 'CLOSE_PLANS_MODAL' });
    }, []),

    closeAllModals: useCallback(() => {
      dispatch({ type: 'CLOSE_ALL_MODALS' });
    }, []),

    // Filter actions
    setSearchTerm: useCallback((term) => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    }, []),

    setActiveFilter: useCallback((filter) => {
      dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
    }, []),

    updateFilterOptions: useCallback((options) => {
      dispatch({ type: 'UPDATE_FILTER_OPTIONS', payload: options });
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: 'RESET_FILTERS' });
    }, []),

    // Loading actions
    startLoading: useCallback((type) => {
      dispatch({ type: 'START_LOADING', payload: type });
    }, []),

    stopLoading: useCallback((type) => {
      dispatch({ type: 'STOP_LOADING', payload: type });
    }, []),

    setSubmitting: useCallback((isSubmitting) => {
      dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
    }, []),

    // Selection actions
    selectContact: useCallback((contactId, isSelected) => {
      dispatch({ type: 'SELECT_CONTACT', payload: { contactId, isSelected } });
    }, []),

    selectAllPage: useCallback((contacts) => {
      dispatch({ type: 'SELECT_ALL_PAGE', payload: contacts });
    }, []),

    selectAllContacts: useCallback(() => {
      dispatch({ type: 'SELECT_ALL_CONTACTS' });
    }, []),

    deselectAllPage: useCallback(() => {
      dispatch({ type: 'DESELECT_ALL_PAGE' });
    }, []),

    clearSelection: useCallback(() => {
      dispatch({ type: 'CLEAR_SELECTION' });
    }, []),

    // Export actions
    setExportFormat: useCallback((format) => {
      dispatch({ type: 'SET_EXPORT_FORMAT', payload: format });
    }, []),

    setSelectedContactsForGroup: useCallback((contacts) => {
      dispatch({ type: 'SET_SELECTED_CONTACTS_FOR_GROUP', payload: contacts });
    }, []),

    // Error actions
    setError: useCallback((error) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' });
    }, []),

    // Data actions
    setContacts: useCallback((contacts) => {
      dispatch({ type: 'SET_CONTACTS', payload: contacts });
    }, []),

    setPagination: useCallback((pagination) => {
      dispatch({ type: 'SET_PAGINATION', payload: pagination });
    }, []),

    // Form state actions (for AddContact and EditContact)
    updateFormField: useCallback((field, value) => {
      dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field, value } });
    }, []),

    resetForm: useCallback(() => {
      dispatch({ type: 'RESET_FORM' });
    }, []),

    setFormError: useCallback((field, error) => {
      dispatch({ type: 'SET_FORM_ERROR', payload: { field, error } });
    }, []),

    clearFormError: useCallback((field) => {
      dispatch({ type: 'CLEAR_FORM_ERROR', payload: field });
    }, []),

    setFormSuccess: useCallback((message) => {
      dispatch({ type: 'SET_FORM_SUCCESS', payload: message });
    }, []),

    setFormLoading: useCallback((isLoading) => {
      dispatch({ type: 'SET_FORM_LOADING', payload: isLoading });
    }, []),
  };

  const value = {
    state,
    dispatch,
    ...actions,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContactContext = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within ContactProvider');
  }
  return context;
};

export default ContactContext;
