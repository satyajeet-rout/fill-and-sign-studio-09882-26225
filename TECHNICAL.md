# PDF Editor Pro - Technical Documentation

## 🏗️ Architecture Overview

### Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Viewing**: react-pdf 9.2.1
- **PDF Manipulation**: pdf-lib 1.17.1
- **State Management**: React Hooks
- **File Upload**: react-dropzone 14.3.5

### Project Structure

```
src/
├── components/
│   ├── PDFEditor.tsx          # Main orchestrator component
│   ├── pdf/
│   │   ├── FileUpload.tsx     # Drag-drop file upload
│   │   ├── PDFViewer.tsx      # PDF rendering & interaction
│   │   ├── Sidebar.tsx        # Form fields & signature upload
│   │   ├── Toolbar.tsx        # Navigation & actions
│   │   └── SignatureOverlay.tsx # Draggable signature component
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── pdfUtils.ts           # PDF save/export logic
│   └── utils.ts              # General utilities
├── pages/
│   ├── Index.tsx             # Entry page
│   └── NotFound.tsx          # 404 page
└── index.css                 # Design system & globals
```

## 🔧 Core Components

### PDFEditor (Main Component)

**Purpose**: Orchestrates the entire application state

**State Management**:
```typescript
interface State {
  pdfFile: File | null;
  numPages: number;
  currentPage: number;
  zoom: number;
  formFields: FormField[];
  signatures: Signature[];
  isSidebarOpen: boolean;
}
```

**Key Responsibilities**:
- File management
- Page navigation
- Form field state
- Signature management
- UI state coordination

### PDFViewer Component

**Purpose**: Renders PDF and handles interactive overlays

**Dependencies**:
- `react-pdf` for PDF rendering
- `pdfjs-dist` as worker backend

**Features**:
- Page-by-page rendering
- Zoom support (0.5x - 2x)
- Form field overlays
- Signature dragging
- Responsive canvas sizing

**Performance Optimizations**:
- Only renders current page
- Lazy loads PDF.js worker
- Debounced resize handler
- Memoized signature calculations

### FileUpload Component

**Purpose**: Initial file selection interface

**Features**:
- Drag-and-drop zone
- Click-to-upload
- File type validation
- Visual feedback states

**Validation**:
```typescript
accept: {
  "application/pdf": [".pdf"]
}
```

### Sidebar Component

**Purpose**: Form field editing and signature upload

**Sections**:
1. **Signature Upload**: Image file selection
2. **Form Fields List**: All editable fields with inline editing

**UX Features**:
- Collapsible panel
- Synchronized field editing
- Real-time updates
- Responsive width

### Toolbar Component

**Purpose**: Navigation and action controls

**Actions**:
- Page navigation (prev/next)
- Zoom controls (+/-)
- Save & download
- New file upload

**State Display**:
- Current page / total pages
- Current zoom level

### SignatureOverlay Component

**Purpose**: Interactive signature element

**Features**:
- Drag-to-move
- Corner resize handle
- Delete button
- Hover state UI

**Interaction States**:
- `isDragging`: Active drag operation
- `isResizing`: Active resize operation
- `isHovered`: Shows controls

## 📦 Key Libraries

### pdf-lib

**Usage**: Modifying and saving PDFs

**Functions Used**:
- `PDFDocument.load()`: Load original PDF
- `pdfDoc.getPages()`: Access pages
- `page.drawText()`: Add text overlays
- `pdfDoc.embedPng()`: Embed signature images
- `page.drawImage()`: Draw signatures
- `pdfDoc.save()`: Export modified PDF

### react-pdf

**Usage**: Rendering PDFs in browser

**Components Used**:
- `<Document>`: PDF container
- `<Page>`: Individual page renderer

**Configuration**:
```typescript
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

### react-dropzone

**Usage**: File upload interface

**Configuration**:
```typescript
{
  accept: { "application/pdf": [".pdf"] },
  multiple: false,
  onDrop: handleFileUpload
}
```

## 🎨 Design System

### Color Tokens (HSL)

**Light Mode**:
```css
--primary: 221 83% 53%        /* Blue */
--primary-glow: 262 83% 58%   /* Purple */
--accent: 262 83% 58%         /* Purple */
--background: 0 0% 100%       /* White */
--foreground: 224 71% 4%      /* Dark text */
```

**Dark Mode**:
```css
--primary: 221 83% 53%        /* Blue */
--accent: 262 83% 58%         /* Purple */
--background: 224 71% 4%      /* Dark */
--foreground: 210 40% 98%     /* Light text */
```

### Custom Properties

```css
--gradient-primary: linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%));
--shadow-elegant: 0 10px 40px -10px hsl(221 83% 53% / 0.25);
--shadow-glow: 0 0 40px hsl(262 83% 58% / 0.3);
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Utility Classes

```css
.shadow-elegant    /* Primary shadow */
.shadow-glow       /* Accent glow */
.transition-smooth /* Smooth transitions */
.animate-fade-in   /* Entrance animation */
```

## 🔄 Data Flow

### File Upload Flow
```
User uploads file
  ↓
FileUpload validates
  ↓
PDFEditor receives File
  ↓
PDFViewer loads & renders
  ↓
Form fields detected (mock)
  ↓
Fields populate sidebar
```

### Form Editing Flow
```
User edits in sidebar OR PDF
  ↓
onFieldUpdate callback
  ↓
PDFEditor updates state
  ↓
Both sidebar & viewer sync
```

### Signature Flow
```
User uploads signature image
  ↓
Sidebar processes file
  ↓
SignatureOverlay added to page
  ↓
User drags/resizes
  ↓
State updates with position/size
```

### Save Flow
```
User clicks "Save & Download"
  ↓
pdfUtils.savePDF() called
  ↓
Original PDF loaded with pdf-lib
  ↓
Form values drawn as text
  ↓
Signatures embedded as images
  ↓
PDF saved & downloaded
```

## 🧪 Testing Recommendations

### Unit Tests
- `pdfUtils.ts` functions
- Form field state management
- Signature position calculations
- File validation logic

### Integration Tests
- File upload → PDF display
- Form editing → State sync
- Signature upload → Overlay display
- Save → Download flow

### E2E Tests
- Complete user workflow
- Multi-page navigation
- Signature placement accuracy
- Export file integrity

### Test Files to Create
```
src/
├── components/
│   ├── __tests__/
│   │   ├── PDFEditor.test.tsx
│   │   ├── FileUpload.test.tsx
│   │   └── SignatureOverlay.test.tsx
└── lib/
    └── __tests__/
        └── pdfUtils.test.ts
```

## 🚀 Performance Optimization

### Current Optimizations
1. **Lazy Loading**: PDF.js worker loaded on demand
2. **Conditional Rendering**: Only current page rendered
3. **Debounced Handlers**: Resize handlers debounced
4. **Memoization**: Expensive calculations memoized

### Future Optimizations
1. **Virtual Scrolling**: For many-page documents
2. **Web Workers**: Move PDF processing to worker
3. **Progressive Loading**: Stream large PDFs
4. **Caching**: Cache rendered pages

## 🔒 Security Considerations

### Current Implementation
- ✅ Client-side only processing
- ✅ No server uploads
- ✅ No data persistence
- ✅ Input validation on file types

### Recommendations
1. Add file size limits
2. Sanitize file names
3. Implement CSP headers
4. Add XSS protection for text fields
5. Rate limit in production

## 📊 Browser Compatibility

### Required Features
- ES6+ JavaScript
- Web Workers
- Canvas API
- FileReader API
- Blob API
- ArrayBuffer support

### Polyfills Needed
None required for modern browsers (2020+)

### Known Issues
- Safari < 14: Limited PDF.js support
- iOS < 14: Memory constraints on large PDFs
- IE 11: Not supported (by design)

## 🔧 Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## 🐛 Common Issues & Solutions

### Issue: PDF.js Worker Not Found
**Solution**: Ensure worker URL is correct in `PDFViewer.tsx`
```typescript
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

### Issue: Signature Not Appearing
**Solution**: Check image format (PNG/JPG only) and base64 encoding

### Issue: Slow Rendering on Large PDFs
**Solution**: Implement virtual scrolling or page-by-page loading

### Issue: Form Fields Not Detected
**Solution**: Current implementation uses mock data. Implement actual field detection:
```typescript
import { PDFDocument } from 'pdf-lib';

async function detectFields(pdfBytes: ArrayBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  // Process fields...
}
```

## 🔄 State Management Deep Dive

### Form Fields State
```typescript
interface FormField {
  id: string;         // Unique identifier
  name: string;       // Display name
  type: "text" | "checkbox" | "radio" | "select";
  value: string;      // Current value
  x: number;          // X position on page
  y: number;          // Y position on page
  width: number;      // Field width
  height: number;     // Field height
  page: number;       // Page number (1-indexed)
}
```

### Signature State
```typescript
interface Signature {
  id: string;         // Unique identifier
  image: string;      // Base64 data URL
  x: number;          // X position
  y: number;          // Y position
  width: number;      // Signature width
  height: number;     // Signature height
  page: number;       // Page number (1-indexed)
}
```

### State Update Patterns
```typescript
// Immutable update for form field
setFormFields(prev => 
  prev.map(field => 
    field.id === id 
      ? { ...field, value } 
      : field
  )
);

// Immutable add for signature
setSignatures(prev => [...prev, newSignature]);

// Immutable delete for signature
setSignatures(prev => prev.filter(sig => sig.id !== id));
```

## 📈 Scalability Considerations

### Current Limits
- File size: Browser memory dependent (~50MB safe)
- Pages: No hard limit, but >100 pages may slow
- Signatures: Unlimited, but recommend <10 per page
- Form fields: Unlimited

### Scaling Recommendations
1. Implement pagination for large PDFs
2. Add signature limit warnings
3. Compress signature images
4. Implement progressive loading
5. Add memory usage monitoring

## 🎯 Future Enhancements

### Planned Features
1. **Text Annotations**: Add text anywhere
2. **Drawing Tools**: Freehand drawing
3. **Highlight Tool**: Highlight text
4. **Undo/Redo**: Action history
5. **Templates**: Save common forms
6. **Batch Processing**: Multiple PDFs
7. **Cloud Sync**: Optional cloud storage
8. **OCR**: Text extraction from images

### Technical Improvements
1. Actual form field detection
2. Web Worker for processing
3. IndexedDB for temp storage
4. PWA support
5. Offline capability
6. Better mobile gestures

## 📚 Additional Resources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [react-pdf Documentation](https://github.com/wojtekmaj/react-pdf)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
