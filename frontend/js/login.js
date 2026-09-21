document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById("loginForm");

        const loginButton =
            document.getElementById("loginButton");

        const message =
            document.getElementById("message");


        if (!loginForm) {
            return;
        }


        /* =====================================================
           IF ALREADY LOGGED IN
        ====================================================== */

        const existingStudent =
            getLoggedInStudent();


        if (existingStudent) {

            window.location.href =
                "dashboard.html";

            return;
        }


        /* =====================================================
           LOGIN
        ====================================================== */

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const studentCode =
                    document
                        .getElementById("studentCode")
                        .value
                        .trim();


                const password =
                    document
                        .getElementById("password")
                        .value;


                if (!studentCode) {

                    showLoginMessage(
                        "Please enter your Employee / Student ID.",
                        "error"
                    );

                    return;
                }


                if (!password) {

                    showLoginMessage(
                        "Please enter your password.",
                        "error"
                    );

                    return;
                }


                /* BUTTON LOADING */

                loginButton.disabled = true;

                loginButton.textContent =
                    "Signing in...";


                hideLoginMessage();


                try {

                    const response =
                        await fetch(
                            `${API_URL}/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    student_code:
                                        studentCode,

                                    password:
                                        password

                                })
                            }
                        );


                    let data = {};

                    try {

                        data =
                            await response.json();

                    } catch {

                        data = {};
                    }


                    /* =========================================
                       LOGIN FAILED
                    ========================================== */

                    if (!response.ok) {

                        throw new Error(
                            data.detail ||
                            data.message ||
                            "Invalid Employee ID or password."
                        );
                    }


                    /* =========================================
                       LOGIN SUCCESS
                    ========================================== */

                    if (
                        !data.success &&
                        !data.student
                    ) {

                        throw new Error(
                            data.message ||
                            "Login failed."
                        );
                    }


                    const student =
                        data.student ||
                        data.user ||
                        data.data;


                    if (!student) {

                        throw new Error(
                            "Login successful, but employee information was not returned by the server."
                        );
                    }


                    /* SAVE USER */

                    saveLoggedInStudent(
                        student
                    );


                    /* SUCCESS MESSAGE */

                    showLoginMessage(
                        "Login successful. Opening your portal...",
                        "success"
                    );


                    /* REDIRECT */

                    setTimeout(
                        function () {

                            window.location.href =
                                "dashboard.html";

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        "LOGIN ERROR:",
                        error
                    );


                    showLoginMessage(
                        error.message ||
                        "Unable to connect to the HUECTECH server.",
                        "error"
                    );


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Sign in";
                }

            }
        );

    }
);


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "message"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "form-message " + type;


    element.style.display =
        "block";
}


/* =========================================================
   HIDE LOGIN MESSAGE
========================================================= */

function hideLoginMessage() {

    const element =
        document.getElementById(
            "message"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.className =
        "form-message";


    element.style.display =
        "none";
}