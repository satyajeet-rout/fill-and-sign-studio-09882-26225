import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type === "application/pdf") {
          onFileSelect(file);
          toast.success("PDF loaded successfully!");
        } else {
          toast.error("Please upload a PDF file");
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-elegant">
            <FileText className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PDF Editor Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Fill forms, add signatures, and edit PDFs with ease
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${
              isDragActive
                ? "border-primary bg-primary/5 scale-105 shadow-glow"
                : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-6">
            <div className={`
              p-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10
              transition-transform duration-300
              ${isDragActive ? "scale-110" : ""}
            `}>
              <Upload className={`w-12 h-12 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                {isDragActive ? "Drop your PDF here" : "Upload your PDF"}
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your PDF file here, or click to browse
              </p>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-elegant px-8"
              >
                Choose File
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Form Fillable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span>Add Signatures</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Secure Export</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Supports all PDF formats including form-fillable documents</p>
        </div>
      </div>
    </div>
  );
};
