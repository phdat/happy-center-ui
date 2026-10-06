/**
 * Course id, e.g. "KIDS", "TOEIC". Comes from the "Mã" column of the "Khóa học" sheet
 * (see apps-script/Code.gs), so it is a plain string rather than a fixed union.
 */
export type CourseId = string;

export interface CourseMeta {
  label: string;
  value: string;
}

export interface Course {
  id: CourseId;
  /** Section the course is listed under, e.g. "Tiếng Anh", "Tin học". */
  group: string;
  /** Short name used on chips and in confirmations. */
  shortName: string;
  title: string;
  tag: string;
  description: string;
  highlights: string[];
  meta: CourseMeta[];
}

/**
 * Built-in copy of the course list. The live list is loaded from the Google Sheet
 * (CourseStore); this is only used if the sheet can't be reached.
 */
export const FALLBACK_COURSES: readonly Course[] = [
  {
    id: 'KIDS',
    group: 'Tiếng Anh',
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
    group: 'Tiếng Anh',
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
    group: 'Tiếng Anh',
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
    group: 'Tin học',
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
    group: 'Tin học',
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
