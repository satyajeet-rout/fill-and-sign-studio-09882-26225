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

export interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  page: number;
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

  const handleTextAdd = (text: string) => {
    const newText: TextAnnotation = {
      id: `text-${Date.now()}`,
      text,
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      fontSize: 14,
      page: currentPage,
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
        onTextAdd={handleTextAdd}
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
          textAnnotations={textAnnotations}
          onNewFile={() => setPdfFile(null)}
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
        />
      </div>
    </div>
  );
};

export default PDFEditor;
