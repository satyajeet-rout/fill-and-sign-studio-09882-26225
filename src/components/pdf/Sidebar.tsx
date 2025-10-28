import { useState, useRef, useEffect } from "react";
import { X, FileText, PenTool, ChevronDown, ChevronUp, Type, ChevronRight, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormField } from "../PDFEditor";
import { cleanFieldName } from "@/lib/fieldNameUtils";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  formFields: FormField[];
  onFieldUpdate: (id: string, value: string) => void;
  onSignatureAdd: (signatureData: string) => void;
  onTextAdd: (text: string) => void;
  highlightedFieldId?: string;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  formFields,
  onFieldUpdate,
  onSignatureAdd,
  onTextAdd,
  highlightedFieldId,
}: SidebarProps) => {
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
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
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onSignatureAdd(event.target.result as string);
            toast.success("Signature added! Drag it to position.");
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check if canvas is empty
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = !imageData.data.some(channel => channel !== 0);
    
    if (isEmpty) {
      toast.error("Please draw your signature first");
      return;
    }

    const signatureData = canvas.toDataURL("image/png");
    onSignatureAdd(signatureData);
    handleClearSignature();
    setIsSignatureOpen(false);
    toast.success("Signature added! Drag it to position.");
  };

  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text");
      return;
    }
    
    onTextAdd(textInput);
    setTextInput("");
    setIsTextOpen(false);
    toast.success("Text added! Drag it to position.");
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

            {/* Signature Upload Section */}
            <Collapsible open={isSignatureOpen} onOpenChange={setIsSignatureOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    <span className="font-medium">Add Signature</span>
                  </div>
                  {isSignatureOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 py-3 space-y-3">
                {/* Upload Option */}
                <div className="border-2 border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-colors">
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Upload image
                    </span>
                  </label>
                </div>

                <div className="text-center text-xs text-muted-foreground">or</div>

                {/* Draw Option */}
                <div className="space-y-2">
                  <Label className="text-xs">Draw Signature</Label>
                  <canvas
                    ref={canvasRef}
                    width={256}
                    height={120}
                    className="border border-border rounded-lg bg-white w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveSignature}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearSignature}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            {/* Add Text Section */}
            <Collapsible open={isTextOpen} onOpenChange={setIsTextOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    <span className="font-medium">Add Text</span>
                  </div>
                  {isTextOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 py-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Enter Text</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Type your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddText}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Add Text
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTextInput("")}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

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
