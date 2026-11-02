import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  MessageSquare,
  Users,
  Heart,
  Send,
  Trash2,
  Star,
  BookOpen,
  Settings,
  Calendar,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  BookCheck,
  ChevronDown
} from 'lucide-react';
import { BookRecord, CommentItem } from '../types';
import { GOAL_BOOKS, TEACHER_NAME } from '../data/students';

interface DashboardPageProps {
  books: BookRecord[];
  students?: string[];
  currentStudent: string | null;
  goalBooks?: number;
  activeTab?: string;
  onToggleLike: (bookId: string) => void;
  onAddComment: (bookId: string, text: string) => void;
  onDeleteComment: (bookId: string, commentId: string) => void;
  onRequireLogin: () => void;
  onOpenSettings?: () => void;
}

export type PeriodMode = 'month' | 'custom' | 'all';

export function DashboardPage({
  books,
  students = [],
  currentStudent,
  goalBooks = GOAL_BOOKS,
  activeTab = '2026학년도',
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onRequireLogin,
  onOpenSettings
}: DashboardPageProps) {
  // Period filter states
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  // Custom date range state (YYYY-MM-DD)
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Table sorting & filtering state
  const [sortField, setSortField] = useState<'count' | 'avg' | 'name'>('count');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [onlyReadStudents, setOnlyReadStudents] = useState<boolean>(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Set of book IDs whose comment section is opened
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  // Input draft per book
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const changeMonth = (offset: number) => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;
  const monthYearStr = `${year}-${String(month).padStart(2, '0')}`;

  // Quick preset ranges for custom period
  const applyPresetRange = (preset: 'thisMonth' | 'lastMonth' | 'semester1' | 'semester2' | 'last7Days' | 'last30Days' | 'all') => {
    const now = new Date();
    const curYear = now.getFullYear();

    if (preset === 'thisMonth') {
      const start = new Date(curYear, now.getMonth(), 1).toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);
      setCustomStartDate(start);
      setCustomEndDate(end);
      setPeriodMode('custom');
    } else if (preset === 'lastMonth') {
      const start = new Date(curYear, now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(curYear, now.getMonth(), 0).toISOString().slice(0, 10);
      setCustomStartDate(start);
      setCustomEndDate(end);
      setPeriodMode('custom');
    } else if (preset === 'semester1') {
      // 1학기: 3월 1일 ~ 8월 31일
      setCustomStartDate(`${curYear}-03-01`);
      setCustomEndDate(`${curYear}-08-31`);
      setPeriodMode('custom');
    } else if (preset === 'semester2') {
      // 2학기: 9월 1일 ~ 익년 2월 28일
      setCustomStartDate(`${curYear}-09-01`);
      setCustomEndDate(`${curYear + 1}-02-28`);
      setPeriodMode('custom');
    } else if (preset === 'last7Days') {
      const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      setCustomStartDate(start);
      setCustomEndDate(now.toISOString().slice(0, 10));
      setPeriodMode('custom');
    } else if (preset === 'last30Days') {
      const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      setCustomStartDate(start);
      setCustomEndDate(now.toISOString().slice(0, 10));
      setPeriodMode('custom');
    } else if (preset === 'all') {
      setPeriodMode('all');
    }
  };

  // Helper to get book effective date
  const getBookDate = (b: BookRecord): string => {
    if (b.endDate) return b.endDate.slice(0, 10);
    if (b.startDate) return b.startDate.slice(0, 10);
    if (b.createdAt) return b.createdAt.slice(0, 10);
    return '';
  };

  // Filter books based on active periodMode
  const filteredBooks = useMemo(() => {
    if (periodMode === 'all') {
      return books;
    }
    if (periodMode === 'month') {
      return books.filter((b) => {
        const d = getBookDate(b);
        return d && d.startsWith(monthYearStr);
      });
    }
    // Custom date range
    return books.filter((b) => {
      const d = getBookDate(b);
      if (!d) return false;
      const matchStart = customStartDate ? d >= customStartDate : true;
      const matchEnd = customEndDate ? d <= customEndDate : true;
      return matchStart && matchEnd;
    });
  }, [books, periodMode, monthYearStr, customStartDate, customEndDate]);

  // Overall class stats across all time
  const totalBooksCount = books.length;
  const targetGoal = goalBooks && goalBooks > 0 ? goalBooks : GOAL_BOOKS;
  const thermoPercent = Math.min(Math.round((totalBooksCount / targetGoal) * 100), 100);

  // Period label for headings
  const periodLabel = useMemo(() => {
    if (periodMode === 'all') return '전체 누적 기간';
    if (periodMode === 'month') return `${year}년 ${month}월`;
    if (customStartDate && customEndDate) return `${customStartDate} ~ ${customEndDate}`;
    if (customStartDate) return `${customStartDate} 이후`;
    if (customEndDate) return `${customEndDate} 이전`;
    return '지정 기간';
  }, [periodMode, year, month, customStartDate, customEndDate]);

  // Statistics for the filtered period
  const periodTotalBooks = filteredBooks.length;
  const periodAvgRating = useMemo(() => {
    const rated = filteredBooks.filter((b) => b.rating > 0);
    if (rated.length === 0) return '-';
    return (rated.reduce((acc, b) => acc + b.rating, 0) / rated.length).toFixed(1);
  }, [filteredBooks]);

  // Active students who read at least 1 book in this period
  const activeReadersCount = useMemo(() => {
    const set = new Set(filteredBooks.map((b) => b.studentName).filter(Boolean));
    return set.size;
  }, [filteredBooks]);

  // Full student list (union of configured students + names found in books)
  const allKnownStudents = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s));
    books.forEach((b) => {
      if (b.studentName) set.add(b.studentName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [students, books]);

  // Comprehensive Student Statistics for the filtered period
  const studentStats = useMemo(() => {
    const map: Record<string, BookRecord[]> = {};

    // Group filtered books
    filteredBooks.forEach((b) => {
      if (!b.studentName) return;
      if (!map[b.studentName]) map[b.studentName] = [];
      map[b.studentName].push(b);
    });

    // Also include students who read 0 books
    const targetStudentNames = allKnownStudents.length > 0
      ? allKnownStudents
      : Object.keys(map);

    let list = targetStudentNames.map((name) => {
      const bList = map[name] || [];
      const rated = bList.filter((b) => b.rating > 0);
      const avgNum = rated.length > 0
        ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length
        : 0;
      const avg = rated.length > 0 ? avgNum.toFixed(1) : '-';

      return {
        name,
        count: bList.length,
        avgNum,
        avg,
        books: bList,
        isTeacher: name === TEACHER_NAME
      };
    });

    // Filter by search query
    if (studentSearch.trim()) {
      const q = studentSearch.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    // Filter by only readers (> 0)
    if (onlyReadStudents) {
      list = list.filter((s) => s.count > 0);
    }

    // Sort
    list.sort((a, b) => {
      if (sortField === 'count') {
        const diff = b.count - a.count;
        return sortAsc ? -diff : diff;
      }
      if (sortField === 'avg') {
        const diff = b.avgNum - a.avgNum;
        return sortAsc ? -diff : diff;
      }
      // sort by name
      const cmp = a.name.localeCompare(b.name, 'ko');
      return sortAsc ? -cmp : cmp;
    });

    return list;
  }, [filteredBooks, allKnownStudents, studentSearch, onlyReadStudents, sortField, sortAsc]);

  // Top Readers in the selected period (1st to 5th)
  const topReaders = useMemo(() => {
    const countMap: Record<string, number> = {};
    filteredBooks.forEach((b) => {
      if (b.studentName) {
        countMap[b.studentName] = (countMap[b.studentName] || 0) + 1;
      }
    });

    const entries = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const uniqueScores = [...new Set(entries.map((e) => e[1]))].slice(0, 5);

    return uniqueScores.map((score, rankIndex) => {
      const studentNames = entries.filter((e) => e[1] === score).map((e) => e[0]);
      return {
        rankIndex,
        score,
        students: studentNames
      };
    });
  }, [filteredBooks]);

  // Recent reviews in the selected period
  const recentReviews = useMemo(() => {
    return filteredBooks
      .filter((b) => b.review && b.review.trim().length > 0)
      .sort((a, b) => new Date(b.createdAt || b.endDate).getTime() - new Date(a.createdAt || a.endDate).getTime())
      .slice(0, 6);
  }, [filteredBooks]);

  // Handle comment submit
  const handleCommentSubmit = (bookId: string) => {
    if (!currentStudent) {
      onRequireLogin();
      return;
    }
    const text = (commentInputs[bookId] || '').trim();
    if (!text) return;
    onAddComment(bookId, text);
    setCommentInputs((prev) => ({ ...prev, [bookId]: '' }));
    setOpenComments((prev) => new Set(prev).add(bookId));
  };

  const toggleCommentsView = (bookId: string) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const medalStyles = [
    {
      gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 140, 0, 0.95) 100%)',
      glow: '#FFD700',
      label: '🥇 1st'
    },
    {
      gradient: 'linear-gradient(135deg, rgba(200, 205, 215, 0.95) 0%, rgba(150, 160, 175, 0.95) 100%)',
      glow: '#C0C0C0',
      label: '🥈 2nd'
    },
    {
      gradient: 'linear-gradient(135deg, rgba(215, 145, 90, 0.95) 0%, rgba(165, 90, 20, 0.95) 100%)',
      glow: '#CD7F32',
      label: '🥉 3rd'
    },
    {
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(79, 70, 229, 0.85) 100%)',
      glow: '#4F46E5',
      label: '4th'
    },
    {
      gradient: 'linear-gradient(135deg, rgba(45, 212, 191, 0.85) 0%, rgba(20, 184, 166, 0.85) 100%)',
      glow: '#14B8A6',
      label: '5th'
    }
  ];

  // CSV Export for teacher records
  const handleExportCSV = () => {
    const headers = ['순번', '학생명', '읽은권수', '평균별점', '읽은책목록'];
    const rows = studentStats.map((st, idx) => {
      const bookTitles = st.books.map((b) => b.bookTitle).join('; ');
      return [
        idx + 1,
        st.name,
        st.count,
        st.avg === '-' ? '' : st.avg,
        `"${bookTitles.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `독서통계_${periodLabel.replace(/[\s~:/]/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSortToggle = (field: 'count' | 'avg' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name'); // default asc for name, desc for numbers
    }
  };

  return (
    <div id="dashboard-view" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Period Selector Card (Month / Custom Date Range / All Time) */}
      <section className="bg-white/15 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">기간별 통계 조회</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-indigo-100">
                  {periodLabel}
                </span>
              </div>
              <p className="text-xs text-white/75">
                원하는 시작일과 종료일을 지정하여 학생별 읽은 권수를 한눈에 확인하세요.
              </p>
            </div>
          </div>

          {/* Mode Switch Buttons */}
          <div className="flex rounded-2xl bg-black/20 p-1 border border-white/10 shrink-0">
            <button
              id="btn-period-month"
              type="button"
              onClick={() => setPeriodMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                periodMode === 'month'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              월별 조회
            </button>
            <button
              id="btn-period-custom"
              type="button"
              onClick={() => setPeriodMode('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                periodMode === 'custom'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>직접 기간 설정</span>
            </button>
            <button
              id="btn-period-all"
              type="button"
              onClick={() => setPeriodMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                periodMode === 'all'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              전체 누적
            </button>
          </div>
        </div>

        {/* Sub-controls depending on mode */}
        {periodMode === 'month' && (
          <div className="flex items-center justify-center gap-3 pt-2 pb-1 border-t border-white/10">
            <button
              id="btn-prev-month"
              onClick={() => changeMonth(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-white font-bold transition-all border border-white/20"
              title="이전 달"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span
              id="month-display"
              className="text-xl sm:text-2xl font-black text-white min-w-[160px] text-center"
            >
              {year}년 {month}월
            </span>

            <button
              id="btn-next-month"
              onClick={() => changeMonth(1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-white font-bold transition-all border border-white/20"
              title="다음 달"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {periodMode === 'custom' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            {/* Date Pickers */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-white shrink-0">기간 입력:</span>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                <input
                  id="input-custom-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
              <span className="text-white font-bold">~</span>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                <input
                  id="input-custom-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-white/70 font-semibold mr-1">빠른 선택:</span>
              <button
                type="button"
                onClick={() => applyPresetRange('thisMonth')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
              >
                이번 달
              </button>
              <button
                type="button"
                onClick={() => applyPresetRange('lastMonth')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
              >
                지난 달
              </button>
              <button
                type="button"
                onClick={() => applyPresetRange('semester1')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
              >
                1학기 (3~8월)
              </button>
              <button
                type="button"
                onClick={() => applyPresetRange('semester2')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
              >
                2학기 (9~익년 2월)
              </button>
              <button
                type="button"
                onClick={() => applyPresetRange('last30Days')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
              >
                최근 30일
              </button>
              <button
                type="button"
                onClick={() => applyPresetRange('last7Days')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
              >
                최근 7일
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Thermometer Goal Section (Cumulative) */}
      <section className="bg-white/10 p-6 sm:p-7 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              학급 독서 온도계 (목표 {targetGoal.toLocaleString()}권)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white/90 border border-white/20">
              {activeTab}
            </span>
            {onOpenSettings && (
              <button
                id="dash-edit-goal-btn"
                onClick={onOpenSettings}
                title="목표 권 수 및 시트 탭 변경하기"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 shadow-sm hover:scale-105 active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-amber-300" />
                <span>목표/탭 변경</span>
              </button>
            )}
          </div>
          <span id="thermo-text" className="text-white font-black text-base sm:text-lg">
            {totalBooksCount} / {targetGoal.toLocaleString()} 권 ({thermoPercent}%)
          </span>
        </div>

        <div className="w-full bg-slate-900/30 rounded-full h-6 p-1 relative shadow-inner overflow-hidden border border-white/10">
          <motion.div
            id="thermo-bar"
            initial={{ width: 0 }}
            animate={{ width: `${thermoPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full shiny-badge rounded-full shadow-md transition-all relative"
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 60%, #ec4899 100%)'
            }}
          />
        </div>

        <p className="text-xs text-white/70 mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <span>🎯 우리 반 친구들이 함께 힘을 모아 {targetGoal.toLocaleString()}권 독서를 달성해 봐요!</span>
          {totalBooksCount >= targetGoal && (
            <span className="text-amber-300 font-bold animate-bounce">
              🎉 {targetGoal.toLocaleString()}권 달성 완료! 축하합니다!
            </span>
          )}
        </p>
      </section>

      {/* 3. Three Metrics Cards for the Filtered Period */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊 {periodLabel} 통계 현황</span>
          </h2>
          <span className="text-xs text-white/70">
            총 {filteredBooks.length}권 기록 반영 중
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Period Total books */}
          <div
            className="backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-lg border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.9) 100%)'
            }}
          >
            <div id="dash-total-books" className="text-4xl sm:text-5xl font-black">
              {periodTotalBooks}
            </div>
            <p className="text-sm font-medium opacity-90 mt-2">해당 기간 완독 권수</p>
          </div>

          {/* Average rating */}
          <div
            className="backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-lg border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.85) 0%, rgba(190, 24, 93, 0.9) 100%)'
            }}
          >
            <div id="dash-avg-rating" className="text-4xl sm:text-5xl font-black flex items-center justify-center gap-2">
              <span>{periodAvgRating}</span>
              {periodAvgRating !== '-' && <span className="text-amber-300 text-3xl">★</span>}
            </div>
            <p className="text-sm font-medium opacity-90 mt-2">평균 별점</p>
          </div>

          {/* Active readers */}
          <div
            className="backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-lg border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(22, 163, 74, 0.9) 100%)'
            }}
          >
            <div id="dash-active-readers" className="text-4xl sm:text-5xl font-black">
              {activeReadersCount}
              <span className="text-2xl font-bold ml-1 opacity-80">명</span>
            </div>
            <p className="text-sm font-medium opacity-90 mt-2">독서 참여 학생 수</p>
          </div>
        </div>
      </section>

      {/* 4. NEW: Comprehensive Student Reading Table with Sorting & Search */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookCheck className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                학생별 읽은 권수 통계 리스트
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {periodLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              선택한 기간 동안 각 학생이 완독한 권수와 평균 별점을 정렬하고 세부 도서 목록을 확인하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              title="현재 통계 결과를 엑셀/CSV로 다운로드"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>엑셀(CSV) 저장</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              id="input-student-search"
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="학생 이름 검색..."
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-48 bg-slate-50"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={onlyReadStudents}
                onChange={(e) => setOnlyReadStudents(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>1권 이상 읽은 학생만</span>
            </label>
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            총 <strong>{studentStats.length}</strong>명 표시됨 (합계:{' '}
            <strong className="text-indigo-600">
              {studentStats.reduce((sum, s) => sum + s.count, 0)}
            </strong>
            권)
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3 w-14 text-center">순번</th>
                <th
                  onClick={() => handleSortToggle('name')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>학생명</span>
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('count')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1 text-indigo-700 font-black">
                    <span>읽은 권수</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('avg')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>평균 별점</span>
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4">읽은 책 확인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentStats.length > 0 ? (
                studentStats.map((st, idx) => {
                  const isTop = idx < 3 && st.count > 0 && sortField === 'count' && !sortAsc;
                  const isExpanded = expandedStudent === st.name;

                  return (
                    <tr
                      key={st.name}
                      className={`hover:bg-indigo-50/40 transition-colors ${
                        st.count === 0 ? 'opacity-60 bg-slate-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {isTop ? (
                          idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : '🥉 3'
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {st.isTeacher && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                              선생님
                            </span>
                          )}
                          {st.count >= 10 && (
                            <span title="독서왕 (10권 이상)">👑</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-black text-xs sm:text-sm ${
                            st.count > 0
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {st.count}권
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {st.avg !== '-' ? (
                          <span className="flex items-center justify-center gap-0.5 text-amber-500">
                            ★ {st.avg}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {st.books.length > 0 ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => setExpandedStudent(isExpanded ? null : st.name)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                            >
                              <span>{st.books.length}권 목록 보기</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {isExpanded && (
                              <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                {st.books.map((b) => (
                                  <div key={b.id} className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-800">
                                      • {b.bookTitle}
                                    </span>
                                    <span className="text-[11px] text-slate-400 shrink-0">
                                      {getBookDate(b)} | ★{b.rating}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">기록 없음</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    조건에 해당하는 학생 독서 기록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Top Readers (1st to 5th) Podium in the selected period */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">
              🏆 {periodLabel} 독서 랭킹 TOP 5
            </h2>
          </div>
          <span className="text-xs text-white/70">완독 권수 기준</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {topReaders.length > 0 ? (
            topReaders.map((tier) => {
              const style = medalStyles[tier.rankIndex] || medalStyles[4];

              return (
                <div
                  key={tier.rankIndex}
                  id={`top-reader-tier-${tier.rankIndex + 1}`}
                  className="rounded-3xl p-4 text-white shadow-xl backdrop-blur-md relative overflow-hidden transition-all hover:scale-[1.03]"
                  style={{
                    background: style.gradient,
                    boxShadow: `0 10px 25px -5px ${style.glow}40`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                      {style.label}
                    </span>
                    <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">
                      {tier.score}권
                    </span>
                  </div>

                  <div className="space-y-1 mt-3">
                    {tier.students.map((name) => (
                      <div
                        key={name}
                        className="font-extrabold text-base tracking-tight truncate flex items-center gap-1"
                        title={name}
                      >
                        <span>{name}</span>
                        {tier.score >= 10 && <span title="독서왕">👑</span>}
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] opacity-80 mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
                    <span>{tier.students.length}명 달성</span>
                    <span>완독</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white/10 rounded-2xl py-8 text-center text-white/70 border border-white/15">
              선택한 기간({periodLabel})에는 아직 독서 기록이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 6. Recent Reviews in the selected period with Like & Comments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-300" />
            <h2 className="text-xl font-extrabold text-white">
              💬 {periodLabel} 친구들의 독서 한마디
            </h2>
          </div>
          <span className="text-xs text-white/70">따뜻한 댓글과 응원을 남겨보세요</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentReviews.length > 0 ? (
            recentReviews.map((book) => {
              const likes = book.likes || [];
              const comments = book.comments || [];
              const isLiked = currentStudent ? likes.includes(currentStudent) : false;
              const isCommentsOpen = openComments.has(book.id);

              return (
                <div
                  key={book.id}
                  id={`review-card-${book.id}`}
                  className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base leading-snug">
                          {book.bookTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-indigo-600">
                            {book.studentName} 학생
                          </span>
                          {book.author && (
                            <span className="text-xs text-slate-400">
                              • {book.author}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400 text-xs shrink-0 font-bold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < book.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic leading-relaxed">
                      "{book.review}"
                    </p>
                  </div>

                  {/* Actions: Likes & Comments */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      id={`like-btn-${book.id}`}
                      type="button"
                      onClick={() => onToggleLike(book.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                        isLiked
                          ? 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? 'fill-pink-500 text-pink-500' : 'text-slate-400'
                        }`}
                      />
                      <span>추천 {likes.length}</span>
                    </button>

                    <button
                      id={`toggle-comments-${book.id}`}
                      type="button"
                      onClick={() => toggleCommentsView(book.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>댓글 {comments.length}</span>
                    </button>
                  </div>

                  {/* Expandable comments section */}
                  <AnimatePresence>
                    {isCommentsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-100 space-y-2 overflow-hidden"
                      >
                        {comments.length > 0 ? (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {comments.map((c) => {
                              const canDelete =
                                currentStudent &&
                                (currentStudent === c.author ||
                                  currentStudent === TEACHER_NAME);

                              return (
                                <div
                                  key={c.id}
                                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2"
                                >
                                  <div>
                                    <span className="font-bold text-indigo-700">
                                      {c.author}:
                                    </span>{' '}
                                    <span className="text-slate-700">{c.text}</span>
                                  </div>
                                  {canDelete && (
                                    <button
                                      onClick={() => onDeleteComment(book.id, c.id)}
                                      className="text-slate-400 hover:text-rose-600 shrink-0"
                                      title="댓글 삭제"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 text-center py-1">
                            첫 댓글을 남겨보세요!
                          </p>
                        )}

                        <div className="flex gap-2 pt-1">
                          <input
                            id={`input-comment-${book.id}`}
                            type="text"
                            value={commentInputs[book.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [book.id]: e.target.value
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCommentSubmit(book.id);
                              }
                            }}
                            placeholder={
                              currentStudent
                                ? `${currentStudent} 학생으로 따뜻한 한마디 남기기...`
                                : '로그인 후 댓글을 작성할 수 있습니다...'
                            }
                            className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-400 transition-colors"
                          />
                          <button
                            id={`submit-comment-${book.id}`}
                            onClick={() => handleCommentSubmit(book.id)}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span>등록</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white/10 rounded-2xl py-10 text-center text-white/70 border border-white/15">
              선택한 기간에는 아직 작성된 감상평이 없어요
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
