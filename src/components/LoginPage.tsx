import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { BookOpen, BarChart3, UserCheck, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { TEACHER_NAME } from '../data/students';

interface LoginPageProps {
  students: string[];
  activeTab: string;
  onLogin: (studentName: string) => void;
  onViewDashboard: () => void;
  onOpenSettings?: () => void;
}

export function LoginPage({
  students,
  activeTab,
  onLogin,
  onViewDashboard,
  onOpenSettings
}: LoginPageProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    onLogin(selectedStudent);
  };

  return (
    <div id="login-page" className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl mb-3 shadow-lg shadow-indigo-500/25">
              📚
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span
                id="login-current-tab-badge"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
              >
                <Calendar className="w-3 h-3 text-indigo-600" />
                {activeTab}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              독서 기록
            </h1>
            <p className="text-sm mt-1.5 text-slate-500 font-medium">
              우리 반 함께하는 독서 여정
            </p>
          </div>

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="student-name-select"
                className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between"
              >
                <span>이름 선택</span>
                <span className="text-xs font-normal text-slate-400">총 {students.length}명</span>
              </label>
              <div className="relative">
                <select
                  id="student-name-select"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 text-slate-800 font-medium text-base bg-slate-50/50 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">이름을 선택하세요</option>
                  {students.map((name) => (
                    <option key={name} value={name}>
                      {name === TEACHER_NAME ? `${name} (선생님)` : name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Fast student chips for 1-click select */}
            <div>
              <span className="text-xs font-semibold text-slate-400 mb-2 block">빠른 선택</span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 pb-1">
                {students.map((name) => {
                  const isSelected = selectedStudent === name;
                  const isTeacher = name === TEACHER_NAME;
                  return (
                    <button
                      key={name}
                      type="button"
                      id={`chip-${name}`}
                      onClick={() => setSelectedStudent(name)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm scale-105'
                          : isTeacher
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isTeacher ? '👑 이창민 (선생님)' : name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={!selectedStudent}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>{selectedStudent ? `${selectedStudent}(으)로 시작하기` : '서재 입장하기'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">또는</span>
            </div>
          </div>

          {/* Quick Dashboard link */}
          <button
            id="btn-guest-dashboard"
            type="button"
            onClick={onViewDashboard}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>로그인 없이 학급 대시보드 둘러보기</span>
          </button>

          {onOpenSettings && (
            <div className="mt-4 pt-3 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs text-slate-400 hover:text-indigo-600 font-medium transition-colors"
              >
                ⚙️ 다른 학년도 기록 보기 / 새 탭 설정
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
