import { BookRecord, RawSheetBook, CommentItem } from '../types';
import { DEFAULT_SCRIPT_URL, INITIAL_SEED_BOOKS, STUDENTS as DEFAULT_STUDENTS } from '../data/students';

const SCRIPT_URL_KEY = 'classReadingScriptUrl';
const GOAL_BOOKS_KEY = 'classReadingGoalBooks';
const ACTIVE_TAB_KEY = 'classReadingActiveSheetTab';
const STUDENTS_KEY = 'classReadingStudentsList';
const TABS_LIST_KEY = 'classReadingKnownTabsList';

export const DEFAULT_SHEET_TAB = '2026학년도';

export function getScriptUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SCRIPT_URL;
  return localStorage.getItem(SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL;
}

export function setScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCRIPT_URL_KEY, url.trim());
  }
}

export function getActiveSheetTab(): string {
  if (typeof window === 'undefined') return DEFAULT_SHEET_TAB;
  return localStorage.getItem(ACTIVE_TAB_KEY) || DEFAULT_SHEET_TAB;
}

export function setActiveSheetTab(tabName: string): void {
  if (typeof window !== 'undefined') {
    const clean = tabName.trim() || DEFAULT_SHEET_TAB;
    localStorage.setItem(ACTIVE_TAB_KEY, clean);
    // Add to known tabs list
    const known = getKnownSheetTabs();
    if (!known.includes(clean)) {
      setKnownSheetTabs([...known, clean]);
    }
  }
}

export function getKnownSheetTabs(): string[] {
  if (typeof window === 'undefined') return ['2026학년도', '2027학년도'];
  try {
    const saved = localStorage.getItem(TABS_LIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return ['2026학년도', '2027학년도'];
}

export function setKnownSheetTabs(tabs: string[]): void {
  if (typeof window === 'undefined') return;
  const unique = Array.from(new Set(tabs.map(t => t.trim()).filter(Boolean)));
  localStorage.setItem(TABS_LIST_KEY, JSON.stringify(unique));
}

export function getStudentsList(): string[] {
  if (typeof window === 'undefined') return DEFAULT_STUDENTS;
  try {
    const saved = localStorage.getItem(STUDENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_STUDENTS;
}

export function setStudentsList(students: string[]): void {
  if (typeof window === 'undefined') return;
  const unique = Array.from(new Set(students.map(s => s.trim()).filter(Boolean)));
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(unique));
}

export function getGoalBooks(): number {
  if (typeof window === 'undefined') return 100;
  const saved = localStorage.getItem(GOAL_BOOKS_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 100;
}

export function setGoalBooks(goal: number): void {
  if (typeof window !== 'undefined' && goal > 0) {
    localStorage.setItem(GOAL_BOOKS_KEY, goal.toString());
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
    coverUrl,
    likes,
    comments,
    createdAt
  };
}

export function bookToSheetPayload(book: BookRecord): Record<string, unknown> {
  return {
    ID: book.id,
    id: book.id,
    학생명: book.studentName,
    책제목: book.bookTitle,
    저자: book.author,
    시작일: book.startDate,
    완독일: book.endDate,
    별점: book.rating,
    감상평: book.review,
    표지URL: book.coverUrl,
    좋아요: JSON.stringify(book.likes || []),
    댓글: JSON.stringify(book.comments || []),
    생성일: book.createdAt
  };
}

function getTabStorageKey(tabName: string): string {
  return `classReadingBooks_${tabName || DEFAULT_SHEET_TAB}`;
}

export function getLocalBooks(tabName?: string): BookRecord[] {
  if (typeof window === 'undefined') return INITIAL_SEED_BOOKS;
  const targetTab = tabName || getActiveSheetTab();
  const key = getTabStorageKey(targetTab);

  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      // If legacy key exists and we're looking at default tab, migrate it
      if (targetTab === DEFAULT_SHEET_TAB) {
        const legacy = localStorage.getItem('classReadingBooks');
        if (legacy) {
          localStorage.setItem(key, legacy);
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(normalizeBookRecord);
          }
        }
        localStorage.setItem(key, JSON.stringify(INITIAL_SEED_BOOKS));
        return INITIAL_SEED_BOOKS;
      }
      return [];
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeBookRecord);
    }
    return [];
  } catch (err) {
    console.error('Failed to parse local books for tab:', targetTab, err);
    return [];
  }
}

export function saveLocalBooks(books: BookRecord[], tabName?: string): void {
  if (typeof window === 'undefined') return;
  const targetTab = tabName || getActiveSheetTab();
  const key = getTabStorageKey(targetTab);

  try {
    localStorage.setItem(key, JSON.stringify(books));
    // also keep legacy key updated if default tab
    if (targetTab === DEFAULT_SHEET_TAB) {
      localStorage.setItem('classReadingBooks', JSON.stringify(books));
    }
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Fetch books from Google Apps Script Web App URL for a specific tab.
 * Automatically sends sheetName query param so Google Sheet loads that specific tab!
 */
export async function fetchBooksFromSheet(tabName?: string): Promise<{ books: BookRecord[]; success: boolean; error?: string }> {
  const currentTab = tabName || getActiveSheetTab();
  const baseUrl = getScriptUrl();

  if (!baseUrl || baseUrl.includes('여기에_웹앱_URL')) {
    return { books: getLocalBooks(currentTab), success: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Build URL with sheetName parameter
    const sep = baseUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${baseUrl}${sep}sheetName=${encodeURIComponent(currentTab)}`;

    const response = await fetch(fetchUrl, {
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
      saveLocalBooks(normalized, currentTab);
      return { books: normalized, success: true };
    } else if (data && Array.isArray((data as { books?: unknown[] }).books)) {
      const normalized = (data as { books: unknown[] }).books.map(normalizeBookRecord);
      saveLocalBooks(normalized, currentTab);
      return { books: normalized, success: true };
    }

    return { books: getLocalBooks(currentTab), success: true };
  } catch (err) {
    console.warn('Google Sheet fetch fallback to local cache:', err);
    return {
      books: getLocalBooks(currentTab),
      success: false,
      error: err instanceof Error ? err.message : '구글 시트 연동 실패'
    };
  }
}

/**
 * Sync save or delete operation to Google Sheet with sheetName specified.
 */
export async function syncToGoogleSheet(
  action: 'save' | 'delete',
  payload: { book?: BookRecord; id?: string },
  tabName?: string
): Promise<boolean> {
  const url = getScriptUrl();
  if (!url || url.includes('여기에_웹앱_URL')) return false;

  const currentTab = tabName || getActiveSheetTab();

  const bodyData = {
    action,
    sheetName: currentTab,
    tabName: currentTab,
    ...(payload.book ? { book: bookToSheetPayload(payload.book) } : {}),
    ...(payload.id ? { id: payload.id } : {})
  };

  try {
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

/**
 * Generate Google Apps Script code snippet that handles sheetName dynamically
 */
export function getRecommendedAppsScriptCode(): string {
  return `/**
 * 학급 독서 기록장 Google Apps Script (다년도 탭 자동 분리 지원)
 * 2040년까지 매년 탭만 새로 만들면 코드를 건드릴 필요가 없습니다!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // 웹앱에서 전달한 탭 이름 (없을 경우 기본 첫 번째 시트 또는 2026학년도)
    var requestedTab = (e && e.parameter && e.parameter.sheetName) ? e.parameter.sheetName : "2026학년도";
    var sheet = ss.getSheetByName(requestedTab);
    
    // 만약 시트 탭이 없으면 첫 번째 시트 사용
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var rows = data.slice(1);
    var results = rows.map(function(row) {
      var item = {};
      headers.forEach(function(header, idx) {
        item[header] = row[idx];
      });
      return item;
    });
    
    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var requestedTab = payload.sheetName || payload.tabName || "2026학년도";
    var sheet = ss.getSheetByName(requestedTab);
    
    // 해당 탭이 아직 없으면 자동으로 생성하고 제목행 추가
    if (!sheet) {
      sheet = ss.insertSheet(requestedTab);
      var defaultHeaders = ['ID', '학생명', '책제목', '저자', '시작일', '완독일', '별점', '감상평', '표지URL', '좋아요', '댓글', '생성일'];
      sheet.appendRow(defaultHeaders);
    }
    
    var action = payload.action;
    var book = payload.book;
    var targetId = payload.id || (book ? (book.ID || book.id) : null);
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    if (action === 'delete') {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(targetId)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: 'deleted' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Save (Update or Insert)
    var rowData = headers.map(function(col) {
      var val = book[col];
      return (val !== undefined && val !== null) ? val : "";
    });
    
    var rowIndexToUpdate = -1;
    for (var j = 1; j < data.length; j++) {
      if (String(data[j][0]) === String(targetId)) {
        rowIndexToUpdate = j + 1;
        break;
      }
    }
    
    if (rowIndexToUpdate > 0) {
      sheet.getRange(rowIndexToUpdate, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, action: 'saved' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
}
