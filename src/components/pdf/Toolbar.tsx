import { Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormField, Signature } from "../PDFEditor";
import { savePDF } from "@/lib/pdfUtils";
import { toast } from "sonner";

interface ToolbarProps {
  currentPage: number;
  numPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  pdfFile: File;
  formFields: FormField[];
  signatures: Signature[];
  onNewFile: () => void;
}

export const Toolbar = ({
  currentPage,
  numPages,
  zoom,
  onPageChange,
  onZoomChange,
  pdfFile,
  formFields,
  signatures,
  onNewFile,
}: ToolbarProps) => {
  const handleSave = async () => {
    const loadingToast = toast.loading("Preparing PDF for download...");
    
    try {
      await savePDF(pdfFile, formFields, signatures);
      toast.dismiss(loadingToast);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Save error:", error);
      
      // Provide helpful error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("encrypted") || errorMessage.includes("password")) {
        toast.error("This PDF is password-protected. Please use an unlocked version.");
      } else if (errorMessage.includes("Invalid") || errorMessage.includes("parse")) {
        toast.error("This PDF has compatibility issues. Try converting it to PDF/A format.");
      } else {
        toast.error("Unable to save PDF. Please try a different file.");
      }
    }
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewFile}
            className="gap-2 hover:bg-secondary"
          >
            <FileUp className="w-4 h-4" />
            New File
          </Button>
          
          <Separator orientation="vertical" className="h-6" />

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-sm font-medium min-w-[80px] text-center">
              <span className="text-foreground">{currentPage}</span>
              <span className="text-muted-foreground"> / {numPages}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
              disabled={currentPage === numPages}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
              disabled={zoom <= 0.5}
              className="h-8 w-8"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <div className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
              disabled={zoom >= 2}
              className="h-8 w-8"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-elegant"
        >
          <Download className="w-4 h-4" />
          Save & Download
        </Button>
      </div>
    </div>
  );
};
