from database import get_connection

print("Testing SQL Server connection...")

try:
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("SELECT GETDATE()")

    result = cursor.fetchone()

    print("SUCCESS!")
    print("Connected to SQL Server.")
    print("SQL Server time:", result[0])

    cursor.close()
    connection.close()

except Exception as e:
    print("FAILED!")
    print("Error:", e)