import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, orderBy } from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref, getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";
// import cors from 'cors';
// cors({origin:true})
// import * as functions from 'firebase-functions';  
// import * as cors from 'cors';

const firebaseConfig = {
    apiKey: "AIzaSyAXt5UCawojL8OlicQt-16f9Tu_Yof8RFg",
    authDomain: "timesheet-app-84034.firebaseapp.com",
    projectId: "timesheet-app-84034",
    storageBucket: "timesheet-app-84034.appspot.com",
    messagingSenderId: "1001231652285",
    appId: "1:1001231652285:web:104b6d6466d9a992c76ed4",
    measurementId: "G-SNLELR3XVN"
};
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app)
const today = new Date().toISOString().split('T')[0];
document.getElementById("date").setAttribute("max", today);
const auth = getAuth(app)
const db = getFirestore(app);

//Check permission 
const checkPermission = () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('No support for service worker!')
    }
    if (!('Notification' in window)) {
        throw new Error('No support for Notification API!')
    }

}
// Registering Service Workers
const resisterSW = async () => {
    const registration = await navigator.serviceWorker.register('../sw.js');
    return registration;
}

// Request permission for notifications
const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error("Notification Permission not granted");
    } else {
        new Notification("hellowworld");
    }

}
checkPermission();
resisterSW();
requestNotificationPermission();
const addDeviceToFCM = httpsCallable(getFunctions(), 'addDeviceToFCM')


const getFunction = getFunctions(app);
const sendNotification = httpsCallable(getFunction, 'sendNotification');
const sendNotificationToClient = async (token, title, body) => {
    try {
      const result = await sendNotification({ token, title, body });
      console.log('Notification sent successfully:', result);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

// Registering Firebase Cloud Messaging Client 
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("../firebase-messaging-sw.js")
        .then(function (registration) {
            console.log("Registration successful, scope is:", registration.scope);
            getToken(messaging, {vapidKey: "BNbO_k4Vjk8Vg1wRsEoLdLALvxad_nKrR0OouN86wZ2w-BgrN9g6reBqMmRYeYSEft7_V9DRvLd6Ux_gbyVnP5Y",serviceWorkerRegistration: registration })
                .then(async (currentToken) => {
                    if (currentToken) {
                        console.log('current token for client: ', currentToken);
                        await sendNotificationToClient(currentToken, 'Notification Title', 'Notification Body');
                        // await addDeviceToFCM({token: currentToken})
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                }).catch((err) => {
                    console.log('An error occurred while retrieving token. ', err);
                });
        })
        .catch(function (err) {
            console.log("Service worker registration failed, error:", err);
        });
}

onMessage(messaging, message=> {
  console.log(message.notification)
})


const loginForm = document.querySelector("#login-form");
const signUpForm = document.querySelector("#signup-form");
const timesheetForm = document.querySelector("#timesheet-form-container");
const leaveForm = document.querySelector("#leave-form-container");
const logoutButton = document.querySelector("#logout");
const backButton = document.querySelector("#back");

const signupButton = document.getElementById('signup')
const signupModal = document.getElementById("signup-modal");
const loginButton = document.getElementById('login')
const profileButton = document.getElementById('profile')
const loginModal = document.getElementById("login-modal");
const closeLoginModal = document.getElementById("close-login-modal");
const closeSignUpModal = document.getElementById("close-signup-modal");
const homeSection = document.querySelector(".home-section");
const addTimesheetBtn = document.getElementById("add-timesheet-button");
const addLeaveBtn = document.getElementById("add-leave-button");
const cardContainer = document.querySelector(".card-container");
const viewTimeSheetCard = document.querySelector(".view-timesheet-card");
const addTimeSheetCard = document.querySelector(".add-timesheet-card");
const addLeaveCard = document.querySelector(".add-leave-card");
const timesheetContainer = document.getElementById("timesheet-container");
const cardTitle = viewTimeSheetCard.querySelector(".card-title");
const cardDescription = viewTimeSheetCard.querySelector(".card-description");


signupButton.addEventListener("click", function (event) {
    event.preventDefault();
    signupModal.style.display = "block";
})

loginButton.addEventListener("click", function (event) {
    event.preventDefault();
    loginModal.style.display = "block";
    loginForm.style.display = 'block';
})

closeLoginModal.addEventListener("click", function () {
    loginModal.style.display = "none";
});

closeSignUpModal.addEventListener("click", function () {
    signupModal.style.display = "none";
});

addTimesheetBtn.addEventListener("click", function (e) {
    timesheetForm.style.display = "flex";
    cardContainer.style.display = 'none';
    backButton.style.display = 'block';
})

addLeaveBtn.addEventListener("click", function (e) {
    leaveForm.style.display = "flex";
    cardContainer.style.display = 'none';
    backButton.style.display = 'block';
})

backButton.addEventListener('click', function (event) {
    event.preventDefault();
    timesheetContainer.style.display = 'none';
    cardContainer.style.display = "flex";
    timesheetForm.style.display = 'none';
    leaveForm.style.display = 'none';
    backButton.style.display = 'none';
})

function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notificationContainer.removeChild(notification);
    }, 3000);
}

// SignUp Event
signUpForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const name = document.getElementById("signup-name").value;
    const phone = document.getElementById("signup-phone").value;
    const adminToggle = document.getElementById('admin-toggle');
    const isAdmin = adminToggle.checked;
    const password = document.getElementById("signup-password").value;

    const userQuery = query(
        collection(db, "users"),
        where("email", "==", email)
    );
    getDocs(userQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
            showNotification("Email already exists. Please use a different email.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const collRef = collection(db, "users")
                addDoc(collRef, {
                    userId: user.uid,
                    email,
                    phone,
                    name,
                    isAdmin,
                    date: new Date()
                })
                    .then((result) => {
                        showNotification("User has registered successfully")
                        console.log("user entry added successfully", result);
                        console.log("User logged in:", user);
                        loginForm.style.display = "none";
                        timesheetForm.style.display = "none";
                        logoutButton.style.display = "block";
                        document.getElementById("profile").style.display = 'block'
                        document.getElementById("profile").textContent = isAdmin ? `${name || email} (Admin)` : `${name || email}`;
                        signupModal.style.display = "none";
                        signupButton.style.display = "none";
                        loginButton.style.display = "none";
                        homeSection.style.display = 'none';
                        viewTimeSheetCard.style.display = 'block';
                        addTimeSheetCard.style.display = 'block';
                        addLeaveCard.style.display = 'block';
                        cardContainer.style.display = 'flex';
                        cardTitle.innerText = isAdmin ? "View / Manage Timesheets" : "View Timesheet";
                        cardDescription.innerText = isAdmin ? "View and manage your existing timesheets." : "View your existing timesheets";
                    })
                    .catch((error) => {
                        console.error("Error adding user entry entry: ", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Login error:", errorMessage);
            });
    }).catch((error) => {
        console.error("Error checking existing email: ", error);
    });
});


// Login Event
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("Email:", email);
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Get the user role
            const userRoleQuery = query(
                collection(db, "users"),
                where("userId", "==", user.uid)
            );
            getDocs(userRoleQuery).then((userSnapshot) => {
                if (userSnapshot.empty) {
                    alert("User not found");
                    return;
                }
                const userDoc = userSnapshot.docs[0];
                const isAdmin = userDoc.data().isAdmin;
                const name = userDoc.data().name;
                console.log("User logged in:", user);
                showNotification("User has Logged in successfully")
                logoutButton.style.display = "block";
                document.getElementById("profile").style.display = 'block'
                document.getElementById("profile").textContent = isAdmin ? `${name || email} (Admin)` : `${name || email}`;
                loginModal.style.display = "none";
                loginButton.style.display = "none";
                homeSection.style.display = 'none';
                signupButton.style.display = "none";
                viewTimeSheetCard.style.display = 'block';
                addTimeSheetCard.style.display = 'block';
                addLeaveCard.style.display = 'block';
                loginForm.style.display = 'block';
                cardContainer.style.display = 'flex';
                cardTitle.innerText = isAdmin ? "View / manage timesheets" : "View Timesheet";
                cardDescription.innerText = isAdmin ? "View and manage your existing timesheets." : "View your existing timesheets";
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                showNotification("Please provide the valid credential")
                console.error("Fetching user role error:", errorMessage);
            })

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            showNotification("Please provide the valid credential")
            console.error("Login error:", errorMessage);
        });
});


// Logout Event
logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    signOut(auth)
        .then((userCredential) => {
            console.log("User Logged out");
            // Show logout notification
            showNotification('Logged out successfully!')
            loginButton.style.display = "block";
            signupButton.style.display = "block";
            logoutButton.style.display = "none"
            timesheetForm.style.display = "none"
            document.getElementById("profile").textContent = '';
            homeSection.style.display = 'block';
            cardContainer.style.display = 'none';
            backButton.style.display = 'none';
            loginModal.style.display = "none";
            timesheetContainer.style.display = 'none';
            loginForm.style.display = 'none';
            leaveForm.style.display = 'none';
            profileButton.style.display = 'none';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Logout error:", errorMessage);
        });
});


function calculateDuration(startDate, endDate) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const differenceInMilliseconds = endDate - startDate;
    const duration = Math.round(differenceInMilliseconds / millisecondsPerDay);
    return duration;
}

// Adding Leave
leaveForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const userId = getUserFromCookie();
    if (!userId) alert("Login token has expired! Please login again")
    const startDate = new Date(document.getElementById("start-date").value);
    const endDate = new Date(document.getElementById("end-date").value);
    const project = document.getElementById("leave-project").value;
    const description = document.getElementById("leave-description").value;
    const fileInput = document.getElementById("email-file");
    const duration = calculateDuration(startDate, endDate);
    if (duration < 0) {
        alert("Please choose the date correctly! End date should be more thant start date")
        return;
    }
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file to upload");
        return;
    }
    const storage = getStorage();
    const fileName = file.name;
    const storageRef = ref(storage, `email_attachments/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const collRef = collection(db, "timesheet")
    addDoc(collRef, {
        userId,
        entryType: 'Leave',
        startDate,
        attachment: downloadURL,
        endDate,
        duration,
        description,
        project,
        approvalStatus: "Pending"
    })
        .then((result) => {
            console.log("Leave entry added successfully", result);
            showNotification("Leave has been added successfully, Please go back and view timesheet/leave")
            document.getElementById("start-date").value = "";
            document.getElementById("end-date").value = "";
            document.getElementById("email-file").value = "";
            document.getElementById("project").value = "";
            document.getElementById("description").value = "";
        })
        .catch((error) => {
            console.error("Error adding leave entry: ", error);
        });
});

// Adding timesheet
timesheetForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const userId = getUserFromCookie();
    if (!userId) alert("Login token has expired! Please login again")
    const date = document.getElementById("date").value;
    const hours = document.getElementById("hours").value;
    const project = document.getElementById("project").value;
    const description = document.getElementById("description").value;
    const task = document.getElementById("task").value;
    const collRef = collection(db, "timesheet")
    addDoc(collRef, {
        userId,
        entryType: 'Work Hours',
        date,
        hours,
        project,
        description,
        project,
        task,
        approvalStatus: "Pending"
    })
        .then((result) => {
            console.log("Timesheet entry added successfully", result);
            showNotification("Timesheet has been added successfully, Please go back and view timesheet/leave")
            document.getElementById("date").value = "";
            document.getElementById("hours").value = "";
            document.getElementById("project").value = "";
            document.getElementById("task").value = "";
        })
        .catch((error) => {
            console.error("Error adding timesheet entry: ", error);
        });
});

viewTimeSheetCard.addEventListener("click", async function (event) {
    timesheetContainer.innerHTML = ""; 
    timesheetContainer.style.display = 'block';
    cardContainer.style.display = "none";
    backButton.style.display = 'block';
    loadTimeSheetData(); 
});

async function loadTimeSheetData() {
    const userId = getUserFromCookie();
    const userRoleQuery = query(
        collection(db, "users"),
        where("userId", "==", userId)
    );
    getDocs(userRoleQuery).then(async (userSnapshot) => {
        if (userSnapshot.empty) {
            alert("User not found");
            return;
        }
        const userDoc = userSnapshot.docs[0];
        const isAdmin = userDoc.data().isAdmin;
        const q = query(
            collection(db, "timesheet"),
            where("userId", "==", userId),
        );
        const qAdmin = collection(db, "timesheet");
        getDocs(isAdmin ? qAdmin : q)
            .then(async (querySnapshot) => {
                const table = document.createElement("table");
                table.classList.add("timesheet-table");

                const headingsRow = document.createElement("tr");
                headingsRow.innerHTML = `
                    <th>Project</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Task</th>
                    <th>Entry Type</th>
                    <th>Approval Status</th>
                    <th>Action</th> 
                `;
                table.appendChild(headingsRow);

                querySnapshot.forEach(async (docs) => {
                    const timesheetData = docs.data();
                    const uid = timesheetData.userId;
                    const row = document.createElement("tr");
                    const userQuery = query(
                        collection(db, "users"),
                        where("userId", "==", uid),
                    )
                    const userDetails = await getDocs(userQuery);
                    const users = userDetails.docs[0] && userDetails.docs[0].data();
                    const userEmail = users && users.email;
                    const userName = users && users.name;
                    row.dataset.docId = docs.id;
                    const cells = [
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td"),
                        document.createElement("td")
                    ];

                    cells[0].textContent = timesheetData.project;
                    cells[1].textContent = userName || '';
                    cells[2].textContent = userEmail || '';
                    cells[3].textContent = timesheetData.date || `${new Date(timesheetData.startDate.seconds * 1000).toISOString().split('T')[0]} to ${new Date(timesheetData.endDate.seconds * 1000).toISOString().split('T')[0]}`;
                    cells[4].textContent = timesheetData.hours ? `${timesheetData.hours} hours` : `${timesheetData.duration} days`;
                    cells[5].textContent = timesheetData.task;
                    cells[6].textContent = timesheetData.entryType;
                    cells[7].textContent = timesheetData.approvalStatus;

                    for (let i = 5; i < cells.length - 1; i++) {
                        const cell = cells[i];
                        if (cell.textContent === "Pending") {
                            cell.classList.add("pending");
                        } else if (cell.textContent === "Approved") {
                            cell.classList.add("approved");
                        } else if (cell.textContent === "Rejected") {
                            cell.classList.add("rejected");
                        }
                    }

                    if (isAdmin && timesheetData.approvalStatus === "Pending" && userId != uid) {
                        const actionContainer = document.createElement("div");
                        actionContainer.classList.add("action-container");

                        const approveButton = document.createElement("button");
                        approveButton.textContent = "Approve";
                        approveButton.classList.add("approve-button");
                        approveButton.onclick = () => {
                            const docId = row.dataset.docId;
                            const timesheetRef = doc(db, "timesheet", docId);
                            const updatedData = { approvalStatus: "Approved" };
                            updateDoc(timesheetRef, updatedData)
                                .then(() => {
                                    showNotification("Timesheet has been approved")
                                    console.log("Timesheet entry approved:", docId);
                                    timesheetContainer.innerHTML = "";
                                    loadTimeSheetData()
                                }).catch((error) => {
                                    console.error("Error approving timesheet entry:", error);
                                });
                        };
                        actionContainer.appendChild(approveButton);
                        const rejectButton = document.createElement("button");
                        rejectButton.textContent = "Reject";
                        rejectButton.classList.add("reject-button");
                        rejectButton.onclick = () => {
                            const docId = row.dataset.docId;
                            const timesheetRef = doc(db, "timesheet", docId);
                            const updatedData = { approvalStatus: "Rejected" };
                            updateDoc(timesheetRef, updatedData)
                                .then(() => {
                                    console.log("Timesheet entry Rejected:", docId);
                                    showNotification("Timesheet has been rejected")
                                    timesheetContainer.innerHTML = ""; 
                                    loadTimeSheetData()
                                }).catch((error) => {
                                    console.error("Error Rejecting timesheet entry:", error);
                                });
                        };
                        actionContainer.appendChild(rejectButton);

                        cells[8].appendChild(actionContainer);
                    }
                    else {
                        cells[8].textContent = "-";
                    }
                    cells.forEach(cell => row.appendChild(cell));
                    table.appendChild(row);
                });

                timesheetContainer.appendChild(table);
            })
            .catch((error) => {
                console.error("Error fetching timesheet data: ", error);
            });
    });
}


function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name) {
    document.cookie = `${name}=;max-age=0;path=/;`;
}

function getUserFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'user') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        setCookie('user', user.uid, 30);
    } else {
        deleteCookie('user');
    }
});