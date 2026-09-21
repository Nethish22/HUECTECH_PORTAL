/* =========================================================
   HUECTECH EMPLOYEE DASHBOARD
   Dynamic Dashboard
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentStudent = null;

let todayAttendance = null;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("HUECTECH Dashboard loaded");


    /*
       Get logged-in employee/student
    */

    currentStudent = getLoggedInStudent();


    /*
       If nobody is logged in,
       send them back to login.
    */

    if (!currentStudent) {

        window.location.href = "index.html";

        return;

    }


    /*
       Setup logout
    */

    setupLogout();


    /*
       Setup mobile menu
    */

    setupMobileMenu();


    /*
       Display logged-in employee
    */

    displayEmployee(currentStudent);


    /*
       Load latest profile information
    */

    await loadEmployeeProfile();


    /*
       Load today's attendance
    */

    await loadTodayAttendance();


    /*
       Load attendance history
    */

    await loadAttendanceHistory();

});


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutButton");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.getElementById("mobileMenuButton");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (!menuButton || !sidebar || !overlay) {
        return;
    }


    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

            overlay.classList.toggle("show");

        }
    );


    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove("open");

            overlay.classList.remove("show");

        }
    );


    /*
       Close menu after clicking navigation
    */

    const navLinks =
        sidebar.querySelectorAll(".nav-item");


    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                sidebar.classList.remove("open");

                overlay.classList.remove("show");

            }
        );

    });

}


/* =========================================================
   DISPLAY EMPLOYEE
========================================================= */

function displayEmployee(student) {

    const name =
        student.name ||
        student.full_name ||
        student.FullName ||
        "Employee";


    const code =
        student.student_code ||
        student.employee_code ||
        student.StudentCode ||
        "—";


    const email =
        student.email ||
        student.Email ||
        "—";


    const course =
        student.course ||
        student.course_name ||
        student.CourseName ||
        "—";


    const batch =
        student.batch ||
        student.batch_name ||
        student.BatchName ||
        "—";


    const active =
        student.is_active !== false;


    /*
       Initials
    */

    const initialsValue =
        getInitials(name);


    /*
       Sidebar
    */

    setText(
        "sidebarName",
        name
    );


    setText(
        "sidebarCode",
        code
    );


    setText(
        "sidebarAvatar",
        initialsValue
    );


    /*
       Header
    */

    setText(
        "headerName",
        name
    );


    setText(
        "headerCode",
        code
    );


    setText(
        "headerAvatar",
        initialsValue
    );


    /*
       Welcome
    */

    setText(
        "welcomeName",
        getFirstName(name)
    );


    /*
       Profile
    */

    setText(
        "employeeName",
        name
    );


    setText(
        "employeeEmail",
        email
    );


    setText(
        "employeeCode",
        code
    );


    setText(
        "employeeCourse",
        course
    );


    setText(
        "employeeBatch",
        batch
    );


    setText(
        "profileAvatar",
        initialsValue
    );


    /*
       Account status
    */

    const statusElement =
        document.getElementById("employeeStatus");


    if (statusElement) {

        statusElement.textContent =
            active
                ? "Active"
                : "Inactive";


        statusElement.className =
            active
                ? "status-active"
                : "";

    }

}


/* =========================================================
   LOAD EMPLOYEE PROFILE
========================================================= */

async function loadEmployeeProfile() {

    if (!currentStudent) {
        return;
    }


    const studentId =
        currentStudent.student_id ||
        currentStudent.StudentID ||
        currentStudent.id;


    if (!studentId) {

        console.warn(
            "Student ID not available"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/profile/${studentId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load profile"
            );

        }


        const data =
            await response.json();


        /*
           Backend may return:

           {
             success: true,
             student: {...}
           }

           OR directly student object.
        */

        const profile =
            data.student ||
            data.profile ||
            data;


        if (profile) {

            /*
               Update local session
               with latest information.
            */

            currentStudent = {
                ...currentStudent,
                ...profile
            };


            saveLoggedInStudent(
                currentStudent
            );


            /*
               Refresh screen
            */

            displayEmployee(
                currentStudent
            );

        }

    }

    catch (error) {

        console.error(
            "Profile error:",
            error
        );

    }

}


/* =========================================================
   LOAD TODAY ATTENDANCE
========================================================= */

async function loadTodayAttendance() {

    if (!currentStudent) {
        return;
    }


    const studentId =
        currentStudent.student_id ||
        currentStudent.StudentID ||
        currentStudent.id;


    if (!studentId) {

        showAttendanceMessage(
            "Student ID is missing.",
            "error"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/attendance/today/${studentId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load today's attendance"
            );

        }


        const data =
            await response.json();


        todayAttendance =
            data.attendance ||
            data.data ||
            data;


        if (
            !todayAttendance ||
            todayAttendance.success === false
        ) {

            todayAttendance = null;

        }


        renderTodayAttendance();

    }

    catch (error) {

        console.error(
            "Today's attendance error:",
            error
        );


        /*
           Keep dashboard usable
           even if no attendance exists.
        */

        todayAttendance = null;

        renderTodayAttendance();

    }

}


/* =========================================================
   RENDER TODAY ATTENDANCE
========================================================= */

function renderTodayAttendance() {

    const attendance =
        todayAttendance;


    if (!attendance) {

        setText(
            "attendanceStatus",
            "Not Checked In"
        );


        setText(
            "checkInTime",
            "--:--"
        );


        setText(
            "checkOutTime",
            "--:--"
        );


        setText(
            "workingHours",
            "00:00"
        );


        setText(
            "statCheckIn",
            "--:--"
        );


        setText(
            "statCheckOut",
            "--:--"
        );


        setText(
            "statWorkingHours",
            "00:00"
        );


        updateAttendanceButtons(
            false,
            false
        );


        return;

    }


    const checkIn =
        getAttendanceValue(
            attendance,
            [
                "check_in",
                "checkIn",
                "CheckIn",
                "check_in_time",
                "CheckInTime"
            ]
        );


    const checkOut =
        getAttendanceValue(
            attendance,
            [
                "check_out",
                "checkOut",
                "CheckOut",
                "check_out_time",
                "CheckOutTime"
            ]
        );


    const status =
        getAttendanceValue(
            attendance,
            [
                "status",
                "Status"
            ]
        );


    const checkInDisplay =
        formatTime(checkIn);


    const checkOutDisplay =
        formatTime(checkOut);


    const workingHours =
        calculateWorkingHours(
            checkIn,
            checkOut
        );


    setText(
        "checkInTime",
        checkInDisplay
    );


    setText(
        "checkOutTime",
        checkOutDisplay
    );


    setText(
        "workingHours",
        workingHours
    );


    setText(
        "statCheckIn",
        checkInDisplay
    );


    setText(
        "statCheckOut",
        checkOutDisplay
    );


    setText(
        "statWorkingHours",
        workingHours
    );


    /*
       Status
    */

    let displayStatus =
        "Not Checked In";


    if (status) {

        displayStatus =
            status;

    }
    else if (checkIn && !checkOut) {

        displayStatus =
            "Checked In";

    }
    else if (checkIn && checkOut) {

        displayStatus =
            "Present";

    }


    setText(
        "attendanceStatus",
        displayStatus
    );


    /*
       Button state
    */

    const hasCheckIn =
        Boolean(checkIn);


    const hasCheckOut =
        Boolean(checkOut);


    updateAttendanceButtons(
        hasCheckIn,
        hasCheckOut
    );

}


/* =========================================================
   ATTENDANCE BUTTON STATE
========================================================= */

function updateAttendanceButtons(
    hasCheckIn,
    hasCheckOut
) {

    const checkInButton =
        document.getElementById(
            "checkInButton"
        );


    const checkOutButton =
        document.getElementById(
            "checkOutButton"
        );


    if (checkInButton) {

        checkInButton.disabled =
            hasCheckIn;

    }


    if (checkOutButton) {

        checkOutButton.disabled =
            !hasCheckIn ||
            hasCheckOut;

    }

}


/* =========================================================
   CHECK IN
========================================================= */

async function checkIn() {

    if (!currentStudent) {
        return;
    }


    const studentId =
        currentStudent.student_id ||
        currentStudent.StudentID ||
        currentStudent.id;


    if (!studentId) {

        showAttendanceMessage(
            "Student ID is missing.",
            "error"
        );

        return;

    }


    const button =
        document.getElementById(
            "checkInButton"
        );


    try {

        button.disabled = true;

        button.textContent =
            "Checking in...";


        const response =
            await fetch(
                `${API_URL}/attendance/check-in`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        student_id:
                            Number(studentId)
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                "Check-in failed"
            );

        }


        showAttendanceMessage(
            data.message ||
            "Attendance check-in successful.",
            "success"
        );


        /*
           Reload latest attendance
        */

        await loadTodayAttendance();

        await loadAttendanceHistory();

    }

    catch (error) {

        console.error(
            "Check-in error:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Unable to check in.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "✓ Check In";

    }

}


/* =========================================================
   CHECK OUT
========================================================= */

async function checkOut() {

    if (!currentStudent) {
        return;
    }


    const studentId =
        currentStudent.student_id ||
        currentStudent.StudentID ||
        currentStudent.id;


    if (!studentId) {

        showAttendanceMessage(
            "Student ID is missing.",
            "error"
        );

        return;

    }


    const button =
        document.getElementById(
            "checkOutButton"
        );


    try {

        button.disabled = true;

        button.textContent =
            "Checking out...";


        const response =
            await fetch(
                `${API_URL}/attendance/check-out`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        student_id:
                            Number(studentId)
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                "Check-out failed"
            );

        }


        showAttendanceMessage(
            data.message ||
            "Attendance check-out successful.",
            "success"
        );


        await loadTodayAttendance();

        await loadAttendanceHistory();

    }

    catch (error) {

        console.error(
            "Check-out error:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Unable to check out.",
            "error"
        );


        button.disabled = false;

        button.textContent =
            "↪ Check Out";

    }

}


/* =========================================================
   LOAD ATTENDANCE HISTORY
========================================================= */

async function loadAttendanceHistory() {

    if (!currentStudent) {
        return;
    }


    const studentId =
        currentStudent.student_id ||
        currentStudent.StudentID ||
        currentStudent.id;


    if (!studentId) {
        return;
    }


    const tableBody =
        document.getElementById(
            "attendanceHistory"
        );


    if (!tableBody) {
        return;
    }


    try {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-loading"
                >
                    Loading attendance records...
                </td>
            </tr>
        `;


        const response =
            await fetch(
                `${API_URL}/attendance/history/${studentId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load attendance history"
            );

        }


        const data =
            await response.json();


        const records =
            data.attendance ||
            data.history ||
            data.records ||
            data.data ||
            [];


        renderAttendanceHistory(
            Array.isArray(records)
                ? records
                : []
        );

    }

    catch (error) {

        console.error(
            "Attendance history error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-loading"
                >
                    Unable to load attendance records.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderAttendanceHistory(
    records
) {

    const tableBody =
        document.getElementById(
            "attendanceHistory"
        );


    if (!tableBody) {
        return;
    }


    if (!records.length) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-loading"
                >
                    No attendance records found.
                </td>
            </tr>
        `;

        return;

    }


    /*
       Show latest records first
    */

    const sortedRecords =
        [...records].sort(
            function (a, b) {

                const dateA =
                    getAttendanceValue(
                        a,
                        [
                            "date",
                            "attendance_date",
                            "AttendanceDate",
                            "Date"
                        ]
                    ) || "";


                const dateB =
                    getAttendanceValue(
                        b,
                        [
                            "date",
                            "attendance_date",
                            "AttendanceDate",
                            "Date"
                        ]
                    ) || "";


                return String(dateB)
                    .localeCompare(
                        String(dateA)
                    );

            }
        );


    /*
       Only show recent 7
    */

    const recentRecords =
        sortedRecords.slice(0, 7);


    tableBody.innerHTML =
        recentRecords
            .map(function (record) {

                const date =
                    getAttendanceValue(
                        record,
                        [
                            "date",
                            "attendance_date",
                            "AttendanceDate",
                            "Date"
                        ]
                    );


                const checkIn =
                    getAttendanceValue(
                        record,
                        [
                            "check_in",
                            "checkIn",
                            "CheckIn",
                            "check_in_time",
                            "CheckInTime"
                        ]
                    );


                const checkOut =
                    getAttendanceValue(
                        record,
                        [
                            "check_out",
                            "checkOut",
                            "CheckOut",
                            "check_out_time",
                            "CheckOutTime"
                        ]
                    );


                const status =
                    getAttendanceValue(
                        record,
                        [
                            "status",
                            "Status"
                        ]
                    ) ||
                    (
                        checkIn
                            ? "Present"
                            : "Pending"
                    );


                const hours =
                    calculateWorkingHours(
                        checkIn,
                        checkOut
                    );


                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                formatDate(date)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatTime(checkIn)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatTime(checkOut)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(hours)}
                        </td>

                        <td>
                            <span
                                class="table-status ${getStatusClass(status)}"
                            >
                                ${escapeHTML(
                                    status
                                )}
                            </span>
                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================================
   GET ATTENDANCE VALUE
========================================================= */

function getAttendanceValue(
    object,
    possibleKeys
) {

    if (!object) {
        return null;
    }


    for (
        const key of possibleKeys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];

        }

    }


    return null;

}


/* =========================================================
   CALCULATE WORKING HOURS
========================================================= */

function calculateWorkingHours(
    checkIn,
    checkOut
) {

    if (!checkIn) {
        return "00:00";
    }


    const start =
        parseDateTime(checkIn);


    if (!start) {
        return "00:00";
    }


    /*
       If employee has checked in
       but has not checked out,
       calculate until current time.
    */

    const end =
        checkOut
            ? parseDateTime(checkOut)
            : new Date();


    if (!end) {
        return "00:00";
    }


    let difference =
        end.getTime() -
        start.getTime();


    if (difference < 0) {
        return "00:00";
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


    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );

}


/* =========================================================
   PARSE DATE TIME
========================================================= */

function parseDateTime(value) {

    if (!value) {
        return null;
    }


    /*
       Already a Date
    */

    if (value instanceof Date) {

        return value;

    }


    /*
       SQL Server datetime
       examples:

       2026-09-21 09:30:00
       2026-09-21T09:30:00
    */

    let text =
        String(value)
            .trim()
            .replace(" ", "T");


    const date =
        new Date(text);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(value) {

    if (!value) {
        return "--:--";
    }


    const date =
        parseDateTime(value);


    if (!date) {

        /*
           If backend already returns
           a formatted time.
        */

        const text =
            String(value);


        if (
            text.includes(":")
        ) {

            return text.substring(
                0,
                5
            );

        }


        return text;

    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const text =
        String(value)
            .split("T")[0]
            .split(" ")[0];


    const parts =
        text.split("-");


    if (
        parts.length === 3
    ) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return text;

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    const value =
        String(status || "")
            .toLowerCase();


    if (
        value.includes("present") ||
        value.includes("complete") ||
        value.includes("checked")
    ) {

        return "present";

    }


    if (
        value.includes("absent")
    ) {

        return "absent";

    }


    return "pending";

}


/* =========================================================
   ATTENDANCE MESSAGE
========================================================= */

function showAttendanceMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "attendanceMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    if (type === "success") {

        element.style.color =
            "#079662";

    }
    else {

        element.style.color =
            "#d23b3b";

    }


    setTimeout(
        function () {

            element.textContent = "";

        },
        5000
    );

}


/* =========================================================
   SET TEXT SAFELY
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ?? "—";

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "U";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {
        return "U";
    }


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   FIRST NAME
========================================================= */

function getFirstName(name) {

    if (!name) {
        return "Employee";
    }


    return String(name)
        .trim()
        .split(/\s+/)[0];

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}