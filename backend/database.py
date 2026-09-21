import os

import pyodbc
from dotenv import load_dotenv


load_dotenv()


DB_SERVER = os.getenv(
    "DB_SERVER",
    r"DESKTOP-ENP9FNL\Nethish"
)

DB_NAME = os.getenv(
    "DB_NAME",
    "HUECTECH"
)

DB_DRIVER = os.getenv(
    "DB_DRIVER",
    "ODBC Driver 18 for SQL Server"
)


CONNECTION_STRING = (
    f"DRIVER={{{DB_DRIVER}}};"
    f"SERVER={DB_SERVER};"
    f"DATABASE={DB_NAME};"
    f"Trusted_Connection=yes;"
    f"TrustServerCertificate=yes;"
)


def get_connection():
    return pyodbc.connect(CONNECTION_STRING)