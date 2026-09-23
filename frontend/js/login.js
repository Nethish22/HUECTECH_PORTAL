document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById("loginForm");

        const loginButton =
            document.getElementById("loginButton");

        if (!loginForm) {
            return;
        }


        /* =====================================================
           IF ALREADY LOGGED IN
        ====================================================== */

        const existingStudent =
            getLoggedInStudent();

        if (existingStudent) {

            window.location.replace(
                "dashboard.html"
            );

            return;
        }


        /* =====================================================
           LOGIN
        ====================================================== */

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const studentCodeElement =
                    document.getElementById(
                        "studentCode"
                    );

                const passwordElement =
                    document.getElementById(
                        "password"
                    );


                const studentCode =
                    studentCodeElement
                        .value
                        .trim();

                const password =
                    passwordElement.value;


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


                loginButton.disabled = true;

                loginButton.textContent =
                    "Signing in...";

                hideLoginMessage();


                try {

                    console.log(
                        "LOGIN API:",
                        `${API_URL}/login`
                    );


                    const response =
                        await fetch(
                            `${API_URL}/login`,
                            {
                                method: "POST",

                                cache: "no-store",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Cache-Control":
                                        "no-cache"
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


                    if (!response.ok) {

                        throw new Error(
                            data.detail ||
                            data.message ||
                            "Invalid Employee ID or password."
                        );
                    }


                    const student =
                        data.student ||
                        data.user ||
                        data.data;


                    if (!student) {

                        throw new Error(
                            "Login successful, but employee information was not returned."
                        );
                    }


                    /*
                     * Remove old employee session
                     */

                    localStorage.removeItem(
                        "student"
                    );


                    /*
                     * Save newly authenticated employee
                     */

                    saveLoggedInStudent(
                        student
                    );


                    showLoginMessage(
                        "Login successful. Opening your portal...",
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.replace(
                                "dashboard.html"
                            );

                        },
                        300
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
});


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