import { formatThaiDateParts } from '../data/defaultSchedule';
import {
  AppointmentEntry,
  SchedulePageData,
  SheetSettings,
  TimeSlot,
} from '../types/schedule';

interface ExportScheduleCsvParams {
  pages: SchedulePageData[];
  timeSlots: TimeSlot[];
  settings: SheetSettings;
  entries: Record<string, AppointmentEntry>;
  cabinetNotes: Record<string, string>;
}

function escapeCsvCell(value: string): string {
  const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const safeValue = /^[=+@]/.test(normalized) ? `'${normalized}` : normalized;
  if (/[",\n]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}

function formatDateLabel(settings: SheetSettings): string {
  if (settings.dateMode !== 'custom') {
    return '';
  }
  const parts = formatThaiDateParts(settings.customDateIso);
  if (!parts.dayNum) return settings.customDateIso;
  return `วัน${parts.dayName} ที่ ${parts.dayNum} ${parts.monthName} พ.ศ. ${parts.yearBe}`;
}

export function buildScheduleCsvContent({
  pages,
  timeSlots,
  settings,
  entries,
  cabinetNotes,
}: ExportScheduleCsvParams): { csv: string; rowCount: number; filledCount: number } {
  const headers = [
    'วันที่',
    'แผ่นที่',
    'ช่วงเวลา',
    'ผู้ให้บริการ / ช่อง',
    'ประเภทช่อง',
    'ชื่อผู้รับบริการ',
    'HN',
    'เบอร์โทร',
    'อาการ / บันทึก',
  ];

  const dateLabel = formatDateLabel(settings);
  const allRows: string[][] = [];
  const filledRows: string[][] = [];

  for (const page of pages) {
    const pageLabel = page.id === 'page1' ? 'แผ่นที่ 1' : 'แผ่นที่ 2';

    for (const slot of timeSlots) {
      if (slot.isLunch) continue;
      const timeRange = `${slot.start} - ${slot.end} น.`;

      for (const col of page.columns) {
        const cellKey = `${page.id}__${slot.id}__${col.id}`;
        const colName = col.label.trim() || 'ช่องว่าง';
        const colType =
          col.kind === 'cabinet'
            ? 'ตู้อบ'
            : col.kind === 'blank'
            ? 'ช่องว่าง'
            : 'ผู้ให้บริการ';

        if (col.kind === 'practitioner') {
          const entry = entries[cellKey] ?? {
            name: '',
            hn: '',
            phone: '',
            symptom: '',
          };
          const row = [
            dateLabel,
            pageLabel,
            timeRange,
            colName,
            colType,
            entry.name.trim(),
            entry.hn.trim(),
            entry.phone.trim(),
            entry.symptom.trim(),
          ];
          allRows.push(row);
          if (
            entry.name.trim() ||
            entry.hn.trim() ||
            entry.phone.trim() ||
            entry.symptom.trim()
          ) {
            filledRows.push(row);
          }
        } else {
          const note = (cabinetNotes[cellKey] ?? '').trim();
          const row = [
            dateLabel,
            pageLabel,
            timeRange,
            colName,
            colType,
            '',
            '',
            '',
            note,
          ];
          allRows.push(row);
          if (note) {
            filledRows.push(row);
          }
        }
      }
    }
  }

  // Export populated patient entries when available; fall back to full slot structure if schedule is blank
  const targetRows = filledRows.length > 0 ? filledRows : allRows;
  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...targetRows.map((row) => row.map(escapeCsvCell).join(',')),
  ];

  // Include UTF-8 BOM so Thai characters open cleanly in Microsoft Excel
  const csv = `\uFEFF${csvLines.join('\r\n')}`;
  return {
    csv,
    rowCount: targetRows.length,
    filledCount: filledRows.length,
  };
}

export function downloadScheduleCsv(params: ExportScheduleCsvParams): {
  rowCount: number;
  filledCount: number;
} {
  const { csv, rowCount, filledCount } = buildScheduleCsvContent(params);
  const dateSuffix =
    params.settings.dateMode === 'custom' && params.settings.customDateIso
      ? params.settings.customDateIso
      : new Date().toISOString().slice(0, 10);

  const filename = `ตารางนัดแพทย์แผนไทย_${dateSuffix}.csv`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { rowCount, filledCount };
}
