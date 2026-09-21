let todayAttendance = null;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const student = requireLogin();

    if (!student) {
        return;
    }


    setCommonStudentUI(student);


    const name =
        student.name ||
        student.full_name ||
        student.FullName ||
        "Employee";


    const code =
        student.student_code ||
        student.employee_id ||
        student.StudentCode ||
        "—";


    setText("topName", name);

    setText("topCode", code);

    setText(
        "sidebarName",
        name
    );

    setText(
        "sidebarCode",
        code
    );


    const avatar =
        initials(name);


    setText(
        "topAvatar",
        avatar
    );

    setText(
        "sidebarAvatar",
        avatar
    );


    displayTodayDate();


    await loadTodayAttendance(
        student.student_id
    );


    await loadAttendanceHistory(
        student.student_id
    );

});


/* =========================================================
   TODAY DATE
========================================================= */

function displayTodayDate() {

    const now =
        new Date();


    const formatted =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    setText(
        "todayDate",
        formatted
    );
}


/* =========================================================
   LOAD TODAY ATTENDANCE
========================================================= */

async function loadTodayAttendance(studentId) {

    if (!studentId) {
        return;
    }


    try {

        const data =
            await getJSON(
                `${API_URL}/attendance/today/${studentId}`
            );


        todayAttendance =
            data.attendance ||
            data.data ||
            data.record ||
            data;


        renderTodayAttendance(
            todayAttendance
        );


    } catch (error) {

        console.error(
            "TODAY ATTENDANCE ERROR:",
            error
        );


        setText(
            "todayStatus",
            "Unable to load"
        );


        showAttendanceMessage(
            "Unable to load today's attendance.",
            "error"
        );

    }
}


/* =========================================================
   RENDER TODAY ATTENDANCE
========================================================= */

function renderTodayAttendance(attendance) {

    if (!attendance) {

        resetAttendanceUI();

        return;
    }


    const checkIn =
        getValue(
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
        getValue(
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
        getValue(
            attendance,
            [
                "status",
                "Status"
            ]
        );


    setText(
        "checkInTime",
        formatTime(checkIn)
    );


    setText(
        "checkOutTime",
        formatTime(checkOut)
    );


    /*
       If both check-in and check-out exist,
       calculate total working hours.
    */

    if (checkIn && checkOut) {

        setText(
            "workingHours",
            calculateDuration(
                checkIn,
                checkOut
            )
        );

    }

    else if (checkIn) {

        setText(
            "workingHours",
            calculateLiveDuration(checkIn)
        );

    }

    else {

        setText(
            "workingHours",
            "00:00"
        );

    }


    let displayStatus =
        status;


    if (!displayStatus) {

        if (checkOut) {
            displayStatus = "Completed";
        }

        else if (checkIn) {
            displayStatus = "Checked In";
        }

        else {
            displayStatus = "Not Checked In";
        }

    }


    setText(
        "todayStatus",
        displayStatus
    );


    updateAttendanceButtons(
        checkIn,
        checkOut
    );
}


/* =========================================================
   CHECK IN
========================================================= */

async function checkIn() {

    const student =
        requireLogin();

    if (!student) {
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


        const data =
            await getJSON(
                `${API_URL}/attendance/check-in`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        student_id:
                            student.student_id

                    })
                }
            );


        showAttendanceMessage(
            data.message ||
            "Check-in recorded successfully.",
            "success"
        );


        await loadTodayAttendance(
            student.student_id
        );


        await loadAttendanceHistory(
            student.student_id
        );


    } catch (error) {

        console.error(
            "CHECK-IN ERROR:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Unable to check in.",
            "error"
        );


    } finally {

        button.disabled = false;

        button.innerHTML =
            "✓ Check In";

    }
}


/* =========================================================
   CHECK OUT
========================================================= */

async function checkOut() {

    const student =
        requireLogin();

    if (!student) {
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


        const data =
            await getJSON(
                `${API_URL}/attendance/check-out`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        student_id:
                            student.student_id

                    })
                }
            );


        showAttendanceMessage(
            data.message ||
            "Check-out recorded successfully.",
            "success"
        );


        await loadTodayAttendance(
            student.student_id
        );


        await loadAttendanceHistory(
            student.student_id
        );


    } catch (error) {

        console.error(
            "CHECK-OUT ERROR:",
            error
        );


        showAttendanceMessage(
            error.message ||
            "Unable to check out.",
            "error"
        );


    } finally {

        button.disabled = false;

        button.innerHTML =
            "↪ Check Out";

    }
}


/* =========================================================
   LOAD HISTORY
========================================================= */

async function loadAttendanceHistory(studentId) {

    if (!studentId) {
        return;
    }


    const tableBody =
        document.getElementById(
            "attendanceHistory"
        );


    try {

        const data =
            await getJSON(
                `${API_URL}/attendance/history/${studentId}`
            );


        const records =
            data.records ||
            data.attendance ||
            data.history ||
            data.data ||
            [];


        renderAttendanceHistory(
            Array.isArray(records)
                ? records
                : []
        );


    } catch (error) {

        console.error(
            "HISTORY ERROR:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="table-empty">

                    Unable to load attendance history.

                </td>

            </tr>

        `;

    }
}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderAttendanceHistory(records) {

    const tableBody =
        document.getElementById(
            "attendanceHistory"
        );


    if (!records.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="table-empty">

                    No attendance records found.

                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        records.map(
            record => {

                const date =
                    getValue(
                        record,
                        [
                            "date",
                            "attendance_date",
                            "AttendanceDate",
                            "Date"
                        ]
                    );


                const checkIn =
                    getValue(
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
                    getValue(
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
                    getValue(
                        record,
                        [
                            "status",
                            "Status"
                        ]
                    ) ||
                    (
                        checkOut
                            ? "Completed"
                            : checkIn
                                ? "Checked In"
                                : "Absent"
                    );


                const duration =
                    checkIn && checkOut
                        ? calculateDuration(
                            checkIn,
                            checkOut
                        )
                        : checkIn
                            ? calculateLiveDuration(
                                checkIn
                            )
                            : "00:00";


                return `

                    <tr>

                        <td>
                            <strong>
                                ${formatDate(date)}
                            </strong>
                        </td>


                        <td>

                            <span class="time-value">
                                ${formatTime(checkIn)}
                            </span>

                        </td>


                        <td>

                            <span class="time-value">
                                ${formatTime(checkOut)}
                            </span>

                        </td>


                        <td>

                            <span class="duration-value">
                                ${duration}
                            </span>

                        </td>


                        <td>

                            <span
                                class="history-status ${getStatusClass(status)}">

                                ${escapeHTML(status)}

                            </span>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


/* =========================================================
   UPDATE BUTTONS
========================================================= */

function updateAttendanceButtons(
    checkIn,
    checkOut
) {

    const checkInButton =
        document.getElementById(
            "checkInButton"
        );


    const checkOutButton =
        document.getElementById(
            "checkOutButton"
        );


    if (checkIn) {

        checkInButton.disabled = true;

        checkInButton.innerHTML =
            "✓ Checked In";

    }

    else {

        checkInButton.disabled = false;

        checkInButton.innerHTML =
            "✓ Check In";

    }


    if (!checkIn || checkOut) {

        checkOutButton.disabled = true;

        checkOutButton.innerHTML =
            checkOut
                ? "✓ Checked Out"
                : "↪ Check Out";

    }

    else {

        checkOutButton.disabled = false;

        checkOutButton.innerHTML =
            "↪ Check Out";

    }
}


/* =========================================================
   RESET
========================================================= */

function resetAttendanceUI() {

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
        "todayStatus",
        "Not Checked In"
    );


    updateAttendanceButtons(
        null,
        null
    );
}


/* =========================================================
   CALCULATE DURATION
========================================================= */

function calculateDuration(
    start,
    end
) {

    const startDate =
        parseDate(start);

    const endDate =
        parseDate(end);


    if (
        !startDate ||
        !endDate
    ) {
        return "00:00";
    }


    let milliseconds =
        endDate.getTime() -
        startDate.getTime();


    if (milliseconds < 0) {
        milliseconds = 0;
    }


    const totalMinutes =
        Math.floor(
            milliseconds /
            60000
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    return `${pad(hours)}:${pad(minutes)}`;
}


/* =========================================================
   LIVE DURATION
========================================================= */

function calculateLiveDuration(
    start
) {

    const startDate =
        parseDate(start);


    if (!startDate) {
        return "00:00";
    }


    return calculateDuration(
        startDate,
        new Date()
    );
}


/* =========================================================
   PARSE DATE
========================================================= */

function parseDate(value) {

    if (!value) {
        return null;
    }


    const date =
        new Date(value);


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
        parseDate(value);


    if (!date) {

        return String(value)
            .substring(0, 5);

    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
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
        String(value);


    /*
       SQL date:

       2026-09-21

       Avoid timezone conversion.
    */

    const dateOnly =
        text.substring(
            0,
            10
        );


    const parts =
        dateOnly.split("-");


    if (parts.length === 3) {

        return `${parts[2]}-${parts[1]}-${parts[0]}`;

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
        return "status-success";
    }


    if (
        value.includes("absent")
    ) {
        return "status-danger";
    }


    return "status-neutral";
}


/* =========================================================
   MESSAGE
========================================================= */

function showAttendanceMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "attendanceMessage"
        );


    element.textContent =
        message;


    element.className =
        `attendance-message ${type}`;


    setTimeout(
        () => {

            element.textContent =
                "";

            element.className =
                "attendance-message";

        },
        5000
    );
}


/* =========================================================
   GENERIC VALUE
========================================================= */

function getValue(
    object,
    keys
) {

    for (
        const key of keys
    ) {

        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }

    return null;
}


/* =========================================================
   TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "—";

    }
}


/* =========================================================
   PAD
========================================================= */

function pad(number) {

    return String(number)
        .padStart(2, "0");
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}