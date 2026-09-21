from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth_routes import router as auth_router
from attendance import router as attendance_router
from profile import router as profile_router


app = FastAPI(
    title="HUECTECH Internship Portal",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "success": True,
        "message": "HUECTECH Internship Portal API is working",
        "version": "2.0.0"
    }


app.include_router(auth_router)
app.include_router(attendance_router)
app.include_router(profile_router)