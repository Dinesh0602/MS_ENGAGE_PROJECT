//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyAkffwqa39vKuVS11tN_MffFJMqICEaGX0",
  authDomain: "msengage2022.firebaseapp.com",
  projectId: "msengage2022",
  storageBucket: "msengage2022.appspot.com",
  messagingSenderId: "433398017840",
  appId: "1:433398017840:web:1f0a58dcb508514bdce2f5",
  measurementId: "G-X9K4NE6E9X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
////////////////////////////////////////////////////////////////////////////////


// Firebase Password reset function
document.getElementById("resetform").addEventListener("submit",  (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  if(email.trim()==""){
    alert("Please enter your email");
  }
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset mail sent!");
      window.location.href = "/index.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
});
/////////////////////////////////////