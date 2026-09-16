export interface CommentItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface BookRecord {
  id: string;
  studentName: string;
  bookTitle: string;
  author: string;
  startDate: string;
  endDate: string;
  rating: number;
  review: string;
  coverUrl: string; // Emoji (e.g. 📕) or image URL
  likes: string[]; // List of student names
  comments: CommentItem[];
  createdAt: string;
}

export interface RawSheetBook {
  ID?: string;
  __backendId?: string;
  id?: string;
  학생명?: string;
  student_name?: string;
  studentName?: string;
  책제목?: string;
  book_title?: string;
  bookTitle?: string;
  저자?: string;
  author?: string;
  시작일?: string;
  start_date?: string;
  startDate?: string;
  완독일?: string;
  end_date?: string;
  endDate?: string;
  별점?: number | string;
  rating?: number | string;
  감상평?: string;
  review?: string;
  표지URL?: string;
  cover_url?: string;
  coverUrl?: string;
  좋아요?: string | string[];
  likes?: string | string[];
  댓글?: string | CommentItem[];
  comments?: string | CommentItem[];
  생성일?: string;
  created_at?: string;
  createdAt?: string;
}

export type PageView = 'login' | 'student' | 'dashboard';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
