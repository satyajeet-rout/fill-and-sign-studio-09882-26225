import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Wand2, Copy } from "lucide-react";
import { toast } from "sonner";

interface SampleField {
  name: string;
  label: string;
  value: string;
  type: string;
}

interface SampleDataPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onApplyField: (fieldName: string, value: string) => void;
  onApplyAll: () => void;
}

export const SampleDataPanel = ({
  isOpen,
  onToggle,
  onApplyField,
  onApplyAll,
}: SampleDataPanelProps) => {
  const [sampleData, setSampleData] = useState<SampleField[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    try {
      const response = await fetch("/sample-data/form-fields-dummy.json");
      const data = await response.json();
      setSampleData(data.formFields);
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast.error("Failed to load sample data");
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeFields = () => {
    const categories = {
      personalInfo: [] as SampleField[],
      education: [] as SampleField[],
      employment: [] as SampleField[],
      achievements: [] as SampleField[],
    };

    sampleData.forEach((field) => {
      if (["fullName", "dateOfBirth", "passportNumber", "citizenship", "address", "phone", "email"].includes(field.name)) {
        categories.personalInfo.push(field);
      } else if (["education", "university", "graduationYear"].includes(field.name)) {
        categories.education.push(field);
      } else if (["currentEmployer", "jobTitle", "yearsExperience", "salary"].includes(field.name)) {
        categories.employment.push(field);
      } else {
        categories.achievements.push(field);
      }
    });

    return categories;
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApplyField = (fieldName: string, fieldValue: string, fieldLabel?: string) => {
    const field = sampleData.find(f => f.name === fieldName);
    onApplyField(fieldName, fieldValue);
    const labelToShow = fieldLabel ?? field?.label ?? fieldName;
    toast.success(`Applied: ${labelToShow}`);
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-card border-r border-border flex flex-col p-4">
        <p className="text-sm text-muted-foreground">Loading sample data...</p>
      </div>
    );
  }

  const categories = categorizeFields();

  return (
    <div className={`${isOpen ? "w-96" : "w-12"} bg-card border-r border-border flex flex-col transition-all duration-300 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isOpen && (
          <>
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Sample Data</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </>
        )}
        {!isOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-full w-full flex items-center justify-center"
            title="Open Sample Data"
          >
            <Wand2 className="w-4 h-4 text-primary" />
          </Button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Apply All Button */}
          <div className="p-4 border-b border-border">
            <Button
              onClick={onApplyAll}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
              size="sm"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Apply All Fields
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Personal Info */}
            <div className="border-b border-border">
              <button
                onClick={() => toggleSection("personalInfo")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">👤 Personal Info</span>
                {expandedSections.personalInfo ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedSections.personalInfo && (
                <div className="px-3 py-2 space-y-2 bg-secondary/30">
                  {categories.personalInfo.map((field) => (
                    <FieldItem
                      key={field.name}
                      field={field}
                      onApply={handleApplyField}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="border-b border-border">
              <button
                onClick={() => toggleSection("education")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">🎓 Education</span>
                {expandedSections.education ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedSections.education && (
                <div className="px-3 py-2 space-y-2 bg-secondary/30">
                  {categories.education.map((field) => (
                    <FieldItem
                      key={field.name}
                      field={field}
                      onApply={handleApplyField}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Employment */}
            <div className="border-b border-border">
              <button
                onClick={() => toggleSection("employment")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">💼 Employment</span>
                {expandedSections.employment ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedSections.employment && (
                <div className="px-3 py-2 space-y-2 bg-secondary/30">
                  {categories.employment.map((field) => (
                    <FieldItem
                      key={field.name}
                      field={field}
                      onApply={handleApplyField}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div>
              <button
                onClick={() => toggleSection("achievements")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">🏆 Achievements</span>
                {expandedSections.achievements ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedSections.achievements && (
                <div className="px-3 py-2 space-y-2 bg-secondary/30">
                  {categories.achievements.map((field) => (
                    <FieldItem
                      key={field.name}
                      field={field}
                      onApply={handleApplyField}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Individual Field Item
interface FieldItemProps {
  field: SampleField;
  onApply: (fieldName: string, fieldValue: string, fieldLabel?: string) => void;
}

const FieldItem = ({ field, onApply }: FieldItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(field.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded border border-border/50 p-2 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {field.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {field.value}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApply(field.name, field.value, field.label)}
            className="h-6 w-6 p-0 hover:bg-primary/20"
            title="Apply to form"
          >
            <Wand2 className="w-3 h-3 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-secondary"
            title="Copy value"
          >
            <Copy className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};
