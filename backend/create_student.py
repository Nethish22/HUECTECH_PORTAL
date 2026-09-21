from database import get_connection
from auth import hash_password


def create_student():
    print("===================================")
    print("     HUECTECH - CREATE STUDENT")
    print("===================================")

    full_name = input("Enter student name: ")
    email = input("Enter email: ")
    course_name = input("Enter course name: ")
    batch_name = input("Enter batch name: ")
    password = input("Enter password: ")

    connection = get_connection()
    cursor = connection.cursor()

    try:

        # Find latest StudentCode
        cursor.execute("""
            SELECT MAX(
                CAST(RIGHT(StudentCode, 4) AS INT)
            )
            FROM Students
            WHERE StudentCode LIKE 'HUEC2026%'
        """)

        result = cursor.fetchone()

        last_number = result[0] if result[0] is not None else 0

        next_number = last_number + 1

        student_code = f"HUEC2026{next_number:04d}"

        # Hash password
        password_hash = hash_password(password)

        # Insert student
        cursor.execute("""
            INSERT INTO Students
            (
                StudentCode,
                FullName,
                Email,
                PasswordHash,
                CourseName,
                BatchName,
                IsActive
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            student_code,
            full_name,
            email,
            password_hash,
            course_name,
            batch_name,
            1
        ))

        connection.commit()

        print()
        print("===================================")
        print("      STUDENT CREATED")
        print("===================================")
        print(f"Student Code : {student_code}")
        print(f"Name         : {full_name}")
        print(f"Email        : {email}")
        print(f"Course       : {course_name}")
        print(f"Batch        : {batch_name}")
        print(f"Password     : {password}")
        print("===================================")

    except Exception as e:

        connection.rollback()

        print()
        print("ERROR:")
        print(e)

    finally:

        cursor.close()
        connection.close()


if __name__ == "__main__":
    create_student()