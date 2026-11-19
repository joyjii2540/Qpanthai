import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileDown, Printer, SlidersHorizontal } from 'lucide-react';
import { A4ScheduleSheet } from './components/A4ScheduleSheet';
import { InspectorPanel } from './components/InspectorPanel';
import { ScaledPaperFrame } from './components/ScaledPaperFrame';
import {
  DEFAULT_PAGES,
  DEFAULT_SETTINGS,
  DEFAULT_TIME_SLOTS,
} from './data/defaultSchedule';
import {
  AppointmentEntry,
  ColumnKind,
  SchedulePageData,
  SheetSettings,
  ViewMode,
} from './types/schedule';
import { downloadScheduleCsv } from './utils/exportCsv';
import { downloadSchedulePdf } from './utils/exportPdf';

const STORAGE_KEY = 'thai_med_schedule_v2';
const LEGACY_STORAGE_KEY = 'thai_med_schedule_v1';

interface SavedState {
  settings: SheetSettings;
  pages: SchedulePageData[];
  entries: Record<string, AppointmentEntry>;
  cabinetNotes: Record<string, string>;
}

function loadSavedState(): SavedState | null {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<SavedState>;
      if (parsed.settings && parsed.pages) {
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          pages: parsed.pages,
          entries: parsed.entries ?? {},
          cabinetNotes: parsed.cabinetNotes ?? {},
        };
      }
    }

    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1) as Partial<SavedState>;
      if (parsed.settings && parsed.pages) {
        const migratedPages = parsed.pages.map((p) => {
          if (p.id !== 'page2') return p;
          const hasBlank = p.columns.some((c) => c.id === 'p2-blank1');
          if (hasBlank) return p;
          const idx = p.columns.findIndex((c) => c.id === 'p2-c4');
          const cols = [...p.columns];
          const insertAt = idx >= 0 ? idx + 1 : cols.length;
          cols.splice(insertAt, 0, {
            id: 'p2-blank1',
            label: '',
            kind: 'blank',
          });
          return {
            ...p,
            title: 'แผ่นที่ 2 — ผู้ให้บริการ 4 ท่าน ช่องว่าง และตู้อบ',
            columns: cols,
          };
        });
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          pages: migratedPages,
          entries: parsed.entries ?? {},
          cabinetNotes: parsed.cabinetNotes ?? {},
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const initial = useMemo(() => loadSavedState(), []);

  const [settings, setSettings] = useState<SheetSettings>(
    initial?.settings ?? DEFAULT_SETTINGS
  );
  const [pages, setPages] = useState<SchedulePageData[]>(
    initial?.pages ?? DEFAULT_PAGES
  );
  const [entries, setEntries] = useState<Record<string, AppointmentEntry>>(
    initial?.entries ?? {}
  );
  const [cabinetNotes, setCabinetNotes] = useState<Record<string, string>>(
    initial?.cabinetNotes ?? {}
  );
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [showSidebarMobile, setShowSidebarMobile] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const payload: SavedState = {
        settings,
        pages,
        entries,
        cabinetNotes,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings, pages, entries, cabinetNotes]);

  const handleChangeSettings = <K extends keyof SheetSettings>(
    key: K,
    value: SheetSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateEntry = (
    cellKey: string,
    field: keyof AppointmentEntry,
    value: string
  ) => {
    setEntries((prev) => {
      const current = prev[cellKey] ?? {
        name: '',
        hn: '',
        phone: '',
        symptom: '',
      };
      return {
        ...prev,
        [cellKey]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleUpdateCabinetNote = (cellKey: string, value: string) => {
    setCabinetNotes((prev) => ({ ...prev, [cellKey]: value }));
  };

  const handleUpdateColumnLabel = (
    pageId: 'page1' | 'page2',
    colId: string,
    label: string
  ) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id !== pageId
          ? page
          : {
              ...page,
              columns: page.columns.map((col) =>
                col.id === colId ? { ...col, label } : col
              ),
            }
      )
    );
  };

  const handleUpdateColumnKind = (
    pageId: 'page1' | 'page2',
    colId: string,
    kind: ColumnKind
  ) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id !== pageId
          ? page
          : {
              ...page,
              columns: page.columns.map((col) =>
                col.id === colId ? { ...col, kind } : col
              ),
            }
      )
    );
  };

  const handleAddColumn = (pageId: 'page1' | 'page2', kind: ColumnKind) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const count =
          page.columns.filter((c) => c.kind === kind).length + 1;
        const label =
          kind === 'cabinet'
            ? `ตู้อบ ${count}`
            : kind === 'blank'
            ? ''
            : `ผู้ตรวจ ${count}`;
        const newCol = {
          id: `${pageId}-${kind}-${Date.now()}`,
          label,
          kind,
        };
        return {
          ...page,
          columns: [...page.columns, newCol],
        };
      })
    );
  };

  const handleRemoveColumn = (pageId: 'page1' | 'page2', colId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || page.columns.length <= 1) return page;
        return {
          ...page,
          columns: page.columns.filter((c) => c.id !== colId),
        };
      })
    );
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setPages(DEFAULT_PAGES);
  };

  const handleClearEntries = () => {
    setEntries({});
    setCabinetNotes({});
  };

  const hasEntries = useMemo(() => {
    const hasAppointmentText = Object.values(entries).some(
      (e) => e.name || e.hn || e.phone || e.symptom
    );
    const hasCabText = Object.values(cabinetNotes).some((v) => v.trim() !== '');
    return hasAppointmentText || hasCabText;
  }, [entries, cabinetNotes]);

  const visiblePages = useMemo(() => {
    if (viewMode === 'page1') return pages.filter((p) => p.id === 'page1');
    if (viewMode === 'page2') return pages.filter((p) => p.id === 'page2');
    return pages;
  }, [pages, viewMode]);

  const showNotice = (message: string, durationMs = 4000) => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    setActionNotice(message);
    noticeTimerRef.current = window.setTimeout(() => {
      setActionNotice(null);
    }, durationMs);
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const pageCount = await downloadSchedulePdf(settings);
      showNotice(`บันทึกไฟล์ PDF แล้ว (${pageCount} แผ่น A4 แนวนอน)`);
    } catch {
      showNotice('ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง', 5000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    window.print();

    if (inIframe) {
      showNotice(
        'หากหน้าต่างพิมพ์ไม่เปิดในโหมดตัวอย่าง ให้กด "บันทึกเป็น PDF" แล้วสั่งพิมพ์จากไฟล์ PDF',
        6500
      );
    }
  };

  const handleExportCsv = () => {
    const { rowCount, filledCount } = downloadScheduleCsv({
      pages,
      timeSlots: DEFAULT_TIME_SLOTS,
      settings,
      entries,
      cabinetNotes,
    });
    const msg =
      filledCount > 0
        ? `ส่งออก CSV แล้ว (${filledCount} รายการ)`
        : `ส่งออก CSV ตารางเปล่าแล้ว (${rowCount} ช่อง)`;
    showNotice(msg);
  };

  return (
    <div className="print-root min-h-screen flex flex-col bg-slate-100 text-slate-900 font-ui">
      {/* Top Bar */}
      <header className="no-print sticky top-0 z-20 bg-white border-b border-slate-200 px-5 lg:px-6 h-14 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowSidebarMobile((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="เปิดแถบปรับแต่งสัดส่วน"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <span className="text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            ตารางนัดคลินิกแพทย์แผนไทย
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {(
            [
              { id: 'both', label: 'แสดงทั้ง 2 แผ่น' },
              { id: 'page1', label: 'แผ่นที่ 1 (5 ท่าน)' },
              { id: 'page2', label: 'แผ่นที่ 2 (4 ท่าน + ช่องว่าง + ตู้อบ)' },
            ] as Array<{ id: ViewMode; label: string }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewMode(item.id)}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                viewMode === item.id
                  ? 'border-teal-700 text-slate-950 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'กำลังสร้าง PDF...' : 'บันทึกเป็น PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Inspector Sidebar (always visible on desktop, toggleable on mobile) */}
        <div
          className={`${
            showSidebarMobile ? 'block' : 'hidden'
          } lg:block lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14 shrink-0`}
        >
          <InspectorPanel
            settings={settings}
            onChangeSettings={handleChangeSettings}
            pages={pages}
            onUpdateColumnLabel={handleUpdateColumnLabel}
            onUpdateColumnKind={handleUpdateColumnKind}
            onAddColumn={handleAddColumn}
            onRemoveColumn={handleRemoveColumn}
            onResetDefaults={handleResetDefaults}
            onClearEntries={handleClearEntries}
            onExportCsv={handleExportCsv}
            hasEntries={hasEntries}
          />
        </div>

        {/* Paper Preview & Print Stage */}
        <main className="print-container flex-1 min-w-0 bg-slate-200/75 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="no-print max-w-[1123px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <p>
              คลิกที่หัวคอลัมน์หรือช่องรายการในตารางเพื่อพิมพ์แก้ไขได้โดยตรง
              — กด &quot;บันทึกเป็น PDF&quot; เพื่อรับไฟล์ขนาด A4 แนวนอนพร้อมพิมพ์ทันที
            </p>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {actionNotice && (
                <span className="text-xs font-medium text-teal-800 whitespace-nowrap">
                  {actionNotice}
                </span>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>สั่งพิมพ์</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>ส่งออก CSV</span>
              </button>
              <div className="flex md:hidden items-center gap-2">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  aria-label="เลือกหน้าที่แสดง"
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
                >
                  <option value="both">แสดงทั้ง 2 แผ่น</option>
                  <option value="page1">แผ่นที่ 1 (5 ท่าน)</option>
                  <option value="page2">แผ่นที่ 2 (4 ท่าน + ช่องว่าง + ตู้อบ)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 print:block print:gap-0">
            {visiblePages.map((page) => (
              <ScaledPaperFrame key={page.id} pageLabel={page.title}>
                <A4ScheduleSheet
                  page={page}
                  timeSlots={DEFAULT_TIME_SLOTS}
                  settings={settings}
                  entries={entries}
                  onUpdateEntry={handleUpdateEntry}
                  onUpdateColumnLabel={handleUpdateColumnLabel}
                  cabinetNotes={cabinetNotes}
                  onUpdateCabinetNote={handleUpdateCabinetNote}
                />
              </ScaledPaperFrame>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
