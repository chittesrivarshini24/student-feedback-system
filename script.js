// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCnVb35e95jP-RV3_DBUTaYNY3-mElIZfo",
    authDomain: "student-feedback-system-b4b98.firebaseapp.com",
    projectId: "student-feedback-system-b4b98",
    storageBucket: "student-feedback-system-b4b98.firebasestorage.app",
    messagingSenderId: "1034713683832",
    appId: "1:1034713683832:web:e6972a30bba99045d85a8d"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Auth only if available
let auth = null;
if (firebase.auth) {
    auth = firebase.auth();
}

// ---------------- REGISTER ----------------
const regForm = document.getElementById("registerForm");

if (regForm && auth) {
    regForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("regName").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                alert("Registration Successful!");
                window.location.href = "survey.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// ---------------- LOGIN ----------------
const loginForm = document.getElementById("loginForm");

if (loginForm && auth) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                alert("Login Successful!");
                window.location.href = "survey.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// ---------------- LOGOUT ----------------
function logout() {
    if (auth) {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    }
}

// ---------------- SURVEY SUBMIT ----------------
const surveyForm = document.getElementById("surveyForm");

if (surveyForm) {
    surveyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = auth ? auth.currentUser : null;

        const surveyTypeValue = document.getElementById("surveyType").value;

let feedbackData = {
surveyType: surveyTypeValue,
studentName: user ? user.displayName : "Anonymous",
email: user ? user.email : "",
satisfaction: Number(document.querySelector('input[name="satisfaction"]:checked')?.value || 0),
timestamp: firebase.firestore.FieldValue.serverTimestamp()
};

const value1 = Number(document.querySelector('input[name="teaching"]:checked')?.value || 0);
const value2 = Number(document.querySelector('input[name="labs"]:checked')?.value || 0);
const value3 = Number(document.querySelector('input[name="library"]:checked')?.value || 0);
const value4 = Number(document.querySelector('input[name="events"]:checked')?.value || 0);

if (surveyTypeValue === "student") {
feedbackData.teaching = value1;
feedbackData.labs = value2;
feedbackData.library = value3;
feedbackData.events = value4;
}
else if (surveyTypeValue === "hospital") {
feedbackData.doctorService = value1;
feedbackData.nursingCare = value2;
feedbackData.cleanliness = value3;
feedbackData.waitingTime = value4;
}
else if (surveyTypeValue === "employee") {
feedbackData.workEnvironment = value1;
feedbackData.managementSupport = value2;
feedbackData.teamCollaboration = value3;
feedbackData.trainingPrograms = value4;
}
else if (surveyTypeValue === "office") {
feedbackData.staffBehaviour = value1;
feedbackData.serviceQuality = value2;
feedbackData.responseTime = value3;
feedbackData.officeCleanliness = value4;
}

   console.log(feedbackData);
        try {
            await db.collection("surveyResponses").add(feedbackData);

            alert("Feedback Submitted Successfully!");
            window.location.href = "results.html";

        } catch (error) {
            alert(error.message);
        }
    });
}

// ---------------- RESULTS PAGE ----------------
async function loadAnalytics() {

    const totalResponsesEl = document.getElementById("totalResponses");
    if (!totalResponsesEl) return;

    const snapshot = await db.collection("surveyResponses").get();

    const totalResponses = snapshot.size;
    totalResponsesEl.innerText = totalResponses;

    let studentCount = 0;
let hospitalCount = 0;
let employeeCount = 0;
let officeCount = 0;

    let teaching = 0;
    let labs = 0;
    let library = 0;
    let events = 0;
    let satisfaction = 0;

    snapshot.forEach((doc) => {

        const data = doc.data();

        // Count survey types
      if (!data.surveyType || data.surveyType === "student") {
    studentCount++;
}
else if (data.surveyType === "hospital") {
    hospitalCount++;
}
else if (data.surveyType === "employee") {
    employeeCount++;
}
else if (data.surveyType === "office") {
    officeCount++;
}

        teaching += Number(data.teaching || 0);
        labs += Number(data.labs || 0);
        library += Number(data.library || 0);
        events += Number(data.events || 0);
        satisfaction += Number(data.satisfaction || 0);
    });

    // Update cards
    const studentEl = document.getElementById("studentCount");
    const hospitalEl = document.getElementById("hospitalCount");
    const employeeEl = document.getElementById("employeeCount");
    const officeEl = document.getElementById("officeCount");

    if (studentEl) studentEl.innerText = studentCount;
    if (hospitalEl) hospitalEl.innerText = hospitalCount;
    if (employeeEl) employeeEl.innerText = employeeCount;
    if (officeEl) officeEl.innerText = officeCount;

    if (totalResponses === 0) return;

   const surveyStats = {
    Student: studentCount,
    Hospital: hospitalCount,
    Employee: employeeCount,
    Office: officeCount
};
// Bar Chart
const barCanvas = document.getElementById("barChart");

if (barCanvas) {
    new Chart(barCanvas, {
        type: "bar",
        data: {
            labels: Object.keys(surveyStats),
            datasets: [{
                label: "Number of Surveys",
                data: Object.values(surveyStats)
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

    // Pie Chart
    const pieCanvas = document.getElementById("pieChart");

    if (pieCanvas) {
        new Chart(pieCanvas, {
            type: "pie",
           data: {
    labels: Object.keys(surveyStats),
    datasets: [{
        data: Object.values(surveyStats)
    }]
}
        });
    }
}

// Run analytics only on results page
window.onload = () => {
    if (document.getElementById("totalResponses")) {
        loadAnalytics();
    }
};
const surveyType = document.getElementById("surveyType");
const q1 = document.getElementById("q1");
const q2 = document.getElementById("q2");
const q3 = document.getElementById("q3");
const q4 = document.getElementById("q4");

if (surveyType) {

    surveyType.addEventListener("change", () => {

        if (surveyType.value === "student") {

            q1.innerText = "1. Teaching Quality";
            q2.innerText = "2. Lab Facilities";
            q3.innerText = "3. Library Facilities";
            q4.innerText = "4. Events";

        }
        else if (surveyType.value === "hospital") {

            q1.innerText = "1. Doctor Service";
            q2.innerText = "2. Nursing Care";
            q3.innerText = "3. Cleanliness";
            q4.innerText = "4. Waiting Time";

        }
        else if (surveyType.value === "employee") {

            q1.innerText = "1. Work Environment";
            q2.innerText = "2. Management Support";
            q3.innerText = "3. Team Collaboration";
            q4.innerText = "4. Training Programs";

        }
        else if (surveyType.value === "office") {

            q1.innerText = "1. Staff Behaviour";
            q2.innerText = "2. Service Quality";
            q3.innerText = "3. Response Time";
            q4.innerText = "4. Office Cleanliness";

        }

    });

}