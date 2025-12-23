import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageSelectorProps {
  numPages: number;
  selectedPages: number[];
  onSelectionChange: (pages: number[]) => void;
}

export const PageSelector = ({
  numPages,
  selectedPages,
  onSelectionChange,
}: PageSelectorProps) => {
  const handleTogglePage = (page: number) => {
    if (selectedPages.includes(page)) {
      onSelectionChange(selectedPages.filter(p => p !== page));
    } else {
      onSelectionChange([...selectedPages, page].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (selectedPages.length === numPages) {
      onSelectionChange([]);
    } else {
      onSelectionChange(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="mb-4">
        <button
          onClick={handleSelectAll}
          className="text-sm font-medium text-primary hover:underline"
        >
          {selectedPages.length === numPages ? "Deselect All" : "Select All"}
        </button>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-2 pr-4">
          {Array.from({ length: numPages }, (_, i) => i + 1).map(page => (
            <div key={page} className="flex items-center gap-2">
              <Checkbox
                id={`page-${page}`}
                checked={selectedPages.includes(page)}
                onCheckedChange={() => handleTogglePage(page)}
              />
              <Label htmlFor={`page-${page}`} className="text-sm cursor-pointer">
                Page {page}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
