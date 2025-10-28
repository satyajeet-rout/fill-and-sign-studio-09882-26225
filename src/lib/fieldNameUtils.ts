/**
 * Converts raw PDF field names into human-readable format
 * Example: "form1[0].#subform[0].Pt1Line1b_GivenName[0]" -> "Given Name"
 */
export function cleanFieldName(rawName: string): string {
  // Skip barcode fields
  if (rawName.toLowerCase().includes('barcode')) {
    return rawName;
  }

  // Extract the last meaningful part of the field name
  let cleanName = rawName;
  
  // Remove array notation like [0], [1], etc.
  cleanName = cleanName.replace(/\[\d+\]/g, '');
  
  // Get the last part after the last dot or slash
  const parts = cleanName.split(/[./]/);
  cleanName = parts[parts.length - 1];
  
  // Remove common prefixes
  cleanName = cleanName.replace(/^(Pt\d+Line\d+[a-z]?_|#subform_|form\d+_)/i, '');
  
  // Split camelCase and PascalCase into separate words
  cleanName = cleanName.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Split by underscores and capitalize
  cleanName = cleanName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Handle special cases
  cleanName = cleanName
    .replace(/\bUscis\b/gi, 'USCIS')
    .replace(/\bSsn\b/gi, 'SSN')
    .replace(/\bEin\b/gi, 'EIN')
    .replace(/\bId\b/gi, 'ID')
    .replace(/\bDob\b/gi, 'Date of Birth')
    .replace(/\bAddr\b/gi, 'Address')
    .replace(/\bApt\b/gi, 'Apartment')
    .replace(/\bZip\b/gi, 'ZIP Code')
    .replace(/\bPo\b/gi, 'PO')
    .trim();
  
  return cleanName || rawName;
}
