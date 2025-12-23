import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { exportFilledPdf } from "@/lib/pdfUtils";
import { PDFViewer } from "./pdf/PDFViewer";
import { Sidebar } from "./pdf/Sidebar";
import { Toolbar } from "./pdf/Toolbar";
import { ChatPanel as FloatingChatPanel } from "./pdf/ChatPanel";
import { toast } from "sonner";
import { cleanFieldName } from "@/lib/fieldNameUtils";

export interface FormField {
  id: string;
  name: string;
  type: "text" | "checkbox" | "radio" | "select";
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  maxLength?: number;
}

export interface Signature {
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  pageWidth?: number; // Actual PDF page width
  pageHeight?: number; // Actual PDF page height
}

export interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  page: number;
  pageWidth?: number; // Actual PDF page width
  pageHeight?: number; // Actual PDF page height
}

const PDFEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | undefined>();
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 612, height: 792 });
  
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    setCurrentPage(1);
    setFormFields([]);
    setSignatures([]);
    setTextAnnotations([]);
  };

  const handleFieldUpdate = (id: string, value: string) => {
    setFormFields(prev =>
      prev.map(field =>
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const handleSignatureAdd = (signatureData: string) => {
    // Load image to get natural dimensions and calculate proper aspect ratio
    const img = new Image();
    img.onload = () => {
      const maxWidth = 200;
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const width = maxWidth;
      const height = maxWidth * aspectRatio;
      
      const newSignature: Signature = {
        id: `sig-${Date.now()}`,
        image: signatureData,
        x: 100,
        y: 100,
        width,
        height,
        page: currentPage,
        pageWidth: pageDimensions.width,
        pageHeight: pageDimensions.height,
      };
      setSignatures(prev => [...prev, newSignature]);
    };
    img.src = signatureData;
  };

  const handleSignatureMove = (id: string, x: number, y: number) => {
    setSignatures(prev =>
      prev.map(sig =>
        sig.id === id ? { ...sig, x, y } : sig
      )
    );
  };

  const handleSignatureResize = (id: string, width: number, height: number) => {
    setSignatures(prev =>
      prev.map(sig =>
        sig.id === id ? { ...sig, width, height } : sig
      )
    );
  };

  const handleSignatureDelete = (id: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== id));
  };

  const handleTextAdd = (text: string, fontSize: number = 14) => {
    const newText: TextAnnotation = {
      id: `text-${Date.now()}`,
      text,
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      fontSize,
      page: currentPage,
      pageWidth: pageDimensions.width,
      pageHeight: pageDimensions.height,
    };
    setTextAnnotations(prev => [...prev, newText]);
  };

  const handleTextMove = (id: string, x: number, y: number) => {
    setTextAnnotations(prev =>
      prev.map(text =>
        text.id === id ? { ...text, x, y } : text
      )
    );
  };

  const handleTextResize = (id: string, width: number, height: number) => {
    setTextAnnotations(prev =>
      prev.map(text =>
        text.id === id ? { ...text, width, height } : text
      )
    );
  };

  const handleTextUpdate = (id: string, text: string) => {
    setTextAnnotations(prev =>
      prev.map(annotation =>
        annotation.id === id ? { ...annotation, text } : annotation
      )
    );
  };

  const handleTextDelete = (id: string) => {
    setTextAnnotations(prev => prev.filter(text => text.id !== id));
  };

  const handleFieldClick = (id: string) => {
    setHighlightedFieldId(id);
    setIsSidebarOpen(true);
    setTimeout(() => setHighlightedFieldId(undefined), 2000);
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Try to load a file passed from the upload page via location.state.fileUrl
    const state: any = (location && (location as any).state) || {};
    if (!pdfFile) {
      if (state.fileUrl) {
        fetch(state.fileUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'uploaded.pdf', { type: 'application/pdf' });
            setPdfFile(file);
            setCurrentPage(1);
          })
          .catch(err => {
            console.error('Failed to load PDF from upload page state', err);
            navigate('/');
          });
      } else {
        // No file provided — redirect back to upload/home
        navigate('/');
      }
    }
  }, [location, pdfFile, navigate]);

  const handleNext = async () => {
    if (!pdfFile) return;
    try {
      const blob = await exportFilledPdf(pdfFile, formFields, signatures, textAnnotations);

      // Create object URL and store base64 in sessionStorage for persistence
      const objectUrl = URL.createObjectURL(blob);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        try {
          sessionStorage.setItem("reviewPdfBase64", base64);
        } catch (e) {
          console.warn("Unable to save PDF to sessionStorage", e);
        }

        navigate("/review-pdf", { state: { objectUrl } });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to export PDF for review:", error);
      toast.error("Failed to prepare PDF for review");
    }
  };

  const handleLoadDummyData = async () => {
    try {
      const response = await fetch("/sample-data/form-fields-dummy.json");
      if (!response.ok) throw new Error("Failed to load dummy data");
      const data = await response.json();

      // Update form fields with dummy values
      setFormFields((prevFields) =>
        prevFields.map((field) => {
          const dummyField = data.formFields.find(
            (df: any) => df.name === field.name || df.label === field.name
          );
          return dummyField ? { ...field, value: dummyField.value } : field;
        })
      );

      toast.success("✨ Dummy data loaded! All fields are now filled.");
    } catch (error) {
      toast.error("Failed to load dummy data");
      console.error("Error loading dummy data:", error);
    }
  };

  const handleApplyField = (sampleName: string, value: string, sampleLabel?: string) => {
    // Find matching fields by name or cleaned label, then call the id-based updater
    setFormFields((prevFields) => {
      const matchedIds: string[] = [];
      prevFields.forEach((field) => {
        const fieldName = field.name || "";
        const cleaned = cleanFieldName(fieldName).toLowerCase();

        const nameMatch = fieldName === sampleName || fieldName.toLowerCase() === sampleName.toLowerCase();
        const labelMatch = sampleLabel && (cleaned === sampleLabel.toLowerCase() || cleaned.includes(sampleLabel.toLowerCase()));
        const nameIncludes = cleaned.includes(sampleName.toLowerCase());

        if (nameMatch || labelMatch || nameIncludes) {
          matchedIds.push(field.id);
        }
      });

      // If matched, update their values
      if (matchedIds.length > 0) {
        matchedIds.forEach((id) => handleFieldUpdate(id, value));
      }

      // Return prevFields unchanged here because handleFieldUpdate will update state
      return prevFields;
    });
  };

  const handleApplyAllFields = async () => {
    try {
      const response = await fetch("/sample-data/form-fields-dummy.json");
      if (!response.ok) throw new Error("Failed to load dummy data");
      const data = await response.json();

      // Collect all field updates first
      const updates: { id: string; value: string }[] = [];
      const samples: any[] = data.formFields || [];

      // Build updates by matching all samples against current form fields
      samples.forEach((sample) => {
        const sampleName = sample.name;
        const sampleLabel = sample.label;
        const sampleValue = sample.value;

        // Match in current formFields
        formFields.forEach((field) => {
          const fieldName = field.name || "";
          const cleaned = cleanFieldName(fieldName).toLowerCase();

          const nameMatch = fieldName === sampleName || fieldName.toLowerCase() === sampleName.toLowerCase();
          const labelMatch = sampleLabel && (cleaned === sampleLabel.toLowerCase() || cleaned.includes(sampleLabel.toLowerCase()));
          const nameIncludes = cleaned.includes(sampleName.toLowerCase());

          if (nameMatch || labelMatch || nameIncludes) {
            updates.push({ id: field.id, value: sampleValue });
          }
        });
      });

      // Apply all updates in a single state update
      setFormFields((prevFields) =>
        prevFields.map((field) => {
          const update = updates.find((u) => u.id === field.id);
          return update ? { ...field, value: update.value } : field;
        })
      );

      toast.success("✨ All fields applied successfully!");
    } catch (error) {
      toast.error("Failed to apply fields");
      console.error("Error applying fields:", error);
    }
  };

  

  

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        formFields={formFields}
        onFieldUpdate={handleFieldUpdate}
        onSignatureAdd={handleSignatureAdd}
        onTextAdd={handleTextAdd}
        highlightedFieldId={highlightedFieldId}
        currentPage={currentPage}
      />

      <FloatingChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        formFields={formFields}
        currentPage={currentPage}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          currentPage={currentPage}
          numPages={numPages}
          zoom={zoom}
          onPageChange={setCurrentPage}
          onNext={handleNext}
          onZoomChange={setZoom}
          pdfFile={pdfFile}
          formFields={formFields}
          signatures={signatures}
          textAnnotations={textAnnotations}
          onNewFile={() => setPdfFile(null)}
          onLoadDummyData={handleLoadDummyData}
          onChatOpen={() => setIsChatOpen(true)}
        />
        
        <PDFViewer
          file={pdfFile}
          currentPage={currentPage}
          zoom={zoom}
          onLoadSuccess={setNumPages}
          formFields={formFields}
          signatures={signatures}
          textAnnotations={textAnnotations}
          onFieldUpdate={handleFieldUpdate}
          onSignatureMove={handleSignatureMove}
          onSignatureResize={handleSignatureResize}
          onSignatureDelete={handleSignatureDelete}
          onTextMove={handleTextMove}
          onTextResize={handleTextResize}
          onTextUpdate={handleTextUpdate}
          onTextDelete={handleTextDelete}
          onFieldsDetected={setFormFields}
          onFieldClick={handleFieldClick}
          onPageDimensionsDetected={setPageDimensions}
        />
      </div>
    </div>
  );
};

export default PDFEditor;
