/**
 * Hạnh Phúc – contact form backend (Google Apps Script).
 *
 * Saves every request from the website's contact form as a row in this Google Sheet
 * and (optionally) emails the staff. Setup: see DEPLOY.md, step 1.
 *
 * The website sends JSON as text/plain (no CORS preflight), e.g.
 * {"audience":"CHILD","fullName":"Nguyễn Văn An","phone":"0912345678","email":null,
 *  "courses":["KIDS","TOEIC"],"note":null,"website":""}
 */

// ===== Settings =====
const SHEET_NAME = 'Đăng ký';
/** Email(s) to notify on each new request, comma-separated. Leave '' to turn off. */
const NOTIFY_EMAIL = '';

const HEADERS = ['Thời gian', 'Mã', 'Đăng ký cho', 'Họ tên', 'Số điện thoại', 'Email', 'Khóa học', 'Ghi chú', 'Trạng thái'];
const COURSE_NAMES = {
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
        lead.courses.map((c) => COURSE_NAMES[c]).join(', '),
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

/** Lets you open the /exec URL in a browser to check the deployment works. */
function doGet() {
  return json_({ ok: true, service: 'hanh-phuc-contact' });
}

function validate_(d) {
  const fullName = String(d.fullName || '').trim();
  const phone = String(d.phone || '').replace(/[\s.-]/g, '');
  const email = String(d.email || '').trim();
  const note = String(d.note || '').trim();
  const audience = d.audience === 'CHILD' ? 'CHILD' : 'SELF';
  const courses = Array.isArray(d.courses)
    ? d.courses.filter((c, i, all) => COURSE_NAMES[c] && all.indexOf(c) === i)
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
  const courses = lead.courses.map((c) => COURSE_NAMES[c]).join(', ') || '(chưa chọn)';
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
