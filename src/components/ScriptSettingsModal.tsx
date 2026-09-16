import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sheet, CheckCircle2, RefreshCw, ExternalLink, HelpCircle, Save } from 'lucide-react';
import { getScriptUrl, setScriptUrl } from '../services/sheetService';
import { DEFAULT_SCRIPT_URL } from '../data/students';

interface ScriptSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestAndReload: () => Promise<void>;
}

export function ScriptSettingsModal({ isOpen, onClose, onTestAndReload }: ScriptSettingsModalProps) {
  const [url, setUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getScriptUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setScriptUrl(url.trim());
    setTestResult('저장되었습니다.');
  };

  const handleResetDefault = () => {
    setUrl(DEFAULT_SCRIPT_URL);
    setScriptUrl(DEFAULT_SCRIPT_URL);
    setTestResult('기본 웹앱 URL로 재설정되었습니다.');
  };

  const handleTest = async () => {
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
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100"
        >
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sheet className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">구글 시트 연동 설정</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                onClick={handleTest}
                disabled={isTesting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? '동기화 중...' : '시트 데이터 불러오기'}</span>
              </button>

              <button
                id="btn-save-url"
                type="button"
                onClick={handleSave}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>URL 저장</span>
              </button>

              <button
                id="btn-reset-default"
                type="button"
                onClick={handleResetDefault}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
              >
                기본값 복원
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
