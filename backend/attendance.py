from datetime import datetime, date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_connection


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


class AttendanceRequest(BaseModel):
    student_id: int


def check_student(student_id: int):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                StudentID,
                StudentCode,
                FullName,
                IsActive
            FROM Students
            WHERE StudentID = ?
            """,
            (
                student_id,
            )
        )

        student = cursor.fetchone()


        if student is None:

            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )


        if not bool(student.IsActive):

            raise HTTPException(
                status_code=403,
                detail="Student account is inactive"
            )


        return student


    finally:

        cursor.close()
        connection.close()


def serialize_attendance(row):

    return {

        "attendance_id":
            row.AttendanceID,

        "date":
            str(row.AttendanceDate),

        "check_in":
            row.CheckInTime.isoformat()
            if row.CheckInTime
            else None,

        "check_out":
            row.CheckOutTime.isoformat()
            if row.CheckOutTime
            else None,

        "status":
            row.Status
    }


# =========================================================
# CHECK IN
# =========================================================

@router.post("/check-in")
def check_in(request: AttendanceRequest):

    check_student(
        request.student_id
    )

    connection = get_connection()
    cursor = connection.cursor()

    today = date.today()
    now = datetime.now()

    try:

        cursor.execute(
            """
            SELECT AttendanceID
            FROM Attendance
            WHERE StudentID = ?
              AND AttendanceDate = ?
            """,
            (
                request.student_id,
                today
            )
        )

        existing = cursor.fetchone()


        if existing:

            raise HTTPException(
                status_code=400,
                detail="You have already checked in today."
            )


        cursor.execute(
            """
            INSERT INTO Attendance
            (
                StudentID,
                AttendanceDate,
                CheckInTime,
                Status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                'Present'
            )
            """,
            (
                request.student_id,
                today,
                now
            )
        )

        connection.commit()


        return {

            "success": True,

            "message":
                "Attendance checked in successfully.",

            "date":
                str(today),

            "check_in":
                now.isoformat(),

            "status":
                "Present"
        }


    finally:

        cursor.close()
        connection.close()


# =========================================================
# CHECK OUT
# =========================================================

@router.post("/check-out")
def check_out(request: AttendanceRequest):

    check_student(
        request.student_id
    )

    connection = get_connection()
    cursor = connection.cursor()

    today = date.today()
    now = datetime.now()

    try:

        cursor.execute(
            """
            SELECT
                AttendanceID,
                CheckOutTime
            FROM Attendance
            WHERE StudentID = ?
              AND AttendanceDate = ?
            """,
            (
                request.student_id,
                today
            )
        )

        attendance = cursor.fetchone()


        if attendance is None:

            raise HTTPException(
                status_code=400,
                detail="Please check in before checking out."
            )


        if attendance.CheckOutTime is not None:

            raise HTTPException(
                status_code=400,
                detail="You have already checked out."
            )


        cursor.execute(
            """
            UPDATE Attendance
            SET CheckOutTime = ?
            WHERE AttendanceID = ?
            """,
            (
                now,
                attendance.AttendanceID
            )
        )

        connection.commit()


        return {

            "success": True,

            "message":
                "Checked out successfully.",

            "check_out":
                now.isoformat()
        }


    finally:

        cursor.close()
        connection.close()


# =========================================================
# TODAY
# =========================================================

@router.get("/today/{student_id}")
def today_attendance(student_id: int):

    check_student(
        student_id
    )

    connection = get_connection()
    cursor = connection.cursor()

    today = date.today()

    try:

        cursor.execute(
            """
            SELECT
                AttendanceID,
                AttendanceDate,
                CheckInTime,
                CheckOutTime,
                Status
            FROM Attendance
            WHERE StudentID = ?
              AND AttendanceDate = ?
            """,
            (
                student_id,
                today
            )
        )

        row = cursor.fetchone()


        if row is None:

            return {

                "marked": False,

                "attendance": None
            }


        return {

            "marked": True,

            "attendance":
                serialize_attendance(row)
        }


    finally:

        cursor.close()
        connection.close()


# =========================================================
# HISTORY
# =========================================================

@router.get("/history/{student_id}")
def attendance_history(student_id: int):

    check_student(
        student_id
    )

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                AttendanceID,
                AttendanceDate,
                CheckInTime,
                CheckOutTime,
                Status
            FROM Attendance
            WHERE StudentID = ?
            ORDER BY AttendanceDate DESC
            """,
            (
                student_id,
            )
        )

        rows = cursor.fetchall()


        return {

            "total_days":
                len(rows),

            "attendance":
                [
                    serialize_attendance(row)
                    for row in rows
                ]
        }


    finally:

        cursor.close()
        connection.close()