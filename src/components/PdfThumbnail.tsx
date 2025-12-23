import React from "react";

interface PdfThumbnailProps {
  src: string;
}

const PdfThumbnail = ({ src }: PdfThumbnailProps) => {
  return (
    <div className="w-full h-[600px] bg-white rounded-md overflow-hidden shadow-sm">
      <iframe
        title="pdf-preview"
        src={src}
        className="w-full h-full"
      />
    </div>
  );
};

export default PdfThumbnail;
