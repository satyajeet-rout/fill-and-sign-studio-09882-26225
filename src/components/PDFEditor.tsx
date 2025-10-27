import { useState } from "react";
import { FileUpload } from "./pdf/FileUpload";
import { PDFViewer } from "./pdf/PDFViewer";
import { Sidebar } from "./pdf/Sidebar";
import { Toolbar } from "./pdf/Toolbar";

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
}

export interface Signature {
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const PDFEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | undefined>();

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    setCurrentPage(1);
    setFormFields([]);
    setSignatures([]);
  };

  const handleFieldUpdate = (id: string, value: string) => {
    setFormFields(prev =>
      prev.map(field =>
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const handleSignatureAdd = (signatureData: string) => {
    const newSignature: Signature = {
      id: `sig-${Date.now()}`,
      image: signatureData,
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      page: currentPage,
    };
    setSignatures(prev => [...prev, newSignature]);
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

  const handleFieldClick = (id: string) => {
    setHighlightedFieldId(id);
    setIsSidebarOpen(true);
    setTimeout(() => setHighlightedFieldId(undefined), 2000);
  };

  if (!pdfFile) {
    return <FileUpload onFileSelect={handleFileSelect} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        formFields={formFields}
        onFieldUpdate={handleFieldUpdate}
        onSignatureAdd={handleSignatureAdd}
        highlightedFieldId={highlightedFieldId}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          currentPage={currentPage}
          numPages={numPages}
          zoom={zoom}
          onPageChange={setCurrentPage}
          onZoomChange={setZoom}
          pdfFile={pdfFile}
          formFields={formFields}
          signatures={signatures}
          onNewFile={() => setPdfFile(null)}
        />
        
        <PDFViewer
          file={pdfFile}
          currentPage={currentPage}
          zoom={zoom}
          onLoadSuccess={setNumPages}
          formFields={formFields}
          signatures={signatures}
          onFieldUpdate={handleFieldUpdate}
          onSignatureMove={handleSignatureMove}
          onSignatureResize={handleSignatureResize}
          onSignatureDelete={handleSignatureDelete}
          onFieldsDetected={setFormFields}
          onFieldClick={handleFieldClick}
        />
      </div>
    </div>
  );
};

export default PDFEditor;
