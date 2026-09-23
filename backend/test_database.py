from database import get_connection


try:

    connection = get_connection()

    print("===================================")
    print("SQL SERVER CONNECTION SUCCESSFUL")
    print("===================================")

    cursor = connection.cursor()

    cursor.execute("""
        SELECT DB_NAME()
    """)

    result = cursor.fetchone()

    print("Database:", result[0])

    connection.close()

except Exception as error:

    print("DATABASE CONNECTION ERROR")
    print(error)