# Sample Data Panel - Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### What You're Getting
A powerful left-side panel in the PDF editor that auto-fills form fields with realistic sample data. Perfect for testing and demonstrating immigration forms.

### Setup (Already Done ✅)

All files are ready to use:
- ✅ `SampleDataPanel.tsx` component created
- ✅ `PDFEditor.tsx` updated with panel integration
- ✅ `form-fields-dummy.json` with 20 sample fields
- ✅ All dependencies installed

### How to Use

#### Step 1: Upload a PDF Form
1. Open the PDF editor
2. Select or upload a PDF with form fields (e.g., I-140 form)
3. Wait for form fields to be detected (red outlines visible)

#### Step 2: Access Sample Data Panel
- You'll see a magic wand icon (✨) on the left side
- Panel auto-opens when form fields are detected
- Shows "Sample Data" header

#### Step 3: Choose Your Method

**Option A: Auto-Fill Everything (Recommended)**
```
Click "Apply All Fields" button → All 20 fields fill instantly
```

**Option B: Fill Specific Fields**
```
1. Click category header to expand (e.g., "Personal Info")
2. Click magic wand (🪄) next to field name
3. Field updates in PDF immediately
4. See toast: "Applied: [Field Name]"
```

**Option C: Copy Values**
```
Click copy icon (📋) next to any field → Value in clipboard
```

#### Step 4: Review & Edit
1. Check values in the PDF preview
2. Use right-side Sidebar to edit any field
3. Continue with signing/downloading

## 📋 Sample Fields Included

### 👤 Personal Information (7 fields)
- Full Name: `Dr. Rajesh Kumar Patel`
- Date of Birth: `1988-05-15`
- Passport Number: `X98765432`
- Citizenship: `Indian National`
- Address: `Stanford, CA 94305`
- Phone: `+1-650-555-0123`
- Email: `rajesh.patel@example.com`

### 🎓 Education (3 fields)
- Degree: `Ph.D. in Computer Science`
- University: `Stanford University`
- Graduation Year: `2012`

### 💼 Employment (4 fields)
- Current Employer: `Google`
- Job Title: `Senior Software Engineer`
- Years of Experience: `14 years`
- Annual Salary: `$350,000 USD`

### 🏆 Achievements (6+ fields)
- Publications: `47 peer-reviewed papers`
- Citations: `3,200+ citations`
- Patents: `5 granted patents`
- Awards: `National Science Foundation Award`
- Memberships: `IEEE Fellow, ACM Member`
- Media: `Featured in 12 publications`

## 🎨 Panel Features at a Glance

| Feature | Action | Result |
|---------|--------|--------|
| **Apply All** | Click "Apply All Fields" button | All 20 fields fill at once |
| **Apply Single** | Click magic wand (🪄) icon | One field fills |
| **Copy Value** | Click copy icon (📋) | Value copied to clipboard |
| **Expand Section** | Click category header | Shows fields in that category |
| **Collapse Panel** | Click toggle icon | Saves screen space |
| **View Value** | Hover on field | Preview of data shown |

## 💡 Pro Tips

### Tip 1: Bulk Fill
When you first upload a PDF, immediately click "Apply All Fields" - fills everything in seconds.

### Tip 2: Selective Updates
If you only need a few fields filled, expand the relevant category and apply just those fields.

### Tip 3: Copy & Paste
Use copy button to quickly get values for use in other applications or notes.

### Tip 4: Field Editing
After applying, use the right-side Sidebar to make quick edits to any field without collapsing the panel.

### Tip 5: Multiple PDFs
The panel stays open across different PDFs - perfect for batch processing forms.

## 🔄 Workflow Examples

### Example 1: Quick Immigration Form Test
```
1. Upload I-140.pdf
2. Click "Apply All Fields"
3. See all 20 fields filled instantly
4. Download completed form
⏱️ Total time: 30 seconds
```

### Example 2: Selective Field Fill
```
1. Upload medical form
2. Expand "Personal Info" section
3. Click apply on: Name, DOB, Phone, Email
4. Expand "Achievements" section
5. Click apply on: Publications, Awards
6. Manual edit for form-specific fields
⏱️ Total time: 2 minutes
```

### Example 3: Data Review
```
1. Open any PDF
2. Use copy buttons to extract sample data
3. Paste into spreadsheet or document
4. Review for accuracy
⏱️ Total time: 1-2 minutes
```

## 🎯 Key Keyboard Actions

Currently available:
- **Click** magic wand → Apply field
- **Click** copy icon → Copy to clipboard
- **Click** category header → Toggle section
- **Click** panel icon → Toggle panel

Future keyboard shortcuts coming in v2.0

## 🔧 Customizing Sample Data

### Modify Field Values
Edit `/public/sample-data/form-fields-dummy.json`:
```json
{
  "formFields": [
    {
      "name": "fullName",
      "label": "Full Name",
      "value": "YOUR_NAME_HERE",  // ← Change this
      "type": "text"
    }
  ]
}
```

### Add/Remove Fields
Add new objects to the array or delete existing ones:
```json
{
  "formFields": [
    // Existing fields...
    {
      "name": "newFieldName",
      "label": "New Field Label",
      "value": "Sample value",
      "type": "text"
    }
  ]
}
```

**Note:** Field names should match your PDF form field names for auto-matching.

## ❓ FAQ

**Q: Will applying data overwrite my edits?**
A: No, applying data only fills empty fields. You can edit after applying.

**Q: Can I use different sample data?**
A: Yes, edit the JSON file at `/public/sample-data/form-fields-dummy.json`

**Q: What if field names don't match?**
A: The system tries to match by name AND label. If no match, field stays blank.

**Q: Can I hide the panel?**
A: Yes, click the icon on the left to collapse the panel.

**Q: Does this work with all PDF forms?**
A: Works best with PDFs that have form fields. Scanned PDFs need OCR first.

**Q: Can I apply data multiple times?**
A: Yes, each click reapplies the data. Previous values are overwritten.

## 🐛 Troubleshooting

### Panel Not Showing
- Upload a PDF first
- Check that form fields are detected (red outlines)
- Refresh the page

### Fields Not Filling
- Verify field names match between PDF and JSON
- Check browser console for errors
- Try "Apply All Fields" instead of individual fields

### Copy Not Working
- Check browser permissions for clipboard
- Try clearing cache if still not working
- Use manual copy-paste from value preview

### Sample Data Not Loading
- Verify file exists at `/public/sample-data/form-fields-dummy.json`
- Check JSON syntax (use JSONLint to validate)
- Check browser developer console for errors

## 📚 Full Documentation

For more details, see:
- **SAMPLE_DATA_PANEL_GUIDE.md** - Complete user guide
- **SAMPLE_DATA_VISUAL_GUIDE.md** - Architecture & diagrams
- **SAMPLE_DATA_PANEL_IMPLEMENTATION.md** - Technical details

## 🎉 You're Ready!

That's it! You're now ready to use the Sample Data Panel. Upload a PDF and start filling forms with a single click.

---

**Version:** 1.0
**Last Updated:** December 11, 2025
**Status:** Production Ready ✅
