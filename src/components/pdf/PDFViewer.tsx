import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FormField, Signature, TextAnnotation } from "../PDFEditor";
import { SignatureOverlay } from "./SignatureOverlay";
import { TextOverlay } from "./TextOverlay";
import { Loader2 } from "lucide-react";
import { extractFormFields } from "@/lib/formFieldExtractor";
import { Checkbox } from "@/components/ui/checkbox";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  currentPage: number;
  zoom: number;
  onLoadSuccess: (numPages: number) => void;
  formFields: FormField[];
  signatures: Signature[];
  textAnnotations: TextAnnotation[];
  onFieldUpdate: (id: string, value: string) => void;
  onSignatureMove: (id: string, x: number, y: number) => void;
  onSignatureResize: (id: string, width: number, height: number) => void;
  onSignatureDelete: (id: string) => void;
  onTextMove: (id: string, x: number, y: number) => void;
  onTextResize: (id: string, width: number, height: number) => void;
  onTextUpdate: (id: string, text: string) => void;
  onTextDelete: (id: string) => void;
  onFieldsDetected: (fields: FormField[]) => void;
  onFieldClick?: (id: string) => void;
  onPageDimensionsDetected: (dimensions: { width: number; height: number }) => void;
}

export const PDFViewer = ({
  file,
  currentPage,
  zoom,
  onLoadSuccess,
  formFields,
  signatures,
  textAnnotations,
  onFieldUpdate,
  onSignatureMove,
  onSignatureResize,
  onSignatureDelete,
  onTextMove,
  onTextResize,
  onTextUpdate,
  onTextDelete,
  onFieldsDetected,
  onFieldClick,
  onPageDimensionsDetected,
}: PDFViewerProps) => {
  const [pageWidth, setPageWidth] = useState(800);
  const [aspectRatio, setAspectRatio] = useState(1.294); // Standard letter ratio as default
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 48;
        setPageWidth(Math.min(width, 1000));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Update page dimensions whenever pageWidth or aspectRatio changes
  useEffect(() => {
    const renderedHeight = pageWidth * aspectRatio;
    onPageDimensionsDetected({ width: pageWidth, height: renderedHeight });
  }, [pageWidth, aspectRatio, onPageDimensionsDetected]);

  const handleDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    onLoadSuccess(numPages);
    
    // Get actual PDF page dimensions to calculate aspect ratio
    const loadingTask = pdfjs.getDocument(await file.arrayBuffer());
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    
    // Store the aspect ratio for dynamic dimension updates
    setAspectRatio(viewport.height / viewport.width);
    
    // Extract actual form fields from the PDF with the rendered page width
    const fields = await extractFormFields(file, pageWidth);
    onFieldsDetected(fields);
  };

  const currentPageSignatures = signatures.filter(sig => sig.page === currentPage);
  const currentPageTexts = textAnnotations.filter(text => text.page === currentPage);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-secondary/10 to-transparent p-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-white rounded-lg shadow-elegant overflow-hidden" style={{ overflow: 'hidden' }}>
          <Document
            file={file}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96 text-destructive">
                Failed to load PDF
              </div>
            }
          >
            <div className="relative overflow-hidden" style={{ pointerEvents: 'none' }}>
              <Page
                pageNumber={currentPage}
                width={pageWidth * zoom}
                renderTextLayer={false}
                renderAnnotationLayer={true}
              />
              
              {/* Render form fields */}
              {formFields
                .filter(field => field.page === currentPage)
                .map(field => {
                  // Ensure minimum visibility
                  const minWidth = Math.max(field.width, 20);
                  const minHeight = Math.max(field.height, 20);
                  
                  return (
                  <div
                    key={field.id}
                    className="absolute border-2 border-primary/50 bg-white/90 rounded shadow-sm z-40 hover:border-primary transition-colors cursor-pointer"
                    style={{
                      left: field.x,
                      top: field.y,
                      width: minWidth,
                      height: minHeight,
                      pointerEvents: 'none',
                    }}
                    onClick={(e) => {
                      // Don't trigger field click for checkboxes (they handle their own clicks)
                      if (field.type !== "checkbox") {
                        onFieldClick?.(field.id);
                      }
                    }}
                  >
                    {field.type === "text" && (
                      <input
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => onFieldUpdate(field.id, e.target.value)}
                        maxLength={field.maxLength}
                        className="w-full h-full px-2 bg-transparent border-none outline-none text-sm focus:bg-primary/5"
                        style={{ pointerEvents: 'auto', fontFamily: '"Courier New", monospace', color: '#000' }}
                      />
                    )}
                    {field.type === "select" && (
                      <input
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => onFieldUpdate(field.id, e.target.value)}
                        className="w-full h-full px-2 bg-transparent border-none outline-none text-sm focus:bg-primary/5"
                        style={{ pointerEvents: 'auto', fontFamily: '"Courier New", monospace', color: '#000' }}
                      />
                    )}
                    {field.type === "radio" && (
                      <input
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => onFieldUpdate(field.id, e.target.value)}
                        className="w-full h-full px-2 bg-transparent border-none outline-none text-sm focus:bg-primary/5"
                        style={{ pointerEvents: 'auto', fontFamily: '"Courier New", monospace', color: '#000' }}
                      />
                    )}
                    {field.type === "checkbox" && (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ pointerEvents: 'auto' }}
                        onClick={() => {
                          const currentValue = field.value;
                          onFieldUpdate(field.id, currentValue === "true" ? "false" : "true");
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={field.value === "true"}
                          onChange={() => {
                            const currentValue = field.value;
                            onFieldUpdate(field.id, currentValue === "true" ? "false" : "true");
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  );
                })}

              {/* Render signatures */}
              {currentPageSignatures.map(signature => (
                <SignatureOverlay
                  key={signature.id}
                  signature={signature}
                  zoom={zoom}
                  onMove={onSignatureMove}
                  onResize={onSignatureResize}
                  onDelete={onSignatureDelete}
                />
              ))}

              {/* Render text annotations */}
              {currentPageTexts.map(text => (
                <TextOverlay
                  key={text.id}
                  text={text}
                  zoom={zoom}
                  onMove={onTextMove}
                  onResize={onTextResize}
                  onUpdate={onTextUpdate}
                  onDelete={onTextDelete}
                />
              ))}
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};
