import { BookOpen, BarChart3, LogOut, RefreshCw, CheckCircle2, AlertTriangle, Settings, Sparkles } from 'lucide-react';
import { PageView, SyncStatus } from '../types';
import { TEACHER_NAME } from '../data/students';

interface NavbarProps {
  currentPage: PageView;
  currentStudent: string | null;
  syncStatus: SyncStatus;
  isReadingKing: boolean;
  onNavigate: (page: PageView) => void;
  onLogout: () => void;
  onRefreshSync: () => void;
  onOpenSettings: () => void;
}

export function Navbar({
  currentPage,
  currentStudent,
  syncStatus,
  isReadingKing,
  onNavigate,
  onLogout,
  onRefreshSync,
  onOpenSettings
}: NavbarProps) {
  const isTeacher = currentStudent === TEACHER_NAME;

  return (
    <header className="px-4 sm:px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left branding and student info */}
        <div className="flex items-center gap-3">
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate(currentStudent ? 'student' : 'login')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">학급 독서 기록</span>
                {isReadingKing && (
                  <span
                    id="nav-reading-king-badge"
                    className="shiny-badge inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    독서왕
                  </span>
                )}
              </div>
              {currentStudent ? (
                <p className="text-xs text-white/75">
                  <span className="font-semibold text-white">{currentStudent}</span>
                  {isTeacher ? ' (선생님)' : ' 학생'}의 서재
                </p>
              ) : (
                <p className="text-xs text-white/60">우리 반 함께하는 독서 여정</p>
              )}
            </div>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Sync indicator */}
          <button
            id="nav-sync-btn"
            onClick={onRefreshSync}
            title={
              syncStatus === 'syncing'
                ? '구글 시트와 동기화 중...'
                : syncStatus === 'synced'
                ? '구글 시트 연동 완료 (클릭하여 새로고침)'
                : syncStatus === 'error'
                ? '시트 연동 오류 (로컬에 안전하게 저장됨)'
                : '로컬 모드 (클릭하여 시트 동기화 시도)'
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white/90 transition-colors border border-white/10"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-300" />
            ) : syncStatus === 'synced' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {syncStatus === 'syncing'
                ? '동기화 중'
                : syncStatus === 'synced'
                ? '시트 연동됨'
                : '시트 확인'}
            </span>
          </button>

          {/* Settings button */}
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            title="구글 시트 연동 설정"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dashboard / Student view toggle */}
          {currentStudent && (
            <>
              {currentPage === 'dashboard' ? (
                <button
                  id="nav-my-books-btn"
                  onClick={() => onNavigate('student')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>내 서재</span>
                </button>
              ) : (
                <button
                  id="nav-dashboard-btn"
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>대시보드</span>
                </button>
              )}
            </>
          )}

          {/* Logout or Login button */}
          {currentStudent ? (
            <button
              id="nav-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs sm:text-sm transition-colors border border-white/10"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          ) : (
            <button
              id="nav-login-link-btn"
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
