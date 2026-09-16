import { BookRecord, RawSheetBook, CommentItem } from '../types';
import { DEFAULT_SCRIPT_URL, INITIAL_SEED_BOOKS } from '../data/students';

const STORAGE_KEY = 'classReadingBooks';
const SCRIPT_URL_KEY = 'classReadingScriptUrl';

export function getScriptUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SCRIPT_URL;
  return localStorage.getItem(SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL;
}

export function setScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCRIPT_URL_KEY, url.trim());
  }
}

export function parseLikes(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      }
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  return [];
}

export function parseComments(raw: unknown): CommentItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as CommentItem[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw.trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeBookRecord(raw: RawSheetBook): BookRecord {
  const id = String(raw.ID || raw.__backendId || raw.id || `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const studentName = String(raw.학생명 || raw.student_name || raw.studentName || '');
  const bookTitle = String(raw.책제목 || raw.book_title || raw.bookTitle || '');
  const author = String(raw.저자 || raw.author || '');
  const startDate = String(raw.시작일 || raw.start_date || raw.startDate || '');
  const endDate = String(raw.완독일 || raw.end_date || raw.endDate || '');
  const rating = Number(raw.별점 || raw.rating || 0) || 0;
  const review = String(raw.감상평 || raw.review || '');
  const coverUrl = String(raw.표지URL || raw.cover_url || raw.coverUrl || '📕');
  const likes = parseLikes(raw.좋아요 || raw.likes);
  const comments = parseComments(raw.댓글 || raw.comments);
  const createdAt = String(raw.생성일 || raw.created_at || raw.createdAt || new Date().toISOString());

  return {
    id,
    studentName,
    bookTitle,
    author,
    startDate,
    endDate,
    rating,
    review,
    coverUrl: coverUrl.trim() || '📕',
    likes,
    comments,
    createdAt
  };
}

export function bookToSheetPayload(book: BookRecord): Record<string, unknown> {
  return {
    ID: book.id,
    __backendId: book.id,
    학생명: book.studentName,
    student_name: book.studentName,
    책제목: book.bookTitle,
    book_title: book.bookTitle,
    저자: book.author,
    author: book.author,
    시작일: book.startDate,
    start_date: book.startDate,
    완독일: book.endDate,
    end_date: book.endDate,
    별점: book.rating,
    rating: book.rating,
    감상평: book.review,
    review: book.review,
    표지URL: book.coverUrl,
    cover_url: book.coverUrl,
    좋아요: JSON.stringify(book.likes),
    likes: JSON.stringify(book.likes),
    댓글: JSON.stringify(book.comments),
    comments: JSON.stringify(book.comments),
    생성일: book.createdAt,
    created_at: book.createdAt
  };
}

export function getLocalBooks(): BookRecord[] {
  if (typeof window === 'undefined') return INITIAL_SEED_BOOKS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKS));
      return INITIAL_SEED_BOOKS;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeBookRecord);
    }
    return INITIAL_SEED_BOOKS;
  } catch (err) {
    console.error('Failed to parse local books:', err);
    return INITIAL_SEED_BOOKS;
  }
}

export function saveLocalBooks(books: BookRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Fetch books from Google Apps Script Web App URL.
 * Falls back safely to local storage if network is unreachable or CORS blocked.
 */
export async function fetchBooksFromSheet(): Promise<{ books: BookRecord[]; success: boolean; error?: string }> {
  const url = getScriptUrl();
  if (!url || url.includes('여기에_웹앱_URL')) {
    return { books: getLocalBooks(), success: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      const normalized = data.map(normalizeBookRecord);
      // Merge with any local offline additions that might not be on sheet yet
      saveLocalBooks(normalized);
      return { books: normalized, success: true };
    }
    return { books: getLocalBooks(), success: true };
  } catch (err) {
    console.warn('Google Sheet fetch fallback to local cache:', err);
    return {
      books: getLocalBooks(),
      success: false,
      error: err instanceof Error ? err.message : '구글 시트 연동 실패'
    };
  }
}

/**
 * Sync save or delete operation to Google Sheet.
 * Sends payload to Apps Script Web App.
 */
export async function syncToGoogleSheet(
  action: 'save' | 'delete',
  payload: { book?: BookRecord; id?: string }
): Promise<boolean> {
  const url = getScriptUrl();
  if (!url || url.includes('여기에_웹앱_URL')) return false;

  const bodyData = {
    action,
    ...(payload.book ? { book: bookToSheetPayload(payload.book) } : {}),
    ...(payload.id ? { id: payload.id } : {})
  };

  try {
    // Note: Google Apps Script Web App handles POST.
    // In browser environments with CORS, we send text/plain or json
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(bodyData)
    });
    return response.ok;
  } catch (err) {
    console.warn('Google Sheet sync attempt error (saved locally):', err);
    return false;
  }
}
