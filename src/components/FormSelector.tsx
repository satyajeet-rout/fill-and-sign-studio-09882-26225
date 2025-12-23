import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SimpleFormField {
  id: string;
  name: string;
  page: number;
  value?: string;
}

interface FormSelectorProps {
  numPages: number;
  selectedPages: number[];
  onPageToggle: (page: number) => void;
  formFields: SimpleFormField[];
}

export const FormSelector = ({
  numPages,
  selectedPages,
  onPageToggle,
  formFields,
}: FormSelectorProps) => {
  const getPageFieldCount = (page: number) => {
    return formFields.filter(f => f.page === page).length;
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4">
        Pages ({selectedPages.length} selected)
      </h2>
      
      {Array.from({ length: numPages }, (_, i) => i + 1).map(page => (
        <Card
          key={page}
          className={`p-4 cursor-pointer transition-all ${
            selectedPages.includes(page)
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onPageToggle(page)}
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedPages.includes(page)}
              onCheckedChange={() => onPageToggle(page)}
              className="cursor-pointer"
            />
            <div className="flex-1">
              <Label className="font-semibold cursor-pointer">
                Page {page}
              </Label>
              <p className="text-xs text-muted-foreground">
                {getPageFieldCount(page)} form fields
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
 