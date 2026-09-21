from fastapi import APIRouter, HTTPException

from database import get_connection


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# =========================================================
# GET TASKS FOR STUDENT
# =========================================================

@router.get("/{student_id}")
def get_student_tasks(student_id: int):

    connection = None
    cursor = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        # =================================================
        # GET STUDENT
        # =================================================

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
            (student_id,)
        )

        student = cursor.fetchone()

        if student is None:

            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        # Student inactive
        if not student.IsActive:

            raise HTTPException(
                status_code=403,
                detail="Student account is inactive"
            )


        # =================================================
        # GET TASKS FOR STUDENT'S BATCH
        # =================================================

        cursor.execute(
            """
            SELECT
                TaskID,
                Title,
                Description,
                AssignedBatch,
                DueDate,
                CreatedAt,
                IsActive
            FROM Tasks
            WHERE IsActive = 1
              AND AssignedBatch = ?
            ORDER BY
                DueDate ASC,
                CreatedAt DESC
            """,
            (student.BatchName,)
        )

        rows = cursor.fetchall()


        # =================================================
        # CONVERT TASKS TO JSON
        # =================================================

        tasks = []

        for row in rows:

            task = {

                "task_id": row.TaskID,

                "title": row.Title,

                "description": row.Description,

                "assigned_batch": row.AssignedBatch,

                "due_date":
                    str(row.DueDate)
                    if row.DueDate
                    else None,

                "created_at":
                    row.CreatedAt.isoformat()
                    if row.CreatedAt
                    else None
            }

            tasks.append(task)


        # =================================================
        # RETURN RESPONSE
        # =================================================

        return {

            "student_id":
                student.StudentID,

            "student_code":
                student.StudentCode,

            "student_name":
                student.FullName,

            "email":
                student.Email,

            "course":
                student.CourseName,

            "batch":
                student.BatchName,

            "total_tasks":
                len(tasks),

            "tasks":
                tasks
        }


    except HTTPException:

        raise


    except Exception as e:

        print("TASK API ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load tasks: {str(e)}"
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()