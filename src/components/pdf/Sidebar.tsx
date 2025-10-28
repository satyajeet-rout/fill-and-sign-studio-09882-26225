import { useState, useEffect } from "react";
import { ChevronRight, Upload, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormField } from "../PDFEditor";
import { toast } from "sonner";
import { cleanFieldName } from "@/lib/fieldNameUtils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  formFields: FormField[];
  onFieldUpdate: (id: string, value: string) => void;
  onSignatureAdd: (signatureData: string) => void;
  highlightedFieldId?: string;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  formFields,
  onFieldUpdate,
  onSignatureAdd,
  highlightedFieldId,
}: SidebarProps) => {
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  // Initialize draft values when form fields change
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    formFields.forEach(field => {
      initialValues[field.id] = field.value;
    });
    setDraftValues(initialValues);
  }, [formFields]);

  // Scroll to highlighted field
  useEffect(() => {
    if (highlightedFieldId) {
      const element = document.getElementById(`field-${highlightedFieldId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedFieldId]);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSignatureFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onSignatureAdd(event.target.result as string);
            toast.success("Signature added! Drag it to position it.");
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleApplyValues = () => {
    Object.entries(draftValues).forEach(([id, value]) => {
      onFieldUpdate(id, value);
    });
    toast.success("Form values applied successfully!");
  };

  const handleDraftChange = (id: string, value: string) => {
    setDraftValues(prev => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <div
        className={`
          bg-card border-r border-border transition-all duration-300 flex flex-col
          ${isOpen ? "w-80" : "w-0"}
        `}
      >
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Editor Panel</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="hover:bg-secondary"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Signature Upload */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Add Signature</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  id="signature-upload"
                />
                <label
                  htmlFor="signature-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Upload signature image
                  </span>
                  {signatureFile && (
                    <span className="text-xs text-primary font-medium">
                      {signatureFile.name}
                    </span>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, or SVG format
              </p>
            </div>

            <Separator className="my-6" />

            {/* Form Fields */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-medium">Form Fields</Label>
                </div>
                {formFields.length > 0 && (
                  <Button 
                    size="sm" 
                    onClick={handleApplyValues}
                    className="h-8 gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply
                  </Button>
                )}
              </div>

              {formFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No form fields detected in this PDF
                </p>
              ) : (
                <div className="space-y-4">
                  {formFields
                    .filter(field => !field.name.toLowerCase().includes('barcode'))
                    .map((field) => (
                      <div 
                        key={field.id} 
                        id={`field-${field.id}`}
                        className={`space-y-2 p-3 rounded-lg transition-colors ${
                          highlightedFieldId === field.id ? 'bg-primary/10 border-2 border-primary' : 'bg-transparent'
                        }`}
                      >
                        <Label className="text-sm font-medium">{cleanFieldName(field.name)}</Label>
                        {field.type === "text" && (
                          <Input
                            value={draftValues[field.id] || ""}
                            onChange={(e) => handleDraftChange(field.id, e.target.value)}
                            className="h-9"
                          />
                        )}
                        {field.type === "checkbox" && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={draftValues[field.id] === "true"}
                              onChange={(e) =>
                                handleDraftChange(field.id, e.target.checked.toString())
                              }
                              className="w-4 h-4 rounded border-border cursor-pointer"
                            />
                            <span className="text-sm text-muted-foreground">
                              Check to agree
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute left-4 top-20 z-10 bg-card shadow-lg hover:bg-secondary"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Button>
      )}
    </>
  );
};
