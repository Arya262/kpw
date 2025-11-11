# Lighthouse Optimization Guide - Contacts Folder

## 🎯 Goal: Improve Lighthouse Scores

Current scores affecting contacts page:
- **Performance: 55** → Target: **85+**
- **Accessibility: 74** → Target: **95+**
- **Best Practices: 83** → Target: **95+**

## 📊 Issues Found in Contacts Folder

### Performance Issues
1. ❌ Large bundle size (ContactList.jsx: 76.32 KB)
2. ❌ Heavy dependencies (react-phone-input-2: 81.88 KB)
3. ❌ No code splitting
4. ❌ Large icon imports

### Accessibility Issues
1. ❌ Checkboxes without labels
2. ❌ Buttons without accessible names
3. ❌ Select elements without labels
4. ❌ Low contrast text colors

### Best Practices Issues
1. ❌ No lazy loading
2. ❌ Large JavaScript files not minified

## 🚀 Fixes to Implement

### 1. Add Accessibility Labels (Highest Impact)

#### Fix 1.1: Checkbox Labels in ContactTable.jsx

**Current (Bad):**
```jsx
<input
  type="checkbox"
  className="form-checkbox w-4 h-4"
  checked={selection.mode === 'page' || selection.mode === 'all'}
  onChange={(e) => onSelectAllChange(e, displayedContacts)}
/>
```

**Fixed (Good):**
```jsx
<input
  type="checkbox"
  className="form-checkbox w-4 h-4"
  checked={selection.mode === 'page' || selection.mode === 'all'}
  onChange={(e) => onSelectAllChange(e, displayedContacts)}
  aria-label="Select all contacts on this page"
  id="select-all-checkbox"
/>
```

#### Fix 1.2: Contact Row Checkboxes

**Current (Bad):**
```jsx
<input
  type="checkbox"
  className="form-checkbox w-4 h-4"
  checked={isChecked}
  onChange={(e) => onCheckboxChange(contact.contact_id, e.target.checked)}
/>
```

**Fixed (Good):**
```jsx
<input
  type="checkbox"
  className="form-checkbox w-4 h-4"
  checked={isChecked}
  onChange={(e) => onCheckboxChange(contact.contact_id, e.target.checked)}
  aria-label={`Select ${contact.fullName || 'contact'}`}
  id={`contact-checkbox-${contact.contact_id}`}
/>
```

#### Fix 1.3: Pagination Select

**Current (Bad):**
```jsx
<select
  className="appearance-none bg-white border..."
  value={itemsPerPage}
  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
>
  <option value={5}>5</option>
  <option value={10}>10</option>
  <option value={25}>25</option>
  <option value={50}>50</option>
  <option value={100}>All</option>
</select>
```

**Fixed (Good):**
```jsx
<label htmlFor="items-per-page" className="sr-only">
  Items per page
</label>
<select
  id="items-per-page"
  className="appearance-none bg-white border..."
  value={itemsPerPage}
  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
  aria-label="Select number of items per page"
>
  <option value={5}>5</option>
  <option value={10}>10</option>
  <option value={25}>25</option>
  <option value={50}>50</option>
  <option value={100}>All</option>
</select>
```

#### Fix 1.4: Action Buttons

**Current (Bad):**
```jsx
<button className="p-1 text-gray-500 hover:text-gray-700">
  <svg>...</svg>
</button>
```

**Fixed (Good):**
```jsx
<button 
  className="p-1 text-gray-500 hover:text-gray-700"
  aria-label="More options"
  title="More options"
>
  <svg aria-hidden="true">...</svg>
</button>
```

### 2. Fix Color Contrast Issues

#### Fix 2.1: Update Low Contrast Colors

**File: ContactTable.jsx, ContactRow.jsx**

**Current (Bad):**
```jsx
<span className="text-gray-400 text-sm italic">No tags</span>
<div className="text-sm text-gray-500 italic">WhatsApp Number:</div>
```

**Fixed (Good):**
```jsx
<span className="text-gray-600 text-sm italic">No tags</span>
<div className="text-sm text-gray-700 italic">WhatsApp Number:</div>
```

#### Fix 2.2: Button Text Contrast

**Current (Bad):**
```jsx
<button className="text-gray-700 hover:text-[#0AA89E]">
  All (25)
</button>
```

**Fixed (Good):**
```jsx
<button className="text-gray-800 hover:text-[#0AA89E]">
  All (25)
</button>
```

### 3. Optimize Icon Imports (Performance)

#### Fix 3.1: Tree-shake Icon Imports

**Current (Bad) - ContactTabs.jsx:**
```jsx
import { FiUpload } from 'react-icons/fi';
```

**Fixed (Good):**
```jsx
// Create a separate icons file
// kpw/src/features/contacts/icons.js
export { FiUpload } from 'react-icons/fi';

// Then import from there
import { FiUpload } from './icons';
```

Better yet, use inline SVG for frequently used icons:

```jsx
// Instead of importing FiUpload
const UploadIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
```

### 4. Lazy Load Heavy Components

#### Fix 4.1: Lazy Load BulkContactForm

**File: Addcontact.jsx**

**Current (Bad):**
```jsx
import BulkContactForm from "./BulkContactForm";
```

**Fixed (Good):**
```jsx
import { lazy, Suspense } from 'react';

const BulkContactForm = lazy(() => import("./BulkContactForm"));

// In render:
{tab === "bulk" ? (
  <Suspense fallback={<div>Loading...</div>}>
    <BulkContactForm {...props} />
  </Suspense>
) : (
  <SingleContactForm {...props} />
)}
```

#### Fix 4.2: Lazy Load Modals

**File: ContactModals.jsx**

**Current (Bad):**
```jsx
import AddContact from "../Addcontact";
import EditContact from "../EditContact";
```

**Fixed (Good):**
```jsx
import { lazy, Suspense } from 'react';

const AddContact = lazy(() => import("../Addcontact"));
const EditContact = lazy(() => import("../EditContact"));

// In render:
{isAddContactOpen && (
  <Suspense fallback={<div className="p-4">Loading...</div>}>
    <AddContact {...props} />
  </Suspense>
)}
```

### 5. Optimize Phone Input Library

#### Fix 5.1: Use Dynamic Import

**File: BulkContactForm.jsx**

**Current (Bad):**
```jsx
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
```

**Fixed (Good):**
```jsx
import { lazy, Suspense } from 'react';

const PhoneInput = lazy(() => import("react-phone-input-2"));

// In render:
<Suspense fallback={<input type="text" placeholder="Loading..." />}>
  <PhoneInput {...props} />
</Suspense>
```

Or better yet, create a lightweight custom phone input:

```jsx
// CustomPhoneInput.jsx
const CustomPhoneInput = ({ value, onChange, country }) => {
  const countryCodes = {
    in: '+91',
    us: '+1',
    gb: '+44',
    // ... add only countries you need
  };

  return (
    <div className="flex">
      <select 
        value={country}
        onChange={(e) => onChange(countryCodes[e.target.value])}
        className="border rounded-l px-2"
        aria-label="Select country code"
      >
        <option value="in">🇮🇳 +91</option>
        <option value="us">🇺🇸 +1</option>
        <option value="gb">🇬🇧 +44</option>
      </select>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-r px-3 py-2 flex-1"
        placeholder="Phone number"
        aria-label="Phone number"
      />
    </div>
  );
};
```

### 6. Add Loading States

#### Fix 6.1: Skeleton Loaders

**Create: SkeletonLoader.jsx**

```jsx
export const ContactRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-2 py-4">
      <div className="h-4 w-4 bg-gray-200 rounded"></div>
    </td>
    <td className="px-2 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-2 py-4">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-2 py-4">
      <div className="h-4 bg-gray-200 rounded w-40"></div>
    </td>
  </tr>
);

export const ContactTableSkeleton = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <ContactRowSkeleton key={i} />
    ))}
  </>
);
```

**Use in ContactTable.jsx:**

```jsx
{loading.contacts ? (
  <ContactTableSkeleton />
) : displayedContacts.length === 0 ? (
  <tr>
    <td colSpan="8" className="text-center py-4">
      No contacts found.
    </td>
  </tr>
) : (
  displayedContacts.map((contact) => (
    <ContactRow key={contact.contact_id} {...props} />
  ))
)}
```

### 7. Optimize Images

#### Fix 7.1: Add Image Optimization

**File: ContactRow.jsx (if you have avatars)**

**Current (Bad):**
```jsx
<img src={contact.avatar} alt={contact.name} />
```

**Fixed (Good):**
```jsx
<img 
  src={contact.avatar} 
  alt={`${contact.name} avatar`}
  width="45"
  height="45"
  loading="lazy"
  decoding="async"
  className="rounded-full"
/>
```

### 8. Add Proper ARIA Roles

#### Fix 8.1: Table Accessibility

**File: ContactTable.jsx**

**Current (Bad):**
```jsx
<table className="w-full text-sm text-center">
```

**Fixed (Good):**
```jsx
<table 
  className="w-full text-sm text-center"
  role="table"
  aria-label="Contacts list"
>
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader" scope="col">...</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
    <tr role="row">
      <td role="cell">...</td>
    </tr>
  </tbody>
</table>
```

### 9. Reduce Bundle Size

#### Fix 9.1: Remove Unused Imports

**Check all files for unused imports:**

```bash
# Run this to find unused imports
npx depcheck
```

#### Fix 9.2: Use Smaller Alternatives

**Instead of Papa Parse (28.53 KB), use native CSV parsing:**

```jsx
// CustomCSVParser.js
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = values[i]?.trim() || '';
          return obj;
        }, {});
      });
      resolve({ data, headers });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
```

## 📝 Implementation Checklist

### Phase 1: Accessibility (Highest Impact - 1 day)
- [ ] Add aria-labels to all checkboxes
- [ ] Add labels to select elements
- [ ] Add aria-labels to icon buttons
- [ ] Fix color contrast (gray-400 → gray-600)
- [ ] Add proper table roles
- [ ] Test with screen reader

### Phase 2: Performance (Medium Impact - 2 days)
- [ ] Lazy load BulkContactForm
- [ ] Lazy load modals (AddContact, EditContact)
- [ ] Optimize icon imports (use inline SVG)
- [ ] Add skeleton loaders
- [ ] Optimize images (add width, height, loading="lazy")

### Phase 3: Bundle Optimization (High Impact - 1 day)
- [ ] Replace react-phone-input-2 with custom component
- [ ] Replace Papa Parse with native parser
- [ ] Remove unused imports
- [ ] Code split large components

### Phase 4: Testing (1 day)
- [ ] Run Lighthouse again
- [ ] Test accessibility with keyboard navigation
- [ ] Test with screen reader
- [ ] Verify all features still work

## 🎯 Expected Results

### After Phase 1 (Accessibility):
- Accessibility: 74 → **95+** (+21 points) ✅

### After Phase 2 (Performance):
- Performance: 55 → **70+** (+15 points) ✅

### After Phase 3 (Bundle):
- Performance: 70 → **85+** (+15 points) ✅
- Best Practices: 83 → **95+** (+12 points) ✅

### Total Expected Improvement:
- **Performance: 55 → 85** (+30 points) 🚀
- **Accessibility: 74 → 95** (+21 points) 🚀
- **Best Practices: 83 → 95** (+12 points) 🚀

## 🔧 Quick Wins (Do These First)

### 1. Add Accessibility Labels (30 minutes)
```jsx
// ContactTable.jsx - Line ~30
<input
  type="checkbox"
  aria-label="Select all contacts"
  // ... rest of props
/>

// ContactRow.jsx - Line ~45
<input
  type="checkbox"
  aria-label={`Select ${contact.fullName}`}
  // ... rest of props
/>

// Pagination.jsx - Line ~20
<select
  aria-label="Items per page"
  // ... rest of props
/>
```

### 2. Fix Color Contrast (15 minutes)
```jsx
// Find and replace in all files:
// text-gray-400 → text-gray-600
// text-gray-500 → text-gray-700
```

### 3. Add Image Optimization (10 minutes)
```jsx
// Add to any <img> tags:
width="45"
height="45"
loading="lazy"
```

## 📊 Measuring Success

### Before Changes:
```bash
npm run build
npx lighthouse http://localhost:3000/contact --view
```

### After Each Phase:
```bash
npm run build
npx lighthouse http://localhost:3000/contact --view
```

### Compare Results:
- Save each report
- Compare scores
- Verify improvements

## 🎉 Summary

**Total Time: ~5 days**
**Expected Score Improvements:**
- Performance: +30 points
- Accessibility: +21 points
- Best Practices: +12 points

**Files to Modify:**
1. ContactTable.jsx (accessibility)
2. ContactRow.jsx (accessibility)
3. Pagination.jsx (accessibility)
4. ContactListHeader.jsx (accessibility)
5. Addcontact.jsx (lazy loading)
6. ContactModals.jsx (lazy loading)
7. BulkContactForm.jsx (optimization)
8. All files (color contrast)

**Start with Phase 1 (Accessibility) for the biggest impact!** 🚀
