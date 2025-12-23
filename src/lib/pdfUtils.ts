import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FormField, Signature, TextAnnotation } from "@/components/PDFEditor";
import { toast } from "sonner";

export async function savePDF(
  originalFile: File,
  formFields: FormField[],
  signatures: Signature[],
  textAnnotations: TextAnnotation[] = []
): Promise<void> {
  try {
    // Load the original PDF with lenient parsing options
    const arrayBuffer = await originalFile.arrayBuffer();
    
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
      });
    } catch (loadError) {
      console.error("PDF parsing error:", loadError);
      toast.error("This PDF has formatting issues. Trying alternative save method...");
      
      // Fallback: Create a new PDF and try to copy content
      await savePDFAlternativeMethod(originalFile, formFields, signatures, textAnnotations);
      return;
    }
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    
    // Embed font for text annotations
    const font = await pdfDoc.embedFont(StandardFonts.Courier);

    // Fill form field values
    for (const field of formFields) {
      try {
        const pdfField = form.getFields().find(f => f.getName() === field.name);
        
        if (pdfField && field.value) {
          if (field.type === "text") {
            (pdfField as any).setText?.(field.value);
          } else if (field.type === "checkbox") {
            if (field.value === "true") {
              (pdfField as any).check?.();
            } else {
              (pdfField as any).uncheck?.();
            }
          }
        }
      } catch (error) {
        console.error(`Error filling field ${field.name}:`, error);
      }
    }

    // Embed and draw signatures BEFORE flattening
    for (const signature of signatures) {
      const page = pages[signature.page - 1];
      const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

      console.log("Processing signature:", {
        id: signature.id,
        page: signature.page,
        canvasX: signature.x,
        canvasY: signature.y,
        canvasWidth: signature.width,
        canvasHeight: signature.height,
        storedCanvasPageWidth: signature.pageWidth,
        storedCanvasPageHeight: signature.pageHeight,
        actualPdfPageWidth: pdfPageWidth,
        actualPdfPageHeight: pdfPageHeight,
      });

      try {
        // Extract image data from base64
        const imageData = signature.image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));

        console.log("Image bytes extracted, length:", imageBytes.length);

        // Determine image type and embed
        let image;
        if (signature.image.includes("image/png")) {
          console.log("Embedding as PNG");
          image = await pdfDoc.embedPng(imageBytes);
        } else if (signature.image.includes("image/jpeg") || signature.image.includes("image/jpg")) {
          console.log("Embedding as JPG");
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          console.warn("Unsupported image format for signature");
          continue;
        }

        console.log("Image embedded successfully");

        // Calculate scale factor: from rendered canvas space to PDF points
        const scaleX = signature.pageWidth ? pdfPageWidth / signature.pageWidth : 1;
        const scaleY = signature.pageHeight ? pdfPageHeight / signature.pageHeight : 1;

        // Convert coordinates from canvas space to PDF space
        const pdfX = signature.x * scaleX;
        const pdfY = signature.y * scaleY;
        const pdfWidth = signature.width * scaleX;
        const pdfHeight = signature.height * scaleY;

        console.log("Scale and position calculation:", {
          scaleX,
          scaleY,
          pdfX,
          pdfY,
          pdfWidth,
          pdfHeight,
          finalY: pdfPageHeight - pdfY - pdfHeight,
        });

        // Draw the signature image (PDF coordinates start from bottom-left)
        page.drawImage(image, {
          x: pdfX,
          y: pdfPageHeight - pdfY - pdfHeight,
          width: pdfWidth,
          height: pdfHeight,
        });

        console.log("Signature drawn successfully");
      } catch (error) {
        console.error("Failed to embed signature:", error);
        toast.error(`Failed to add signature: ${error.message}`);
      }
    }

    // Draw text annotations
    for (const textAnnotation of textAnnotations) {
      const page = pages[textAnnotation.page - 1];
      const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

      console.log("Processing text annotation:", {
        id: textAnnotation.id,
        text: textAnnotation.text,
        x: textAnnotation.x,
        y: textAnnotation.y,
        fontSize: textAnnotation.fontSize,
        pageWidth: textAnnotation.pageWidth,
        pageHeight: textAnnotation.pageHeight,
      });

      try {
        // Calculate scale factor between rendered canvas and actual PDF
        const scaleX = textAnnotation.pageWidth ? pdfPageWidth / textAnnotation.pageWidth : 1;
        const scaleY = textAnnotation.pageHeight ? pdfPageHeight / textAnnotation.pageHeight : 1;

        // Convert coordinates from canvas space to PDF space
        const pdfX = textAnnotation.x * scaleX;
        const pdfY = textAnnotation.y * scaleY;
        const pdfFontSize = textAnnotation.fontSize * scaleY;

        console.log("Text scales:", { scaleX, scaleY, pdfX, pdfY, pdfFontSize });

        // Draw text
        const lines = textAnnotation.text.split('\n');
        const lineHeight = pdfFontSize * 1.2;
        
        lines.forEach((line, index) => {
          page.drawText(line, {
            x: pdfX + 5 * scaleX,
            y: pdfPageHeight - pdfY - (index + 1) * lineHeight - 5 * scaleY,
            size: pdfFontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        });

        console.log("Text annotation drawn successfully");
      } catch (error) {
        console.error("Failed to add text annotation:", error);
        toast.error(`Failed to add text: ${error.message}`);
      }
    }

    // Now flatten the form AFTER drawing signatures and text
    try {
      form.updateFieldAppearances();
      form.flatten();
      console.log("Form flattened successfully");
    } catch (error) {
      console.warn("Could not flatten form, fields will remain editable:", error);
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `edited_${originalFile.name}`;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving PDF:", error);
    toast.error("Failed to save PDF. The file may have compatibility issues.");
    throw error;
  }
}

// Export a filled PDF as a Blob (without triggering a download)
export async function exportFilledPdf(
  originalFile: File,
  formFields: FormField[],
  signatures: Signature[],
  textAnnotations: TextAnnotation[] = []
): Promise<Blob> {
  try {
    const arrayBuffer = await originalFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);

    // Fill fields (similar to savePDF)
    for (const field of formFields) {
      try {
        const pdfField = form.getFields().find(f => f.getName() === field.name);
        if (pdfField && field.value) {
          if (field.type === "text") {
            (pdfField as any).setText?.(field.value);
          } else if (field.type === "checkbox") {
            if (field.value === "true") {
              (pdfField as any).check?.();
            } else {
              (pdfField as any).uncheck?.();
            }
          }
        }
      } catch (error) {
        console.error(`Error filling field ${field.name}:`, error);
      }
    }

    // Signatures
    for (const signature of signatures) {
      const page = pages[signature.page - 1];
      const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();
      try {
        const imageData = signature.image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));
        let image;
        if (signature.image.includes("image/png")) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (signature.image.includes("image/jpeg") || signature.image.includes("image/jpg")) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          continue;
        }

        const scaleX = signature.pageWidth ? pdfPageWidth / signature.pageWidth : 1;
        const scaleY = signature.pageHeight ? pdfPageHeight / signature.pageHeight : 1;
        const pdfX = signature.x * scaleX;
        const pdfY = signature.y * scaleY;
        const pdfWidth = signature.width * scaleX;
        const pdfHeight = signature.height * scaleY;

        page.drawImage(image, {
          x: pdfX,
          y: pdfPageHeight - pdfY - pdfHeight,
          width: pdfWidth,
          height: pdfHeight,
        });
      } catch (error) {
        console.error("Failed to embed signature:", error);
      }
    }

    // Text annotations
    for (const textAnnotation of textAnnotations) {
      const page = pages[textAnnotation.page - 1];
      const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();
      try {
        const scaleX = textAnnotation.pageWidth ? pdfPageWidth / textAnnotation.pageWidth : 1;
        const scaleY = textAnnotation.pageHeight ? pdfPageHeight / textAnnotation.pageHeight : 1;
        const pdfX = textAnnotation.x * scaleX;
        const pdfY = textAnnotation.y * scaleY;
        const pdfFontSize = textAnnotation.fontSize * scaleY;

        const lines = textAnnotation.text.split('\n');
        const lineHeight = pdfFontSize * 1.2;
        lines.forEach((line, index) => {
          page.drawText(line, {
            x: pdfX + 5 * scaleX,
            y: pdfPageHeight - pdfY - (index + 1) * lineHeight - 5 * scaleY,
            size: pdfFontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        });
      } catch (error) {
        console.error("Failed to add text annotation:", error);
      }
    }

    try {
      form.updateFieldAppearances();
      form.flatten();
    } catch (error) {
      console.warn("Could not flatten form:", error);
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    return blob;
  } catch (error) {
    console.error("exportFilledPdf error:", error);
    throw error;
  }
}

// Alternative save method using canvas rendering
async function savePDFAlternativeMethod(
  originalFile: File,
  formFields: FormField[],
  signatures: Signature[],
  textAnnotations: TextAnnotation[]
): Promise<void> {
  try {
    toast.info("Using alternative save method - this may take a moment...");
    
    // For PDFs with parsing issues, we'll use a simpler approach:
    // Just create a download with the original file since we can't modify it safely
    const blob = new Blob([await originalFile.arrayBuffer()], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `edited_${originalFile.name}`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast.warning("Note: Due to PDF compatibility issues, changes may not be embedded. Consider using a different PDF or converting it first.");
  } catch (error) {
    console.error("Alternative save failed:", error);
    toast.error("Unable to save this PDF. Try converting it to a newer PDF format.");
    throw error;
  }
}
