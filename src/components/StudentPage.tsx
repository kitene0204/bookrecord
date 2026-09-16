import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookPlus, Star, Calendar, Edit2, Trash2, Search, Sparkles, BookOpen } from 'lucide-react';
import { BookRecord } from '../types';

interface StudentPageProps {
  currentStudent: string;
  books: BookRecord[];
  onOpenAddModal: () => void;
  onEditBook: (book: BookRecord) => void;
  onDeleteBook: (book: BookRecord) => void;
  onGoDashboard: () => void;
}

export function StudentPage({
  currentStudent,
  books,
  onOpenAddModal,
  onEditBook,
  onDeleteBook
}: StudentPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'title'>('latest');

  // Filter books for the current student
  const studentBooks = useMemo(() => {
    return books.filter((b) => b.studentName === currentStudent);
  }, [books, currentStudent]);

  // Derived stats
  const totalCount = studentBooks.length;
  const isReadingKing = totalCount >= 10;

  const avgRating = useMemo(() => {
    const rated = studentBooks.filter((b) => b.rating > 0);
    if (rated.length === 0) return '-';
    const sum = rated.reduce((acc, b) => acc + b.rating, 0);
    return (sum / rated.length).toFixed(1);
  }, [studentBooks]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return studentBooks.filter((b) => b.endDate && b.endDate.startsWith(ym)).length;
  }, [studentBooks]);

  // Filtered and sorted books
  const displayBooks = useMemo(() => {
    let result = [...studentBooks];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookTitle.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.review.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
    } else {
      // latest created or completed
      result.sort((a, b) => {
        const dateA = new Date(a.endDate || a.createdAt).getTime();
        const dateB = new Date(b.endDate || b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    return result;
  }, [studentBooks, searchTerm, sortBy]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${y}.${m}.${d}`;
      const dObj = new Date(dateStr);
      return `${dObj.getFullYear()}.${String(dObj.getMonth() + 1).padStart(2, '0')}.${String(dObj.getDate()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="student-page-view" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with greeting and quick stats */}
      <section className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-white/20 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentStudent}님의 독서 기록
              </h1>
              {isReadingKing && (
                <span
                  id="student-reading-king-badge"
                  className="shiny-badge inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-black px-3 py-1 rounded-full border border-amber-300 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  👑 독서왕
                </span>
              )}
            </div>
            <p className="text-sm text-white/80">
              {isReadingKing
                ? '대단해요! 10권 이상 완독하여 독서왕 칭호를 획득했습니다.'
                : `현재 ${totalCount}권 완독 중! 10권을 채워 독서왕 뱃지를 획득해 보세요.`}
            </p>
          </div>

          <button
            id="student-add-book-cta"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-700/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <BookPlus className="w-5 h-5" />
            <span>새 독서 기록 추가</span>
          </button>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
            <div id="stat-total-books" className="text-2xl sm:text-4xl font-extrabold">
              {totalCount}
            </div>
            <div className="text-xs sm:text-sm text-white/75 mt-1 font-medium">읽은 책</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
            <div id="stat-avg-rating" className="text-2xl sm:text-4xl font-extrabold flex items-center justify-center gap-1 text-amber-300">
              <span>{avgRating}</span>
              {avgRating !== '-' && <span className="text-lg">★</span>}
            </div>
            <div className="text-xs sm:text-sm text-white/75 mt-1 font-medium">평균 별점</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
            <div id="stat-this-month" className="text-2xl sm:text-4xl font-extrabold text-emerald-300">
              {thisMonthCount}
            </div>
            <div className="text-xs sm:text-sm text-white/75 mt-1 font-medium">이번 달 완독</div>
          </div>
        </div>
      </section>

      {/* Book Search & Filter Controls */}
      {studentBooks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              id="student-book-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="책 제목, 저자, 감상평 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/25 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-white/70">정렬:</span>
            <select
              id="student-book-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'rating' | 'title')}
              className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white text-xs font-medium focus:outline-none focus:bg-white/25 transition-colors cursor-pointer"
            >
              <option value="latest" className="bg-slate-800 text-white">최신 완독순</option>
              <option value="rating" className="bg-slate-800 text-white">별점 높은순</option>
              <option value="title" className="bg-slate-800 text-white">책 이름순</option>
            </select>
          </div>
        </div>
      )}

      {/* Book List */}
      <div className="space-y-4">
        {displayBooks.length > 0 ? (
          <div id="books-list" className="space-y-4">
            <AnimatePresence>
              {displayBooks.map((book) => {
                const isUrl = book.coverUrl.startsWith('http');

                return (
                  <motion.div
                    key={book.id}
                    id={`book-card-${book.id}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all border border-slate-100 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                  >
                    {/* Cover: Image or Emoji */}
                    <div className="shrink-0 self-center sm:self-start">
                      {isUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.bookTitle}
                          className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-2xl shadow-md border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-4xl sm:text-5xl shadow-sm border border-indigo-100">
                          {book.coverUrl || '📕'}
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl leading-snug">
                            {book.bookTitle}
                          </h3>
                          {book.author && (
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                              {book.author} 지음
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`edit-btn-${book.id}`}
                            onClick={() => onEditBook(book)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="수정하기"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-btn-${book.id}`}
                            onClick={() => onDeleteBook(book)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="삭제하기"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stars & Completion Date */}
                      <div className="flex flex-wrap items-center gap-3 my-2.5">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-600 ml-1.5">
                            {book.rating}점
                          </span>
                        </div>

                        {book.endDate && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(book.endDate)} 완독</span>
                          </div>
                        )}

                        {book.likes && book.likes.length > 0 && (
                          <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full border border-rose-100">
                            ❤️ 친구 추천 {book.likes.length}
                          </span>
                        )}

                        {book.comments && book.comments.length > 0 && (
                          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                            💬 댓글 {book.comments.length}
                          </span>
                        )}
                      </div>

                      {/* Review snippet */}
                      {book.review ? (
                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                          {book.review}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">작성된 감상평이 없습니다.</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <div
            id="empty-message"
            className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center border border-white/15 text-white"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/20 mx-auto flex items-center justify-center text-4xl mb-4 shadow-inner">
              📖
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">
              {searchTerm ? '검색 결과가 없습니다' : '아직 기록된 책이 없어요'}
            </h3>
            <p className="text-white/70 text-sm max-w-sm mx-auto mb-6">
              {searchTerm
                ? '다른 검색어로 다시 찾아보세요.'
                : '읽은 책을 등록하고 나만의 멋진 독서 기록장을 채워보세요!'}
            </p>
            {!searchTerm && (
              <button
                id="empty-add-btn"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-700/30 transition-all hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                <span>첫 번째 책 추가하기</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
