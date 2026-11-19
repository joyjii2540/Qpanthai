export type ColumnKind = 'practitioner' | 'blank' | 'cabinet';

export interface ScheduleColumn {
  id: string;
  label: string;
  kind: ColumnKind;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  isLunch?: boolean;
  lunchLabel?: string;
}

export interface AppointmentEntry {
  name: string;
  hn: string;
  phone: string;
  symptom: string;
}

export interface SchedulePageData {
  id: 'page1' | 'page2';
  title: string;
  columns: ScheduleColumn[];
}

export type MarginPreset = 'compact' | 'standard' | 'wide';
export type BorderWeightPreset = 'thin' | 'medium' | 'bold';
export type LineStylePreset = 'dotted' | 'solid' | 'none';
export type FontScalePreset = 'sm' | 'md' | 'lg';
export type SurfaceTintPreset = 'plain' | 'tinted';

export interface SheetSettings {
  documentTitle: string;
  hospitalName: string;
  dateMode: 'blank' | 'custom';
  customDateIso: string; // YYYY-MM-DD
  marginPreset: MarginPreset;
  borderWeight: BorderWeightPreset;
  lineStyle: LineStylePreset;
  fontScale: FontScalePreset;
  surfaceTint: SurfaceTintPreset;
  timeColumnWidthPct: number; // e.g. 8 to 12
  cabinetColumnWidthPct: number; // e.g. 6 to 13
  showCabinetLines: boolean;
  lunchHeightRatio: number; // percentage of normal row height, e.g. 42 to 65
}

export type ViewMode = 'both' | 'page1' | 'page2';
