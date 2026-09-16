import { BookRecord } from '../types';

export const STUDENTS: string[] = [
  '강윤찬',
  '강주연',
  '김민지',
  '김세은',
  '김진후',
  '김현지',
  '박채현',
  '성서아',
  '송다정',
  '엄호준',
  '윤시우',
  '이솔빛나',
  '이정',
  '전성후',
  '정혜원',
  '최예은',
  '한태은',
  '허은서',
  '황혜리',
  '이창민' // Teacher
];

export const TEACHER_NAME = '이창민';

export const GOAL_BOOKS = 100;

export const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkl9CMwPDvV9sVBmnCurRHJcwTJe-ag_W5x_5c4uiGi17GAID_6YEEg2log3V22St1Pw/exec';

// Initial sample data if localStorage is empty
export const INITIAL_SEED_BOOKS: BookRecord[] = [
  {
    id: 'seed-1',
    studentName: '김민지',
    bookTitle: '어린 왕자',
    author: '앙투안 드 생텍쥐페리',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    rating: 5,
    review: '여우가 한 "가장 중요한 것은 눈에 보이지 않아"라는 말이 마음에 깊이 남았어요. 친구들에게 꼭 추천하고 싶어요.',
    coverUrl: '📘',
    likes: ['박채현', '이솔빛나', '강주연'],
    comments: [
      {
        id: 'c-1',
        author: '박채현',
        text: '나도 이 책 읽고 감동받았어! 여우 대사가 진짜 명언이지 👍',
        date: '2026-04-05T10:30:00.000Z'
      },
      {
        id: 'c-2',
        author: '김민지',
        text: '맞아! 다음에 다른 책도 같이 읽자~',
        date: '2026-04-05T11:00:00.000Z'
      }
    ],
    createdAt: '2026-04-05T10:00:00.000Z'
  },
  {
    id: 'seed-2',
    studentName: '박채현',
    bookTitle: '마틸다',
    author: '로알드 달',
    startDate: '2026-04-03',
    endDate: '2026-04-08',
    rating: 5,
    review: '마틸다가 책을 사랑하고 스스로 어려움을 이겨내는 모습이 정말 용기 있고 멋졌습니다.',
    coverUrl: '📕',
    likes: ['김민지', '윤시우'],
    comments: [
      {
        id: 'c-3',
        author: '윤시우',
        text: '영화로도 봤는데 책이 훨씬 재미있더라고요!',
        date: '2026-04-08T15:20:00.000Z'
      }
    ],
    createdAt: '2026-04-08T15:00:00.000Z'
  },
  {
    id: 'seed-3',
    studentName: '윤시우',
    bookTitle: '찰리와 초콜릿 공장',
    author: '로알드 달',
    startDate: '2026-04-06',
    endDate: '2026-04-10',
    rating: 4,
    review: '상상력이 가득한 웡카 씨의 초콜릿 공장 이야기가 흥미진진해서 시간 가는 줄 모르고 읽었습니다.',
    coverUrl: '📙',
    likes: ['엄호준', '전성후'],
    comments: [],
    createdAt: '2026-04-10T12:00:00.000Z'
  },
  {
    id: 'seed-4',
    studentName: '이솔빛나',
    bookTitle: '긴긴밤',
    author: '루리',
    startDate: '2026-04-02',
    endDate: '2026-04-07',
    rating: 5,
    review: '노든과 펭귄이 함께 바다를 향해 걸어가는 밤들이 너무 뭉클했어요. 올해 읽은 최고의 책!',
    coverUrl: '📗',
    likes: ['김민지', '성서아', '최예은', '한태은'],
    comments: [
      {
        id: 'c-4',
        author: '성서아',
        text: '진짜 눈물 나는 감동 이야기야 ㅠㅠ 추천 고마워!',
        date: '2026-04-07T18:00:00.000Z'
      }
    ],
    createdAt: '2026-04-07T17:30:00.000Z'
  },
  {
    id: 'seed-5',
    studentName: '강윤찬',
    bookTitle: '해리 포터와 마법사의 돌',
    author: 'J.K. 롤링',
    startDate: '2026-04-04',
    endDate: '2026-04-12',
    rating: 5,
    review: '호그와트 마법 학교에 입학하는 기분으로 읽었습니다. 다음 2권도 바로 빌려 읽을 생각입니다.',
    coverUrl: '📔',
    likes: ['김진후', '전성후', '엄호준'],
    comments: [],
    createdAt: '2026-04-12T09:00:00.000Z'
  },
  {
    id: 'seed-6',
    studentName: '성서아',
    bookTitle: '아몬드',
    author: '손원평',
    startDate: '2026-04-05',
    endDate: '2026-04-11',
    rating: 5,
    review: '감정을 느끼지 못하는 윤재의 성장을 지켜보며 타인의 감정에 공감하는 것이 얼마나 소중한지 배웠어요.',
    coverUrl: '📘',
    likes: ['이솔빛나', '정혜원'],
    comments: [],
    createdAt: '2026-04-11T14:20:00.000Z'
  },
  {
    id: 'seed-7',
    studentName: '김진후',
    bookTitle: '자전거 도둑',
    author: '박완서',
    startDate: '2026-04-08',
    endDate: '2026-04-13',
    rating: 4,
    review: '양심과 정직함에 대해 깊이 생각해 보게 되었습니다. 수남이의 갈등이 인상적이었습니다.',
    coverUrl: '📕',
    likes: ['강윤찬'],
    comments: [],
    createdAt: '2026-04-13T16:00:00.000Z'
  },
  {
    id: 'seed-8',
    studentName: '박채현',
    bookTitle: '푸른 사자 와니니',
    author: '이현',
    startDate: '2026-04-09',
    endDate: '2026-04-14',
    rating: 5,
    review: '무리에서 쫓겨났지만 자신만의 무리를 만들고 당당하게 살아가는 와니니의 모험이 멋졌습니다.',
    coverUrl: '📙',
    likes: ['김민지', '이솔빛나'],
    comments: [],
    createdAt: '2026-04-14T11:00:00.000Z'
  }
];
