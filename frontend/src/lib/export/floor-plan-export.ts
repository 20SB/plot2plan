import { FloorPlanResponse } from '@/types/floor-plan';

/**
 * Export floor plan to PDF using jsPDF and html2canvas
 */
export async function exportFloorPlanToPDF(
  floorPlan: FloorPlanResponse,
  projectName: string
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const jsPDF = (await import('jspdf')).default;
  const html2canvas = (await import('html2canvas')).default;

  // Find the SVG element
  const svgElement = document.querySelector('.floor-plan-canvas svg') as SVGElement;
  
  if (!svgElement) {
    throw new Error('Floor plan canvas not found');
  }

  // Convert SVG to canvas
  const canvas = await html2canvas(svgElement, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher quality
  });

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate dimensions to fit A4
  const imgWidth = 277; // A4 landscape width in mm (minus margins)
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add image to PDF
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

  // Add project details
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(10);
  pdf.text(`Project: ${projectName}`, 10, pageHeight - 20);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, pageHeight - 15);
  pdf.text(
    `Plot Size: ${floorPlan.plotDimensions.length} × ${floorPlan.plotDimensions.width} ${floorPlan.plotDimensions.unit}`,
    10,
    pageHeight - 10
  );
  pdf.text(`Total Area: ${floorPlan.totalArea.toFixed(0)} sq ${floorPlan.plotDimensions.unit}`, 100, pageHeight - 10);
  
  if (floorPlan.vastuScore) {
    pdf.text(`Vastu Score: ${floorPlan.vastuScore}%`, 180, pageHeight - 10);
  }

  // Save PDF
  pdf.save(`${projectName}-floor-plan-${Date.now()}.pdf`);
}

/**
 * Export floor plan to PNG (high resolution)
 */
export async function exportFloorPlanToPNG(
  projectName: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;

  const svgElement = document.querySelector('.floor-plan-canvas svg') as SVGElement;
  
  if (!svgElement) {
    throw new Error('Floor plan canvas not found');
  }

  const canvas = await html2canvas(svgElement, {
    backgroundColor: '#ffffff',
    scale: 3, // High resolution
  });

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}-floor-plan-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Export floor plan to SVG (vector format)
 */
export function exportFloorPlanToSVG(projectName: string): void {
  const svgElement = document.querySelector('.floor-plan-canvas svg') as SVGElement;
  
  if (!svgElement) {
    throw new Error('Floor plan canvas not found');
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}-floor-plan-${Date.now()}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}
