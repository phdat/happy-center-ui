/** Must stay in sync with the backend enum `com.happy.center.contact.Course`. */
export type CourseId = 'KIDS' | 'TOEIC' | 'VSTEP' | 'OFFICE' | 'AI';

export type CourseTrack = 'english' | 'computer';

export interface CourseMeta {
  label: string;
  value: string;
}

export interface Course {
  id: CourseId;
  track: CourseTrack;
  /** Short name used on chips and in confirmations. */
  shortName: string;
  title: string;
  tag: string;
  description: string;
  highlights: string[];
  meta: CourseMeta[];
}

export const TRACK_LABELS: Record<CourseTrack, string> = {
  english: 'Tiếng Anh',
  computer: 'Tin học',
};

/**
 * Course catalogue. Values in [BRACKETS] are placeholders the center still has to fill in.
 * Later this can come from the API instead of being hard-coded.
 */
export const COURSES: readonly Course[] = [
  {
    id: 'KIDS',
    track: 'english',
    shortName: 'Tiếng Anh cho bé',
    title: 'Tiếng Anh cho bé',
    tag: 'Thiếu nhi',
    description: 'Bé làm quen và dùng tiếng Anh tự nhiên qua trò chơi, bài hát và hoạt động nhóm.',
    highlights: [
      'Phát âm chuẩn, phản xạ nghe – nói',
      'Từ vựng, mẫu câu theo chủ đề gần gũi',
      'Đọc – viết nền tảng theo độ tuổi',
    ],
    meta: [
      { label: 'Độ tuổi', value: '09-12' },
      { label: 'Học phí', value: '1.500.000 đ' },
    ],
  },
  {
    id: 'TOEIC',
    track: 'english',
    shortName: 'TOEIC',
    title: 'Luyện thi TOEIC',
    tag: 'Sinh viên & người đi làm',
    description: 'Lộ trình theo điểm mục tiêu, tập trung đúng các dạng bài Listening & Reading.',
    highlights: [
      'Kiểm tra trình độ đầu vào',
      'Chiến thuật làm bài từng Part',
      'Thi thử theo format đề thật',
    ],
    meta: [
      { label: 'Thời lượng', value: '20 buổi' },
      { label: 'Học phí', value: '2.000.000 đ' },
    ],
  },
  {
    id: 'VSTEP',
    track: 'english',
    shortName: 'VSTEP',
    title: 'Luyện thi VSTEP',
    tag: 'Chứng chỉ bậc 3 – 5',
    description:
      'Chuẩn bị đủ 4 kỹ năng cho chứng chỉ B1 – B2 – C1 theo khung năng lực 6 bậc Việt Nam.',
    highlights: [
      'Bám sát cấu trúc đề VSTEP',
      'Luyện Nói & Viết có chữa bài',
      'Phù hợp chuẩn đầu ra, xét tốt nghiệp',
    ],
    meta: [
      { label: 'Thời lượng', value: '20 buổi' },
      { label: 'Học phí', value: '2.500.000 - 3.500.000 đ' },
    ],
  },
  {
    id: 'OFFICE',
    track: 'computer',
    shortName: 'Tin học văn phòng',
    title: 'Tin học văn phòng',
    tag: 'Word · Excel · PowerPoint',
    description: 'Thành thạo bộ Microsoft Office cho học tập và công việc hằng ngày.',
    highlights: [
      'Soạn thảo, trình bày văn bản chuẩn',
      'Excel: hàm, bảng tính, biểu đồ',
      'Thiết kế slide thuyết trình',
    ],
    meta: [
      { label: 'Thời lượng', value: '15 buổi' },
      { label: 'Học phí', value: '1.500.000 đ' },
    ],
  },
  {
    id: 'AI',
    track: 'computer',
    shortName: 'Ứng dụng AI',
    title: 'Ứng dụng AI',
    tag: 'Kỹ năng mới',
    description:
      'Dùng công cụ AI để học nhanh hơn, làm việc hiệu quả hơn — đúng cách và an toàn.',
    highlights: [
      'Viết câu lệnh (prompt) hiệu quả',
      'AI cho soạn thảo, tổng hợp, thuyết trình',
      'Kiểm chứng thông tin, dùng AI có trách nhiệm',
    ],
    meta: [
      { label: 'Thời lượng', value: '5 buổi' },
      { label: 'Học phí', value: '500.000 đ' },
    ],
  },
];

export function findCourse(id: CourseId): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
