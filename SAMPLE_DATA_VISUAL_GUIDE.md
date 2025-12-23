# Sample Data Panel Implementation - Visual Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  PDF Editor UI Layout                                            │
├──────┬───────────────────────────────────────────────┬──────────┤
│      │                                               │          │
│      │  ┌─────────────────────────────────────────┐  │          │
│      │  │  TOOLBAR (Page Nav, Zoom, New File)   │  │ SIDEBAR  │
│ SAMP │  ├─────────────────────────────────────────┤  │ (Fields  │
│ DATA │  │                                         │  │  Edit)   │
│ PANE │  │   PDF VIEWER (Form Fields, Signature)  │  │          │
│ (NEW)│  │                                         │  │          │
│      │  │                                         │  │          │
│      │  └─────────────────────────────────────────┘  │          │
│      │                                               │          │
└──────┴───────────────────────────────────────────────┴──────────┘
   ↑
New Left Panel with:
- Category sections
- Field list
- Apply buttons
```

## Component Hierarchy

```
PDFEditor (Parent)
├── SampleDataPanel (NEW - Left sidebar)
│   ├── Header
│   │   ├── Magic Wand Icon + Title
│   │   └── Toggle Button
│   ├── Apply All Button
│   └── Categories
│       ├── Personal Info
│       │   ├── FieldItem (name)
│       │   ├── FieldItem (DOB)
│       │   └── ...
│       ├── Education
│       ├── Employment
│       └── Achievements
├── Sidebar (Original - Right sidebar)
├── Toolbar
└── PDFViewer
```

## Panel States

### Collapsed State
```
│ ✨ │  ← Minimal width, just icon
│    │
```

### Expanded State
```
│ ✨ Sample Data      │
├──────────────────────┤
│ [Apply All Fields]  │
├──────────────────────┤
│ 👤 Personal Info ▼  │
│  Full Name (Raj...) │
│   [🪄] [📋]          │
│  Date of Birth      │
│   [🪄] [📋]          │
│                      │
│ 🎓 Education ▼      │
│  Degree             │
│   [🪄] [📋]          │
│                      │
│ 💼 Employment ▼     │
│ 🏆 Achievements ▼   │
```

## User Interaction Flow

### Single Field Apply

```
User opens PDF
        ↓
Form fields detected (red outlines)
        ↓
Sample Data Panel appears (auto-expanded)
        ↓
User expands "Personal Info" category
        ↓
User sees "Full Name: Dr. Rajesh Kumar Patel"
        ↓
User clicks magic wand (🪄)
        ↓
Field updates in PDF (real-time)
        ↓
Toast notification: "Applied: Full Name"
```

### Bulk Apply

```
User clicks "Apply All Fields" button
        ↓
Loads form-fields-dummy.json
        ↓
Matches all field names
        ↓
Updates all form fields at once
        ↓
Toast notification: "✨ All fields applied successfully!"
```

## Data Flow

### Field Matching Algorithm

```json
Form Field (PDF)          Sample Data (JSON)
{                         {
  name: "fullName"          name: "fullName"
  label: "Full Name"        label: "Full Name"
  value: ""                 value: "Dr. Rajesh..."
}                         }
      ↓
    Match!
      ↓
  Copy value to form field
      ↓
User sees data in PDF
```

## Visual Elements

### Button Styling

**Apply All Button (Top)**
```
┌─────────────────────────────┐
│ 🪄  Apply All Fields        │  ← Gradient primary→accent
└─────────────────────────────┘
```

**Field Apply Button**
```
┌──────────────────────────────┐
│ Full Name: Dr. Rajesh...     │
│              [🪄] [📋]        │  ← Small hover buttons
└──────────────────────────────┘
    ↑        ↑
  Apply   Copy to
  field   clipboard
```

**Category Section**
```
▼ 👤 Personal Info          ← Click to collapse
  Full Name (Dr. Raj...)
    [🪄] [📋]
  Date of Birth (1988...)
    [🪄] [📋]
```

## Integration Points

### 1. PDFEditor State Management
```typescript
const [isDataPanelOpen, setIsDataPanelOpen] = useState(true);
const handleApplyField = (fieldName, value) => { ... };
const handleApplyAllFields = () => { ... };
```

### 2. Component Props Flow
```
PDFEditor
    ↓
    ├→ isOpen={isDataPanelOpen}
    ├→ onToggle={() => setIsDataPanelOpen(!isDataPanelOpen)}
    ├→ onApplyField={handleApplyField}
    └→ onApplyAll={handleApplyAllFields}
    
SampleDataPanel receives props
    ↓
    ├→ Renders categories
    ├→ Calls onApplyField when button clicked
    └→ Calls onApplyAll when bulk button clicked
    
Callbacks update PDFEditor state
    ↓
setFormFields updated
    ↓
PDFViewer re-renders with new values
```

### 3. File Updates
```
form-fields-dummy.json (Static data)
         ↓
   SampleDataPanel (Loads & displays)
         ↓
   handleApplyField() (Selected field)
   handleApplyAllFields() (All fields)
         ↓
   setFormFields() (Update state)
         ↓
   PDFViewer (Renders updated form)
```

## Styling Architecture

### Tailwind Classes Used

**Panel Container**
- `w-96` - Expanded width (384px)
- `w-12` - Collapsed width (48px)
- `transition-all duration-300` - Smooth animation

**Header**
- `flex items-center justify-between` - Layout
- `p-4` - Padding
- `border-b border-border` - Divider

**Category Sections**
- `hover:bg-secondary` - Hover effect
- `px-4 py-3` - Padding
- `border-b border-border` - Dividers

**Field Items**
- `bg-card` - Card background
- `border border-border/50` - Subtle border
- `hover:border-primary/50` - Hover highlight
- `line-clamp-2` - Text truncation

**Buttons**
- `bg-gradient-to-r from-primary to-accent` - Gradient
- `hover:opacity-90` - Hover effect
- `h-6 w-6 p-0` - Small icon buttons

## Feature Checklist

✅ Panel toggle (expand/collapse)
✅ Categorized field display
✅ Individual field apply
✅ Bulk apply all fields
✅ Copy to clipboard
✅ Toast notifications
✅ Load sample data from JSON
✅ Field matching by name/label
✅ Responsive collapsed state
✅ Smooth animations
✅ Error handling
✅ Loading states

## Example Workflow

**Scenario: Auto-fill immigration form**

```
1. User uploads I-140 form PDF
   ↓
2. PDF editor detects 20 form fields
   ↓
3. Sample Data Panel auto-opens on left
   ↓
4. User sees "Apply All Fields" button
   ↓
5. User clicks button
   ↓
6. All fields auto-fill:
   - Name: Dr. Rajesh Kumar Patel
   - DOB: 1988-05-15
   - Passport: X98765432
   - Employer: Google
   - Title: Senior Engineer
   - ... (15 more fields)
   ↓
7. User reviews and edits specific fields in Sidebar
   ↓
8. User signs document using Signature feature
   ↓
9. User downloads completed PDF
```

## Responsive Design

### Desktop (1920px+)
- Sample Data Panel: 384px width
- PDF Viewer: Remaining space
- Sidebar: 300px width
- All visible at once

### Tablet (768px+)
- Toggle Sample Data Panel to save space
- Collapse when not needed
- Sidebar still visible

### Mobile
- Panel collapses to icon
- PDF takes full width
- Portrait mode optimized

---

**Version:** 1.0
**Updated:** December 11, 2025
