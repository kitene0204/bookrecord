import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, BookOpen, Calendar, User } from 'lucide-react';
import { BookRecord } from '../types';

interface BookModalProps {
  isOpen: boolean;
  editingBook: BookRecord | null;
  currentStudent: string;
  onClose: () => void;
  onSave: (bookData: {
    id?: string;
    studentName: string;
    bookTitle: string;
    author: string;
    startDate: string;
    endDate: string;
    rating: number;
    review: string;
    coverUrl: string;
  }) => void;
}

const COVER_EMOJIS = ['📕', '📙', '📗', '📘', '📔'];

export function BookModal({
  isOpen,
  editingBook,
  currentStudent,
  onClose,
  onSave
}: BookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [coverUrl, setCoverUrl] = useState('📕');

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.bookTitle || '');
      setAuthor(editingBook.author || '');
      setStartDate(editingBook.startDate || '');
      setEndDate(editingBook.endDate || '');
      setRating(editingBook.rating || 5);
      setReview(editingBook.review || '');
      setCoverUrl(editingBook.coverUrl || '📕');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setAuthor('');
      setStartDate(today);
      setEndDate(today);
      setRating(5);
      setReview('');
      setCoverUrl('📕');
    }
  }, [editingBook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingBook?.id,
      studentName: currentStudent,
      bookTitle: title.trim(),
      author: author.trim(),
      startDate,
      endDate,
      rating,
      review: review.trim(),
      coverUrl: coverUrl.trim() || '📕'
    });
  };

  return (
    <AnimatePresence>
      <div
        id="book-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="book-modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 my-8"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-10 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 id="modal-title" className="text-xl font-extrabold text-slate-800">
                {editingBook ? '독서 기록 수정' : '새 독서 기록'}
              </h2>
            </div>
            <button
              id="modal-close-btn"
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form id="book-form" onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Student Notice */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs">
              <span className="text-slate-600 font-medium">기록 작성 학생:</span>
              <span className="font-extrabold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg shadow-xs">
                {currentStudent}
              </span>
            </div>

            {/* Cover emoji picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                표지 아이콘 선택
              </label>
              <div className="flex justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                {COVER_EMOJIS.map((emoji) => {
                  const isSelected = coverUrl === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      id={`emoji-btn-${emoji}`}
                      onClick={() => setCoverUrl(emoji)}
                      className={`flex-1 text-3xl py-2.5 rounded-xl transition-all ${
                        isSelected
                          ? 'border-2 border-indigo-600 bg-indigo-50 scale-105 shadow-sm'
                          : 'border-2 border-transparent hover:bg-white hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Author */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  책 제목 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="form-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="읽은 책 제목을 입력하세요"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  지은이 / 저자
                </label>
                <div className="relative">
                  <input
                    id="form-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="저자명을 입력하세요 (선택)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Dates: Start & End */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>읽기 시작</span>
                </label>
                <input
                  id="form-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>완독일</span>
                </label>
                <input
                  id="form-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                별점 평가
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    id={`star-${star}`}
                    onClick={() => setRating(star)}
                    className="p-1 text-3xl transition-transform hover:scale-125 focus:outline-none"
                    title={`${star}점`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-3">
                  {rating}점 ({rating === 5 ? '최고예요!' : rating === 4 ? '재미있어요' : rating === 3 ? '보통이에요' : '아쉬워요'})
                </span>
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                독서 감상평
              </label>
              <textarea
                id="form-review"
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="책을 읽고 느낀 점이나 친구들에게 알려주고 싶은 구절을 적어보세요..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="form-cancel-btn"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                id="form-save-btn"
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
              >
                저장하기
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
