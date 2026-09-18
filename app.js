const courseTabs = document.getElementById('courseTabs');
const content = document.getElementById('content');
const snapshotTimeEl = document.getElementById('snapshotTime');

let data = {};
let courseIds = [];
let activeCourseId = null;

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function statusOf(sub, dueAt) {
  if (sub.workflow_state === 'unsubmitted' || !sub.submitted_at) {
    return { label: 'Missing', cls: 'status-missing' };
  }
  const late = dueAt && sub.submitted_at && new Date(sub.submitted_at) > new Date(dueAt);
  if (sub.grade == null || sub.workflow_state === 'submitted') {
    return late
      ? { label: 'Late — needs grading', cls: 'status-late' }
      : { label: 'Needs grading', cls: 'status-needs' };
  }
  return { label: `Graded: ${sub.grade}`, cls: 'status-graded' };
}

function renderSubmissionBody(sub) {
  if (sub.workflow_state === 'unsubmitted' || !sub.submitted_at) return '<em>No submission yet.</em>';
  const parts = [];
  if (sub.submission_type === 'online_text_entry' && sub.body) {
    parts.push(`<div>${escapeHtml(sub.body).replace(/\n/g, '<br>')}</div>`);
  } else if (sub.submission_type === 'online_url' && sub.url) {
    parts.push(`<div>${escapeHtml(sub.url)}</div>`);
  } else if (sub.submission_type === 'online_upload' && Array.isArray(sub.attachments)) {
    const items = sub.attachments
      .map((a) => `<li>${escapeHtml(a.content_type || 'file')} · ${a.size_kb ?? '?'} KB</li>`)
      .join('');
    parts.push(`<ul class="attachment-list">${items}</ul>`);
  } else if (sub.submission_type === 'media_recording') {
    parts.push('<em>Media recording submitted.</em>');
  } else {
    parts.push('<em>Submitted.</em>');
  }
  if (Array.isArray(sub.comments) && sub.comments.length) {
    const comments = sub.comments.map((c) => `<div>${escapeHtml(c.text)}</div>`).join('');
    parts.push(`<div class="comment-block">${comments}</div>`);
  }
  return parts.join('');
}

function renderTabs() {
  courseTabs.innerHTML = courseIds
    .map((id) => `<div class="tab" data-id="${id}">${escapeHtml(data[id].name)}</div>`)
    .join('');
  courseTabs.querySelectorAll('.tab').forEach((el) => {
    el.addEventListener('click', () => selectCourse(el.dataset.id));
  });
  courseIds.forEach((id) => {
    const c = data[id];
    if (!c.submissions) return;
    const needs = c.submissions.filter((s) => s.workflow_state === 'submitted' && s.grade == null).length;
    if (needs > 0) {
      const tab = courseTabs.querySelector(`.tab[data-id="${id}"]`);
      tab.insertAdjacentHTML('beforeend', ` <span class="badge">${needs}</span>`);
    }
  });
}

function selectCourse(id) {
  activeCourseId = id;
  courseTabs.querySelectorAll('.tab').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === id);
  });
  render(data[id]);
}

function render(courseData) {
  const { assignment, submissions } = courseData;
  if (!assignment) {
    content.innerHTML = '<p class="empty">No past-due assignments found for this course.</p>';
    return;
  }

  const header = `
    <div class="assignment-header">
      <h2>${escapeHtml(assignment.name)}</h2>
      <div class="meta">
        Due ${fmtDate(assignment.due_at)} · ${assignment.points_possible ?? '—'} pts ·
        ${submissions.length} student${submissions.length === 1 ? '' : 's'}
      </div>
    </div>`;

  const cards = submissions
    .map((sub) => {
      const status = statusOf(sub, assignment.due_at);
      return `
      <div class="submission-card">
        <div class="row">
          <div>
            <div class="student-name">${escapeHtml(sub.student)}</div>
            <div class="sub-meta">Submitted ${fmtDate(sub.submitted_at)}</div>
          </div>
          <span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span>
        </div>
        <div class="sub-body">${renderSubmissionBody(sub)}</div>
      </div>`;
    })
    .join('');

  content.innerHTML = header + (cards || '<p class="empty">No students found.</p>');
}

async function init() {
  try {
    const res = await fetch('data.json');
    data = await res.json();
    courseIds = Object.keys(data);
    renderTabs();
    if (courseIds.length) selectCourse(courseIds[0]);

    const metaRes = await fetch('meta.json').catch(() => null);
    if (metaRes && metaRes.ok) {
      const meta = await metaRes.json();
      snapshotTimeEl.textContent = `Snapshot taken ${fmtDate(meta.generated_at)}`;
    }
  } catch (err) {
    content.innerHTML = `<p class="error">Couldn't load snapshot data: ${escapeHtml(err.message)}</p>`;
  }
}

init();
