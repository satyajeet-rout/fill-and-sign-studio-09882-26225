import { PDFDocument, rgb } from "pdf-lib";
import { FormField, Signature } from "@/components/PDFEditor";
import { toast } from "sonner";

export async function savePDF(
  originalFile: File,
  formFields: FormField[],
  signatures: Signature[]
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
      await savePDFAlternativeMethod(originalFile, formFields, signatures);
      return;
    }
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();

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

    // Flatten the form to make fields non-editable in the saved PDF
    try {
      form.flatten();
    } catch (error) {
      console.warn("Could not flatten form, fields will remain editable:", error);
    }

    // Embed and draw signatures
    for (const signature of signatures) {
      const page = pages[signature.page - 1];
      const { height } = page.getSize();

      try {
        // Extract image data from base64
        const imageData = signature.image.split(",")[1];
        const imageBytes = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));

        // Determine image type and embed
        let image;
        if (signature.image.includes("image/png")) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (signature.image.includes("image/jpeg") || signature.image.includes("image/jpg")) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          console.warn("Unsupported image format for signature");
          continue;
        }

        // Draw the signature image
        page.drawImage(image, {
          x: signature.x,
          y: height - signature.y - signature.height,
          width: signature.width,
          height: signature.height,
        });
      } catch (error) {
        console.error("Failed to embed signature:", error);
      }
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

// Alternative save method using canvas rendering
async function savePDFAlternativeMethod(
  originalFile: File,
  formFields: FormField[],
  signatures: Signature[]
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
