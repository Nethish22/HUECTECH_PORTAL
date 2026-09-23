const API_URL = "https://YOUR-ACTUAL-RENDER-URL.onrender.com";


/* =========================================================
   GET LOGGED-IN USER
========================================================= */

function getLoggedInStudent() {

    try {

        const value =
            localStorage.getItem("student");

        if (!value) {
            return null;
        }

        return JSON.parse(value);

    } catch (error) {

        console.error(
            "SESSION ERROR:",
            error
        );

        localStorage.removeItem("student");

        return null;
    }
}