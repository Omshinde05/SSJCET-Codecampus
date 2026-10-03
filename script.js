"use strict";

/* ==========================================
   SSJCET CODECAMPUS
   Computer Department Management Portal
   ========================================== */

const $ = selector => document.querySelector(selector);

const HOD_NAME = "Prof. Vishal Shinde Sir";

const subjects = [
  {
    name: "Computer Networks",
    abbreviation: "CN",
    teachers: ["Prof. Satish Manje", "Prof. Kanchan Mam"]
  },
  {
    name: "Web Technology",
    abbreviation: "WebTech",
    teachers: ["Prof. Satish Manje"]
  },
  {
    name: "Software Engineering",
    abbreviation: "SE",
    teachers: ["Prof. Shweta Mam"]
  },
  {
    name: "Artificial Intelligence and Soft Computing",
    abbreviation: "AISC",
    teachers: ["Prof. Deepika Mam"]
  },
  {
    name: "Data Warehousing and Management",
    abbreviation: "DWM",
    teachers: ["Prof. Swati Gite"]
  },
  {
    name: "Indian Knowledge System",
    abbreviation: "IKS",
    teachers: ["Prof. Wankhede Sir"]
  }
];

const roles = ["Student", "Teacher", "HOD", "Coordinator"];

const pageTitles = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks & Results",
  assignments: "Assignments",
  timetable: "Timetable",
  notices: "Department Notices",
  people: "People & Classes",
  approvals: "Approvals",
  settings: "Settings"
};

const rolePages = {
  Student: [
    "dashboard", "attendance", "marks", "assignments",
    "timetable", "notices", "people", "settings"
  ],
  Teacher: [
    "dashboard", "attendance", "marks", "assignments",
    "timetable", "notices", "people", "settings"
  ],
  HOD: [
    "dashboard", "attendance", "marks", "assignments",
    "timetable", "notices", "people", "approvals", "settings"
  ],
  Coordinator: [
    "dashboard", "attendance", "marks", "assignments",
    "timetable", "notices", "people", "approvals", "settings"
  ]
};

/* ==========================================
   DEMO DATA
   ========================================== */

const initialAttendance = [
  { subject: "Computer Networks", present: 24, total: 28 },
  { subject: "Web Technology", present: 26, total: 28 },
  { subject: "Software Engineering", present: 25, total: 28 },
  {
    subject: "Artificial Intelligence and Soft Computing",
    present: 23,
    total: 28
  },
  {
    subject: "Data Warehousing and Management",
    present: 22,
    total: 28
  },
  { subject: "Indian Knowledge System", present: 27, total: 28 }
];

const initialMarks = [
  { subject: "Computer Networks", obtained: 18, total: 25 },
  { subject: "Web Technology", obtained: 21, total: 25 },
  { subject: "Software Engineering", obtained: 20, total: 25 },
  {
    subject: "Artificial Intelligence and Soft Computing",
    obtained: 19,
    total: 25
  },
  {
    subject: "Data Warehousing and Management",
    obtained: 22,
    total: 25
  },
  { subject: "Indian Knowledge System", obtained: 23, total: 25 }
];

const initialAssignments = [
  {
    id: 1,
    subject: "Web Technology",
    title: "HTML and CSS Practical",
    due: "10 Oct 2026",
    status: "Pending"
  },
  {
    id: 2,
    subject: "Computer Networks",
    title: "Networking Fundamentals",
    due: "12 Oct 2026",
    status: "Pending"
  },
  {
    id: 3,
    subject: "Software Engineering",
    title: "SDLC Assignment",
    due: "15 Oct 2026",
    status: "Submitted"
  }
];

const initialNotices = [
  {
    id: 1,
    title: "Welcome to SSJCET CodeCampus",
    message: "Welcome to the Computer Department portal.",
    date: "03 Oct 2026",
    author: HOD_NAME
  },
  {
    id: 2,
    title: "Department Faculty Information",
    message: "Visit People & Classes to view subjects and faculty.",
    date: "03 Oct 2026",
    author: "Computer Department"
  }
];

const initialApprovals = [
  {
    id: 1,
    title: "Sample attendance correction",
    requestedBy: "Demo Student",
    status: "Pending"
  }
];

const state = {
  role: "Student",
  user: "Om Shinde",
  page: "dashboard",
  attendance: structuredClone(initialAttendance),
  marks: structuredClone(initialMarks),
  assignments: structuredClone(initialAssignments),
  notices: structuredClone(initialNotices),
  approvals: structuredClone(initialApprovals),
  nextId: 4
};

/* ==========================================
   HELPER FUNCTIONS
   ========================================== */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function initials(name) {
  return name.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] || "")
    .join("")
    .toUpperCase();
}

function canAccess(page) {
  return (rolePages[state.role] || rolePages.Student).includes(page);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function openModal(title, content) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = content;
  $("#modalBackdrop").hidden = false;
}

function closeModal() {
  $("#modalBackdrop").hidden = true;
}

function todayString() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function goTo(page) {
  if (!pageTitles[page]) return;

  if (!canAccess(page)) {
    showToast("This page is not available for this role.");
    return;
  }

  state.page = page;
  render();

  $("#sidebar")?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function subjectOptions() {
  return subjects.map(subject => `
    <option value="${escapeHTML(subject.name)}">
      ${escapeHTML(subject.name)}
    </option>
  `).join("");
}

/* ==========================================
   HEADER AND NAVIGATION
   ========================================== */

function updateHeader() {
  const sidebarUser = $("#sidebarUser");
  const sidebarRole = $("#sidebarRole");
  const headerUser = $("#headerUser");
  const pageHeading = $("#pageHeading");

  if (sidebarUser) sidebarUser.textContent = state.user;
  if (sidebarRole) sidebarRole.textContent = state.role;
  if (headerUser) headerUser.textContent = state.user;

  document.querySelectorAll(".avatar").forEach(avatar => {
    avatar.textContent = initials(state.user);
  });

  if (pageHeading) {
    pageHeading.textContent = pageTitles[state.page] || "Dashboard";
  }

  document.querySelectorAll("#navigation [data-page]").forEach(button => {
    const page = button.dataset.page;

    button.hidden = !canAccess(page);
    button.classList.toggle("active", state.page === page);

    if (state.page === page) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

/* ==========================================
   DASHBOARD
   ========================================== */

function dashboardPage() {
  const present = state.attendance.reduce(
    (sum, item) => sum + item.present, 0
  );

  const total = state.attendance.reduce(
    (sum, item) => sum + item.total, 0
  );

  const attendancePercent = total
    ? Math.round(present / total * 100)
    : 0;

  const averageMarks = state.marks.length
    ? Math.round(
        state.marks.reduce((sum, item) => sum + item.obtained, 0) /
        state.marks.length
      )
    : 0;

  const pending = state.assignments.filter(
    item => item.status === "Pending"
  ).length;

  return `
    <section class="welcome-banner">
      <div>
        <h2>Welcome back, ${escapeHTML(state.user)}! 👋</h2>
        <p>
          ${escapeHTML(state.role)} Portal · Computer Department<br>
          HOD: ${escapeHTML(HOD_NAME)}
        </p>
      </div>
      <div class="banner-tag">Academic Year 2026–27</div>
    </section>

    <div class="stats-grid">
      <article class="stat-card">
        <div class="stat-label">Department Subjects</div>
        <div class="stat-value">${subjects.length}</div>
        <div class="stat-foot">Faculty directory</div>
      </article>

      <article class="stat-card">
        <div class="stat-label">Sample Attendance</div>
        <div class="stat-value">${attendancePercent}%</div>
        <div class="stat-foot">Demo records</div>
      </article>

      <article class="stat-card">
        <div class="stat-label">Average Sample Marks</div>
        <div class="stat-value">${averageMarks}/25</div>
        <div class="stat-foot">Six subjects</div>
      </article>

      <article class="stat-card">
        <div class="stat-label">Pending Assignments</div>
        <div class="stat-value">${pending}</div>
        <div class="stat-foot">Demo records</div>
      </article>
    </div>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Head of Department</h2>
          <p>Computer Department</p>
        </div>
        <span class="pill">HOD</span>
      </div>

      <div class="hod-card">
        <h3>${escapeHTML(HOD_NAME)}</h3>
        <p>Head of Department · SSJCET</p>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" data-page="people">
          View Faculty
        </button>
        <button class="btn" data-page="timetable">
          View TE Timetable
        </button>
        <button class="btn" data-page="notices">
          Department Notices
        </button>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Subjects & Faculty</h2>
          <p>Computer Department</p>
        </div>
        <button class="btn" data-page="people">View All</button>
      </div>

      <div class="subject-grid">
        ${subjects.map((subject, index) => `
          <article class="subject-card">
            <div class="subject-icon">${index + 1}</div>
            <h3>${escapeHTML(subject.name)}</h3>
            <p>${subject.teachers.map(escapeHTML).join(" / ")}</p>
            <span class="pill">${escapeHTML(subject.abbreviation)}</span>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Recent Notices</h2>
          <p>Department announcements</p>
        </div>
        <button class="btn" data-page="notices">View Notices</button>
      </div>
      ${noticeCards(2)}
    </section>
  `;
}

/* ==========================================
   ATTENDANCE
   ========================================== */

function attendancePage() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Attendance</h2>
          <p>Subject-wise attendance</p>
        </div>
        <span class="pill">DEMO DATA</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SUBJECT</th>
              <th>PRESENT</th>
              <th>TOTAL</th>
              <th>ATTENDANCE</th>
            </tr>
          </thead>
          <tbody>
            ${state.attendance.map(item => {
              const percentage = item.total
                ? Math.round(item.present / item.total * 100)
                : 0;

              return `
                <tr>
                  <td>${escapeHTML(item.subject)}</td>
                  <td>${item.present}</td>
                  <td>${item.total}</td>
                  <td><strong>${percentage}%</strong></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <p class="form-note">Attendance figures are sample data.</p>

      ${state.role !== "Student" ? `
        <button class="btn btn-primary" data-action="record-attendance">
          Record Attendance
        </button>
      ` : ""}
    </section>
  `;
}

/* ==========================================
   MARKS AND RESULTS
   ========================================== */

function marksPage() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Marks & Results</h2>
          <p>Internal assessment</p>
        </div>
        <span class="pill">OUT OF 25</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SUBJECT</th>
              <th>MARKS</th>
              <th>TOTAL</th>
              <th>PERCENTAGE</th>
            </tr>
          </thead>
          <tbody>
            ${state.marks.map(item => `
              <tr>
                <td>${escapeHTML(item.subject)}</td>
                <td>${item.obtained}</td>
                <td>${item.total}</td>
                <td>${Math.round(item.obtained / item.total * 100)}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <p class="form-note">Marks are sample data, not official results.</p>

      ${state.role !== "Student" ? `
        <button class="btn btn-primary" data-action="add-marks">
          Add Marks
        </button>
      ` : ""}
    </section>
  `;
}

/* ==========================================
   ASSIGNMENTS
   ========================================== */

function assignmentsPage() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Assignments</h2>
          <p>Subject-wise assignment tracker</p>
        </div>

        ${state.role !== "Student" ? `
          <button class="btn btn-primary" data-action="add-assignment">
            + New Assignment
          </button>
        ` : ""}
      </div>

      ${state.assignments.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ASSIGNMENT</th>
                <th>SUBJECT</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${state.assignments.map(item => `
                <tr>
                  <td>${escapeHTML(item.title)}</td>
                  <td>${escapeHTML(item.subject)}</td>
                  <td>${escapeHTML(item.due)}</td>
                  <td>
                    <span class="badge ${item.status === "Pending" ? "pending" : ""}">
                      ${escapeHTML(item.status)}
                    </span>
                  </td>
                  <td>
                    ${state.role === "Student" && item.status === "Pending"
                      ? `<button class="btn" data-action="submit-assignment" data-id="${item.id}">Mark Submitted</button>`
                      : "—"}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">No assignments available.</div>
      `}

      <p class="form-note">Assignment changes are temporary demo records.</p>
    </section>
  `;
}

/* ==========================================
   TIMETABLE
   NOTE: Verify these sample periods against
   your official college timetable.
   ========================================== */

function timetablePage() {
  const timetable = [
    {
      day: "Monday",
      periods: [
        "CN (TH) (MAN)",
        "CN (TH) (MAN)",
        "DWM-TH (GSB)",
        "DWM-TH (GSB)",
        "BREAK",
        "OE (MSJ)",
        "AISC-PR",
        "AISC-PR"
      ]
    },
    {
      day: "Tuesday",
      periods: [
        "MDM-TH (DNG)",
        "MDM-TH (DNG)",
        "SE-PR-SC",
        "SE-PR-SC",
        "BREAK",
        "CN-TH (MAN)",
        "DWM-TH/PR (GSB)",
        "DWM-TH/PR (GSB)"
      ]
    },
    {
      day: "Wednesday",
      periods: [
        "SE-(TH) SC.",
        "SE-(TH) SC.",
        "AISC-TH (DDM)",
        "AISC-TH (DDM)",
        "BREAK",
        "IKS (PR) (WP)",
        "IKS (PR) (WP)",
        "AISC-PR"
      ]
    },
    {
      day: "Thursday",
      periods: [
        "IKS (TH) (WP)",
        "IKS (TH) (WP)",
        "CN/MDM (PR)",
        "CN/MDM (PR)",
        "BREAK",
        "AISC-TH (DDM)",
        "AISC-TH (DDM)",
        "MDM-PR (DNG)"
      ]
    }
  ];

  const times = [
    "9:30–10:30",
    "10:30–11:30",
    "11:30–12:30",
    "12:30–1:30",
    "1:30–2:00",
    "2:00–3:00",
    "3:00–4:00",
    "4:00–5:00"
  ];

  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>TE Class Timetable</h2>
          <p>SSJCET · Computer Department</p>
        </div>
        <span class="pill">TE</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>DAY</th>
              ${times.map(time => `
                <th>${escapeHTML(time)}</th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            ${timetable.map(day => `
              <tr>
                <td><strong>${escapeHTML(day.day)}</strong></td>
                ${day.periods.map(period => `
                  <td>${escapeHTML(period)}</td>
                `).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/* ==========================================
   NOTICES
   ========================================== */

function noticeCards(limit = Infinity) {
  const notices = state.notices.slice(0, limit);

  if (!notices.length) {
    return `<div class="empty-state">No notices available.</div>`;
  }

  return notices.map(notice => `
    <article class="notice-card">
      <h3>${escapeHTML(notice.title)}</h3>
      <p>${escapeHTML(notice.message)}</p>
      <p class="small-text">
        ${escapeHTML(notice.author)} · ${escapeHTML(notice.date)}
      </p>
    </article>
  `).join("");
}

function noticesPage() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Department Notices</h2>
          <p>Computer Department announcements</p>
        </div>

        ${["HOD", "Coordinator"].includes(state.role) ? `
          <button class="btn btn-primary" data-action="add-notice">
            + Create Notice
          </button>
        ` : ""}
      </div>

      ${noticeCards()}
    </section>
  `;
}

/* ==========================================
   PEOPLE AND CLASSES
   ========================================== */

function peoplePage() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Department Leadership</h2>
          <p>SSJCET Computer Department</p>
        </div>
        <span class="pill">HOD</span>
      </div>

      <div class="hod-card">
        <h3>${escapeHTML(HOD_NAME)}</h3>
        <p>Head of Department</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Subjects & Faculty</h2>
          <p>Computer Department</p>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NO.</th>
              <th>SUBJECT</th>
              <th>ABBREVIATION</th>
              <th>FACULTY</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map((subject, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHTML(subject.name)}</strong></td>
                <td>${escapeHTML(subject.abbreviation)}</td>
                <td>${subject.teachers.map(escapeHTML).join(" / ")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Demo Role Switch</h2>
          <p>Preview the portal using different roles</p>
        </div>
      </div>

      <div class="btn-row">
        ${roles.map(role => `
          <button
            class="btn ${state.role === role ? "btn-primary" : ""}"
            data-action="switch-role"
            data-id="${escapeHTML(role)}"
          >
            ${escapeHTML(role)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

/* ==========================================
   APPROVALS
   ========================================== */

function approvalsPage() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Approvals</h2>
          <p>Demo requests</p>
        </div>
        <span class="pill">DEMO</span>
      </div>

      ${state.approvals.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REQUEST</th>
                <th>REQUESTED BY</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${state.approvals.map(item => `
                <tr>
                  <td>${escapeHTML(item.title)}</td>
                  <td>${escapeHTML(item.requestedBy)}</td>
                  <td>${escapeHTML(item.status)}</td>
                  <td>
                    ${item.status === "Pending" ? `
                      <button class="btn"
                        data-action="approve"
                        data-id="${item.id}">
                        Approve
                      </button>

                      <button class="btn btn-danger"
                        data-action="reject"
                        data-id="${item.id}">
                        Reject
                      </button>
                    ` : "Reviewed"}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">No pending requests.</div>
      `}
    </section>
  `;
}

/* ==========================================
   SETTINGS
   ========================================== */

function settingsPage() {
  return `
    <div class="settings-layout">
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Profile Settings</h2>
            <p>Update your demo profile</p>
          </div>
        </div>

        <form id="settingsForm">
          <div class="field">
            <label for="profileName">Display Name</label>
            <input
              id="profileName"
              maxlength="60"
              value="${escapeHTML(state.user)}"
              required
            >
          </div>

          <div class="field">
            <label for="roleSelect">Demo Role</label>
            <select id="roleSelect">
              ${roles.map(role => `
                <option value="${escapeHTML(role)}"
                  ${state.role === role ? "selected" : ""}>
                  ${escapeHTML(role)}
                </option>
              `).join("")}
            </select>
          </div>

          <button class="btn btn-primary" type="submit">
            Save Settings
          </button>
        </form>

        <p class="form-note">
          Role switching is for demonstration only.
        </p>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Department Information</h2>
            <p>Project details</p>
          </div>
        </div>

        <div class="field">
          <label>College</label>
          <input
            value="Shivajirao S. Jondhale College of Engineering"
            readonly
          >
        </div>

        <div class="field">
          <label>Department</label>
          <input value="Computer Department" readonly>
        </div>

        <div class="field">
          <label>HOD</label>
          <input value="${escapeHTML(HOD_NAME)}" readonly>
        </div>

        <div class="field">
          <label>Total Subjects</label>
          <input value="${subjects.length}" readonly>
        </div>

        <button class="btn btn-danger" data-action="reset-demo">
          Reset Demo Data
        </button>
      </section>
    </div>
  `;
}

/* ==========================================
   RENDER CURRENT PAGE
   ========================================== */

function render() {
  if (!canAccess(state.page)) {
    state.page = "dashboard";
  }

  updateHeader();

  const pages = {
    dashboard: dashboardPage,
    attendance: attendancePage,
    marks: marksPage,
    assignments: assignmentsPage,
    timetable: timetablePage,
    notices: noticesPage,
    people: peoplePage,
    approvals: approvalsPage,
    settings: settingsPage
  };

  $("#pageContent").innerHTML = pages[state.page]();
}

/* ==========================================
   BUTTON ACTIONS
   ========================================== */

function handleAction(action, id) {
  switch (action) {
    case "switch-role": {
      if (!roles.includes(id)) return;

      state.role = id;
      state.page = "dashboard";

      render();
      showToast("Role changed to " + id + ".");
      break;
    }

    case "submit-assignment": {
      const assignment = state.assignments.find(
        item => item.id === Number(id)
      );

      if (!assignment || state.role !== "Student") return;

      assignment.status = "Submitted";

      render();
      showToast("Assignment marked as submitted.");
      break;
    }

    case "add-assignment": {
      if (state.role === "Student") return;

      openModal("New Assignment", `
        <form id="assignmentForm">
          <div class="field">
            <label for="assignmentTitle">Assignment Title</label>
            <input id="assignmentTitle" maxlength="100" required>
          </div>

          <div class="field">
            <label for="assignmentSubject">Subject</label>
            <select id="assignmentSubject">${subjectOptions()}</select>
          </div>

          <div class="field">
            <label for="assignmentDue">Due Date</label>
            <input id="assignmentDue" type="date" required>
          </div>

          <button class="btn btn-primary" type="submit">
            Create Assignment
          </button>
        </form>
      `);
      break;
    }

    case "add-notice": {
      if (!["HOD", "Coordinator"].includes(state.role)) return;

      openModal("Create Notice", `
        <form id="noticeForm">
          <div class="field">
            <label for="noticeTitle">Notice Title</label>
            <input id="noticeTitle" maxlength="100" required>
          </div>

          <div class="field">
            <label for="noticeMessage">Notice Details</label>
            <textarea
              id="noticeMessage"
              maxlength="1000"
              required
            ></textarea>
          </div>

          <button class="btn btn-primary" type="submit">
            Publish Notice
          </button>
        </form>
      `);
      break;
    }

    case "add-marks": {
      if (state.role === "Student") return;

      openModal("Add Marks", `
        <form id="marksForm">
          <div class="field">
            <label for="marksSubject">Subject</label>
            <select id="marksSubject">${subjectOptions()}</select>
          </div>

          <div class="field">
            <label for="marksObtained">Marks out of 25</label>
            <input
              id="marksObtained"
              type="number"
              min="0"
              max="25"
              required
            >
          </div>

          <button class="btn btn-primary" type="submit">
            Save Marks
          </button>
        </form>
      `);
      break;
    }

    case "record-attendance": {
      if (state.role === "Student") return;

      openModal("Record Attendance", `
        <form id="attendanceForm">
          <div class="field">
            <label for="attendanceSubject">Subject</label>
            <select id="attendanceSubject">${subjectOptions()}</select>
          </div>

          <div class="field">
            <label for="attendancePresent">Students Present</label>
            <input
              id="attendancePresent"
              type="number"
              min="0"
              required
            >
          </div>

          <div class="field">
            <label for="attendanceTotal">Total Students</label>
            <input
              id="attendanceTotal"
              type="number"
              min="1"
              required
            >
          </div>

          <button class="btn btn-primary" type="submit">
            Save Attendance
          </button>
        </form>
      `);
      break;
    }

    case "approve":
    case "reject": {
      if (!["HOD", "Coordinator"].includes(state.role)) return;

      const request = state.approvals.find(
        item => item.id === Number(id)
      );

      if (!request || request.status !== "Pending") return;

      request.status = action === "approve" ? "Approved" : "Rejected";

      render();
      showToast("Request " + request.status.toLowerCase() + ".");
      break;
    }

    case "reset-demo": {
      if (!confirm("Reset all demo changes?")) return;

      state.role = "Student";
      state.user = "Om Shinde";
      state.page = "dashboard";
      state.attendance = structuredClone(initialAttendance);
      state.marks = structuredClone(initialMarks);
      state.assignments = structuredClone(initialAssignments);
      state.notices = structuredClone(initialNotices);
      state.approvals = structuredClone(initialApprovals);
      state.nextId = 4;

      closeModal();
      render();
      showToast("Demo data reset.");
      break;
    }

    default:
      showToast("Action unavailable.");
  }
}

/* ==========================================
   FORM SUBMISSIONS
   ========================================== */

$("#pageContent").addEventListener("submit", event => {
  const form = event.target;

  event.preventDefault();

  if (form.id === "settingsForm") {
    const name = $("#profileName").value.trim();
    const role = $("#roleSelect").value;

    if (!name || !roles.includes(role)) {
      showToast("Enter a valid name and role.");
      return;
    }

    state.user = name;
    state.role = role;
    state.page = "settings";

    render();
    showToast("Settings saved.");
    return;
  }

  if (form.id === "assignmentForm") {
    const title = $("#assignmentTitle").value.trim();
    const subject = $("#assignmentSubject").value;
    const dateValue = $("#assignmentDue").value;

    if (!title || !dateValue) {
      showToast("Complete all fields.");
      return;
    }

    const due = new Date(dateValue + "T12:00:00")
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

    state.assignments.push({
      id: state.nextId++,
      title,
      subject,
      due,
      status: "Pending"
    });

    closeModal();
    render();
    showToast("Assignment created.");
    return;
  }

  if (form.id === "noticeForm") {
    const title = $("#noticeTitle").value.trim();
    const message = $("#noticeMessage").value.trim();

    if (!title || !message) {
      showToast("Complete all fields.");
      return;
    }

    state.notices.unshift({
      id: state.nextId++,
      title,
      message,
      date: todayString(),
      author: state.user
    });

    closeModal();
    render();
    showToast("Notice published.");
    return;
  }

  if (form.id === "marksForm") {
    const subject = $("#marksSubject").value;
    const obtained = Number($("#marksObtained").value);

    if (
      !Number.isFinite(obtained) ||
      obtained < 0 ||
      obtained > 25
    ) {
      showToast("Marks must be between 0 and 25.");
      return;
    }

    const existing = state.marks.find(
      item => item.subject === subject
    );

    if (existing) {
      existing.obtained = obtained;
    } else {
      state.marks.push({
        subject,
        obtained,
        total: 25
      });
    }

    closeModal();
    render();
    showToast("Marks saved.");
    return;
  }

  if (form.id === "attendanceForm") {
    const subject = $("#attendanceSubject").value;
    const present = Number($("#attendancePresent").value);
    const total = Number($("#attendanceTotal").value);

    if (
      !Number.isInteger(present) ||
      !Number.isInteger(total) ||
      total < 1 ||
      present < 0 ||
      present > total
    ) {
      showToast("Enter valid attendance counts.");
      return;
    }

    const existing = state.attendance.find(
      item => item.subject === subject
    );

    if (existing) {
      existing.present = present;
      existing.total = total;
    } else {
      state.attendance.push({
        subject,
        present,
        total
      });
    }

    closeModal();
    render();
    showToast("Attendance saved.");
  }
});

/* ==========================================
   NAVIGATION EVENTS
   ========================================== */

$("#navigation").addEventListener("click", event => {
  const button = event.target.closest("[data-page]");

  if (button) {
    goTo(button.dataset.page);
  }
});

$("#pageContent").addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    goTo(pageButton.dataset.page);
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    handleAction(
      actionButton.dataset.action,
      actionButton.dataset.id
    );
  }
});

/* ==========================================
   PROFILE, MENU AND MODAL
   ========================================== */

$("#profileButton").addEventListener("click", () => {
  goTo("settings");
});

$("#menuButton").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

$("#noticeButton").addEventListener("click", () => {
  goTo("notices");
});

$("#closeModal").addEventListener("click", closeModal);

$("#modalBackdrop").addEventListener("click", event => {
  if (event.target === $("#modalBackdrop")) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* ==========================================
   LIGHT / DARK MODE
   ========================================== */

const themeToggle = $("#themeToggle");

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.textContent = isDark ? "☀️" : "🌙";

    themeToggle.title = isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

    themeToggle.setAttribute(
      "aria-label",
      themeToggle.title
    );
  }
}

let savedTheme = "light";

try {
  savedTheme = localStorage.getItem("ssjcet-theme") || "light";
} catch (error) {
  console.warn("Theme storage is unavailable.", error);
}

applyTheme(savedTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode")
    ? "light"
    : "dark";

  applyTheme(nextTheme);

  try {
    localStorage.setItem("ssjcet-theme", nextTheme);
  } catch (error) {
    console.warn("Could not save the theme preference.", error);
  }
});

/* ==========================================
   START APPLICATION
   ========================================== */

render();