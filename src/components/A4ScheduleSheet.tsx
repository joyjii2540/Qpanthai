import React from 'react';
import {
  AppointmentEntry,
  SchedulePageData,
  SheetSettings,
  TimeSlot,
} from '../types/schedule';
import { formatThaiDateParts } from '../data/defaultSchedule';

interface A4ScheduleSheetProps {
  page: SchedulePageData;
  timeSlots: TimeSlot[];
  settings: SheetSettings;
  entries: Record<string, AppointmentEntry>;
  onUpdateEntry: (
    cellKey: string,
    field: keyof AppointmentEntry,
    value: string
  ) => void;
  onUpdateColumnLabel: (pageId: 'page1' | 'page2', colId: string, label: string) => void;
  cabinetNotes: Record<string, string>;
  onUpdateCabinetNote: (cellKey: string, value: string) => void;
}

export const A4_WIDTH_PX = 1122;
export const A4_HEIGHT_PX = 793;

export const A4ScheduleSheet: React.FC<A4ScheduleSheetProps> = ({
  page,
  timeSlots,
  settings,
  entries,
  onUpdateEntry,
  onUpdateColumnLabel,
  cabinetNotes,
  onUpdateCabinetNote,
}) => {
  // Balanced A4 margins (at 96dpi: 1mm ≈ 3.78px)
  const marginMap = {
    compact: { x: 30, y: 26 },   // ~8mm x 7mm
    standard: { x: 44, y: 36 },  // ~11.6mm x 9.5mm
    wide: { x: 60, y: 50 },      // ~15.8mm x 13.2mm
  };
  const margin = marginMap[settings.marginPreset];

  // Proportional row height percentages inside tbody
  const regularSlotCount = timeSlots.filter((s) => !s.isLunch).length;
  const lunchSlotCount = timeSlots.filter((s) => s.isLunch).length;
  const lunchRatio = settings.lunchHeightRatio / 100;
  const totalRowUnits = regularSlotCount + lunchSlotCount * lunchRatio;
  const regularRowPct = (1 / totalRowUnits) * 100;
  const lunchRowPct = (lunchRatio / totalRowUnits) * 100;

  // Column width percentages
  const cabinetCols = page.columns.filter((c) => c.kind === 'cabinet');
  const mainCols = page.columns.filter((c) => c.kind !== 'cabinet');
  const totalCabinetPct = cabinetCols.length * settings.cabinetColumnWidthPct;
  const remainingPct = Math.max(
    20,
    100 - settings.timeColumnWidthPct - totalCabinetPct
  );
  const mainColPct =
    mainCols.length > 0 ? remainingPct / mainCols.length : 0;

  // Border thicknesses
  const borderStyles = {
    thin: { outer: '1.25px solid #1e293b', inner: '0.75px solid #475569' },
    medium: { outer: '1.5px solid #0f172a', inner: '1px solid #334155' },
    bold: { outer: '2px solid #0f172a', inner: '1.35px solid #1e293b' },
  }[settings.borderWeight];

  // Font scales tuned so 4 rows always fit comfortably inside any A4 margin preset
  const fontScaleStyles = {
    sm: {
      title: '15.5px',
      date: '13px',
      th: '13.5px',
      time: '12px',
      lunch: '14.5px',
      label: '11.5px',
      input: '11.5px',
    },
    md: {
      title: '17px',
      date: '14px',
      th: '14.5px',
      time: '13px',
      lunch: '15.5px',
      label: '12px',
      input: '12px',
    },
    lg: {
      title: '18px',
      date: '14.5px',
      th: '15px',
      time: '13.5px',
      lunch: '16.5px',
      label: '12.5px',
      input: '12.5px',
    },
  }[settings.fontScale];

  const writingLineClass =
    settings.lineStyle === 'dotted'
      ? 'writing-line-dotted'
      : settings.lineStyle === 'solid'
      ? 'writing-line-solid'
      : '';

  const headerBg = settings.surfaceTint === 'tinted' ? '#f1f5f9' : '#ffffff';
  const lunchBg = settings.surfaceTint === 'tinted' ? '#f8fafc' : '#ffffff';

  const dateParts = formatThaiDateParts(settings.customDateIso);

  const fields: Array<{ key: keyof AppointmentEntry; label: string; labelWidth: string }> = [
    { key: 'name', label: 'ชื่อ', labelWidth: 'w-[26px]' },
    { key: 'hn', label: 'HN', labelWidth: 'w-[26px]' },
    { key: 'phone', label: 'โทร', labelWidth: 'w-[26px]' },
    { key: 'symptom', label: 'อาการ', labelWidth: 'w-[36px]' },
  ];

  return (
    <div
      data-sheet-id={page.id}
      className="a4-sheet bg-white text-slate-950 font-doc relative flex flex-col overflow-hidden"
      style={{
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        padding: `${margin.y}px ${margin.x}px`,
        boxSizing: 'border-box',
      }}
    >
      {/* Document Header */}
      <header className="shrink-0 flex flex-col items-center justify-center text-center pb-2.5">
        <h1
          className="font-bold tracking-tight text-slate-950 leading-snug"
          style={{ fontSize: fontScaleStyles.title }}
        >
          {settings.documentTitle}
          {settings.hospitalName ? `\u00A0\u00A0${settings.hospitalName}` : ''}
        </h1>

        <div
          className="flex items-baseline justify-center gap-1.5 mt-0.5 text-slate-900"
          style={{ fontSize: fontScaleStyles.date }}
        >
          <span>วัน</span>
          <span
            className={`inline-block text-center font-medium min-w-[92px] px-1 ${
              settings.dateMode === 'blank' ? 'writing-line-dotted' : 'border-b border-dotted border-slate-500'
            }`}
          >
            {settings.dateMode === 'custom' ? dateParts.dayName : '\u00A0'}
          </span>

          <span>ที่</span>
          <span
            className={`inline-block text-center font-medium min-w-[54px] px-1 tabular-nums ${
              settings.dateMode === 'blank' ? 'writing-line-dotted' : 'border-b border-dotted border-slate-500'
            }`}
          >
            {settings.dateMode === 'custom' ? dateParts.dayNum : '\u00A0'}
          </span>

          <span>เดือน</span>
          <span
            className={`inline-block text-center font-medium min-w-[136px] px-1 ${
              settings.dateMode === 'blank' ? 'writing-line-dotted' : 'border-b border-dotted border-slate-500'
            }`}
          >
            {settings.dateMode === 'custom' ? dateParts.monthName : '\u00A0'}
          </span>

          <span>พ.ศ.</span>
          <span
            className={`inline-block text-center font-medium min-w-[78px] px-1 tabular-nums ${
              settings.dateMode === 'blank' ? 'writing-line-dotted' : 'border-b border-dotted border-slate-500'
            }`}
          >
            {settings.dateMode === 'custom' ? dateParts.yearBe : '\u00A0'}
          </span>
        </div>
      </header>

      {/* Main Grid Table stretches to fill 100% of remaining A4 sheet area */}
      <div className="flex-1 min-h-0 w-full">
        <table
          className="w-full h-full border-collapse table-fixed"
          style={{
            border: borderStyles.outer,
          }}
        >
          <colgroup>
            <col style={{ width: `${settings.timeColumnWidthPct}%` }} />
            {page.columns.map((col) => (
              <col
                key={col.id}
                style={{
                  width: `${
                    col.kind === 'cabinet'
                      ? settings.cabinetColumnWidthPct
                      : mainColPct
                  }%`,
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr
              style={{
                height: '34px',
                backgroundColor: headerBg,
              }}
            >
              <th
                className="font-bold text-slate-950 text-center align-middle px-1"
                style={{
                  fontSize: fontScaleStyles.th,
                  border: borderStyles.inner,
                  borderBottom: borderStyles.outer,
                }}
              >
                เวลา
              </th>
              {page.columns.map((col) => (
                <th
                  key={col.id}
                  className="font-bold text-slate-950 text-center align-middle px-1.5"
                  style={{
                    fontSize: fontScaleStyles.th,
                    border: borderStyles.inner,
                    borderBottom: borderStyles.outer,
                  }}
                >
                  <input
                    type="text"
                    value={col.label}
                    onChange={(e) =>
                      onUpdateColumnLabel(page.id, col.id, e.target.value)
                    }
                    aria-label={`ชื่อคอลัมน์ ${col.label || 'ช่องว่าง'}`}
                    className="w-full text-center font-bold bg-transparent outline-none focus:bg-teal-50/70 rounded px-1 py-0.5 transition-colors select-text cursor-text"
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {timeSlots.map((slot) => {
              if (slot.isLunch) {
                return (
                  <tr
                    key={slot.id}
                    style={{
                      height: `${lunchRowPct}%`,
                      backgroundColor: lunchBg,
                    }}
                  >
                    <td
                      className="text-center align-middle px-1 text-slate-900 font-medium tabular-nums"
                      style={{
                        fontSize: fontScaleStyles.time,
                        border: borderStyles.inner,
                        borderTop: borderStyles.outer,
                        borderBottom: borderStyles.outer,
                      }}
                    >
                      <div className="flex flex-col items-center justify-center leading-[1.2]">
                        <span>{slot.start} –</span>
                        <span>{slot.end} น.</span>
                      </div>
                    </td>
                    <td
                      colSpan={page.columns.length}
                      className="text-center align-middle font-bold text-slate-900 tracking-wide"
                      style={{
                        fontSize: fontScaleStyles.lunch,
                        border: borderStyles.inner,
                        borderTop: borderStyles.outer,
                        borderBottom: borderStyles.outer,
                      }}
                    >
                      {slot.lunchLabel ?? 'พักกลางวัน'}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.id} style={{ height: `${regularRowPct}%` }}>
                  {/* Time Column */}
                  <td
                    className="text-center align-middle px-1 text-slate-900 font-medium tabular-nums"
                    style={{
                      fontSize: fontScaleStyles.time,
                      border: borderStyles.inner,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center leading-[1.25]">
                      <span>{slot.start} –</span>
                      <span>{slot.end} น.</span>
                    </div>
                  </td>

                  {/* Practitioner / Blank / Cabinet Columns */}
                  {page.columns.map((col) => {
                    const cellKey = `${page.id}__${slot.id}__${col.id}`;

                    if (col.kind === 'cabinet' || col.kind === 'blank') {
                      const noteVal = cabinetNotes[cellKey] ?? '';
                      return (
                        <td
                          key={col.id}
                          className="align-top p-1.5 relative group"
                          style={{ border: borderStyles.inner }}
                        >
                          {col.kind === 'cabinet' && settings.showCabinetLines ? (
                            <div className="h-full flex flex-col justify-between py-0.5">
                              {[0, 1, 2].map((lineIdx) => (
                                <div
                                  key={lineIdx}
                                  className={`h-[18px] w-full ${writingLineClass}`}
                                />
                              ))}
                            </div>
                          ) : (
                            <textarea
                              value={noteVal}
                              onChange={(e) =>
                                onUpdateCabinetNote(cellKey, e.target.value)
                              }
                              aria-label={`${col.label || 'ช่องว่าง'} เวลา ${slot.start}-${slot.end}`}
                              className="w-full h-full resize-none bg-transparent outline-none text-center text-slate-900 leading-snug focus:bg-teal-50/40 rounded p-0.5 transition-colors select-text cursor-text"
                              style={{ fontSize: fontScaleStyles.input }}
                            />
                          )}
                        </td>
                      );
                    }

                    const entry = entries[cellKey] ?? {
                      name: '',
                      hn: '',
                      phone: '',
                      symptom: '',
                    };

                    return (
                      <td
                        key={col.id}
                        className="align-middle px-2 py-1"
                        style={{ border: borderStyles.inner }}
                      >
                        <div className="h-full flex flex-col justify-evenly">
                          {fields.map((f) => (
                            <div
                              key={f.key}
                              className="flex items-baseline gap-1 min-w-0"
                            >
                              <span
                                className={`${f.labelWidth} shrink-0 font-medium text-slate-800 leading-none`}
                                style={{ fontSize: fontScaleStyles.label }}
                              >
                                {f.label}
                              </span>
                              <div
                                className={`flex-1 min-w-0 pb-[1px] ${writingLineClass}`}
                              >
                                <input
                                  type="text"
                                  value={entry[f.key]}
                                  onChange={(e) =>
                                    onUpdateEntry(cellKey, f.key, e.target.value)
                                  }
                                  aria-label={`${col.label} ${slot.start}-${slot.end} ${f.label}`}
                                  className="w-full bg-transparent outline-none text-slate-950 leading-[1.2] focus:bg-teal-50/50 rounded-xs px-0.5 py-0 transition-colors select-text cursor-text"
                                  style={{ fontSize: fontScaleStyles.input }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
