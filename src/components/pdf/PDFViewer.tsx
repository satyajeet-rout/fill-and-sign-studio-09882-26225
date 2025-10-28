import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FormField, Signature } from "../PDFEditor";
import { SignatureOverlay } from "./SignatureOverlay";
import { Loader2 } from "lucide-react";
import { extractFormFields } from "@/lib/formFieldExtractor";
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
  onFieldUpdate: (id: string, value: string) => void;
  onSignatureMove: (id: string, x: number, y: number) => void;
  onSignatureResize: (id: string, width: number, height: number) => void;
  onSignatureDelete: (id: string) => void;
  onFieldsDetected: (fields: FormField[]) => void;
  onFieldClick?: (id: string) => void;
}

export const PDFViewer = ({
  file,
  currentPage,
  zoom,
  onLoadSuccess,
  formFields,
  signatures,
  onFieldUpdate,
  onSignatureMove,
  onSignatureResize,
  onSignatureDelete,
  onFieldsDetected,
  onFieldClick,
}: PDFViewerProps) => {
  const [pageWidth, setPageWidth] = useState(800);
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

  const handleDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    onLoadSuccess(numPages);
    
    // Extract actual form fields from the PDF with the rendered page width
    const fields = await extractFormFields(file, pageWidth);
    onFieldsDetected(fields);
  };

  const currentPageSignatures = signatures.filter(sig => sig.page === currentPage);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-gradient-to-br from-secondary/10 to-transparent p-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-white rounded-lg shadow-elegant overflow-hidden">
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
            <div className="relative" style={{ pointerEvents: 'none' }}>
              <Page
                pageNumber={currentPage}
                width={pageWidth * zoom}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              
              {/* Render form fields */}
              {formFields
                .filter(field => field.page === currentPage)
                .map(field => (
                  <div
                    key={field.id}
                    className="absolute border-2 border-primary/50 bg-white/90 rounded shadow-sm z-40 hover:border-primary transition-colors cursor-pointer"
                    style={{
                      left: field.x,
                      top: field.y,
                      width: field.width,
                      height: field.height,
                      pointerEvents: 'auto',
                    }}
                    onClick={() => onFieldClick?.(field.id)}
                  >
                    {field.type === "text" && (
                      <input
                        type="text"
                        value={field.value || ""}
                        onChange={(e) => onFieldUpdate(field.id, e.target.value)}
                        className="w-full h-full px-2 bg-transparent border-none outline-none text-sm focus:bg-primary/5"
                        style={{ pointerEvents: 'auto' }}
                      />
                    )}
                    {field.type === "checkbox" && (
                      <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={field.value === "true"}
                          onChange={(e) => onFieldUpdate(field.id, e.target.checked.toString())}
                          className="w-5 h-5 cursor-pointer"
                          style={{ pointerEvents: 'auto' }}
                        />
                      </div>
                    )}
                  </div>
                ))}

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
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};
