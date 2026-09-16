import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { BookOpen, BarChart3, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { STUDENTS, TEACHER_NAME } from '../data/students';

interface LoginPageProps {
  onLogin: (studentName: string) => void;
  onViewDashboard: () => void;
}

export function LoginPage({ onLogin, onViewDashboard }: LoginPageProps) {
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
                <span className="text-xs font-normal text-slate-400">총 {STUDENTS.length}명</span>
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
                  {STUDENTS.map((name) => (
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
                {STUDENTS.map((name) => {
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

            <button
              id="login-submit-btn"
              type="submit"
              disabled={!selectedStudent}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>{selectedStudent ? `${selectedStudent}으로 시작하기` : '로그인'}</span>
            </button>
          </form>

          {/* Teacher & Dashboard direct button */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <button
              id="login-dashboard-btn"
              onClick={onViewDashboard}
              type="button"
              className="w-full py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/80 transition-colors flex justify-center items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>선생님 & 전체 학급 대시보드 보기</span>
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>기록한 독서 내역은 구글 시트와 실시간 연동됩니다.</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
