import React from 'react';
import { Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  BorderWeightPreset,
  ColumnKind,
  FontScalePreset,
  LineStylePreset,
  MarginPreset,
  SchedulePageData,
  SheetSettings,
  SurfaceTintPreset,
} from '../types/schedule';

interface InspectorPanelProps {
  settings: SheetSettings;
  onChangeSettings: <K extends keyof SheetSettings>(
    key: K,
    value: SheetSettings[K]
  ) => void;
  pages: SchedulePageData[];
  onUpdateColumnLabel: (
    pageId: 'page1' | 'page2',
    colId: string,
    label: string
  ) => void;
  onUpdateColumnKind: (
    pageId: 'page1' | 'page2',
    colId: string,
    kind: ColumnKind
  ) => void;
  onAddColumn: (pageId: 'page1' | 'page2', kind: ColumnKind) => void;
  onRemoveColumn: (pageId: 'page1' | 'page2', colId: string) => void;
  onResetDefaults: () => void;
  onClearEntries: () => void;
  onExportCsv: () => void;
  hasEntries: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  settings,
  onChangeSettings,
  pages,
  onUpdateColumnLabel,
  onUpdateColumnKind,
  onAddColumn,
  onRemoveColumn,
  onResetDefaults,
  onClearEntries,
  onExportCsv,
  hasEntries,
}) => {
  const segmentedBtn = (active: boolean) =>
    `flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-teal-700 ${
      active
        ? 'bg-white text-slate-900 shadow-xs'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <aside className="no-print w-full lg:w-[320px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Section 1: Paper & Column Proportions */}
        <section className="space-y-3.5">
          <h2 className="text-sm font-semibold text-slate-900">
            สัดส่วนหน้ากระดาษและตาราง
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              ระยะขอบกระดาษ (Margin)
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'compact', label: 'กระชับ' },
                  { id: 'standard', label: 'มาตรฐาน' },
                  { id: 'wide', label: 'โปร่ง' },
                ] as Array<{ id: MarginPreset; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeSettings('marginPreset', opt.id)}
                  className={segmentedBtn(settings.marginPreset === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                ความกว้างช่อง "เวลา"
              </span>
              <span className="font-mono-num text-slate-800">
                {settings.timeColumnWidthPct.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={7}
              max={12}
              step={0.5}
              value={settings.timeColumnWidthPct}
              onChange={(e) =>
                onChangeSettings('timeColumnWidthPct', Number(e.target.value))
              }
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                ความกว้างช่อง "ตู้อบ" (แผ่นที่ 2)
              </span>
              <span className="font-mono-num text-slate-800">
                {settings.cabinetColumnWidthPct.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={13}
              step={0.5}
              value={settings.cabinetColumnWidthPct}
              onChange={(e) =>
                onChangeSettings(
                  'cabinetColumnWidthPct',
                  Number(e.target.value)
                )
              }
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                สัดส่วนความสูงแถวพักกลางวัน
              </span>
              <span className="font-mono-num text-slate-800">
                {settings.lunchHeightRatio}%
              </span>
            </div>
            <input
              type="range"
              min={38}
              max={68}
              step={2}
              value={settings.lunchHeightRatio}
              onChange={(e) =>
                onChangeSettings('lunchHeightRatio', Number(e.target.value))
              }
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Section 2: Grid & Writing Lines */}
        <section className="space-y-3.5">
          <h2 className="text-sm font-semibold text-slate-900">
            เส้นตารางและตัวอักษร
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              ความคมชัดเส้นตาราง
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'thin', label: 'บาง' },
                  { id: 'medium', label: 'มาตรฐาน' },
                  { id: 'bold', label: 'คมชัด' },
                ] as Array<{ id: BorderWeightPreset; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeSettings('borderWeight', opt.id)}
                  className={segmentedBtn(settings.borderWeight === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              เส้นบรรทัดกรอกข้อมูล (ชื่อ/HN/โทร/อาการ)
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'dotted', label: 'จุดไข่ปลา' },
                  { id: 'solid', label: 'เส้นบาง' },
                  { id: 'none', label: 'ไม่แสดง' },
                ] as Array<{ id: LineStylePreset; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeSettings('lineStyle', opt.id)}
                  className={segmentedBtn(settings.lineStyle === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              ขนาดตัวอักษร
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'sm', label: 'เล็ก' },
                  { id: 'md', label: 'มาตรฐาน' },
                  { id: 'lg', label: 'ใหญ่' },
                ] as Array<{ id: FontScalePreset; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeSettings('fontScale', opt.id)}
                  className={segmentedBtn(settings.fontScale === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              สีพื้นหัวตารางและพักกลางวัน
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'tinted', label: 'แรเงาอ่อน' },
                  { id: 'plain', label: 'ขาวล้วน' },
                ] as Array<{ id: SurfaceTintPreset; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeSettings('surfaceTint', opt.id)}
                  className={segmentedBtn(settings.surfaceTint === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
            <span className="text-xs font-medium text-slate-700">
              แสดงเส้นบรรทัดในช่อง "ตู้อบ 1–2"
            </span>
            <input
              type="checkbox"
              checked={settings.showCabinetLines}
              onChange={(e) =>
                onChangeSettings('showCabinetLines', e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 accent-teal-700"
            />
          </label>
        </section>

        <hr className="border-slate-200" />

        {/* Section 3: Header & Date */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            หัวเอกสารและวันที่
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              ชื่อตาราง
            </label>
            <input
              type="text"
              value={settings.documentTitle}
              onChange={(e) =>
                onChangeSettings('documentTitle', e.target.value)
              }
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              ชื่อโรงพยาบาล / หน่วยงาน
            </label>
            <input
              type="text"
              value={settings.hospitalName}
              onChange={(e) => onChangeSettings('hospitalName', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              รูปแบบวันที่บนหัวกระดาษ
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => onChangeSettings('dateMode', 'blank')}
                className={segmentedBtn(settings.dateMode === 'blank')}
              >
                เว้นช่องเขียนมือ
              </button>
              <button
                type="button"
                onClick={() => onChangeSettings('dateMode', 'custom')}
                className={segmentedBtn(settings.dateMode === 'custom')}
              >
                ระบุวันที่
              </button>
            </div>
            {settings.dateMode === 'custom' && (
              <input
                type="date"
                value={settings.customDateIso}
                onChange={(e) =>
                  onChangeSettings('customDateIso', e.target.value)
                }
                className="w-full mt-1.5 px-2.5 py-1.5 text-xs font-mono-num text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-teal-600"
              />
            )}
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Section 4: Columns per Page */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            คอลัมน์ผู้ให้บริการ / ห้องตรวจ
          </h2>

          {pages.map((page) => (
            <div key={page.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {page.id === 'page1' ? 'แผ่นที่ 1' : 'แผ่นที่ 2'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddColumn(page.id, 'practitioner')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    ผู้ตรวจ
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddColumn(page.id, 'blank')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    ช่องว่าง
                  </button>
                  {page.id === 'page2' && (
                    <button
                      type="button"
                      onClick={() => onAddColumn(page.id, 'cabinet')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      ตู้อบ
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                {page.columns.map((col) => (
                  <div key={col.id} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={col.label}
                      placeholder="เว้นว่าง"
                      onChange={(e) =>
                        onUpdateColumnLabel(page.id, col.id, e.target.value)
                      }
                      className="flex-1 min-w-0 px-2.5 py-1 text-xs text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:border-teal-600"
                    />
                    <select
                      value={col.kind}
                      onChange={(e) =>
                        onUpdateColumnKind(
                          page.id,
                          col.id,
                          e.target.value as ColumnKind
                        )
                      }
                      aria-label={`ประเภทช่อง ${col.label || 'ช่องว่าง'}`}
                      className="px-1.5 py-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-600 shrink-0"
                    >
                      <option value="practitioner">ฟอร์ม</option>
                      <option value="blank">ช่องว่าง</option>
                      <option value="cabinet">ตู้อบ</option>
                    </select>
                    <button
                      type="button"
                      disabled={page.columns.length <= 1}
                      onClick={() => onRemoveColumn(page.id, col.id)}
                      title="ลบคอลัมน์"
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <hr className="border-slate-200" />

        {/* Utility Reset & Backup Actions */}
        <section className="flex flex-col gap-2 pb-4">
          <button
            type="button"
            onClick={onExportCsv}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            ส่งออกข้อมูลนัดหมาย (CSV)
          </button>
          {hasEntries && (
            <button
              type="button"
              onClick={onClearEntries}
              className="w-full px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              ล้างข้อมูลผู้รับบริการที่พิมพ์ไว้ทั้งหมด
            </button>
          )}
          <button
            type="button"
            onClick={onResetDefaults}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            คืนค่าสัดส่วนและรายชื่อต้นฉบับ
          </button>
        </section>
      </div>
    </aside>
  );
};
