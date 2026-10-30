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
  Sparkles
} from 'lucide-react';
import { getScriptUrl, setScriptUrl } from '../services/sheetService';
import { DEFAULT_SCRIPT_URL, GOAL_BOOKS as DEFAULT_GOAL } from '../data/students';

interface ScriptSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestAndReload: () => Promise<void>;
  goalBooks: number;
  totalBooksCount: number;
  onSaveGoal: (newGoal: number) => void;
  initialTab?: 'goal' | 'sheet';
}

const PRESET_GOALS = [50, 100, 150, 200, 300, 500, 1000];

export function ScriptSettingsModal({
  isOpen,
  onClose,
  onTestAndReload,
  goalBooks,
  totalBooksCount,
  onSaveGoal,
  initialTab = 'goal'
}: ScriptSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'goal' | 'sheet'>(initialTab);
  const [goalInput, setGoalInput] = useState<string>(goalBooks.toString());
  const [url, setUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [goalResult, setGoalResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getScriptUrl());
      setGoalInput(goalBooks.toString());
      setTestResult(null);
      setGoalResult(null);
      setActiveTab(initialTab);
    }
  }, [isOpen, goalBooks, initialTab]);

  if (!isOpen) return null;

  // Parsed number for preview
  const parsedGoal = parseInt(goalInput, 10);
  const validGoal = !isNaN(parsedGoal) && parsedGoal > 0 ? parsedGoal : goalBooks;
  const previewPercent = Math.min(Math.round((totalBooksCount / validGoal) * 100), 100);

  const handleSaveGoal = () => {
    const num = parseInt(goalInput.trim(), 10);
    if (isNaN(num) || num <= 0) {
      setGoalResult('1권 이상의 올바른 숫자를 입력해 주세요.');
      return;
    }
    onSaveGoal(num);
    setGoalResult(`학급 독서 목표가 ${num.toLocaleString()}권으로 저장되었습니다!`);
  };

  const handlePresetSelect = (preset: number) => {
    setGoalInput(preset.toString());
    setGoalResult(null);
  };

  const handleResetGoalDefault = () => {
    setGoalInput(DEFAULT_GOAL.toString());
    onSaveGoal(DEFAULT_GOAL);
    setGoalResult(`목표가 기본 ${DEFAULT_GOAL}권으로 재설정되었습니다.`);
  };

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
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">학급 환경 설정</h3>
                <p className="text-xs text-slate-500">목표 권 수 및 시트 연동 관리</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
            <button
              id="tab-goal-settings"
              type="button"
              onClick={() => setActiveTab('goal')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'goal'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>목표 권 수 설정</span>
            </button>
            <button
              id="tab-sheet-settings"
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'sheet'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sheet className="w-4 h-4 text-emerald-600" />
              <span>구글 시트 연동</span>
            </button>
          </div>

          {/* Tab 1: Goal Books Setting */}
          {activeTab === 'goal' && (
            <div className="space-y-5">
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
                <p className="text-[11px] text-slate-500 mt-1">
                  * 숫자를 직접 타이핑하거나 아래의 추천 목표를 눌러 선택하세요.
                </p>
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
                        onClick={() => handlePresetSelect(preset)}
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
                    미리보기
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
                <p className="text-[11px] text-slate-500">
                  대시보드의 학급 독서 온도계와 통계에 실시간 반영됩니다.
                </p>
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
                  onClick={handleResetGoalDefault}
                  title="기본 100권으로 복원"
                  className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>100권 복원</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Sheet Settings */}
          {activeTab === 'sheet' && (
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
                <p>• 브라우저 로컬 저장소에도 1차 자동 저장되므로 네트워크가 불안정해도 기록이 안전합니다.</p>
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
