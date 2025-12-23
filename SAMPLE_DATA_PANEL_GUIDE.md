# Sample Data Panel Guide

## Overview

The Sample Data Panel is a collapsible left-side panel in the PDF editor that displays categorized sample data fields. You can apply individual fields or all fields at once to auto-fill your PDF form.

## Features

### 1. **Panel Toggle**
- Click the magic wand icon (✨) on the left edge to expand/collapse the panel
- Panel is open by default when editing a PDF with form fields

### 2. **Categorized Fields**
Sample data is organized into 4 sections:
- **👤 Personal Info** - Name, DOB, Passport, Citizenship, Address, Phone, Email
- **🎓 Education** - Degree, University, Graduation Year
- **💼 Employment** - Employer, Job Title, Years Experience, Salary
- **🏆 Achievements** - Publications, Citations, Patents, Awards, Memberships, Media

### 3. **Individual Field Actions**

Each field displays:
- **Field Label** - Clear name of the field
- **Field Value** - Preview of sample data
- **Action Buttons**:
  - 🪄 **Apply** - Click wand to apply field value to PDF form
  - 📋 **Copy** - Copy field value to clipboard

### 4. **Apply All Button**

Click the "Apply All Fields" button at the top of the panel to:
- Apply all sample data fields to the PDF form at once
- Perfect for quick auto-fill when importing a new PDF
- Shows confirmation toast when complete

## Usage Flow

### Single Field Application
1. Expand a category section (Personal Info, Education, etc.)
2. Find the field you want
3. Click the magic wand icon (🪄) next to the field
4. The PDF form field gets populated with the sample value
5. See confirmation toast: "Applied: [Field Name]"

### Bulk Application
1. Click "Apply All Fields" button at top of panel
2. All form fields populate with corresponding sample data
3. See confirmation toast: "✨ All fields applied successfully!"

### Copy Field Values
1. Click the copy icon (📋) next to any field
2. Value is copied to clipboard
3. Paste into any text editor or form field
4. Icon shows feedback for 2 seconds

## Sample Data Structure

The panel loads data from `/public/sample-data/form-fields-dummy.json`:

```json
{
  "formFields": [
    {
      "name": "fullName",
      "label": "Full Name",
      "value": "Dr. Rajesh Kumar Patel",
      "type": "text"
    },
    {
      "name": "dateOfBirth",
      "label": "Date of Birth",
      "value": "1988-05-15",
      "type": "text"
    },
    // ... more fields
  ]
}
```

## Field Matching

Fields are matched between the PDF form and sample data by:
1. **Exact name match** - Compares field.name
2. **Label match** - Compares field.label
3. **Fallback** - If no match, field keeps its current value

## Visual Design

### Panel States

**Collapsed State:**
- Shows only magic wand icon (✨)
- Click to expand
- Takes up minimal width (48px)

**Expanded State:**
- Full width (384px)
- Shows all categories and fields
- Smooth animation when toggling
- Scrollable content area

### Color Coding

- **Section Headers** - Bold text with emoji icon
- **Field Labels** - Small text, foreground color
- **Field Values** - Muted text, line-clamped at 2 lines
- **Apply Button** - Gradient from primary to accent
- **Field Items** - Subtle borders, hover effect on primary color

## Tips & Tricks

### 💡 Best Practices

1. **Review Sample Data** - Always review applied data before submitting
2. **Customize Fields** - After applying, edit individual fields as needed
3. **Use Categories** - Expand only the sections you need
4. **Copy First** - Use copy button to test values in clipboard

### ⚡ Keyboard Shortcuts

Currently supported by buttons - Future enhancement: Keyboard shortcuts for apply actions

### 🔄 Undo/Redo

After applying fields:
- PDF editor tracks all changes
- Edit individual fields in the Sidebar (right side)
- Field values update in real-time in PDF preview

## Technical Details

### Component: `SampleDataPanel.tsx`

**Props:**
- `isOpen: boolean` - Panel visibility state
- `onToggle: () => void` - Callback to toggle panel
- `onApplyField: (fieldName, value) => void` - Apply single field
- `onApplyAll: () => void` - Apply all fields

**State:**
- `sampleData` - Loaded field array
- `expandedSections` - Track open/closed sections
- `isLoading` - Loading state during JSON fetch

**Features:**
- Async JSON loading from public folder
- Error handling with toast notifications
- Smart field categorization
- Copy to clipboard functionality
- Responsive layout with smooth transitions

### Integration Points

1. **PDFEditor.tsx** - Parent component managing field updates
2. **Sidebar.tsx** - Right side panel for detailed field editing
3. **PDFViewer.tsx** - Visual representation of applied data
4. **Toolbar.tsx** - Top toolbar with additional actions

## Troubleshooting

### Fields Not Applying

**Issue:** Click apply but field doesn't update
- **Solution**: Ensure PDF has detected form fields (red outlines visible)
- **Check**: Field names in JSON match PDF field names

### Sample Data Not Loading

**Issue:** "Failed to load sample data" message
- **Check**: File exists at `/public/sample-data/form-fields-dummy.json`
- **Verify**: JSON syntax is valid (use online JSON validator)
- **Check**: Web server can access public folder

### Panel Not Opening

**Issue:** Magic wand icon not clickable or panel won't open
- **Solution**: Ensure PDF is loaded with form fields first
- **Try**: Upload a PDF and wait for field detection

## Future Enhancements

- [ ] Custom sample data file upload
- [ ] Multiple sample data profiles
- [ ] Edit sample data directly in panel
- [ ] Save frequently used field combinations
- [ ] Keyboard shortcuts for apply actions
- [ ] Drag-drop fields between sections
- [ ] Search/filter fields by name
- [ ] Field validation before apply

## Related Files

- Sample Data: `/public/sample-data/form-fields-dummy.json`
- Component: `src/components/pdf/SampleDataPanel.tsx`
- Integration: `src/components/PDFEditor.tsx`
- Styling: Uses Tailwind CSS + shadcn/ui components

---

**Last Updated:** December 11, 2025
**Version:** 1.0
