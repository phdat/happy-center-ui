/**
 * Hạnh Phúc – website backend (Google Apps Script).
 *
 * 1. Courses: the website reads the course list from the "Khóa học" tab
 *    (GET <exec URL>?action=courses). Edit the sheet → the website updates.
 *    Run setupCoursesSheet() once to create that tab with the current courses.
 * 2. Contact form: saves every request as a row in the "Đăng ký" tab
 *    and (optionally) emails the staff.
 * Setup: see DEPLOY.md, step 1.
 *
 * The website sends JSON as text/plain (no CORS preflight), e.g.
 * {"audience":"CHILD","fullName":"Nguyễn Văn An","phone":"0912345678","email":null,
 *  "courses":["KIDS","TOEIC"],"note":null,"website":""}
 */

// ===== Settings =====
const SHEET_NAME = 'Đăng ký';
/** Email(s) to notify on each new request, comma-separated. Leave '' to turn off. */
const NOTIFY_EMAIL = '';

const COURSES_SHEET = 'Khóa học';
const COURSE_HEADERS = [
  'Mã', 'Nhóm', 'Tên ngắn', 'Tên khóa', 'Nhãn', 'Mô tả',
  'Điểm nổi bật (mỗi dòng 1 ý)', 'Thông tin (mỗi dòng "Nhãn: Giá trị")', 'Hiển thị',
];
const COURSES_CACHE_KEY = 'courses-v1';
const COURSES_CACHE_SECONDS = 300;

const HEADERS = ['Thời gian', 'Mã', 'Đăng ký cho', 'Họ tên', 'Số điện thoại', 'Email', 'Khóa học', 'Ghi chú', 'Trạng thái'];
/** Used only if the "Khóa học" tab doesn't exist yet. */
const DEFAULT_COURSE_NAMES = {
  KIDS: 'Tiếng Anh cho bé',
  TOEIC: 'TOEIC',
  VSTEP: 'VSTEP',
  OFFICE: 'Tin học văn phòng',
  AI: 'Ứng dụng AI',
};
const AUDIENCE_NAMES = { SELF: 'Bản thân', CHILD: 'Con' };
const VN_PHONE = /^(?:\+84|0)\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot filled in → a bot. Pretend success, save nothing.
    if (data.website) return json_({ ok: true, id: '0' });

    const lead = validate_(data);
    const id = Utilities.getUuid().slice(0, 8);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow([
        new Date(),
        id,
        AUDIENCE_NAMES[lead.audience],
        safe_(lead.fullName),
        "'" + lead.phone, // keep the leading 0
        safe_(lead.email),
        lead.courseNames.join(', '),
        safe_(lead.note),
        'Mới',
      ]);
    } finally {
      lock.releaseLock();
    }

    if (NOTIFY_EMAIL) notify_(id, lead);
    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/**
 * GET ?action=courses → the visible courses from the "Khóa học" tab.
 * Plain GET (no action) lets you open the /exec URL in a browser to check the deployment.
 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'courses') {
      return json_({ ok: true, courses: coursesCached_() });
    }
    return json_({ ok: true, service: 'hanh-phuc' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Simple trigger: clears the cache when the "Khóa học" tab is edited, so changes show up at once. */
function onEdit(e) {
  if (e && e.range && e.range.getSheet().getName() === COURSES_SHEET) {
    CacheService.getScriptCache().remove(COURSES_CACHE_KEY);
  }
}

function coursesCached_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(COURSES_CACHE_KEY);
  if (hit) return JSON.parse(hit);
  const courses = readCourses_();
  if (courses) cache.put(COURSES_CACHE_KEY, JSON.stringify(courses), COURSES_CACHE_SECONDS);
  return courses || [];
}

/** Reads the "Khóa học" tab. Returns null when the tab doesn't exist. */
function readCourses_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COURSES_SHEET);
  if (!sheet) return null;
  const rows = sheet.getDataRange().getDisplayValues().slice(1); // skip header
  const raw = sheet.getDataRange().getValues().slice(1);
  const courses = [];
  const seen = {};
  rows.forEach((r, i) => {
    const id = String(r[0]).trim().toUpperCase();
    const title = String(r[3]).trim();
    const visible = raw[i][8];
    if (!id || !title || seen[id] || visible === false || /^(false|no|không|ẩn)$/i.test(String(visible).trim())) return;
    seen[id] = true;
    courses.push({
      id: id,
      group: String(r[1]).trim() || 'Khóa học',
      shortName: String(r[2]).trim() || title,
      title: title,
      tag: String(r[4]).trim(),
      description: String(r[5]).trim(),
      highlights: lines_(r[6]),
      meta: lines_(r[7])
        .map((line) => {
          const at = line.indexOf(':');
          return at > 0 ? { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() } : null;
        })
        .filter((m) => m && m.label && m.value),
    });
  });
  return courses;
}

function lines_(cell) {
  return String(cell || '').split(/\r?\n/).map((x) => x.replace(/^[\s•\-–]+/, '').trim()).filter(Boolean);
}

/** id → short name, for the "Đăng ký" rows. */
function courseNames_() {
  const courses = coursesCached_();
  if (!courses.length) return DEFAULT_COURSE_NAMES;
  const names = {};
  courses.forEach((c) => (names[c.id] = c.shortName));
  return names;
}

/**
 * Run once from the Apps Script editor (select it → ▶ Run) to create the "Khóa học" tab
 * filled with the website's current courses. Does nothing if the tab already exists.
 */
function setupCoursesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(COURSES_SHEET)) {
    Logger.log('Tab "' + COURSES_SHEET + '" already exists – nothing to do.');
    return;
  }
  const sheet = ss.insertSheet(COURSES_SHEET, 0);
  const seed = [
    ['KIDS', 'Tiếng Anh', 'Tiếng Anh cho bé', 'Tiếng Anh cho bé', 'Thiếu nhi',
      'Bé làm quen và dùng tiếng Anh tự nhiên qua trò chơi, bài hát và hoạt động nhóm.',
      'Phát âm chuẩn, phản xạ nghe – nói\nTừ vựng, mẫu câu theo chủ đề gần gũi\nĐọc – viết nền tảng theo độ tuổi',
      'Độ tuổi: 09-12\nHọc phí: 1.500.000 đ', true],
    ['TOEIC', 'Tiếng Anh', 'TOEIC', 'Luyện thi TOEIC', 'Sinh viên & người đi làm',
      'Lộ trình theo điểm mục tiêu, tập trung đúng các dạng bài Listening & Reading.',
      'Kiểm tra trình độ đầu vào\nChiến thuật làm bài từng Part\nThi thử theo format đề thật',
      'Thời lượng: 20 buổi\nHọc phí: 2.000.000 đ', true],
    ['VSTEP', 'Tiếng Anh', 'VSTEP', 'Luyện thi VSTEP', 'Chứng chỉ bậc 3 – 5',
      'Chuẩn bị đủ 4 kỹ năng cho chứng chỉ B1 – B2 – C1 theo khung năng lực 6 bậc Việt Nam.',
      'Bám sát cấu trúc đề VSTEP\nLuyện Nói & Viết có chữa bài\nPhù hợp chuẩn đầu ra, xét tốt nghiệp',
      'Thời lượng: 20 buổi\nHọc phí: 2.500.000 - 3.500.000 đ', true],
    ['OFFICE', 'Tin học', 'Tin học văn phòng', 'Tin học văn phòng', 'Word · Excel · PowerPoint',
      'Thành thạo bộ Microsoft Office cho học tập và công việc hằng ngày.',
      'Soạn thảo, trình bày văn bản chuẩn\nExcel: hàm, bảng tính, biểu đồ\nThiết kế slide thuyết trình',
      'Thời lượng: 15 buổi\nHọc phí: 1.500.000 đ', true],
    ['AI', 'Tin học', 'Ứng dụng AI', 'Ứng dụng AI', 'Kỹ năng mới',
      'Dùng công cụ AI để học nhanh hơn, làm việc hiệu quả hơn — đúng cách và an toàn.',
      'Viết câu lệnh (prompt) hiệu quả\nAI cho soạn thảo, tổng hợp, thuyết trình\nKiểm chứng thông tin, dùng AI có trách nhiệm',
      'Thời lượng: 5 buổi\nHọc phí: 500.000 đ', true],
  ];
  sheet.getRange(1, 1, 1, COURSE_HEADERS.length).setValues([COURSE_HEADERS]).setFontWeight('bold');
  sheet.getRange(2, 1, seed.length, COURSE_HEADERS.length).setValues(seed);
  sheet.getRange(2, 9, 200, 1).insertCheckboxes();
  sheet.getRange(2, 9, seed.length, 1).check();
  sheet.setFrozenRows(1);
  sheet.getRange('A:H').setWrap(true).setVerticalAlignment('top');
  sheet.setColumnWidths(1, 3, 120);
  sheet.setColumnWidths(4, 5, 260);
  CacheService.getScriptCache().remove(COURSES_CACHE_KEY);
}

function validate_(d) {
  const fullName = String(d.fullName || '').trim();
  const phone = String(d.phone || '').replace(/[\s.-]/g, '');
  const email = String(d.email || '').trim();
  const note = String(d.note || '').trim();
  const audience = d.audience === 'CHILD' ? 'CHILD' : 'SELF';
  const names = courseNames_();
  const courses = Array.isArray(d.courses)
    ? d.courses.map((c) => String(c)).filter((c, i, all) => names[c] && all.indexOf(c) === i)
    : [];

  if (!fullName || fullName.length > 100) throw new Error('invalid fullName');
  if (!VN_PHONE.test(phone)) throw new Error('invalid phone');
  if (email && (email.length > 150 || !EMAIL.test(email))) throw new Error('invalid email');
  if (note.length > 1000) throw new Error('note too long');

  return {
    audience: audience,
    fullName: fullName,
    phone: phone.indexOf('+84') === 0 ? '0' + phone.slice(3) : phone,
    email: email,
    courses: courses,
    courseNames: courses.map((c) => names[c]),
    note: note,
  };
}

/** Stops spreadsheet formula injection (values starting with = + - @). */
function safe_(value) {
  const s = String(value || '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function notify_(id, lead) {
  const courses = lead.courseNames.join(', ') || '(chưa chọn)';
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'Đăng ký tư vấn mới: ' + lead.fullName + ' – ' + lead.phone,
    body: [
      'Mã: ' + id,
      'Đăng ký cho: ' + AUDIENCE_NAMES[lead.audience],
      'Họ tên: ' + lead.fullName,
      'Số điện thoại: ' + lead.phone,
      'Email: ' + (lead.email || '-'),
      'Khóa học: ' + courses,
      'Ghi chú: ' + (lead.note || '-'),
      '',
      'Xem tất cả: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].join('\n'),
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
