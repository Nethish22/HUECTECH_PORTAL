from database import get_connection
import bcrypt


# =========================================================
# CREATE STUDENT
# =========================================================

def create_student():

    print()
    print("===================================")
    print("       HUECTECH - CREATE STUDENT")
    print("===================================")
    print()

    # -----------------------------------------------------
    # STUDENT DETAILS
    # -----------------------------------------------------

    student_code = input(
        "Enter Student ID: "
    ).strip()

    full_name = input(
        "Enter student name: "
    ).strip()

    email = input(
        "Enter email: "
    ).strip()

    phone = input(
        "Enter phone number: "
    ).strip()

    course_name = input(
        "Enter course name: "
    ).strip()

    batch_name = input(
        "Enter batch name: "
    ).strip()

    internship_start_date = input(
        "Enter internship start date (YYYY-MM-DD): "
    ).strip()

    internship_end_date = input(
        "Enter internship end date (YYYY-MM-DD): "
    ).strip()

    password = input(
        "Enter password: "
    ).strip()

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not student_code:
        print("Student ID cannot be empty.")
        return

    if not full_name:
        print("Student name cannot be empty.")
        return

    if not email:
        print("Email cannot be empty.")
        return

    if not password:
        print("Password cannot be empty.")
        return

    # -----------------------------------------------------
    # PASSWORD HASH
    # -----------------------------------------------------

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    connection = None

    try:

        # -------------------------------------------------
        # CONNECT TO SQL SERVER
        # -------------------------------------------------

        connection = get_connection()

        cursor = connection.cursor()

        # -------------------------------------------------
        # CHECK DUPLICATE STUDENT ID
        # -------------------------------------------------

        cursor.execute(
            """
            SELECT StudentID
            FROM dbo.Students
            WHERE StudentCode = ?
            """,
            student_code
        )

        existing_student = cursor.fetchone()

        if existing_student:

            print()
            print("===================================")
            print("       STUDENT ID ALREADY EXISTS")
            print("===================================")
            print()

            print(
                "Student ID:",
                student_code
            )

            return

        # -------------------------------------------------
        # CHECK DUPLICATE EMAIL
        # -------------------------------------------------

        cursor.execute(
            """
            SELECT StudentID
            FROM dbo.Students
            WHERE Email = ?
            """,
            email
        )

        existing_email = cursor.fetchone()

        if existing_email:

            print()
            print("===================================")
            print("          EMAIL ALREADY EXISTS")
            print("===================================")
            print()

            print(
                "Email:",
                email
            )

            return

        # -------------------------------------------------
        # INSERT STUDENT
        # -------------------------------------------------

        cursor.execute(
            """
            INSERT INTO dbo.Students
            (
                StudentCode,
                FullName,
                Email,
                Phone,
                PasswordHash,
                CourseName,
                BatchName,
                InternshipStartDate,
                InternshipEndDate,
                IsActive,
                CreatedAt
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                1,
                GETDATE()
            )
            """,

            student_code,

            full_name,

            email,

            phone if phone else None,

            password_hash,

            course_name if course_name else None,

            batch_name if batch_name else None,

            internship_start_date
            if internship_start_date
            else None,

            internship_end_date
            if internship_end_date
            else None
        )

        # -------------------------------------------------
        # SAVE
        # -------------------------------------------------

        connection.commit()

        # -------------------------------------------------
        # GET CREATED STUDENT
        # -------------------------------------------------

        cursor.execute(
            """
            SELECT
                StudentID,
                StudentCode,
                FullName,
                Email,
                Phone,
                CourseName,
                BatchName,
                InternshipStartDate,
                InternshipEndDate,
                IsActive,
                CreatedAt,
                PhotoURL
            FROM dbo.Students
            WHERE StudentCode = ?
            """,
            student_code
        )

        student = cursor.fetchone()

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        print()
        print("===================================")
        print("   STUDENT CREATED SUCCESSFULLY")
        print("===================================")
        print()

        print(
            "Student ID        :",
            student.StudentID
        )

        print(
            "Student Code      :",
            student.StudentCode
        )

        print(
            "Name              :",
            student.FullName
        )

        print(
            "Email             :",
            student.Email
        )

        print(
            "Phone             :",
            student.Phone
        )

        print(
            "Course            :",
            student.CourseName
        )

        print(
            "Batch             :",
            student.BatchName
        )

        print(
            "Internship Start  :",
            student.InternshipStartDate
        )

        print(
            "Internship End    :",
            student.InternshipEndDate
        )

        print(
            "Active            :",
            student.IsActive
        )

        print(
            "Created At        :",
            student.CreatedAt
        )

        print()

        print(
            "Student has been stored in SQL Server."
        )

        print()

    except Exception as error:

        # -------------------------------------------------
        # ERROR
        # -------------------------------------------------

        if connection:

            connection.rollback()

        print()
        print("===================================")
        print("       ERROR CREATING STUDENT")
        print("===================================")
        print()

        print(error)

        print()

    finally:

        if connection:

            connection.close()


# =========================================================
# RUN PROGRAM
# =========================================================

if __name__ == "__main__":

    create_student()