import { useState, useRef, useEffect } from "react";
import { X, FileText, PenTool, ChevronDown, ChevronUp, Type, ChevronRight, Upload, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormField } from "../PDFEditor";
import { cleanFieldName } from "@/lib/fieldNameUtils";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  onTextAdd: (text: string, fontSize: number) => void;
  highlightedFieldId?: string;
  currentPage: number;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  formFields,
  onFieldUpdate,
  onSignatureAdd,
  onTextAdd,
  highlightedFieldId,
  currentPage,
}: SidebarProps) => {
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState("14");
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  // Initialize draft values from formFields
  useEffect(() => {
    const initial: Record<string, string> = {};
   	formFields.forEach(f => {
      initial[f.id] = f.value || "";
    });
    setDraftValues(initial);
  }, [formFields]);

  // Auto-scroll to highlighted field
  useEffect(() => {
    if (highlightedFieldId) {
      const el = document.getElementById(`field-${highlightedFieldId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedFieldId]);

  // === Signature Upload ===
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        onSignatureAdd(reader.result as string);
        toast.success("Signature uploaded! Drag to place.");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload an image file");
    }
  };

  // === Drawing Signature ===
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData.data.every((val, i) => i % 4 === 3 || val === 0);

    if (isEmpty) {
      toast.error("Draw your signature first!");
      return;
    }

    onSignatureAdd(canvas.toDataURL("image/png"));
    clearCanvas();
    setIsSignatureOpen(false);
    toast.success("Signature added! Drag to place.");
  };

  // === Add Text ===
  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error("Enter some text first");
      return;
    }
    onTextAdd(textInput.trim(), parseInt(fontSize));
    setTextInput("");
    setIsTextOpen(false);
    toast.success("Text added! Drag to place.");
  };

  // === Apply All Draft Values ===
  const handleApplyValues = () => {
    Object.entries(draftValues).forEach(([id, value]) => {
      onFieldUpdate(id, value);
    });
    toast.success("All values applied to PDF!");
  };

  const handleDraftChange = (id: string, value: string) => {
    setDraftValues(prev => ({ ...prev, [id]: value }));
  };

  // === Load Sample Data – FIXED & IMPROVED ===
  const handleLoadSampleData = async () => {
    if (isLoadingSample) return;
    setIsLoadingSample(true);

    try {
      const response = await fetch("/sample-data/form-fields-dummy.json");
      if (!response.ok) throw new Error("Failed to fetch sample data");

      const data = await response.json();
      const samples = data.formFields || [];

      const updates: { id: string; value: string }[] = [];
      const newDraftValues = { ...draftValues };

      console.log("Loading sample data...", {
        totalFormFields: formFields.length,
        totalSamples: samples.length
      });

      formFields.forEach(field => {
        const fieldName = (field.name || "").trim();
        const cleaned = cleanFieldName(fieldName).toLowerCase();

        // Try different matching strategies
        const match = samples.find((s: any) => {
          const sName = (s.name || "").toString().toLowerCase().trim();
          const sLabel = (s.label || "").toString().toLowerCase().trim();

          // Strategy 1: Exact match on original name
          if (fieldName.toLowerCase() === sName) return true;
          
          // Strategy 2: Exact match on label
          if (fieldName.toLowerCase() === sLabel) return true;
          
          // Strategy 3: Cleaned name exact match
          if (cleaned === sName) return true;
          if (cleaned === sLabel) return true;
          
          // Strategy 4: Contains match
          if (cleaned.includes(sName) || sName.includes(cleaned)) return true;
          if (cleaned.includes(sLabel) || sLabel.includes(cleaned)) return true;
          
          // Strategy 5: Word-based matching - split by spaces and check if any words match
          const cleanedWords = cleaned.split(/[\s_-]+/).filter(w => w.length > 0);
          const sNameWords = sName.split(/[\s_-]+/).filter(w => w.length > 0);
          const sLabelWords = sLabel.split(/[\s_-]+/).filter(w => w.length > 0);
          
          if (cleanedWords.length > 0 && sNameWords.length > 0) {
            const nameMatch = cleanedWords.some(w => sNameWords.some(sw => w.includes(sw) || sw.includes(w)));
            if (nameMatch) return true;
          }
          
          if (cleanedWords.length > 0 && sLabelWords.length > 0) {
            const labelMatch = cleanedWords.some(w => sLabelWords.some(sw => w.includes(sw) || sw.includes(w)));
            if (labelMatch) return true;
          }

          return false;
        });

        if (match?.value != null) {
          const value = String(match.value).trim();
          newDraftValues[field.id] = value;
          updates.push({ id: field.id, value });
          console.log("Matched field:", { fieldName, cleanedName: cleaned, sampleName: match.name, value });
        }
      });

      console.log("Total matches found:", updates.length);

      // Update UI instantly
      setDraftValues(newDraftValues);

      // Apply to actual PDF fields - use batch update
      if (updates.length > 0) {
        // Instead of calling onFieldUpdate multiple times, we'll trigger a single update
        // that applies all changes at once for better performance
        updates.forEach(({ id, value }) => {
          console.log("Applying field update:", { id, value });
          onFieldUpdate(id, value);
        });
      }

      toast.success(`Sample data applied to ${updates.length} field${updates.length !== 1 ? "s" : ""}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sample data");
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <>
      {/* Sidebar Panel */}
      <div className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${isOpen ? "w-80" : "w-0"}`}>
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Editor Panel</h2>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Add Signature */}
            <Collapsible open={isSignatureOpen} onOpenChange={setIsSignatureOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-accent/50">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    <span className="font-medium">Add Signature</span>
                  </div>
                  {isSignatureOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 py-3 space-y-4">
                {/* Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" id="sig-upload" />
                  <label htmlFor="sig-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm">Upload signature image</span>
                  </label>
                </div>

                <div className="text-center text-xs text-muted-foreground">or draw below</div>

                {/* Draw */}
                <div className="space-y-2">
                  <Label className="text-xs">Draw Signature</Label>
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={140}
                    className="border border-border rounded-lg bg-white w-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveDrawnSignature} className="flex-1">
                    Add Signature
                  </Button>
                  <Button variant="outline" onClick={clearCanvas} className="flex-1">
                    Clear
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            {/* Add Text */}
            <Collapsible open={isTextOpen} onOpenChange={setIsTextOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    <span className="font-medium">Add Text</span>
                  </div>
                  {isTextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 py-3 space-y-3">
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Textarea
                    placeholder="Type anything..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                        <SelectItem key={size} value={String(size)}>{size}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddText} className="flex-1">Add Text</Button>
                  <Button variant="outline" onClick={() => setTextInput("")} className="flex-1">Clear</Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            {/* Load Sample Data Button */}
            {formFields.length > 0 && (
              <>
                <Button
                  onClick={handleLoadSampleData}
                  disabled={isLoadingSample}
                  className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md"
                  size="sm"
                >
                  {isLoadingSample ? (
                    <>Loading…</>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 animate-pulse" />
                      Load Sample Data
                    </>
                  )}
                </Button>
                <Separator className="my-4" />
              </>
            )}

            {/* Form Fields List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium">Form Fields</span>
                </div>
                {formFields.length > 0 && (
                  <Button size="sm" onClick={handleApplyValues} className="gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Apply All
                  </Button>
                )}
              </div>

              {formFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No form fields detected</p>
              ) : (
                <div className="space-y-3">
                  {formFields
                    .filter(f => !f.name.toLowerCase().includes("barcode") && f.page === currentPage)
                    .map(field => (
                      <div
                        key={field.id}
                        id={`field-${field.id}`}
                        className={`p-3 rounded-lg border transition-all ${
                          highlightedFieldId === field.id
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-transparent"
                        }`}
                      >
                        <Label className="text-sm">
                          {cleanFieldName(field.name)}
                          {field.maxLength && (
                            <span className="text-muted-foreground ml-1">({field.maxLength})</span>
                          )}
                        </Label>
                        {field.type === "checkbox" ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={draftValues[field.id] === "true"}
                              onChange={e => handleDraftChange(field.id, e.target.checked ? "true" : "false")}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm">{draftValues[field.id] === "true" ? "Checked" : "Unchecked"}</span>
                          </div>
                        ) : (
                          <Input
                            value={draftValues[field.id] ?? ""}
                            onChange={e => handleDraftChange(field.id, e.target.value)}
                            maxLength={field.maxLength}
                            className="mt-1 h-9"
                            placeholder={`Enter ${cleanFieldName(field.name).toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collapsed Toggle Button */}
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