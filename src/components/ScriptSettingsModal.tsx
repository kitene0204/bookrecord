import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sheet,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Save,
  Target,
  Flame,
  RotateCcw,
  Sparkles,
  Calendar,
  Users,
  Copy,
  Plus,
  Trash2,
  Code
} from 'lucide-react';
import {
  getScriptUrl,
  setScriptUrl,
  getKnownSheetTabs,
  getRecommendedAppsScriptCode
} from '../services/sheetService';
import { DEFAULT_SCRIPT_URL, GOAL_BOOKS as DEFAULT_GOAL } from '../data/students';

interface ScriptSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestAndReload: () => Promise<void>;
  goalBooks: number;
  totalBooksCount: number;
  onSaveGoal: (newGoal: number) => void;
  activeTabName: string;
  onSwitchTab: (tabName: string) => Promise<void>;
  students: string[];
  onSaveStudents: (newStudents: string[]) => void;
  initialTab?: 'yearTab' | 'goal' | 'students' | 'sheet';
}

const PRESET_GOALS = [50, 100, 150, 200, 300, 500, 1000];

// Generate upcoming years up to 2040 (both '학년도' and '년' formats supported)!
const QUICK_YEAR_TABS = [
  '2026학년도',
  '2026년',
  '2027학년도',
  '2027년',
  '2028학년도',
  '2029학년도',
  '2030학년도',
  '2035학년도',
  '2040학년도'
];

export function ScriptSettingsModal({
  isOpen,
  onClose,
  onTestAndReload,
  goalBooks,
  totalBooksCount,
  onSaveGoal,
  activeTabName,
  onSwitchTab,
  students,
  onSaveStudents,
  initialTab = 'yearTab'
}: ScriptSettingsModalProps) {
  const [currentModalTab, setCurrentModalTab] = useState<'yearTab' | 'goal' | 'students' | 'sheet'>(initialTab);
  
  // Sheet Tab state
  const [targetTabInput, setTargetTabInput] = useState<string>(activeTabName);
  const [knownTabs, setKnownTabs] = useState<string[]>([]);
  const [tabSwitchResult, setTabSwitchResult] = useState<string | null>(null);
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // Goal state
  const [goalInput, setGoalInput] = useState<string>(goalBooks.toString());
  const [goalResult, setGoalResult] = useState<string | null>(null);

  // Students state
  const [studentsText, setStudentsText] = useState<string>('');
  const [studentsResult, setStudentsResult] = useState<string | null>(null);

  // Sheet URL state
  const [url, setUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getScriptUrl());
      setGoalInput(goalBooks.toString());
      setTargetTabInput(activeTabName);
      setKnownTabs(getKnownSheetTabs());
      setStudentsText(students.join(', '));
      setTestResult(null);
      setGoalResult(null);
      setTabSwitchResult(null);
      setStudentsResult(null);
      setCurrentModalTab(initialTab);
    }
  }, [isOpen, goalBooks, activeTabName, students, initialTab]);

  if (!isOpen) return null;

  // Parsed number for preview
  const parsedGoal = parseInt(goalInput, 10);
  const validGoal = !isNaN(parsedGoal) && parsedGoal > 0 ? parsedGoal : goalBooks;
  const previewPercent = Math.min(Math.round((totalBooksCount / validGoal) * 100), 100);

  // Switch sheet tab
  const handleApplyTab = async (tabToApply: string) => {
    const trimmed = tabToApply.trim();
    if (!trimmed) {
      setTabSwitchResult('시트 탭 이름을 입력해 주세요.');
      return;
    }
    setIsSwitchingTab(true);
    setTabSwitchResult(null);
    try {
      await onSwitchTab(trimmed);
      setTargetTabInput(trimmed);
      setKnownTabs(getKnownSheetTabs());
      setTabSwitchResult(`[${trimmed}] 탭으로 성공적으로 전환되었습니다!`);
    } catch {
      setTabSwitchResult(`[${trimmed}] 탭으로 로컬 전환 완료 (시트 연결 상태를 확인하세요)`);
    } finally {
      setIsSwitchingTab(false);
    }
  };

  // Save Goal
  const handleSaveGoal = () => {
    const num = parseInt(goalInput.trim(), 10);
    if (isNaN(num) || num <= 0) {
      setGoalResult('1권 이상의 올바른 숫자를 입력해 주세요.');
      return;
    }
    onSaveGoal(num);
    setGoalResult(`학급 독서 목표가 ${num.toLocaleString()}권으로 저장되었습니다!`);
  };

  // Save Students
  const handleSaveStudentsList = () => {
    // split by comma, newline or space
    const parsed = studentsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      setStudentsResult('최소 1명 이상의 학생 이름을 입력해 주세요.');
      return;
    }

    // Always keep teacher at the end if not present
    let finalStudents = [...parsed];
    if (!finalStudents.includes('이창민')) {
      finalStudents.push('이창민');
    }

    onSaveStudents(finalStudents);
    setStudentsResult(`총 ${finalStudents.length}명의 학생 명단이 저장되었습니다!`);
  };

  const handleCopyScriptCode = () => {
    const code = getRecommendedAppsScriptCode();
    navigator.clipboard.writeText(code);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2500);
  };

  // Google Sheet URL actions
  const handleSaveUrl = () => {
    setScriptUrl(url.trim());
    setTestResult('구글 시트 URL이 저장되었습니다.');
  };

  const handleResetDefaultUrl = () => {
    setUrl(DEFAULT_SCRIPT_URL);
    setScriptUrl(DEFAULT_SCRIPT_URL);
    setTestResult('기본 웹앱 URL로 재설정되었습니다.');
  };

  const handleTestUrl = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      setScriptUrl(url.trim());
      await onTestAndReload();
      setTestResult('구글 시트 연동 테스트 완료!');
    } catch {
      setTestResult('시트 연동 상태를 확인하세요 (로컬 저장소는 정상 작동합니다).');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="settings-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="settings-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">학급 환경 설정</h3>
                <p className="text-xs text-slate-500">
                  현재 탭: <strong className="text-indigo-600">{activeTabName}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (4 categories) */}
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1 mb-5">
            <button
              id="tab-btn-yearTab"
              type="button"
              onClick={() => setCurrentModalTab('yearTab')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                currentModalTab === 'yearTab'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>시트 탭/학년도</span>
            </button>

            <button
              id="tab-btn-students"
              type="button"
              onClick={() => setCurrentModalTab('students')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                currentModalTab === 'students'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>학생 명단</span>
            </button>

            <button
              id="tab-btn-goal"
              type="button"
              onClick={() => setCurrentModalTab('goal')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                currentModalTab === 'goal'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>목표 권 수</span>
            </button>

            <button
              id="tab-btn-sheet"
              type="button"
              onClick={() => setCurrentModalTab('sheet')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                currentModalTab === 'sheet'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>연동 URL</span>
            </button>
          </div>

          {/* TAB 1: Year Sheet Tab Switcher (2026 ~ 2040+) */}
          {currentModalTab === 'yearTab' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 leading-relaxed">
                <div className="font-extrabold flex items-center gap-1.5 text-indigo-950 mb-1">
                  <span>📅 구글 시트 탭(Sheet Name) 자동 분리</span>
                </div>
                <p>
                  내년 아이들의 기록을 새 탭에 적어가면서 <strong>올해(2026학년도) 아이들의 기록은 안전하게 보존</strong>할 수 있습니다.
                </p>
                <p className="mt-1 text-[11px] text-indigo-700">
                  선생님께서 2040년까지 교직에 계셔도 매년 시트 탭 이름만 입력하시면 앱이 해당 탭을 읽고 씁니다!
                </p>
              </div>

              {/* Direct Tab Input */}
              <div>
                <label
                  htmlFor="setting-sheet-tab-input"
                  className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
                >
                  <span>사용할 시트 탭 이름 직접 입력</span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    구글 시트의 탭(워크시트) 이름과 일치
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="setting-sheet-tab-input"
                    type="text"
                    value={targetTabInput}
                    onChange={(e) => {
                      setTargetTabInput(e.target.value);
                      setTabSwitchResult(null);
                    }}
                    placeholder="예: 2027학년도, 2028학년도, 4학년2반..."
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-800 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  />
                  <button
                    id="btn-apply-sheet-tab"
                    type="button"
                    onClick={() => handleApplyTab(targetTabInput)}
                    disabled={isSwitchingTab || !targetTabInput.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSwitchingTab ? 'animate-spin' : ''}`} />
                    <span>{isSwitchingTab ? '전환 중...' : '이 탭으로 적용'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Year Presets (2026 ~ 2040) */}
              <div>
                <span className="block text-xs font-bold text-slate-600 mb-2">
                  학년도 빠른 선택 (클릭 즉시 전환):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_YEAR_TABS.map((tab) => {
                    const isCurrent = activeTabName === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleApplyTab(tab)}
                        disabled={isSwitchingTab}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                            : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isCurrent && <CheckCircle2 className="w-3 h-3 text-amber-300" />}
                        <span>{tab}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {tabSwitchResult && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{tabSwitchResult}</span>
                </div>
              )}

              {/* Guide on how it works */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    새 학년도 탭 준비 꿀팁
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowScriptCode(!showScriptCode)}
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Code className="w-3 h-3" />
                    {showScriptCode ? '스크립트 닫기' : '최신 Apps Script 코드 보기'}
                  </button>
                </div>
                <p>
                  1. 구글 스프레드시트 아래쪽 <strong>[+]</strong> 버튼으로 <strong>2027학년도</strong> 탭을 만드세요.
                </p>
                <p>
                  2. 2026학년도 탭의 1행 제목(ID, 학생명, 책제목...)을 복사해서 새 탭 1행에 붙여넣으면 준비 끝!
                </p>
                <p>
                  3. 지난 2026학년도 아이들의 기록을 다시 보고 싶다면 언제든 위의 <strong>[2026학년도]</strong>를 누르면 그대로 열람됩니다.
                </p>

                {showScriptCode && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px]">
                        Google Apps Script (새 탭 자동 생성 지원 코드)
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyScriptCode}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopiedCode ? '복사 완료!' : '코드 복사'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono max-h-40 overflow-y-auto leading-relaxed">
                      {getRecommendedAppsScriptCode()}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Students List Manager */}
          {currentModalTab === 'students' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-purple-900 leading-relaxed">
                <div className="font-extrabold flex items-center gap-1.5 text-purple-950 mb-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>내년 새 학급 아이들 명단 입력</span>
                </div>
                <p>
                  내년에 학생 명단이 바뀌면 나이스(NEIS)나 엑셀에서 학생 명단을 복사해 아래에 붙여넣으세요.
                  (쉼표 또는 줄바꿈으로 구분)
                </p>
              </div>

              <div>
                <label
                  htmlFor="setting-students-textarea"
                  className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
                >
                  <span>학생 명단 (현재 {students.length}명)</span>
                  <span className="text-[11px] text-purple-600 font-medium">쉼표(,)나 줄바꿈으로 입력</span>
                </label>
                <textarea
                  id="setting-students-textarea"
                  rows={5}
                  value={studentsText}
                  onChange={(e) => {
                    setStudentsText(e.target.value);
                    setStudentsResult(null);
                  }}
                  placeholder="예: 강윤찬, 강주연, 김민지, 김세은, ..."
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-slate-50 transition-colors leading-relaxed"
                />
              </div>

              {studentsResult && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{studentsResult}</span>
                </div>
              )}

              <button
                id="btn-save-students"
                type="button"
                onClick={handleSaveStudentsList}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                <Save className="w-4 h-4" />
                <span>학생 명단 저장 및 로그인 목록에 즉시 반영</span>
              </button>
            </div>
          )}

          {/* TAB 3: Goal Books Setting */}
          {currentModalTab === 'goal' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <h4 className="font-extrabold text-amber-950 text-sm">
                    학급 독서 온도계 목표 권 수
                  </h4>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  100권보다 더 높은 목표(예: 150권, 200권, 500권 등)를 사용자가 직접 원하는 숫자로 기입할 수 있습니다.
                </p>
              </div>

              {/* Direct Input Field */}
              <div>
                <label
                  htmlFor="setting-goal-books-input"
                  className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
                >
                  <span>목표 권 수 직접 기입</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    100권 이상 자유 기입 가능
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="setting-goal-books-input"
                    type="number"
                    min="1"
                    max="99999"
                    step="1"
                    value={goalInput}
                    onChange={(e) => {
                      setGoalInput(e.target.value);
                      setGoalResult(null);
                    }}
                    placeholder="예: 150, 200, 300, 500, 1000"
                    className="w-full px-4 py-3 pr-12 text-base font-extrabold text-slate-800 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 bg-white transition-colors shadow-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                    권
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-xs font-bold text-slate-600 mb-2">
                  추천 목표 빠른 선택:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_GOALS.map((preset) => {
                    const isSelected = parsedGoal === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setGoalInput(preset.toString());
                          setGoalResult(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {preset.toLocaleString()}권
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    미리보기 ({activeTabName})
                  </span>
                  <span>
                    {totalBooksCount} / {validGoal.toLocaleString()}권 ({previewPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${previewPercent}%`,
                      background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 60%, #ec4899 100%)'
                    }}
                  />
                </div>
              </div>

              {goalResult && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{goalResult}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  id="btn-save-goal"
                  type="button"
                  onClick={handleSaveGoal}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>목표 권 수 저장</span>
                </button>
                <button
                  id="btn-reset-goal"
                  type="button"
                  onClick={() => {
                    setGoalInput(DEFAULT_GOAL.toString());
                    onSaveGoal(DEFAULT_GOAL);
                    setGoalResult(`목표가 기본 ${DEFAULT_GOAL}권으로 재설정되었습니다.`);
                  }}
                  title="기본 100권으로 복원"
                  className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>100권 복원</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Google Apps Script Web App URL */}
          {currentModalTab === 'sheet' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Google Apps Script 웹 앱 URL</span>
                  <span className="text-[11px] text-emerald-600 font-medium">자동 누가기록 연동</span>
                </label>
                <textarea
                  id="setting-script-url"
                  rows={3}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50 transition-colors"
                />
              </div>

              {testResult && (
                <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl text-xs flex items-center gap-2 border border-indigo-100">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>연동 안내</span>
                </div>
                <p>• 구글 시트에 연결된 Apps Script Web App URL로 독서 기록이 실시간 전송(누가기록)됩니다.</p>
                <p>• 현재 설정된 시트 탭(<strong>{activeTabName}</strong>)으로 자동 저장/조회됩니다.</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  id="btn-test-sheet"
                  type="button"
                  onClick={handleTestUrl}
                  disabled={isTesting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? '동기화 중...' : '시트 데이터 불러오기'}</span>
                </button>

                <button
                  id="btn-save-url"
                  type="button"
                  onClick={handleSaveUrl}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>URL 저장</span>
                </button>

                <button
                  id="btn-reset-default"
                  type="button"
                  onClick={handleResetDefaultUrl}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
                >
                  기본값 복원
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
