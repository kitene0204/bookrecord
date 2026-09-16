import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { StudentPage } from './components/StudentPage';
import { DashboardPage } from './components/DashboardPage';
import { BookModal } from './components/BookModal';
import { DeleteModal } from './components/DeleteModal';
import { ScriptSettingsModal } from './components/ScriptSettingsModal';
import { Toast, ToastMessage } from './components/Toast';
import { BookRecord, PageView, SyncStatus } from './types';
import {
  getLocalBooks,
  saveLocalBooks,
  fetchBooksFromSheet,
  syncToGoogleSheet
} from './services/sheetService';

const STUDENT_SESSION_KEY = 'classReadingCurrentStudent';

export default function App() {
  const [books, setBooks] = useState<BookRecord[]>(() => getLocalBooks());
  const [currentStudent, setCurrentStudent] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STUDENT_SESSION_KEY) || null;
  });
  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    if (typeof window === 'undefined') return 'login';
    const savedStudent = sessionStorage.getItem(STUDENT_SESSION_KEY);
    return savedStudent ? 'student' : 'login';
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState<BookRecord | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      text,
      type
    });
  };

  // Initial load from Google Sheet
  const loadSheetData = useCallback(async (showNotification = false) => {
    setSyncStatus('syncing');
    try {
      const { books: sheetBooks, success, error } = await fetchBooksFromSheet();
      if (success && sheetBooks && sheetBooks.length > 0) {
        setBooks(sheetBooks);
        saveLocalBooks(sheetBooks);
        setSyncStatus('synced');
        if (showNotification) {
          showToast('구글 시트 데이터를 성공적으로 불러왔습니다!');
        }
      } else {
        setSyncStatus('offline');
        if (showNotification) {
          showToast(error ? `시트 연동 알림: ${error}` : '로컬 캐시 데이터를 유지합니다.', 'info');
        }
      }
    } catch {
      setSyncStatus('error');
      if (showNotification) {
        showToast('시트 연결에 실패하여 로컬 데이터를 표시합니다.', 'info');
      }
    }
  }, []);

  useEffect(() => {
    loadSheetData(false);
  }, [loadSheetData]);

  // Login handler
  const handleLogin = (studentName: string) => {
    setCurrentStudent(studentName);
    sessionStorage.setItem(STUDENT_SESSION_KEY, studentName);
    setCurrentPage('student');
    showToast(`${studentName}님, 환영합니다!`);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentStudent(null);
    sessionStorage.removeItem(STUDENT_SESSION_KEY);
    setCurrentPage('login');
    showToast('로그아웃 되었습니다.', 'info');
  };

  // Navigation handler
  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
  };

  // Save Book (Add or Edit)
  const handleSaveBook = async (bookData: {
    id?: string;
    studentName: string;
    bookTitle: string;
    author: string;
    startDate: string;
    endDate: string;
    rating: number;
    review: string;
    coverUrl: string;
  }) => {
    const isEditing = Boolean(bookData.id);
    let updatedBook: BookRecord;

    if (isEditing && bookData.id) {
      const existing = books.find((b) => b.id === bookData.id);
      updatedBook = {
        id: bookData.id,
        studentName: bookData.studentName,
        bookTitle: bookData.bookTitle,
        author: bookData.author,
        startDate: bookData.startDate,
        endDate: bookData.endDate,
        rating: bookData.rating,
        review: bookData.review,
        coverUrl: bookData.coverUrl,
        likes: existing?.likes || [],
        comments: existing?.comments || [],
        createdAt: existing?.createdAt || new Date().toISOString()
      };
    } else {
      updatedBook = {
        id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentName: bookData.studentName,
        bookTitle: bookData.bookTitle,
        author: bookData.author,
        startDate: bookData.startDate,
        endDate: bookData.endDate,
        rating: bookData.rating,
        review: bookData.review,
        coverUrl: bookData.coverUrl,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };
    }

    const nextBooks = isEditing
      ? books.map((b) => (b.id === updatedBook.id ? updatedBook : b))
      : [updatedBook, ...books];

    setBooks(nextBooks);
    saveLocalBooks(nextBooks);
    setIsBookModalOpen(false);
    setEditingBook(null);

    showToast(isEditing ? '독서 기록이 수정되었습니다!' : '새 독서 기록이 등록되었습니다!');

    // Background sync to Google Sheet
    syncToGoogleSheet('save', { book: updatedBook });
  };

  // Delete Book
  const handleDeleteConfirm = async () => {
    if (!deletingBook) return;
    const targetId = deletingBook.id;

    const nextBooks = books.filter((b) => b.id !== targetId);
    setBooks(nextBooks);
    saveLocalBooks(nextBooks);
    setIsDeleteModalOpen(false);
    setDeletingBook(null);

    showToast('독서 기록이 삭제되었습니다.');

    // Background sync to Google Sheet
    syncToGoogleSheet('delete', { id: targetId });
  };

  // Toggle Like on Book
  const handleToggleLike = (bookId: string) => {
    if (!currentStudent) {
      showToast('이름을 선택하고 로그인한 뒤에 추천할 수 있어요!', 'info');
      setCurrentPage('login');
      return;
    }

    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const likes = targetBook.likes || [];
    const alreadyLiked = likes.includes(currentStudent);

    const nextLikes = alreadyLiked
      ? likes.filter((name) => name !== currentStudent)
      : [...likes, currentStudent];

    const updatedBook: BookRecord = {
      ...targetBook,
      likes: nextLikes
    };

    const nextBooks = books.map((b) => (b.id === bookId ? updatedBook : b));
    setBooks(nextBooks);
    saveLocalBooks(nextBooks);

    if (!alreadyLiked) {
      showToast('친구의 감상평을 추천했습니다! ❤️');
    }

    // Sync to Google Sheet
    syncToGoogleSheet('save', { book: updatedBook });
  };

  // Add Comment on Book
  const handleAddComment = (bookId: string, text: string) => {
    if (!currentStudent) {
      showToast('로그인 후 댓글을 남길 수 있습니다.', 'info');
      setCurrentPage('login');
      return;
    }

    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: currentStudent,
      text,
      date: new Date().toISOString()
    };

    const updatedBook: BookRecord = {
      ...targetBook,
      comments: [...(targetBook.comments || []), newComment]
    };

    const nextBooks = books.map((b) => (b.id === bookId ? updatedBook : b));
    setBooks(nextBooks);
    saveLocalBooks(nextBooks);
    showToast('댓글이 등록되었습니다!');

    // Sync to Google Sheet
    syncToGoogleSheet('save', { book: updatedBook });
  };

  // Delete Comment on Book
  const handleDeleteComment = (bookId: string, commentId: string) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const updatedBook: BookRecord = {
      ...targetBook,
      comments: (targetBook.comments || []).filter((c) => c.id !== commentId)
    };

    const nextBooks = books.map((b) => (b.id === bookId ? updatedBook : b));
    setBooks(nextBooks);
    saveLocalBooks(nextBooks);
    showToast('댓글이 삭제되었습니다.');

    // Sync to Google Sheet
    syncToGoogleSheet('save', { book: updatedBook });
  };

  // Check if current logged-in student has Reading King status (>= 10 books)
  const isCurrentStudentReadingKing = currentStudent
    ? books.filter((b) => b.studentName === currentStudent).length >= 10
    : false;

  return (
    <div
      id="app-root"
      className="min-h-screen w-full flex flex-col text-slate-800"
      style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)'
      }}
    >
      {/* Top App Navbar */}
      <Navbar
        currentPage={currentPage}
        currentStudent={currentStudent}
        syncStatus={syncStatus}
        isReadingKing={isCurrentStudentReadingKing}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onRefreshSync={() => loadSheetData(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Pages */}
      <main className="flex-1 w-full pb-12">
        {currentPage === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onViewDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'student' && currentStudent && (
          <StudentPage
            currentStudent={currentStudent}
            books={books}
            onOpenAddModal={() => {
              setEditingBook(null);
              setIsBookModalOpen(true);
            }}
            onEditBook={(book) => {
              setEditingBook(book);
              setIsBookModalOpen(true);
            }}
            onDeleteBook={(book) => {
              setDeletingBook(book);
              setIsDeleteModalOpen(true);
            }}
            onGoDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            books={books}
            currentStudent={currentStudent}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onRequireLogin={() => {
              showToast('로그인 후 추천 및 댓글 기능을 이용할 수 있어요!', 'info');
              setCurrentPage('login');
            }}
          />
        )}
      </main>

      {/* Add / Edit Book Modal */}
      <BookModal
        isOpen={isBookModalOpen}
        editingBook={editingBook}
        currentStudent={currentStudent || '학생'}
        onClose={() => {
          setIsBookModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        book={deletingBook}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBook(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Google Apps Script Settings Modal */}
      <ScriptSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onTestAndReload={() => loadSheetData(true)}
      />

      {/* Floating Notifications Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
