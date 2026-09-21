const API_URL = "http://127.0.0.1:8000";


/* =========================================================
   GET LOGGED-IN USER
========================================================= */

function getLoggedInStudent() {

    try {

        const value = localStorage.getItem("student");

        if (!value) {
            return null;
        }

        return JSON.parse(value);

    } catch (error) {

        console.error("SESSION ERROR:", error);

        localStorage.removeItem("student");

        return null;
    }
}


/* =========================================================
   SAVE LOGGED-IN USER
========================================================= */

function saveLoggedInStudent(student) {

    if (!student) {
        return;
    }

    localStorage.setItem(
        "student",
        JSON.stringify(student)
    );
}


/* =========================================================
   CLEAR SESSION
========================================================= */

function clearSession() {

    localStorage.removeItem("student");
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    clearSession();

    window.location.href = "index.html";
}


/* =========================================================
   REQUIRE LOGIN
========================================================= */

function requireLogin() {

    const student = getLoggedInStudent();

    if (!student) {

        window.location.href = "index.html";

        return null;
    }

    return student;
}


/* =========================================================
   GET USER NAME
========================================================= */

function getStudentName(student) {

    if (!student) {
        return "Employee";
    }

    return (
        student.name ||
        student.full_name ||
        student.FullName ||
        student.fullName ||
        "Employee"
    );
}


/* =========================================================
   GET EMPLOYEE / STUDENT ID
========================================================= */

function getStudentCode(student) {

    if (!student) {
        return "—";
    }

    return (
        student.student_code ||
        student.employee_id ||
        student.employeeCode ||
        student.StudentCode ||
        student.studentCode ||
        "—"
    );
}


/* =========================================================
   GET EMAIL
========================================================= */

function getStudentEmail(student) {

    if (!student) {
        return "—";
    }

    return (
        student.email ||
        student.Email ||
        "—"
    );
}


/* =========================================================
   GET COURSE / DEPARTMENT
========================================================= */

function getStudentCourse(student) {

    if (!student) {
        return "—";
    }

    return (
        student.course ||
        student.course_name ||
        student.CourseName ||
        student.department ||
        student.Department ||
        "—"
    );
}


/* =========================================================
   GET BATCH / TEAM
========================================================= */

function getStudentBatch(student) {

    if (!student) {
        return "—";
    }

    return (
        student.batch ||
        student.batch_name ||
        student.BatchName ||
        student.team ||
        student.Team ||
        "—"
    );
}


/* =========================================================
   GET ACCOUNT STATUS
========================================================= */

function getStudentStatus(student) {

    if (!student) {
        return "Unknown";
    }

    if (
        student.is_active === true ||
        student.IsActive === true ||
        student.isActive === true ||
        student.is_active === 1 ||
        student.IsActive === 1
    ) {

        return "Active";
    }

    if (
        student.is_active === false ||
        student.IsActive === false ||
        student.isActive === false ||
        student.is_active === 0 ||
        student.IsActive === 0
    ) {

        return "Inactive";
    }

    return (
        student.status ||
        student.Status ||
        "Active"
    );
}


/* =========================================================
   INITIALS
========================================================= */

function initials(name) {

    if (!name) {
        return "U";
    }

    const words = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "U";
    }

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   COMMON USER UI
========================================================= */

function setCommonStudentUI(student) {

    if (!student) {
        return;
    }

    const name = getStudentName(student);
    const code = getStudentCode(student);
    const email = getStudentEmail(student);
    const course = getStudentCourse(student);
    const batch = getStudentBatch(student);
    const status = getStudentStatus(student);
    const avatar = initials(name);


    /* -----------------------------------------
       COMMON FIELD MAPPINGS
    ----------------------------------------- */

    const mappings = {

        topName: name,
        topCode: code,

        sidebarName: name,
        sidebarCode: code,

        sidebarEmail: email,

        topAvatar: avatar,
        sidebarAvatar: avatar,

        studentName: name,
        studentCode: code,
        studentEmail: email,
        studentCourse: course,
        studentBatch: batch,
        studentStatus: status,

        profileName: name,
        profileFullName: name,
        profileCode: code,
        profileEmail: email,
        profileEmail2: email,
        profileCourse: course,
        profileBatch: batch,
        profileStatus: status,

        welcomeName: name,

        dashboardName: name,
        dashboardCode: code
    };


    /* -----------------------------------------
       WRITE TEXT INTO ELEMENTS
    ----------------------------------------- */

    Object.keys(mappings).forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.textContent =
            mappings[id];
    });


    /* -----------------------------------------
       AVATARS
    ----------------------------------------- */

    const avatarIds = [
        "topAvatar",
        "sidebarAvatar",
        "profileAvatar",
        "profileInitials",
        "studentAvatar",
        "dashboardAvatar"
    ];


    avatarIds.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.textContent = avatar;
    });


    /* -----------------------------------------
       BODY USER DATA
    ----------------------------------------- */

    document.body.dataset.studentCode = code;
    document.body.dataset.studentName = name;


    /* -----------------------------------------
       PAGE TITLE
    ----------------------------------------- */

    if (
        document.title &&
        !document.title.includes(name)
    ) {

        if (
            document.title.includes("Dashboard")
        ) {

            document.title =
                `HUECTECH | ${name}`;

        }
    }
}


/* =========================================================
   REFRESH USER DATA FROM BACKEND
========================================================= */

async function refreshLoggedInStudent() {

    const student =
        getLoggedInStudent();

    if (!student) {
        return null;
    }


    const studentId =
        student.student_id ||
        student.StudentID ||
        student.studentId;


    if (!studentId) {

        console.warn(
            "Student ID not available in session."
        );

        return student;
    }


    try {

        const data =
            await getJSON(
                `${API_URL}/profile/${studentId}`
            );


        const updatedStudent =
            data.student ||
            data.profile ||
            data.data ||
            data;


        if (
            updatedStudent &&
            typeof updatedStudent === "object"
        ) {

            const mergedStudent = {

                ...student,

                ...updatedStudent
            };


            saveLoggedInStudent(
                mergedStudent
            );


            setCommonStudentUI(
                mergedStudent
            );


            return mergedStudent;
        }

    } catch (error) {

        console.warn(
            "PROFILE REFRESH ERROR:",
            error.message
        );
    }


    return student;
}


/* =========================================================
   API REQUEST
========================================================= */

async function getJSON(
    url,
    options = {}
) {

    try {

        const response =
            await fetch(
                url,
                {
                    ...options,

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})
                    }
                }
            );


        let data = {};


        try {

            data =
                await response.json();

        } catch {

            data = {};
        }


        if (!response.ok) {

            let errorMessage =
                data.detail ||
                data.message ||
                data.error ||
                `Request failed (${response.status})`;


            if (
                Array.isArray(data.detail)
            ) {

                errorMessage =
                    data.detail
                        .map(item =>
                            item.msg ||
                            item.message ||
                            String(item)
                        )
                        .join(", ");
            }


            throw new Error(
                errorMessage
            );
        }


        return data;


    } catch (error) {

        console.error(
            "API ERROR:",
            url,
            error
        );


        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to connect to HUECTECH server. Please make sure the FastAPI backend is running on http://127.0.0.1:8000."
            );
        }


        throw error;
    }
}


/* =========================================================
   API URL HELPER
========================================================= */

function apiUrl(path) {

    if (!path) {
        return API_URL;
    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        return path;
    }


    if (!path.startsWith("/")) {

        path = "/" + path;
    }


    return API_URL + path;
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }


    try {

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    } catch {

        return String(value);
    }
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(value) {

    if (!value) {
        return "--:--";
    }


    try {

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);
        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );


    } catch {

        return String(value);
    }
}


/* =========================================================
   FORMAT DATE + TIME
========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "—";
    }


    try {

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);
        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );


    } catch {

        return String(value);
    }
}


/* =========================================================
   CALCULATE WORKING HOURS
========================================================= */

function calculateWorkingHours(
    checkIn,
    checkOut
) {

    if (!checkIn) {
        return "—";
    }


    const start =
        new Date(checkIn);


    const end =
        checkOut
            ? new Date(checkOut)
            : new Date();


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {

        return "—";
    }


    let difference =
        end.getTime() -
        start.getTime();


    if (difference < 0) {
        return "—";
    }


    const totalMinutes =
        Math.floor(
            difference / 60000
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    return `${hours}h ${minutes}m`;
}


/* =========================================================
   GET ATTENDANCE STATUS
========================================================= */

function getAttendanceStatus(record) {

    if (!record) {
        return "Not Marked";
    }


    if (
        record.status
    ) {

        return record.status;
    }


    if (
        record.Status
    ) {

        return record.Status;
    }


    const checkIn =
        record.check_in ||
        record.checkIn ||
        record.CheckIn;


    const checkOut =
        record.check_out ||
        record.checkOut ||
        record.CheckOut;


    if (
        checkIn &&
        checkOut
    ) {

        return "Present";
    }


    if (checkIn) {

        return "Checked In";
    }


    return "Not Marked";
}


/* =========================================================
   GET ATTENDANCE CHECK-IN
========================================================= */

function getCheckIn(record) {

    if (!record) {
        return null;
    }


    return (
        record.check_in ||
        record.checkIn ||
        record.CheckIn ||
        record.check_in_time ||
        record.checkInTime ||
        record.CheckInTime ||
        null
    );
}


/* =========================================================
   GET ATTENDANCE CHECK-OUT
========================================================= */

function getCheckOut(record) {

    if (!record) {
        return null;
    }


    return (
        record.check_out ||
        record.checkOut ||
        record.CheckOut ||
        record.check_out_time ||
        record.checkOutTime ||
        record.CheckOutTime ||
        null
    );
}


/* =========================================================
   GET ATTENDANCE DATE
========================================================= */

function getAttendanceDate(record) {

    if (!record) {
        return null;
    }


    return (
        record.date ||
        record.Date ||
        record.attendance_date ||
        record.AttendanceDate ||
        record.created_at ||
        record.CreatedAt ||
        null
    );
}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    elementId,
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `form-message ${type}`;


    element.style.display =
        "block";
}


/* =========================================================
   HIDE MESSAGE
========================================================= */

function hideMessage(elementId) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.style.display =
        "none";
}


/* =========================================================
   SET BUTTON LOADING
========================================================= */

function setButtonLoading(
    button,
    loading,
    loadingText = "Please wait..."
) {

    if (!button) {
        return;
    }


    if (loading) {

        if (
            !button.dataset.originalText
        ) {

            button.dataset.originalText =
                button.textContent;
        }


        button.disabled =
            true;


        button.textContent =
            loadingText;


    } else {

        button.disabled =
            false;


        if (
            button.dataset.originalText
        ) {

            button.textContent =
                button.dataset.originalText;
        }
    }
}


/* =========================================================
   ACTIVE SIDEBAR LINK
========================================================= */

function setActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const links =
        document.querySelectorAll(
            ".nav-link"
        );


    links.forEach(link => {

        const href =
            link.getAttribute("href");


        if (!href) {
            return;
        }


        const linkPage =
            href
                .split("/")
                .pop()
                .toLowerCase();


        link.classList.remove(
            "active"
        );


        if (
            linkPage ===
            currentPage
        ) {

            link.classList.add(
                "active"
            );
        }
    });
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initializeMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !menuButton ||
        !sidebar
    ) {

        return;
    }


    function closeMenu() {

        sidebar.classList.remove(
            "open"
        );


        if (overlay) {

            overlay.classList.remove(
                "show"
            );
        }


        document.body.classList.remove(
            "menu-open"
        );
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );


            if (overlay) {

                overlay.classList.toggle(
                    "show"
                );
            }


            document.body.classList.toggle(
                "menu-open"
            );
        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMenu
        );
    }


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMenu
            );
        });
}


/* =========================================================
   CLOSE MOBILE MENU ON RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900
        ) {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            const overlay =
                document.getElementById(
                    "sidebarOverlay"
                );


            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );
            }


            if (overlay) {

                overlay.classList.remove(
                    "show"
                );
            }


            document.body.classList.remove(
                "menu-open"
            );
        }
    }
);


/* =========================================================
   INITIALIZE COMMON UI
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const student =
            getLoggedInStudent();


        if (student) {

            setCommonStudentUI(
                student
            );
        }


        setActiveNavigation();

        initializeMobileMenu();
    }
);