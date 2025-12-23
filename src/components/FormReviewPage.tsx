import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "./ChatPanel";
import { FormSelector } from "./FormSelector";
import { ErrorBoundary } from "./ErrorBoundary";

// Note: ChatPanel and FormSelector should be in the same components folder

interface SimpleFormField {
  id: string;
  name: string;
  page: number;
  value?: string;
}

interface FormReviewPageProps {
  formFields: SimpleFormField[];
  numPages: number;
  currentPage: number;
  onBack: () => void;
}

export const FormReviewPage = ({
  formFields,
  numPages,
  currentPage,
  onBack,
}: FormReviewPageProps) => {
  const [selectedPages, setSelectedPages] = useState<number[]>([currentPage]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handlePageToggle = (page: number) => {
    setSelectedPages(prev =>
      prev.includes(page)
        ? prev.filter(p => p !== page)
        : [...prev, page].sort((a, b) => a - b)
    );
  };

  const getSelectedPageFields = () => {
    return formFields.filter(f => selectedPages.includes(f.page));
  };

  const formattedContent = getSelectedPageFields()
    .map(field => `${field.name}: ${field.value}`)
    .join("\n");

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Left Side - Form Selector */}
        <div className="w-full md:w-1/2 border-r border-border overflow-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Review Forms</h1>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                Select the pages you want to review and discuss with AI
              </p>
            </div>

            <FormSelector
              numPages={numPages}
              selectedPages={selectedPages}
              onPageToggle={handlePageToggle}
              formFields={formFields}
            />
          </div>
        </div>

        {/* Right Side - Chat Panel */}
        <div className="hidden md:flex w-1/2 flex-col bg-blue-50">
          {selectedPages.length > 0 ? (
            <ChatPanel
              selectedPages={selectedPages}
              formContent={formattedContent}
              numPages={numPages}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a page to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
