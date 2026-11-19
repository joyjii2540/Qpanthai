import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { SheetSettings } from '../types/schedule';

async function captureSheetPng(el: HTMLElement): Promise<string> {
  const baseOptions = {
    width: 1122,
    height: 793,
    pixelRatio: 2.5,
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: {
      transform: 'none',
      margin: '0',
    },
  };

  try {
    return await toPng(el, baseOptions);
  } catch {
    return await toPng(el, { ...baseOptions, skipFonts: true });
  }
}

export async function downloadSchedulePdf(settings: SheetSettings): Promise<number> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Blur any active input so focus highlight does not appear in exported PDF
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const sheetElements = Array.from(
    document.querySelectorAll<HTMLElement>('.a4-sheet')
  );

  if (sheetElements.length === 0) {
    throw new Error('ไม่พบหน้ากระดาษสำหรับสร้างไฟล์ PDF');
  }

  // Explicit 297mm x 210mm A4 Landscape dimensions
  const pdf = new jsPDF({
    orientation: 'l',
    unit: 'mm',
    format: [297, 210],
    compress: true,
  });

  for (let i = 0; i < sheetElements.length; i++) {
    const el = sheetElements[i];
    const dataUrl = await captureSheetPng(el);

    if (i > 0) {
      pdf.addPage([297, 210], 'l');
    }

    pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
  }

  const dateSuffix =
    settings.dateMode === 'custom' && settings.customDateIso
      ? settings.customDateIso
      : new Date().toISOString().slice(0, 10);

  pdf.save(`ตารางนัดแพทย์แผนไทย_A4แนวนอน_${dateSuffix}.pdf`);
  return sheetElements.length;
}
