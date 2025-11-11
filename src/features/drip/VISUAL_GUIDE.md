# WhatsApp Drip Campaign - Visual Guide

## 🎨 User Interface Overview

### 1. Main Campaign List Page (`/drip-campaigns`)

```
┌─────────────────────────────────────────────────────────────┐
│  Drip Campaigns                    [+ Create New Sequence]  │
│  Automate your WhatsApp messaging with scheduled sequences  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Total    │  │ Active   │  │ Enrolled │  │ Completed│   │
│  │ Campaigns│  │ Campaigns│  │          │  │          │   │
│  │    12    │  │    5     │  │   234    │  │   156    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│  [All (12)] [Draft (3)] [Active (5)] [Paused (2)] [...]    │
│                                          [Search campaigns] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ Webinar Drip    [⋮] │  │ Welcome Series  [⋮] │         │
│  │ 12:53 PM            │  │ 10:30 AM            │         │
│  │ [Draft]    3 steps  │  │ [Active]   5 steps  │         │
│  │                     │  │                     │         │
│  │ Enrolled: 0         │  │ Enrolled: 45        │         │
│  │ Completed: 0        │  │ Completed: 23       │         │
│  │ Goal: 0             │  │ Goal: 100           │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  [< Previous]  Page 1 of 3  [Next >]                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Campaign Builder/Editor (`/drip-campaigns/create`)

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]  Create New Campaign                              │
│  Set up your automated WhatsApp message sequence            │
│                          [Save Draft] [Save & Activate]     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │ Campaign Details │  │ Message Sequence (3 steps)   │   │
│  │                  │  │                    [+ Add Step]│   │
│  │ Name: *          │  │                              │   │
│  │ [____________]   │  │  ┌─────────────────────────┐ │   │
│  │                  │  │  │ [≡] ① Step 1        [✎][🗑]│ │
│  │ Description:     │  │  │ Template: Welcome Msg   │ │   │
│  │ [____________]   │  │  │ ⏱ Starts Immediately    │ │   │
│  │ [____________]   │  │  └─────────────────────────┘ │   │
│  │                  │  │           │                  │   │
│  ├──────────────────┤  │  ┌─────────────────────────┐ │   │
│  │ Campaign Trigger │  │  │ [≡] ② Step 2        [✎][🗑]│ │
│  │                  │  │  │ Template: Follow-up     │ │   │
│  │ ○ Manual Start   │  │  │ ⏱ Wait 1 day after prev│ │   │
│  │ ○ Contact Added  │  │  └─────────────────────────┘ │   │
│  │ ○ Scheduled      │  │           │                  │   │
│  │ ○ Webhook        │  │  ┌─────────────────────────┐ │   │
│  │                  │  │  │ [≡] ③ Step 3        [✎][🗑]│ │
│  ├──────────────────┤  │  │ Template: Final Offer   │ │   │
│  │ Target Audience  │  │  │ ⏱ Wait 2 days after prev│ │   │
│  │                  │  │  └─────────────────────────┘ │   │
│  │ ○ All Contacts   │  │                              │   │
│  │ ● Specific Groups│  │                              │   │
│  │   ☑ VIP Customers│  │                              │   │
│  │   ☐ New Leads    │  │                              │   │
│  │ ○ By Tags        │  │                              │   │
│  └──────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Step Editor Modal

```
┌─────────────────────────────────────────────────────────┐
│  Edit Step 2                                        [×] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step Name (Optional)                                   │
│  [Follow-up Message                                  ]  │
│                                                         │
│  WhatsApp Template *                                    │
│  [▼ Select a template                                ]  │
│     - Welcome Message (en)                              │
│     - Follow-up (en)                                    │
│     - Final Offer (en)                                  │
│                                                         │
│  Wait Time After Previous Step                          │
│  [  1  ] [▼ Days    ]                                   │
│           - Minutes                                     │
│           - Hours                                       │
│           - Days                                        │
│                                                         │
│  Time to wait after the previous step completes         │
│                                                         │
│                              [Cancel] [Update Step]     │
└─────────────────────────────────────────────────────────┘
```

### 4. Analytics Page (`/drip-campaigns/analytics/:id`)

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]  Welcome Series                                   │
│  Campaign Analytics & Performance                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Enrolled │  │ Active   │  │ Completed│  │ Failed   │   │
│  │   234    │  │   156    │  │    78    │  │    0     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│  📈 Completion Rate                                         │
│  [████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 33.3%     │
├─────────────────────────────────────────────────────────────┤
│  Step Performance                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Step 1: Welcome Message              234 sent       │   │
│  │ Delivered: 230  Read: 210  Failed: 4                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Step 2: Follow-up                    156 sent       │   │
│  │ Delivered: 150  Read: 120  Failed: 6                │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Recent Enrollments                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Contact      │ Status    │ Step │ Enrolled At      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ John Doe     │ [Active]  │ 2/3  │ Jan 15, 2025    │   │
│  │ Jane Smith   │ [Active]  │ 1/3  │ Jan 16, 2025    │   │
│  │ Bob Johnson  │ [Complete]│ 3/3  │ Jan 10, 2025    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5. Empty State (No Campaigns)

```
┌─────────────────────────────────────────────────────────────┐
│  Drip Campaigns                    [+ Create New Sequence]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         ⚡                                   │
│                                                             │
│              No Drip Campaigns Yet                          │
│                                                             │
│     Create your first automated WhatsApp sequence to        │
│     engage your contacts over time with scheduled messages. │
│                                                             │
│              [+ Create Your First Sequence]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Colors
- **Draft**: Gray (`bg-gray-100 text-gray-700`)
- **Active**: Green (`bg-green-100 text-green-700`)
- **Paused**: Yellow (`bg-yellow-100 text-yellow-700`)
- **Completed**: Blue (`bg-blue-100 text-blue-700`)
- **Archived**: Red (`bg-red-100 text-red-700`)

### Primary Colors
- **Brand**: Teal gradient (`from-[#0AA89E] to-cyan-500`)
- **Hover**: Darker teal (`#099890`)
- **Text**: Gray-900 for headings, Gray-600 for body
- **Border**: Gray-200

### Icon Colors
- **Stats**: Blue, Green, Purple, Teal
- **Actions**: Gray-600 (default), Red-600 (delete)

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Full-width cards
- Stacked filters
- Full-screen modals

### Tablet (640px - 1024px)
- 2-column card grid
- Horizontal filter scroll
- Centered modals

### Desktop (> 1024px)
- 3-column card grid
- All filters visible
- Side-by-side editor layout
- Hover effects enabled

## 🎯 Interactive Elements

### Buttons
- **Primary**: Teal gradient with shadow
- **Secondary**: Gray background
- **Danger**: Red text/background
- **Icon**: Hover background change

### Cards
- **Default**: White with border
- **Hover**: Shadow elevation
- **Active**: Border highlight

### Modals
- **Backdrop**: Black 50% opacity
- **Content**: White with rounded corners
- **Close**: X button top-right

### Forms
- **Input**: Border with focus ring
- **Select**: Dropdown with arrow
- **Checkbox**: Custom styled
- **Radio**: Custom styled

## 🔔 Notifications

### Success (Green)
- "Campaign created successfully"
- "Campaign updated successfully"
- "Campaign deleted successfully"
- "Campaign activated successfully"

### Error (Red)
- "Failed to create campaign"
- "You don't have permission"
- "Please select a template"

### Info (Blue)
- Loading states
- Empty states

## 🎭 Animations

- **Page transitions**: Fade in
- **Card hover**: Shadow elevation
- **Button hover**: Background change
- **Modal open**: Slide up (mobile), fade in (desktop)
- **Loading**: Spinner rotation
- **Toast**: Slide in from top

## 📐 Layout Spacing

- **Page padding**: 4 (1rem)
- **Card padding**: 4-6 (1-1.5rem)
- **Gap between cards**: 4 (1rem)
- **Section spacing**: 6 (1.5rem)
- **Button padding**: 2.5 vertical, 4 horizontal

## 🖼️ Icons Used

- **Zap**: Drip campaigns (sidebar)
- **Plus**: Add campaign/step
- **Edit**: Edit action
- **Trash2**: Delete action
- **MoreVertical**: Menu
- **Play/Pause**: Activate/pause
- **BarChart3**: Analytics
- **Users**: Contacts
- **CheckCircle**: Completed
- **Clock**: Active/waiting
- **Target**: Goals
- **ArrowLeft**: Back navigation
- **X**: Close modal
- **Search**: Search input
- **GripVertical**: Drag handle

This visual guide helps understand the UI structure and design system used throughout the drip campaign feature.
