export const initialState = {
  // UI State
  ui: {
    modals: {
      addContact: false,
      editContact: null,
      deleteContact: null,
      bulkDelete: false,
      group: false,
      export: false,
      plans: false,
      filter: false,
      exitConfirmation: false,
    },
    actionRequiringPlan: null,
  },

  // Filter State
  filters: {
    searchTerm: '',
    activeFilter: 'All',
    options: {
      name: '',
      phone: '',
      email: '',
      status: '',
      date: '',
      group: '',
      lastSeenQuick: '',
      lastSeenFrom: '',
      lastSeenTo: '',
      createdAtQuick: '',
      createdAtFrom: '',
      createdAtTo: '',
      optedIn: 'All',
      incomingBlocked: 'All',
      readStatus: 'All',
      attribute: '',
      operator: 'is',
      attributeValue: '',
      selectedTags: [],
    },
  },

  // Loading State
  loading: {
    contacts: false,
    export: false,
    delete: false,
    sync: false,
    submitting: false,
  },

  // Selection State
  selection: {
    mode: 'none', // 'none' | 'page' | 'all'
    selected: {},
    excluded: {},
  },

  // Export State
  export: {
    format: 'csv',
    selectedContacts: {
      ids: [],
      list: [],
    },
  },

  // Data State
  data: {
    contacts: [],
    allContacts: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },

  // Error State
  error: null,

  // Form State (for AddContact and EditContact)
  form: {
    phone: '',
    name: '',
    email: '',
    optStatus: 'Opted In',
    selectedTags: [],
    file: null,
    fieldMapping: {},
    extractedContacts: [],
    countryCode: { dialCode: '91', countryCode: 'in' },
    errors: {},
    successMessage: '',
    errorMessage: '',
    isLoading: false,
    isTouched: false,
  },
};

// Action types
export const ACTION_TYPES = {
  // Modal actions
  OPEN_ADD_CONTACT: 'OPEN_ADD_CONTACT',
  CLOSE_ADD_CONTACT: 'CLOSE_ADD_CONTACT',
  OPEN_EDIT_CONTACT: 'OPEN_EDIT_CONTACT',
  CLOSE_EDIT_CONTACT: 'CLOSE_EDIT_CONTACT',
  OPEN_DELETE_CONTACT: 'OPEN_DELETE_CONTACT',
  CLOSE_DELETE_CONTACT: 'CLOSE_DELETE_CONTACT',
  OPEN_BULK_DELETE: 'OPEN_BULK_DELETE',
  CLOSE_BULK_DELETE: 'CLOSE_BULK_DELETE',
  OPEN_GROUP_DIALOG: 'OPEN_GROUP_DIALOG',
  CLOSE_GROUP_DIALOG: 'CLOSE_GROUP_DIALOG',
  OPEN_EXPORT_DIALOG: 'OPEN_EXPORT_DIALOG',
  CLOSE_EXPORT_DIALOG: 'CLOSE_EXPORT_DIALOG',
  OPEN_FILTER_DIALOG: 'OPEN_FILTER_DIALOG',
  CLOSE_FILTER_DIALOG: 'CLOSE_FILTER_DIALOG',
  OPEN_PLANS_MODAL: 'OPEN_PLANS_MODAL',
  CLOSE_PLANS_MODAL: 'CLOSE_PLANS_MODAL',
  OPEN_EXIT_CONFIRMATION: 'OPEN_EXIT_CONFIRMATION',
  CLOSE_EXIT_CONFIRMATION: 'CLOSE_EXIT_CONFIRMATION',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',

  // Filter actions
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_ACTIVE_FILTER: 'SET_ACTIVE_FILTER',
  UPDATE_FILTER_OPTIONS: 'UPDATE_FILTER_OPTIONS',
  RESET_FILTERS: 'RESET_FILTERS',

  // Loading actions
  START_LOADING: 'START_LOADING',
  STOP_LOADING: 'STOP_LOADING',
  SET_SUBMITTING: 'SET_SUBMITTING',

  // Selection actions
  SELECT_CONTACT: 'SELECT_CONTACT',
  SELECT_ALL_PAGE: 'SELECT_ALL_PAGE',
  SELECT_ALL_CONTACTS: 'SELECT_ALL_CONTACTS',
  DESELECT_ALL_PAGE: 'DESELECT_ALL_PAGE',
  CLEAR_SELECTION: 'CLEAR_SELECTION',

  // Export actions
  SET_EXPORT_FORMAT: 'SET_EXPORT_FORMAT',
  SET_SELECTED_CONTACTS_FOR_GROUP: 'SET_SELECTED_CONTACTS_FOR_GROUP',

  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Data actions
  SET_CONTACTS: 'SET_CONTACTS',
  SET_PAGINATION: 'SET_PAGINATION',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
  DELETE_CONTACT: 'DELETE_CONTACT',

  // Form actions
  UPDATE_FORM_FIELD: 'UPDATE_FORM_FIELD',
  RESET_FORM: 'RESET_FORM',
  SET_FORM_ERROR: 'SET_FORM_ERROR',
  CLEAR_FORM_ERROR: 'CLEAR_FORM_ERROR',
  SET_FORM_SUCCESS: 'SET_FORM_SUCCESS',
  SET_FORM_LOADING: 'SET_FORM_LOADING',
  SET_FORM_TOUCHED: 'SET_FORM_TOUCHED',
};

// Reducer function
export const contactReducer = (state, action) => {
  switch (action.type) {
    // Modal actions
    case ACTION_TYPES.OPEN_ADD_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            addContact: true,
            editContact: null,
          },
        },
      };

    case ACTION_TYPES.CLOSE_ADD_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            addContact: false,
          },
        },
        form: initialState.form, // Reset form on close
      };

    case ACTION_TYPES.OPEN_EDIT_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            editContact: action.payload,
            addContact: false,
          },
        },
        form: {
          ...state.form,
          phone: `${action.payload.country_code || ''}${action.payload.mobile_no || ''}`,
          name: action.payload.first_name || '',
          optStatus: action.payload.is_active ? 'Opted In' : 'Opted Out',
          selectedTags: action.payload.tags || [],
        },
      };

    case ACTION_TYPES.CLOSE_EDIT_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            editContact: null,
          },
        },
        form: initialState.form,
      };

    case ACTION_TYPES.OPEN_DELETE_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            deleteContact: action.payload,
          },
        },
      };

    case ACTION_TYPES.CLOSE_DELETE_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            deleteContact: null,
          },
        },
      };

    case ACTION_TYPES.OPEN_BULK_DELETE:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            bulkDelete: true,
          },
        },
      };

    case ACTION_TYPES.CLOSE_BULK_DELETE:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            bulkDelete: false,
          },
        },
      };

    case ACTION_TYPES.OPEN_GROUP_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            group: true,
          },
        },
        export: {
          ...state.export,
          selectedContacts: action.payload || state.export.selectedContacts,
        },
      };

    case ACTION_TYPES.CLOSE_GROUP_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            group: false,
          },
        },
      };

    case ACTION_TYPES.OPEN_EXPORT_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            export: true,
          },
        },
      };

    case ACTION_TYPES.CLOSE_EXPORT_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            export: false,
          },
        },
      };

    case ACTION_TYPES.OPEN_FILTER_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            filter: true,
          },
        },
      };

    case ACTION_TYPES.CLOSE_FILTER_DIALOG:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            filter: false,
          },
        },
      };

    case ACTION_TYPES.OPEN_PLANS_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            plans: true,
          },
          actionRequiringPlan: action.payload,
        },
      };

    case ACTION_TYPES.CLOSE_PLANS_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            plans: false,
          },
          actionRequiringPlan: null,
        },
      };

    case ACTION_TYPES.OPEN_EXIT_CONFIRMATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            exitConfirmation: true,
          },
        },
      };

    case ACTION_TYPES.CLOSE_EXIT_CONFIRMATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            exitConfirmation: false,
          },
        },
      };

    case ACTION_TYPES.CLOSE_ALL_MODALS:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: initialState.ui.modals,
          actionRequiringPlan: null,
        },
      };

    // Filter actions
    case ACTION_TYPES.SET_SEARCH_TERM:
      return {
        ...state,
        filters: {
          ...state.filters,
          searchTerm: action.payload,
        },
      };

    case ACTION_TYPES.SET_ACTIVE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          activeFilter: action.payload,
        },
      };

    case ACTION_TYPES.UPDATE_FILTER_OPTIONS:
      return {
        ...state,
        filters: {
          ...state.filters,
          options: {
            ...state.filters.options,
            ...action.payload,
          },
        },
      };

    case ACTION_TYPES.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };

    // Loading actions
    case ACTION_TYPES.START_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload]: true,
        },
      };

    case ACTION_TYPES.STOP_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload]: false,
        },
      };

    case ACTION_TYPES.SET_SUBMITTING:
      return {
        ...state,
        loading: {
          ...state.loading,
          submitting: action.payload,
        },
      };

    // Selection actions
    case ACTION_TYPES.SELECT_CONTACT:
      const { contactId, isSelected } = action.payload;
      if (state.selection.mode === 'all') {
        const newExcluded = { ...state.selection.excluded };
        if (!isSelected) {
          newExcluded[contactId] = true;
        } else {
          delete newExcluded[contactId];
        }
        return {
          ...state,
          selection: {
            ...state.selection,
            excluded: newExcluded,
          },
        };
      } else {
        const newSelected = { ...state.selection.selected };
        if (isSelected) {
          newSelected[contactId] = true;
        } else {
          delete newSelected[contactId];
        }
        return {
          ...state,
          selection: {
            ...state.selection,
            selected: newSelected,
          },
        };
      }

    case ACTION_TYPES.SELECT_ALL_PAGE:
      return {
        ...state,
        selection: {
          mode: 'page',
          selected: action.payload.reduce((acc, contact) => ({
            ...acc,
            [contact.contact_id]: true,
          }), {}),
          excluded: {},
        },
      };

    case ACTION_TYPES.SELECT_ALL_CONTACTS:
      return {
        ...state,
        selection: {
          mode: 'all',
          selected: {},
          excluded: {},
        },
      };

    case ACTION_TYPES.DESELECT_ALL_PAGE:
      return {
        ...state,
        selection: {
          mode: 'none',
          selected: {},
          excluded: {},
        },
      };

    case ACTION_TYPES.CLEAR_SELECTION:
      return {
        ...state,
        selection: initialState.selection,
      };

    // Export actions
    case ACTION_TYPES.SET_EXPORT_FORMAT:
      return {
        ...state,
        export: {
          ...state.export,
          format: action.payload,
        },
      };

    case ACTION_TYPES.SET_SELECTED_CONTACTS_FOR_GROUP:
      return {
        ...state,
        export: {
          ...state.export,
          selectedContacts: action.payload,
        },
      };

    // Error actions
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // Data actions
    case ACTION_TYPES.SET_CONTACTS:
      return {
        ...state,
        data: {
          ...state.data,
          contacts: action.payload,
        },
      };

    case ACTION_TYPES.SET_PAGINATION:
      return {
        ...state,
        data: {
          ...state.data,
          pagination: {
            ...state.data.pagination,
            ...action.payload,
          },
        },
      };

    // Form actions
    case ACTION_TYPES.UPDATE_FORM_FIELD:
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.field]: action.payload.value,
        },
      };

    case ACTION_TYPES.RESET_FORM:
      return {
        ...state,
        form: initialState.form,
      };

    case ACTION_TYPES.SET_FORM_ERROR:
      return {
        ...state,
        form: {
          ...state.form,
          errors: {
            ...state.form.errors,
            [action.payload.field]: action.payload.error,
          },
        },
      };

    case ACTION_TYPES.CLEAR_FORM_ERROR:
      const newErrors = { ...state.form.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        form: {
          ...state.form,
          errors: newErrors,
        },
      };

    case ACTION_TYPES.SET_FORM_SUCCESS:
      return {
        ...state,
        form: {
          ...state.form,
          successMessage: action.payload,
          errorMessage: '',
        },
      };

    case ACTION_TYPES.SET_FORM_LOADING:
      return {
        ...state,
        form: {
          ...state.form,
          isLoading: action.payload,
        },
      };

    case ACTION_TYPES.SET_FORM_TOUCHED:
      return {
        ...state,
        form: {
          ...state.form,
          isTouched: action.payload,
        },
      };

    default:
      return state;
  }
};

export default contactReducer;
