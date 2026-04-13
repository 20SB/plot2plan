import jsPDF from "jspdf";

const ROOM_COLORS = {
  kitchen: "#FEF3C7",
  master_bedroom: "#DBEAFE",
  bedroom: "#E0E7FF",
  bathroom: "#D1FAE5",
  living_room: "#FEE2E2",
  pooja_room: "#FCE7F3",
  parking: "#E5E7EB",
  staircase: "#F3E8FF",
  dining_room: "#FED7AA",
  default: "#F5F5F4",
};

const getVastuColor = (score) => {
  if (score >= 85) return [5, 150, 105];
  if (score >= 70) return [245, 158, 11];
  return [220, 38, 38];
};

export const generatePDF = async (project) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Page 1: Floor Plan Blueprint ---
  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("VASTU BLUEPRINT", 10, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(project.name, pageWidth - 10, 12, { align: "right" });

  // Project Info Bar
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  const infoY = 26;
  doc.text(`Plot: ${project.plot_length}' x ${project.plot_width}'`, 10, infoY);
  doc.text(`Facing: ${project.facing_direction.toUpperCase()}`, 80, infoY);
  doc.text(`Style: ${project.style.toUpperCase()}`, 140, infoY);
  doc.text(`Floors: ${project.num_floors}`, 200, infoY);

  // Vastu Score badge
  const [sr, sg, sb] = getVastuColor(project.vastu_overall_score);
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(pageWidth - 55, 22, 45, 12, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`VASTU: ${project.vastu_overall_score.toFixed(0)}/100`, pageWidth - 52, 30);

  // Floor Plan Drawing Area
  const canvasX = 15;
  const canvasY = 40;
  const maxCanvasW = pageWidth - 100;
  const maxCanvasH = pageHeight - 55;

  const scaleX = maxCanvasW / project.plot_length;
  const scaleY = maxCanvasH / project.plot_width;
  const scale = Math.min(scaleX, scaleY);

  const drawW = project.plot_length * scale;
  const drawH = project.plot_width * scale;

  // Plot boundary
  doc.setDrawColor(10, 10, 10);
  doc.setLineWidth(0.8);
  doc.rect(canvasX, canvasY, drawW, drawH);

  // Grid lines
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.1);
  const gridStep = 5;
  for (let x = gridStep; x < project.plot_length; x += gridStep) {
    doc.line(canvasX + x * scale, canvasY, canvasX + x * scale, canvasY + drawH);
  }
  for (let y = gridStep; y < project.plot_width; y += gridStep) {
    doc.line(canvasX, canvasY + y * scale, canvasX + drawW, canvasY + y * scale);
  }

  // Plot dimensions
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.text(`${project.plot_length}'`, canvasX + drawW / 2, canvasY - 2, { align: "center" });
  doc.text(`${project.plot_width}'`, canvasX - 3, canvasY + drawH / 2, { angle: 90 });

  // North arrow
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("N", canvasX + drawW / 2, canvasY - 6, { align: "center" });
  doc.setFontSize(14);
  doc.text("\u2191", canvasX + drawW / 2, canvasY - 8, { align: "center" });

  // Draw rooms
  (project.rooms || []).forEach((room) => {
    const rx = canvasX + room.x * scale;
    const ry = canvasY + room.y * scale;
    const rw = room.width * scale;
    const rh = room.height * scale;

    // Room fill
    const colorKey = room.room_type.toLowerCase().replace(" ", "_");
    const hex = ROOM_COLORS[colorKey] || ROOM_COLORS.default;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    doc.setFillColor(r, g, b);
    doc.rect(rx, ry, rw, rh, "F");

    // Room border with vastu color
    const [vr, vg, vb] = getVastuColor(room.vastu_score);
    doc.setDrawColor(vr, vg, vb);
    doc.setLineWidth(0.5);
    doc.rect(rx, ry, rw, rh, "S");

    // Room name
    doc.setTextColor(10, 10, 10);
    doc.setFontSize(rw > 15 ? 7 : 5);
    doc.setFont("helvetica", "bold");
    const nameText = room.name;
    doc.text(nameText, rx + 2, ry + 5, { maxWidth: rw - 4 });

    // Dimensions
    doc.setFont("helvetica", "normal");
    doc.setFontSize(rw > 15 ? 6 : 4.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`${room.width.toFixed(0)}' x ${room.height.toFixed(0)}'`, rx + 2, ry + 9);

    // Vastu score
    doc.setTextColor(vr, vg, vb);
    doc.setFontSize(5);
    doc.setFont("helvetica", "bold");
    doc.text(`${room.vastu_score.toFixed(0)}`, rx + rw - 2, ry + rh - 2, { align: "right" });
  });

  // Room legend (right sidebar)
  const legendX = canvasX + drawW + 10;
  let legendY = canvasY;
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ROOM LEGEND", legendX, legendY);
  legendY += 6;

  (project.rooms || []).forEach((room) => {
    if (legendY > pageHeight - 20) return;
    const [vr, vg, vb] = getVastuColor(room.vastu_score);
    doc.setFillColor(vr, vg, vb);
    doc.rect(legendX, legendY - 2.5, 3, 3, "F");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(`${room.name} (${room.vastu_score.toFixed(0)}/100)`, legendX + 5, legendY);
    legendY += 5;
  });

  // --- Page 2: Vastu Report & Cost Estimate ---
  doc.addPage("a3", "landscape");

  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("VASTU ANALYSIS & COST ESTIMATE", 10, 12);

  // Vastu Score Section
  let yPos = 30;
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("VASTU COMPLIANCE REPORT", 15, yPos);
  yPos += 10;

  // Overall score
  const [osr, osg, osb] = getVastuColor(project.vastu_overall_score);
  doc.setFillColor(osr, osg, osb);
  doc.roundedRect(15, yPos - 5, 60, 18, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(`${project.vastu_overall_score.toFixed(0)} / 100`, 20, yPos + 7);
  yPos += 22;

  // Room-wise scores table
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Room", 15, yPos);
  doc.text("Direction", 80, yPos);
  doc.text("Score", 130, yPos);
  doc.text("Status", 155, yPos);
  yPos += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, 190, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  (project.rooms || []).forEach((room) => {
    if (yPos > pageHeight - 20) return;
    doc.setTextColor(30, 30, 30);
    doc.text(room.name, 15, yPos);
    doc.text(room.direction || "-", 80, yPos);
    const [rr, rg, rb] = getVastuColor(room.vastu_score);
    doc.setTextColor(rr, rg, rb);
    doc.text(`${room.vastu_score.toFixed(0)}/100`, 130, yPos);
    const status = room.vastu_score >= 85 ? "Excellent" : room.vastu_score >= 70 ? "Good" : "Needs Fix";
    doc.text(status, 155, yPos);
    yPos += 6;
  });

  // Warnings section
  yPos += 5;
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("VASTU RECOMMENDATIONS", 15, yPos);
  yPos += 7;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  (project.rooms || []).forEach((room) => {
    (room.vastu_warnings || []).forEach((warning) => {
      if (yPos > pageHeight - 15) return;
      doc.setTextColor(220, 38, 38);
      doc.text("\u2022", 15, yPos);
      doc.setTextColor(60, 60, 60);
      doc.text(warning, 20, yPos, { maxWidth: 170 });
      yPos += 5;
    });
  });

  // Cost Estimate Section (right side of page 2)
  const costX = pageWidth / 2 + 20;
  let costY = 30;

  doc.setTextColor(10, 10, 10);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("COST ESTIMATION", costX, costY);
  costY += 10;

  const totalArea = (project.rooms || []).reduce((s, r) => s + r.width * r.height, 0);
  const rateMap = { modern: 1800, duplex: 2000, villa: 2500, apartment: 1500 };
  const rate = rateMap[project.style?.toLowerCase()] || 1800;
  const totalCost = totalArea * rate;

  // Summary boxes
  const boxes = [
    { label: "Total Area", value: `${totalArea.toFixed(0)} sq.ft` },
    { label: "Rate", value: `INR ${rate}/sq.ft` },
    { label: "Total Cost", value: `INR ${(totalCost / 100000).toFixed(2)} Lakhs` },
  ];

  boxes.forEach((box, idx) => {
    const bx = costX + idx * 55;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(bx, costY, 50, 16);
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(6);
    doc.text(box.label, bx + 3, costY + 5);
    doc.setTextColor(10, 10, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(box.value, bx + 3, costY + 12);
    doc.setFont("helvetica", "normal");
  });
  costY += 25;

  // BOQ Table
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BILL OF QUANTITIES", costX, costY);
  costY += 8;

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Item", costX, costY);
  doc.text("Quantity", costX + 60, costY);
  doc.text("Amount (INR)", costX + 120, costY, { align: "right" });
  costY += 2;
  doc.line(costX, costY, costX + 130, costY);
  costY += 5;

  const boqItems = [
    { item: "Civil Work", qty: `${totalArea.toFixed(0)} sq.ft`, pct: 0.4 },
    { item: "Electrical Work", qty: "1 lot", pct: 0.15 },
    { item: "Plumbing Work", qty: "1 lot", pct: 0.12 },
    { item: "Finishing Work", qty: `${totalArea.toFixed(0)} sq.ft`, pct: 0.25 },
    { item: "Miscellaneous", qty: "1 lot", pct: 0.08 },
  ];

  doc.setFont("helvetica", "normal");
  boqItems.forEach((item) => {
    doc.setTextColor(30, 30, 30);
    doc.text(item.item, costX, costY);
    doc.text(item.qty, costX + 60, costY);
    const amount = (totalCost * item.pct / 100000).toFixed(2);
    doc.text(`${amount}L`, costX + 120, costY, { align: "right" });
    costY += 6;
  });

  // Total row
  costY += 2;
  doc.setDrawColor(10, 10, 10);
  doc.setLineWidth(0.5);
  doc.line(costX, costY - 3, costX + 130, costY - 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TOTAL", costX, costY);
  doc.text(`${(totalCost / 100000).toFixed(2)}L`, costX + 120, costY, { align: "right" });

  // Footer on both pages
  for (let i = 1; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(6);
    doc.text("Generated by Vastu Blueprint - AI-Powered Vastu-Compliant House Plans", 10, pageHeight - 5);
    doc.text(`Page ${i}`, pageWidth - 10, pageHeight - 5, { align: "right" });
    doc.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 5, { align: "center" });
  }

  // Save
  const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, "_")}_Blueprint.pdf`;
  doc.save(filename);
};
