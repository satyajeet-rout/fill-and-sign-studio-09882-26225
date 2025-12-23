import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PdfThumbnail from "@/components/PdfThumbnail";
import ReviewChatPanel from "@/components/ReviewChatPanel";

const ReviewPdfPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [enableChatCheckbox, setEnableChatCheckbox] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Primary: use passed objectUrl
    const state: any = location.state || {};
    if (state.objectUrl) {
      setObjectUrl(state.objectUrl);
      return;
    }

    // Fallback: try sessionStorage base64
    const base64 = sessionStorage.getItem("reviewPdfBase64");
    if (base64) {
      // create object URL
      fetch(base64)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setObjectUrl(url);
        })
        .catch(err => console.error("Failed to create blob from base64", err));
    }
  }, [location.state]);

  return (
    <div className="h-screen flex">
      <div className={`p-6 ${showChat ? "md:w-2/3" : "w-full"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Review Filled Form</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                onClick={async () => {
                  if (!objectUrl) return;
                  try {
                    const res = await fetch(objectUrl);
                    const blob = await res.blob();
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'filled-form.pdf';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch (err) {
                    console.error('Download failed', err);
                  }
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableChatCheckbox}
                onChange={e => setEnableChatCheckbox(e.target.checked)}
              />
              <span>I want to chat with this form</span>
            </label>

            <Button
              onClick={() => { if (enableChatCheckbox) setShowChat(true); }}
              className={`ml-2 ${!enableChatCheckbox ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!enableChatCheckbox}
            >
              Chat With Form
            </Button>
          </div>

          <div className="p-4 bg-card rounded-lg">
            {objectUrl ? (
              <PdfThumbnail src={objectUrl} />
            ) : (
              <div className="p-12 text-center text-muted-foreground">PDF not found</div>
            )}
          </div>
        </div>
      </div>

      {showChat && (
        <div className="flex w-full md:w-1/3 border-l border-border">
          <div className="w-full h-full">
            <ReviewChatPanel pdfObjectUrl={objectUrl} onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPdfPage;
