# Template Selector - Visual Guide

## 🎨 Updated StepEditor with Visual Template Selection

The StepEditor now includes a beautiful visual template selector modal, similar to the ExploreTemplates page.

---

## ✨ Features

### 1. **Visual Template Cards**
- Grid layout with template previews
- Media thumbnails (images, videos, documents)
- Template name and category badges
- Status indicators (Approved/Pending)
- Selected state with checkmark

### 2. **Search Functionality**
- Real-time search by template name or category
- Search icon in input field
- Filtered results update instantly

### 3. **Template Information**
- Template name
- Category badge (Marketing, Utility, etc.)
- Language code
- Sample text preview
- Approval status

### 4. **Selection States**
- **Not Selected**: Gray border, hover effect
- **Selected**: Teal border with ring, checkmark icon
- **Pending Approval**: Disabled with opacity, "Pending Approval" label

---

## 🎯 User Flow

### Before Selection
```
┌─────────────────────────────────────────┐
│ WhatsApp Template *                     │
│ ┌─────────────────────────────────────┐ │
│ │  + Select a template                │ │
│ └─────────────────────────────────────┘ │
│ Only approved templates can be used     │
└─────────────────────────────────────────┘
```

### After Selection
```
┌─────────────────────────────────────────┐
│ WhatsApp Template *                     │
│ ┌─────────────────────────────────────┐ │
│ │ Welcome Message          [Change]   │ │
│ │ Marketing                           │ │
│ └─────────────────────────────────────┘ │
│ Only approved templates can be used     │
└─────────────────────────────────────────┘
```

---

## 📱 Template Selector Modal

```
┌──────────────────────────────────────────────────────────┐
│  Select Template                                    [×]  │
│  Choose a WhatsApp template for this step                │
├──────────────────────────────────────────────────────────┤
│  [🔍 Search templates...]                                │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ [Image]    │  │ [Image]    │  │ [Image]    │        │
│  │            │  │            │  │            │        │
│  │ Welcome    │  │ Follow-up  │  │ Offer      │        │
│  │ [Marketing]│  │ [Utility]  │  │ [Marketing]│        │
│  │ en         │  │ en         │  │ en         │        │
│  │ Sample...  │  │ Sample...  │  │ Sample...  │        │
│  │         ✓  │  │            │  │            │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ [Video]    │  │ [Document] │  │ [Text]     │        │
│  │            │  │            │  │            │        │
│  │ Tutorial   │  │ Invoice    │  │ Reminder   │        │
│  │ [Utility]  │  │ [Utility]  │  │ [Utility]  │        │
│  │ en         │  │ en         │  │ en         │        │
│  │ Sample...  │  │ Sample...  │  │ Sample...  │        │
│  │            │  │            │  │ Pending    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
├──────────────────────────────────────────────────────────┤
│  6 templates available                      [Cancel]     │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Elements

### Template Card States

#### 1. **Default (Unselected)**
```css
- Border: 2px solid gray-200
- Hover: border-[#0AA89E]
- Cursor: pointer
- Background: white
```

#### 2. **Selected**
```css
- Border: 2px solid [#0AA89E]
- Ring: 2px ring-[#0AA89E]/20
- Checkmark: Green circle with white check
- Background: white
```

#### 3. **Pending Approval**
```css
- Border: 2px solid gray-200
- Opacity: 60%
- Cursor: not-allowed
- Label: "Pending Approval" in amber
```

### Category Badges

- **Marketing**: Green background (`bg-green-100 text-green-700`)
- **Utility**: Blue background (`bg-blue-100 text-blue-700`)
- **Other**: Gray background (`bg-gray-100 text-gray-600`)

---

## 🔧 Technical Implementation

### Key Components

1. **Template Grid**
   - Responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
   - Gap: 4 (1rem)
   - Overflow: Scrollable

2. **Media Rendering**
   - Uses `renderMedia()` utility
   - Supports: Images, Videos, Documents
   - Fallback image for errors
   - Aspect ratio: 16:9

3. **Search**
   - Filters by: template name, category
   - Case-insensitive
   - Real-time updates

4. **Selection**
   - Click to select (approved only)
   - Visual feedback (border + checkmark)
   - Auto-close on selection

---

## 📊 Props

### StepEditor Props
```javascript
{
  step: Object,           // Current step data (for editing)
  index: Number,          // Step index
  templates: Array,       // Available templates
  onSave: Function,       // Save callback
  onClose: Function       // Close callback
}
```

### Template Object Structure
```javascript
{
  id: String,
  element_name: String,
  category: String,
  language_code: String,
  status: String,         // "approved" | "pending"
  template_type: String,  // "text" | "image" | "video" | "document"
  media_url: String,
  container_meta: {
    sampleText: String,
    media_url: String,
    templateType: String
  }
}
```

---

## 🎯 User Interactions

### Opening the Selector
1. Click "+ Select a template" button (if no template selected)
2. Click "Change" button (if template already selected)
3. Modal opens with full template grid

### Selecting a Template
1. Search for template (optional)
2. Click on an approved template card
3. Card shows selected state with checkmark
4. Modal closes automatically
5. Selected template displays in form

### Changing Selection
1. Click "Change" button
2. Modal reopens
3. Current selection is highlighted
4. Click different template to change
5. Modal closes with new selection

---

## 🎨 Styling Details

### Colors
- **Primary**: `#0AA89E` (Teal)
- **Selected Ring**: `#0AA89E` with 20% opacity
- **Hover**: `#0AA89E` with 10% opacity background
- **Disabled**: 60% opacity

### Spacing
- Modal padding: 4 (1rem)
- Card padding: 3 (0.75rem)
- Grid gap: 4 (1rem)
- Border radius: lg (0.5rem)

### Typography
- Template name: font-medium, text-sm
- Category: text-xs, font-medium
- Sample text: text-xs, line-clamp-2
- Status: text-xs, font-medium

---

## 📱 Responsive Design

### Mobile (< 640px)
- 1 column grid
- Full-width modal
- Larger touch targets
- Vertical scroll

### Tablet (640px - 1024px)
- 2 column grid
- Modal max-width: 90vw
- Comfortable spacing

### Desktop (> 1024px)
- 3 column grid
- Modal max-width: 5xl (64rem)
- Optimal viewing

---

## ✅ Accessibility

- **Keyboard Navigation**: Tab through templates
- **Click Handlers**: Only on approved templates
- **Visual Feedback**: Clear selected state
- **Status Indicators**: Color + text labels
- **Close Options**: X button + Cancel button

---

## 🚀 Benefits

### Compared to Dropdown
1. **Visual Preview**: See template media and content
2. **Better UX**: Easier to browse and compare
3. **More Information**: Category, status, sample text
4. **Responsive**: Works great on all devices
5. **Search**: Quick filtering
6. **Professional**: Matches ExploreTemplates design

---

## 🎉 Result

Users can now:
- ✅ Browse templates visually
- ✅ See template previews
- ✅ Search and filter easily
- ✅ Select with confidence
- ✅ Change selection easily
- ✅ Understand template status

The template selection experience is now consistent with the rest of the application and provides a much better user experience!
