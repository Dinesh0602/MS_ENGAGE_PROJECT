//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
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



//Declaration of variables
const loginemail = document.getElementById("email");
const loginpass = document.getElementById("password");
const name = document.getElementById("name");
const registerform=document.getElementById('registerform');
///////////////////////////

// Firebase function to Create new account to users
registerform.addEventListener("submit",async (e) => {
  e.preventDefault();
  if(loginemail.value==""||loginpass.value==""||name.value==""){
    alert("Please fill all the fields");
    return;
  }
  createUserWithEmailAndPassword(auth, loginemail.value, loginpass.value)
    .then((user) => {
      sendEmailVerification(auth.currentUser).then(() => {
        updateProfile(auth.currentUser, {
          displayName: name.value,
        }).then(() => {
          alert("Email verification sent!!!");
          signOut(auth).then(() => {
            window.location.href = "/index.html";
          });
        });
      });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("Error : " + errorMessage);
      document.getElementById("ERRORMSG").style.display = "block";
    });
});

////////////////////////////////////////////////////////
