# Architecture Overview - useReducer Implementation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ContactProvider (Context)                 │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │     useReducer(contactReducer)           │     │    │
│  │  │                                          │     │    │
│  │  │  State:                                  │     │    │
│  │  │  ├─ ui (modals, dialogs)                │     │    │
│  │  │  ├─ filters (search, options)           │     │    │
│  │  │  ├─ loading (contacts, export, etc)     │     │    │
│  │  │  ├─ selection (mode, selected, excluded)│     │    │
│  │  │  ├─ export (format, contacts)           │     │    │
│  │  │  ├─ form (phone, name, tags, etc)       │     │    │
│  │  │  └─ error                                │     │    │
│  │  │                                          │     │    │
│  │  │  Actions: 50+ action creators           │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         Child Components                  │     │    │
│  │  │                                          │     │    │
│  │  │  ├─ ContactList                         │     │    │
│  │  │  ├─ AddContact                          │     │    │
│  │  │  ├─ EditContact                         │     │    │
│  │  │  ├─ ContactTable                        │     │    │
│  │  │  ├─ ContactModals                       │     │    │
│  │  │  └─ ... other components                │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### 1. User Action
```
User clicks "Add Contact" button
         ↓
ContactList component
         ↓
Calls: openAddContact()
```

### 2. Action Dispatch
```
openAddContact()
         ↓
dispatch({ type: 'OPEN_ADD_CONTACT' })
         ↓
contactReducer receives action
```

### 3. State Update
```
contactReducer
         ↓
switch (action.type)
         ↓
case 'OPEN_ADD_CONTACT':
  return {
    ...state,
    ui: {
      ...state.ui,
      modals: {
        ...state.ui.modals,
        addContact: true
      }
    }
  }
```

### 4. Component Re-render
```
New state returned
         ↓
Context updates
         ↓
Components using context re-render
         ↓
Modal appears on screen
```

## 🔄 Complete Flow Example

### Opening Edit Modal

```
┌──────────────────────────────────────────────────────────┐
│ 1. User Action                                           │
│    User clicks "Edit" button on contact row             │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Event Handler                                         │
│    handleEditClick(contact)                              │
│    ├─ Check permissions                                  │
│    └─ Call: openEditContact(contact)                     │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Action Creator                                        │
│    openEditContact(contact) {                            │
│      dispatch({                                          │
│        type: 'OPEN_EDIT_CONTACT',                        │
│        payload: contact                                  │
│      })                                                  │
│    }                                                     │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Reducer                                               │
│    case 'OPEN_EDIT_CONTACT':                             │
│      return {                                            │
│        ...state,                                         │
│        ui: {                                             │
│          ...state.ui,                                    │
│          modals: {                                       │
│            ...state.ui.modals,                           │
│            editContact: action.payload,                  │
│            addContact: false                             │
│          }                                               │
│        },                                                │
│        form: {                                           │
│          ...state.form,                                  │
│          phone: action.payload.mobile_no,                │
│          name: action.payload.first_name,                │
│          selectedTags: action.payload.tags               │
│        }                                                 │
│      }                                                   │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Context Update                                        │
│    New state propagated to all consumers                 │
└────────────────────┬─────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 6. Component Re-render                                   │
│    ContactModals component receives new state            │
│    ├─ editContact is now set                             │
│    ├─ form is pre-populated                              │
│    └─ EditContact modal appears                          │
└──────────────────────────────────────────────────────────┘
```

## 🎯 Component Hierarchy

```
App
└── ContactProvider
    └── Routes
        └── ContactList
            ├── ContactListHeader
            │   ├── Search Input
            │   ├── Filter Buttons
            │   └── Add Contact Button
            │
            ├── FilterDialog
            │
            ├── ContactTable
            │   ├── ContactRow (multiple)
            │   │   ├── Checkbox
            │   │   ├── Contact Info
            │   │   └── Action Buttons
            │   │       ├── Edit Button
            │   │       └── Delete Button
            │   └── ContactActions
            │
            ├── Pagination
            │
            └── ContactModals
                ├── AddContact Modal
                │   ├── ContactTabs
                │   ├── SingleContactForm
                │   └── BulkContactForm
                │
                ├── EditContact Modal
                │   └── SingleContactForm
                │
                ├── DeleteContact Dialog
                ├── BulkDelete Dialog
                ├── GroupDialog
                ├── ExportDialog
                └── PlansModal
```

## 🔌 Context Usage

### Components Using Context

```
┌─────────────────────────────────────────────────────┐
│ ContactList (Main Component)                        │
│ ├─ Uses: Full state and all actions                 │
│ ├─ Manages: All user interactions                   │
│ └─ Coordinates: Child components                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ AddContact (Form Component)                         │
│ ├─ Uses: form state, updateFormField                │
│ ├─ Manages: Form inputs and validation              │
│ └─ Submits: Contact data to API                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ EditContact (Form Component)                        │
│ ├─ Uses: form state, editContact modal state        │
│ ├─ Manages: Form updates                            │
│ └─ Submits: Updated contact data                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ContactModals (Modal Container)                     │
│ ├─ Uses: All modal states                           │
│ ├─ Manages: Modal visibility                        │
│ └─ Renders: Appropriate modals                      │
└─────────────────────────────────────────────────────┘
```

### Components NOT Using Context (Props Only)

```
┌─────────────────────────────────────────────────────┐
│ ContactRow, ContactTable, ContactListHeader, etc.   │
│ ├─ Receive: Props from parent                       │
│ ├─ Emit: Events to parent                           │
│ └─ Benefit: Easier to test and reuse                │
└─────────────────────────────────────────────────────┘
```

## 📦 File Structure

```
kpw/src/features/contacts/
│
├── context/
│   └── ContactContext.jsx          ← Provider & action creators
│
├── reducers/
│   └── contactReducer.js           ← State logic & action types
│
├── hooks/
│   ├── useContactData.js           ← Data fetching (unchanged)
│   └── useContactSelection.js      ← Selection logic (can be removed)
│
├── components/
│   ├── ContactListHeader.jsx       ← Presentational (props only)
│   ├── ContactTable.jsx            ← Presentational (props only)
│   ├── ContactRow.jsx              ← Presentational (props only)
│   ├── ContactModals.jsx           ← Uses context for modal states
│   └── ... other components
│
├── utils/
│   └── contactUtils.js             ← Helper functions (unchanged)
│
├── ContactList.jsx                 ← Main component (uses context)
├── Addcontact.jsx                  ← Form component (uses context)
├── EditContact.jsx                 ← Form component (uses context)
└── ... other components
```

## 🔄 State Management Comparison

### Before (useState)

```
ContactList Component
├── useState (searchTerm)
├── useState (filter)
├── useState (filterDialogOpen)
├── useState (isPopupOpen)
├── useState (editContact)
├── useState (deleteContact)
├── useState (showDeleteDialog)
├── useState (showExitDialog)
├── useState (showGroupDialog)
├── useState (showExportDialog)
├── useState (exportFormat)
├── useState (showPlansModal)
├── useState (actionRequiringPlan)
├── useState (selectedContactsForGroup)
├── useState (isSubmittingGroup)
└── useState (filterOptions)

Total: 16 separate state variables
Problem: Hard to manage, easy to get out of sync
```

### After (useReducer)

```
ContactProvider
└── useReducer(contactReducer, initialState)
    └── state
        ├── ui
        │   ├── modals (8 modal states)
        │   └── actionRequiringPlan
        ├── filters
        │   ├── searchTerm
        │   ├── activeFilter
        │   └── options
        ├── loading (5 loading states)
        ├── selection
        │   ├── mode
        │   ├── selected
        │   └── excluded
        ├── export
        │   ├── format
        │   └── selectedContacts
        ├── form (10+ form fields)
        └── error

Total: 1 organized state object
Benefit: Centralized, atomic updates, easy to debug
```

## 🎨 Action Flow Diagram

```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│  Event Handler      │
│  (in component)     │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Action Creator     │
│  (from context)     │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  dispatch(action)   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  contactReducer     │
│  (pure function)    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  New State          │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Context Update     │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Component          │
│  Re-render          │
└─────────────────────┘
```

## 🧪 Testing Architecture

```
┌─────────────────────────────────────────────────────┐
│ Unit Tests                                          │
│ ├─ Reducer Tests (pure functions)                   │
│ │  ├─ Test each action type                         │
│ │  ├─ Test state transitions                        │
│ │  └─ Test edge cases                               │
│ │                                                    │
│ ├─ Action Creator Tests                             │
│ │  ├─ Test dispatch calls                           │
│ │  └─ Test payload formatting                       │
│ │                                                    │
│ └─ Component Tests                                  │
│    ├─ Test with mock context                        │
│    ├─ Test user interactions                        │
│    └─ Test rendering                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Integration Tests                                   │
│ ├─ Test with real context                           │
│ ├─ Test complete user flows                         │
│ └─ Test state persistence                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ E2E Tests                                           │
│ ├─ Test full application flow                       │
│ ├─ Test with real API                               │
│ └─ Test error scenarios                             │
└─────────────────────────────────────────────────────┘
```

## 🚀 Performance Optimization

```
┌─────────────────────────────────────────────────────┐
│ Optimization Strategies                             │
│                                                     │
│ 1. Memoization                                      │
│    ├─ useCallback for action creators ✅            │
│    ├─ useMemo for derived state                     │
│    └─ React.memo for child components               │
│                                                     │
│ 2. Context Splitting (if needed)                    │
│    ├─ Separate context for rarely changing data     │
│    └─ Separate context for frequently changing data │
│                                                     │
│ 3. Lazy Loading                                     │
│    ├─ Code split modals                             │
│    └─ Lazy load heavy components                    │
│                                                     │
│ 4. Virtualization                                   │
│    ├─ Virtual scrolling for large lists             │
│    └─ Pagination (already implemented)              │
└─────────────────────────────────────────────────────┘
```

## 📊 Metrics & Monitoring

```
┌─────────────────────────────────────────────────────┐
│ What to Monitor                                     │
│                                                     │
│ 1. Performance                                      │
│    ├─ Component render count                        │
│    ├─ State update frequency                        │
│    └─ Time to interactive                           │
│                                                     │
│ 2. Errors                                           │
│    ├─ Console errors                                │
│    ├─ API failures                                  │
│    └─ State inconsistencies                         │
│                                                     │
│ 3. User Experience                                  │
│    ├─ Modal open/close time                         │
│    ├─ Search response time                          │
│    └─ Action completion rate                        │
└─────────────────────────────────────────────────────┘
```

## 🎯 Summary

This architecture provides:
- ✅ **Centralized state** - One source of truth
- ✅ **Predictable updates** - All changes through reducer
- ✅ **Easy debugging** - Clear action flow
- ✅ **Better performance** - Fewer re-renders
- ✅ **Scalable** - Easy to add new features
- ✅ **Testable** - Pure functions, easy to test
- ✅ **Maintainable** - Clear structure and patterns

**Ready to implement? Start with `IMPLEMENTATION_CHECKLIST.md`!** 🚀
