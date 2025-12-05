import { PDFDocument } from "pdf-lib";
import { FormField } from "@/components/PDFEditor";

export async function extractFormFields(file: File, renderedPageWidth?: number): Promise<FormField[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const extractedFields: FormField[] = [];
    const pages = pdfDoc.getPages();

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldName = field.getName();
      
      // Skip barcode fields
      if (fieldName.toLowerCase().includes('barcode')) {
        continue;
      }
      
      // Get field widgets (visual representations on pages)
      const widgets = (field as any).acroField.getWidgets();
      
      for (let widgetIndex = 0; widgetIndex < widgets.length; widgetIndex++) {
        const widget = widgets[widgetIndex];
        const pageRef = widget.P();
        
        if (!pageRef) continue;

        // Find which page this widget is on
        const pages = pdfDoc.getPages();
        let pageIndex = -1;
        for (let p = 0; p < pages.length; p++) {
          if (pages[p].ref === pageRef) {
            pageIndex = p;
            break;
          }
        }

        if (pageIndex === -1) continue;

        const page = pages[pageIndex];
        const pageHeight = page.getHeight();
        const pageWidth = page.getWidth();
        
        // Calculate scale factor if rendered width is provided
        const scaleFactor = renderedPageWidth ? renderedPageWidth / pageWidth : 1;
        
        // Get the field rectangle
        const rect = widget.getRectangle();
        
        if (!rect) continue;

        const { x, y, width, height } = rect;

        // Determine field type
        let fieldType: "text" | "checkbox" | "radio" | "select" = "text";
        
        try {
          if (field.constructor.name.includes("PDFCheckBox")) {
            fieldType = "checkbox";
          } else if (field.constructor.name.includes("PDFRadioGroup")) {
            fieldType = "radio";
          } else if (field.constructor.name.includes("PDFDropdown")) {
            fieldType = "select";
          } else if (field.constructor.name.includes("PDFTextField")) {
            fieldType = "text";
          }
        } catch (e) {
          // Default to text if we can't determine the type
          fieldType = "text";
        }

        // Get current value and maxLength
        let currentValue = "";
        let maxLength: number | undefined;
        try {
          if (fieldType === "checkbox") {
            currentValue = (field as any).isChecked?.() ? "true" : "false";
          } else if (fieldType === "text") {
            currentValue = (field as any).getText?.() || "";
            // Try to get maxLength from the text field
            maxLength = (field as any).getMaxLength?.();
            if (maxLength === undefined || maxLength <= 0) {
              maxLength = undefined;
            }
          }
        } catch (e) {
          // Ignore errors getting values
        }

        extractedFields.push({
          id: `field-${i}-${widgetIndex}`,
          name: fieldName,
          type: fieldType,
          value: currentValue,
          x: x * scaleFactor,
          y: (pageHeight - y - height) * scaleFactor, // Convert from PDF coordinates (bottom-left origin) to screen coordinates (top-left origin)
          width: width * scaleFactor,
          height: height * scaleFactor,
          page: pageIndex + 1, // Convert to 1-indexed
          maxLength,
        });
      }
    }

    return extractedFields;
  } catch (error) {
    console.error("Error extracting form fields:", error);
    return [];
  }
}
