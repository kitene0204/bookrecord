import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { BookRecord } from '../types';

interface DeleteModalProps {
  isOpen: boolean;
  book: BookRecord | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ isOpen, book, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen || !book) return null;

  return (
    <AnimatePresence>
      <div
        id="delete-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="delete-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center shadow-2xl border border-slate-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-800 mb-2">정말 삭제할까요?</h3>

          <p className="text-sm font-semibold text-slate-700 mb-1 truncate px-2">
            "{book.bookTitle}"
          </p>
          <p className="text-xs text-slate-500 mb-6">
            삭제된 독서 기록은 복구할 수 없습니다.
          </p>

          <div className="flex gap-3">
            <button
              id="btn-cancel-delete"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              id="btn-confirm-delete"
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
            >
              삭제하기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
