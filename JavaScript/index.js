//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
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



// Firebase Login Authentication
document.getElementById("loginForm").addEventListener("submit",async (e) => {
  e.preventDefault();
  // console.log(100);
  var loginemail = document.getElementById("email").value.trim();
  var loginpass = document.getElementById("password").value.trim();
if(loginemail==""||loginpass==""){
  alert("Please fill all the fields");
  return;
}
  signInWithEmailAndPassword(auth, loginemail, loginpass)
    .then((user) => {
      if (auth.currentUser.emailVerified) {
        console.log(auth.currentUser);
        alert("Welcome " + auth.currentUser.displayName);
        window.location.href = "/HTML/home.html";
      } else {
        signOut(auth).then(() => {
          alert("Please verify your email");
        });
      }
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("Error : " + errorMessage);
      document.getElementById("ERRORMSG").style.display = "block";
    });
});

////////////////////////////////////