from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_connection
from auth import verify_password


router = APIRouter(
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    student_code: str
    password: str


@router.post("/login")
def student_login(login: LoginRequest):

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
                PasswordHash,
                CourseName,
                BatchName,
                IsActive
            FROM Students
            WHERE StudentCode = ?
            """,
            (
                login.student_code.strip(),
            )
        )

        student = cursor.fetchone()


        if student is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid Student ID or Password"
            )


        if not bool(student.IsActive):

            raise HTTPException(
                status_code=403,
                detail="Student account is inactive"
            )


        if not verify_password(
            login.password,
            student.PasswordHash
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid Student ID or Password"
            )


        return {

            "success": True,

            "message": "Login successful",

            "student": {

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