/**
 * Contacts Module - Main Exports
 * 
 * This module now uses useReducer for state management
 * See README_USEREDUCER.md for implementation guide
 */

// Context and Provider
export { ContactProvider, useContactContext } from './context/ContactContext';

// Reducer and Actions
export { contactReducer, initialState, ACTION_TYPES } from './reducers/contactReducer';

// Main Components
export { default as ContactList } from './ContactList';
export { default as AddContact } from './Addcontact';
export { default as EditContact } from './EditContact';

// Sub Components
export { default as ContactRow } from './ContactRow';
export { default as ContactTabs } from './ContactTabs';
export { default as SingleContactForm } from './SingleContactForm';
export { default as BulkContactForm } from './BulkContactForm';

// Component Exports
export { default as ContactListHeader } from './components/ContactListHeader';
export { default as ContactTable } from './components/ContactTable';
export { default as ContactModals } from './components/ContactModals';
export { default as ContactActions } from './components/ContactActions';

// Hooks
export { useContactData } from './hooks/useContactData';
export { useContactSelection } from './hooks/useContactSelection';

// Utils
export * from './utils/contactUtils';
