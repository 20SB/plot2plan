import Drawing from "dxf-writer";

export const generateDXF = (project) => {
  const d = new Drawing();

  // Add layers
  d.addLayer("PLOT_BOUNDARY", Drawing.ACI.WHITE, "CONTINUOUS");
  d.addLayer("ROOMS", Drawing.ACI.YELLOW, "CONTINUOUS");
  d.addLayer("ROOM_LABELS", Drawing.ACI.CYAN, "CONTINUOUS");
  d.addLayer("DIMENSIONS", Drawing.ACI.GREEN, "CONTINUOUS");
  d.addLayer("PLUMBING", Drawing.ACI.BLUE, "CONTINUOUS");
  d.addLayer("ELECTRICAL", Drawing.ACI.RED, "CONTINUOUS");

  const plotL = project.plot_length;
  const plotW = project.plot_width;

  // Draw plot boundary
  d.setActiveLayer("PLOT_BOUNDARY");
  d.drawLine(0, 0, plotL, 0);
  d.drawLine(plotL, 0, plotL, plotW);
  d.drawLine(plotL, plotW, 0, plotW);
  d.drawLine(0, plotW, 0, 0);

  // Dimension text
  d.setActiveLayer("DIMENSIONS");
  d.drawText(plotL / 2, -3, 1.5, 0, `${plotL}'`);
  d.drawText(-3, plotW / 2, 1.5, 90, `${plotW}'`);

  // Draw rooms
  d.setActiveLayer("ROOMS");
  (project.rooms || []).forEach((room) => {
    const x = room.x;
    const y = room.y;
    const w = room.width;
    const h = room.height;

    // Room rectangle (DXF Y is inverted from screen)
    d.drawLine(x, plotW - y, x + w, plotW - y);
    d.drawLine(x + w, plotW - y, x + w, plotW - (y + h));
    d.drawLine(x + w, plotW - (y + h), x, plotW - (y + h));
    d.drawLine(x, plotW - (y + h), x, plotW - y);

    // Room label
    d.setActiveLayer("ROOM_LABELS");
    d.drawText(x + 1, plotW - y - 2, 1.0, 0, room.name);
    d.drawText(x + 1, plotW - y - 4, 0.8, 0, `${w.toFixed(0)}' x ${h.toFixed(0)}'`);
    d.setActiveLayer("ROOMS");
  });

  // Draw plumbing elements
  d.setActiveLayer("PLUMBING");
  (project.plumbing || []).forEach((elem) => {
    if (elem.element_type === "pipe" && elem.x2 != null && elem.y2 != null) {
      d.drawLine(elem.x, plotW - elem.y, elem.x2, plotW - elem.y2);
    } else {
      // Draw a small circle for point elements
      d.drawCircle(elem.x, plotW - elem.y, 0.8);
      d.drawText(elem.x + 1, plotW - elem.y, 0.6, 0, elem.label || elem.element_type);
    }
  });

  // Draw electrical elements
  d.setActiveLayer("ELECTRICAL");
  (project.electrical || []).forEach((elem) => {
    // Draw a small square for electrical points
    const sz = 0.6;
    d.drawLine(elem.x - sz, plotW - (elem.y - sz), elem.x + sz, plotW - (elem.y - sz));
    d.drawLine(elem.x + sz, plotW - (elem.y - sz), elem.x + sz, plotW - (elem.y + sz));
    d.drawLine(elem.x + sz, plotW - (elem.y + sz), elem.x - sz, plotW - (elem.y + sz));
    d.drawLine(elem.x - sz, plotW - (elem.y + sz), elem.x - sz, plotW - (elem.y - sz));
    d.drawText(elem.x + 1, plotW - elem.y, 0.5, 0, elem.label || elem.element_type);
  });

  // Generate DXF string
  const dxfString = d.toDxfString();

  // Download
  const blob = new Blob([dxfString], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, "_")}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generatePrintA3 = (project) => {
  // Open a new window with print-ready A3 layout
  const win = window.open("", "_blank", "width=1200,height=800");
  if (!win) return;

  const plotL = project.plot_length;
  const plotW = project.plot_width;
  const scale = Math.min(900 / plotL, 600 / plotW);

  const roomColors = {
    kitchen: "#FEF3C7", master_bedroom: "#DBEAFE", bedroom: "#E0E7FF",
    bathroom: "#D1FAE5", living_room: "#FEE2E2", pooja_room: "#FCE7F3",
    parking: "#E5E7EB", default: "#F5F5F4",
  };

  const getVastuColor = (score) => score >= 85 ? "#059669" : score >= 70 ? "#F59E0B" : "#DC2626";

  let roomSvg = "";
  (project.rooms || []).forEach((room) => {
    const fill = roomColors[room.room_type] || roomColors.default;
    const stroke = getVastuColor(room.vastu_score);
    roomSvg += `
      <rect x="${room.x * scale}" y="${room.y * scale}" width="${room.width * scale}" height="${room.height * scale}"
        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${(room.x + 1) * scale}" y="${(room.y + 3) * scale}" font-size="12" font-weight="bold" fill="#0A0A0A">${room.name}</text>
      <text x="${(room.x + 1) * scale}" y="${(room.y + 5) * scale}" font-size="9" fill="#52525B" font-family="monospace">${room.width.toFixed(0)}' x ${room.height.toFixed(0)}'</text>
    `;
  });

  const totalArea = (project.rooms || []).reduce((s, r) => s + r.width * r.height, 0);

  const html = `<!DOCTYPE html>
<html><head>
<title>${project.name} - A3 Print</title>
<style>
  @page { size: A3 landscape; margin: 15mm; }
  body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 20px; background: white; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0A0A0A; padding-bottom: 10px; margin-bottom: 20px; }
  .title { font-size: 24px; font-weight: bold; }
  .meta { font-size: 11px; color: #52525B; font-family: monospace; }
  .score { font-size: 36px; font-weight: bold; font-family: monospace; }
  .plan-container { border: 2px solid #0A0A0A; display: inline-block; background: #F5F5F4; }
  .footer { margin-top: 20px; border-top: 1px solid #E4E4E7; padding-top: 10px; font-size: 9px; color: #A1A1AA; }
  @media print { body { padding: 0; } }
</style>
</head><body>
<div class="header">
  <div>
    <div class="title">VASTU BLUEPRINT</div>
    <div class="meta">${project.name} | ${plotL}' x ${plotW}' | ${project.facing_direction.toUpperCase()} Facing</div>
  </div>
  <div style="text-align: right;">
    <div class="score" style="color: ${getVastuColor(project.vastu_overall_score)}">${project.vastu_overall_score.toFixed(0)}/100</div>
    <div class="meta">VASTU SCORE</div>
  </div>
</div>
<div class="plan-container">
  <svg width="${plotL * scale}" height="${plotW * scale}" style="display: block;">
    <rect width="${plotL * scale}" height="${plotW * scale}" fill="#F5F5F4" stroke="#0A0A0A" stroke-width="2"/>
    ${roomSvg}
  </svg>
</div>
<div style="margin-top: 15px; display: flex; gap: 30px; font-size: 11px;">
  <div><strong>Total Area:</strong> ${totalArea.toFixed(0)} sq.ft</div>
  <div><strong>Style:</strong> ${project.style}</div>
  <div><strong>Floors:</strong> ${project.num_floors}</div>
  <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
</div>
<div class="footer">Generated by Vastu Blueprint - AI-Powered Vastu-Compliant House Plans | For professional use only</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;

  win.document.write(html);
  win.document.close();
};
