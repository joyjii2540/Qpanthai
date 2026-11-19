import { SchedulePageData, SheetSettings, TimeSlot } from '../types/schedule';

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-09', start: '9.00', end: '10.00' },
  { id: 'slot-10', start: '10.00', end: '11.00' },
  { id: 'slot-11', start: '11.00', end: '12.00' },
  { id: 'slot-12', start: '12.00', end: '13.00', isLunch: true, lunchLabel: 'พักกลางวัน' },
  { id: 'slot-13', start: '13.00', end: '14.00' },
  { id: 'slot-14', start: '14.00', end: '15.00' },
  { id: 'slot-15', start: '15.00', end: '16.00' },
];

export const DEFAULT_PAGES: SchedulePageData[] = [
  {
    id: 'page1',
    title: 'แผ่นที่ 1 — ผู้ให้บริการ 5 ท่าน',
    columns: [
      { id: 'p1-c1', label: 'พัชรา', kind: 'practitioner' },
      { id: 'p1-c2', label: 'สมศรี', kind: 'practitioner' },
      { id: 'p1-c3', label: 'กัลยาณี', kind: 'practitioner' },
      { id: 'p1-c4', label: 'นิติกาญจน์', kind: 'practitioner' },
      { id: 'p1-c5', label: 'กัลยรัตน์', kind: 'practitioner' },
    ],
  },
  {
    id: 'page2',
    title: 'แผ่นที่ 2 — ผู้ให้บริการ 4 ท่าน ช่องว่าง และตู้อบ',
    columns: [
      { id: 'p2-c1', label: 'ภัทรจิต', kind: 'practitioner' },
      { id: 'p2-c2', label: 'สุภาพร', kind: 'practitioner' },
      { id: 'p2-c3', label: 'ชลธิชา', kind: 'practitioner' },
      { id: 'p2-c4', label: 'จันทิรา', kind: 'practitioner' },
      { id: 'p2-blank1', label: '', kind: 'blank' },
      { id: 'p2-c5', label: 'ตู้อบ 1', kind: 'cabinet' },
      { id: 'p2-c6', label: 'ตู้อบ 2', kind: 'cabinet' },
    ],
  },
];

export const DEFAULT_SETTINGS: SheetSettings = {
  documentTitle: 'ตารางนัดผู้รับบริการคลินิกแพทย์แผนไทย (ในเวลาราชการ)',
  hospitalName: 'โรงพยาบาลพระนครศรีอยุธยา',
  dateMode: 'blank',
  customDateIso: new Date().toISOString().slice(0, 10),
  marginPreset: 'standard',
  borderWeight: 'medium',
  lineStyle: 'dotted',
  fontScale: 'md',
  surfaceTint: 'tinted',
  timeColumnWidthPct: 9,
  cabinetColumnWidthPct: 8.5,
  showCabinetLines: false,
  lunchHeightRatio: 48,
};

const THAI_DAYS = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
];

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export function formatThaiDateParts(isoDate: string): {
  dayName: string;
  dayNum: string;
  monthName: string;
  yearBe: string;
} {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return { dayName: '', dayNum: '', monthName: '', yearBe: '' };
  }
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  return {
    dayName: THAI_DAYS[dateObj.getDay()] ?? '',
    dayNum: String(d),
    monthName: THAI_MONTHS[m - 1] ?? '',
    yearBe: String(y + 543),
  };
}
