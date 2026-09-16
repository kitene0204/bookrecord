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
  BookOpen
} from 'lucide-react';
import { BookRecord, CommentItem } from '../types';
import { GOAL_BOOKS } from '../data/students';

interface DashboardPageProps {
  books: BookRecord[];
  currentStudent: string | null;
  onToggleLike: (bookId: string) => void;
  onAddComment: (bookId: string, text: string) => void;
  onDeleteComment: (bookId: string, commentId: string) => void;
  onRequireLogin: () => void;
}

export function DashboardPage({
  books,
  currentStudent,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onRequireLogin
}: DashboardPageProps) {
  // Current view date for month selection
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
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

  // Total class stats across all time
  const totalBooksCount = books.length;
  const overallAvgRating = useMemo(() => {
    const rated = books.filter((b) => b.rating > 0);
    if (rated.length === 0) return '-';
    return (rated.reduce((acc, b) => acc + b.rating, 0) / rated.length).toFixed(1);
  }, [books]);

  // Thermometer progress
  const thermoPercent = Math.min(Math.round((totalBooksCount / GOAL_BOOKS) * 100), 100);

  // Filter books completed in the selected month
  const monthBooks = useMemo(() => {
    return books.filter((b) => {
      const d = b.endDate || b.createdAt;
      return d && d.startsWith(monthYearStr);
    });
  }, [books, monthYearStr]);

  const monthBooksCount = monthBooks.length;

  // Top Readers (1st to 5th) in the selected month
  const topReaders = useMemo(() => {
    const countMap: Record<string, number> = {};
    monthBooks.forEach((b) => {
      if (b.studentName) {
        countMap[b.studentName] = (countMap[b.studentName] || 0) + 1;
      }
    });

    const entries = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const uniqueScores = [...new Set(entries.map((e) => e[1]))].slice(0, 5);

    return uniqueScores.map((score, rankIndex) => {
      const students = entries.filter((e) => e[1] === score).map((e) => e[0]);
      return {
        rankIndex,
        score,
        students
      };
    });
  }, [monthBooks]);

  // Recent reviews in the selected month
  const recentReviews = useMemo(() => {
    return monthBooks
      .filter((b) => b.review && b.review.trim().length > 0)
      .sort((a, b) => new Date(b.createdAt || b.endDate).getTime() - new Date(a.createdAt || a.endDate).getTime())
      .slice(0, 8);
  }, [monthBooks]);

  // Student summary grid for the selected month
  const studentSummary = useMemo(() => {
    const map: Record<string, BookRecord[]> = {};
    monthBooks.forEach((b) => {
      if (!map[b.studentName]) map[b.studentName] = [];
      map[b.studentName].push(b);
    });

    return Object.entries(map).map(([name, bList]) => {
      const rated = bList.filter((b) => b.rating > 0);
      const avg =
        rated.length > 0
          ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
          : '-';
      return {
        name,
        count: bList.length,
        avg
      };
    });
  }, [monthBooks]);

  const toggleCommentsView = (bookId: string) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });
  };

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

  const studentCardGradients = [
    'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.85) 100%)',
    'linear-gradient(135deg, rgba(236, 72, 153, 0.8) 0%, rgba(190, 24, 93, 0.85) 100%)',
    'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.85) 100%)',
    'linear-gradient(135deg, rgba(249, 115, 22, 0.8) 0%, rgba(217, 119, 6, 0.85) 100%)',
    'linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(126, 34, 206, 0.85) 100%)',
    'linear-gradient(135deg, rgba(14, 165, 233, 0.8) 0%, rgba(2, 132, 199, 0.85) 100%)'
  ];

  return (
    <div id="dashboard-view" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Month Navigation Control */}
      <div className="flex justify-center items-center gap-4 py-1">
        <button
          id="btn-prev-month"
          onClick={() => changeMonth(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all backdrop-blur-md border border-white/20 shadow-md hover:scale-105 active:scale-95"
          title="이전 달"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2
          id="month-display"
          className="text-2xl sm:text-3xl font-black text-white drop-shadow-md min-w-[200px] text-center tracking-wider"
        >
          {year}년 {month}월
        </h2>

        <button
          id="btn-next-month"
          onClick={() => changeMonth(1)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all backdrop-blur-md border border-white/20 shadow-md hover:scale-105 active:scale-95"
          title="다음 달"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thermometer Goal Section */}
      <section className="bg-white/10 p-6 sm:p-7 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              학급 독서 온도계 (목표 {GOAL_BOOKS}권)
            </h2>
          </div>
          <span id="thermo-text" className="text-white font-black text-base sm:text-lg">
            {totalBooksCount} / {GOAL_BOOKS} 권 ({thermoPercent}%)
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

        <p className="text-xs text-white/70 mt-2.5 flex items-center justify-between">
          <span>🎯 우리 반 친구들이 함께 힘을 모아 100권 독서를 달성해 봐요!</span>
          {totalBooksCount >= GOAL_BOOKS && (
            <span className="text-amber-300 font-bold animate-bounce">🎉 100권 달성 완료! 축하합니다!</span>
          )}
        </p>
      </section>

      {/* 3 Summary Statistics Cards */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>📊 전체 통계 현황</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total books */}
          <div
            className="backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-lg border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.9) 100%)'
            }}
          >
            <div id="dash-total-books" className="text-4xl sm:text-5xl font-black">
              {totalBooksCount}
            </div>
            <p className="text-sm font-medium opacity-90 mt-2">우리 반 총 누적 독서량</p>
          </div>

          {/* Average rating */}
          <div
            className="backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-lg border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.85) 0%, rgba(190, 24, 93, 0.9) 100%)'
            }}
          >
            <div id="dash-avg-rating" className="text-4xl sm:text-5xl font-black flex items-center justify-center gap-1.5">
              <span>{overallAvgRating}</span>
              {overallAvgRating !== '-' && <span className="text-2xl text-amber-300">★</span>}
            </div>
            <p className="text-sm font-medium opacity-90 mt-2">전체 평균 독서 별점</p>
          </div>

          {/* Selected month read count */}
          <div
            className="backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-lg border border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(22, 163, 74, 0.9) 100%)'
            }}
          >
            <div id="dash-month" className="text-4xl sm:text-5xl font-black">
              {monthBooksCount}
            </div>
            <p className="text-sm font-medium opacity-90 mt-2">{month}월 한 달 독서량</p>
          </div>
        </div>
      </section>

      {/* Top Readers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>🏆 {month}월 우수 독자 (1~5위)</span>
          </h2>
        </div>

        <div id="top-readers" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {topReaders.length > 0 ? (
            topReaders.map((tier) => {
              const style = medalStyles[tier.rankIndex] || medalStyles[4];
              const isFirst = tier.rankIndex === 0;

              return tier.students.map((name) => (
                <motion.div
                  key={name}
                  id={`top-reader-${name}`}
                  whileHover={{ scale: 1.04 }}
                  className={`relative shiny-badge rounded-3xl p-5 text-center text-white shadow-xl transition-all border ${
                    isFirst
                      ? 'border-yellow-200 ring-4 ring-yellow-400/40 z-10'
                      : 'border-white/20'
                  }`}
                  style={{
                    background: style.gradient,
                    boxShadow: `0 10px 25px ${style.glow}35`
                  }}
                >
                  {isFirst && (
                    <div className="absolute -top-4 -right-2 text-3xl animate-bounce drop-shadow-md select-none">
                      👑
                    </div>
                  )}

                  <div className="text-2xl font-black mb-2 drop-shadow-sm">{style.label}</div>
                  <div className="font-black text-lg mb-1 truncate">{name}</div>
                  <p className="text-xs sm:text-sm font-bold opacity-95">
                    {tier.score}권 완독! 🎉
                  </p>
                </motion.div>
              ));
            })
          ) : (
            <div className="col-span-full bg-white/10 rounded-2xl py-10 text-center text-white/70 border border-white/15">
              {month}월에는 아직 기록된 완독 도서가 없어요 😅
            </div>
          )}
        </div>
      </section>

      {/* Live Reviews Feed Section with Likes & Comments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-300" />
            <span>💬 {month}월 친구들의 생생한 독서 리뷰</span>
          </h2>
        </div>

        <div id="recent-feed" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentReviews.length > 0 ? (
            recentReviews.map((book) => {
              const isUrl = book.coverUrl.startsWith('http');
              const likes = book.likes || [];
              const comments = book.comments || [];
              const isLiked = currentStudent ? likes.includes(currentStudent) : false;
              const isCommentsOpen = openComments.has(book.id);

              return (
                <div
                  key={book.id}
                  id={`feed-card-${book.id}`}
                  className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col justify-between"
                >
                  <div>
                    {/* Top book & author info */}
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        {isUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.bookTitle}
                            className="w-16 h-22 object-cover rounded-xl shadow-sm border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-22 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-3xl shadow-sm border border-indigo-100">
                            {book.coverUrl || '📕'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            {book.studentName} 학생
                          </span>
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-base truncate">
                          {book.bookTitle}
                        </h4>
                        {book.author && (
                          <p className="text-xs text-slate-400 truncate">{book.author} 지음</p>
                        )}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 p-3 bg-slate-50 rounded-2xl leading-relaxed whitespace-pre-line border border-slate-100 line-clamp-3">
                      {book.review}
                    </p>
                  </div>

                  {/* Actions: Likes and Comments toggle */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {book.endDate ? `${book.endDate} 완독` : ''}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-comments-${book.id}`}
                        onClick={() => toggleCommentsView(book.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>댓글 {comments.length}</span>
                      </button>

                      <button
                        id={`btn-like-${book.id}`}
                        onClick={() => onToggleLike(book.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isLiked
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 heart-bump'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>추천 {likes.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Comments Drawer */}
                  <AnimatePresence>
                    {isCommentsOpen && (
                      <motion.div
                        id={`comments-drawer-${book.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 overflow-hidden"
                      >
                        {/* List of comments */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {comments.length > 0 ? (
                            comments.map((c) => {
                              const isAuthor = c.author === book.studentName;
                              const isMyComment = c.author === currentStudent;

                              return (
                                <div
                                  key={c.id}
                                  className="bg-slate-50 p-2.5 rounded-xl text-xs flex items-start justify-between gap-2 border border-slate-100 group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span
                                        className={`font-bold ${
                                          isAuthor ? 'text-pink-600' : 'text-indigo-600'
                                        }`}
                                      >
                                        {c.author}
                                      </span>
                                      {isAuthor && (
                                        <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-md font-semibold">
                                          글쓴이
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-700 break-words leading-relaxed">
                                      {c.text}
                                    </p>
                                  </div>

                                  {isMyComment && (
                                    <button
                                      id={`btn-del-comment-${c.id}`}
                                      onClick={() => onDeleteComment(book.id, c.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                      title="댓글 삭제"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center text-xs text-slate-400 py-3">
                              아직 댓글이 없어요. 친구에게 첫 번째 칭찬과 응원의 댓글을 남겨보세요!
                            </p>
                          )}
                        </div>

                        {/* Comment input form */}
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
              {month}월에는 아직 작성된 감상평이 없어요
            </div>
          )}
        </div>
      </section>

      {/* Student Grid Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-300" />
            <span>👥 {month}월 학생별 독서 현황</span>
          </h2>
        </div>

        <div id="students-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentSummary.length > 0 ? (
            studentSummary.map((st, idx) => {
              const bg = studentCardGradients[idx % studentCardGradients.length];
              const isKing = st.count >= 10;

              return (
                <div
                  key={st.name}
                  id={`student-grid-${st.name}`}
                  className="backdrop-blur-md rounded-3xl p-5 text-white shadow-lg border border-white/15 transition-all hover:scale-[1.02]"
                  style={{ background: bg }}
                >
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-white/25 shadow-inner">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-base flex items-center gap-1">
                        <span>{st.name}</span>
                        {isKing && <span title="독서왕 뱃지">👑</span>}
                      </div>
                      <div className="text-xs opacity-85 font-medium">{st.count}권 완독 달성</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                      <div className="text-xl font-black">{st.count}</div>
                      <div className="text-[11px] opacity-80 mt-0.5">읽은 책</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                      <div className="text-xl font-black flex items-center justify-center gap-1">
                        <span>{st.avg}</span>
                        {st.avg !== '-' && <span className="text-sm">★</span>}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">평균 별점</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              id="no-students"
              className="col-span-full bg-white/10 rounded-2xl py-12 text-center text-white/70 border border-white/15"
            >
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p id="no-students-text">{month}월에는 아직 학생별 독서 기록이 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
