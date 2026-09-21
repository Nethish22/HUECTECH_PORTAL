from fastapi import APIRouter, HTTPException

from database import get_connection


router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/{student_id}")
def get_profile(student_id: int):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                StudentID,
                StudentCode,
                FullName,
                Email,
                CourseName,
                BatchName,
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


        return {

            "success": True,

            "profile": {

                "student_id": student.StudentID,

                "student_code": student.StudentCode,

                "name": student.FullName,

                "email": student.Email,

                "course": student.CourseName,

                "batch": student.BatchName,

                "is_active": bool(
                    student.IsActive
                )
            }
        }


    finally:

        cursor.close()
        connection.close()