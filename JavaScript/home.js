//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);
///////////////////////////////////////////////////////

//Declaration of variables
const removedatabyimagebtn = document.getElementById("removedatabyimagebtn");
const signoutbtn = document.getElementById("signoutbtn");
const adddatabtn = document.getElementById("adddatabtn");
const name = document.getElementById("name");
const ifadmindisplay = document.getElementById("ifadmindisplay");
const removedataform=document.getElementById('removedataform');
const addadminform=document.getElementById('addadminform');
var Ref;
//////////////////////////////

// If the user is authenticated and a admin then Display his extra features
// If the user is not authenticated then navigate him to the login page(index.html)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    var userid = JSON.parse(JSON.stringify(user.email));
    userid=userid.toLowerCase();
    const snapshot = await getDoc(doc(db, "admins", userid));
    if (snapshot.exists) {
      const data = snapshot.data();
      if (data && userid == data.emailid) {
        ifadmindisplay.removeAttribute("hidden");
      }
    }
  }
  if (!user) {
    window.location.href = "/index.html";
  }
});
///////////////////////////////////////////////


// Add new admin by saving his emailid in admins collection of firestore database
addadminform.addEventListener("submit", async(e)=> {
  e.preventDefault();
  const email = document.getElementById("email");
  if (email.value.trim() == "") {
    alert("Invalid email address");
    return;
  }
  let emailInLowerCase = email.value.toLowerCase();
  const snapshot = await getDoc(doc(db, "admins", emailInLowerCase));
  if(snapshot.exists && snapshot.data()){
    alert(`${emailInLowerCase} already exists `);
    return;
  }
  setDoc(doc(db, "admins", emailInLowerCase), {
    emailid: email.value.toLowerCase(),
  })
    .then(() => {
      alert("Successful!");
     
    })
    .catch((e) => {
      alert("There is some error please try again");
    });
    document.getElementById('addadminform').reset();
})
/////////////////////////////////////////////////////////////////////////////////////

// On clicking adddata btn navigate the user to addData.html page
function adddatafn() {
  window.location.href = "/HTML/addData.html";
}
/////////////////////////////////////////////////////////////////

// On clicking removedatabyimgbtn navigate the user to removedatabyimage.html page
function removedatabyimgfn() {
  window.location.href = "removedatabyimage.html";
}
///////////////////////////////

// 
removedataform.addEventListener("submit",async (e)=> {
e.preventDefault();
  if (name.value == "") {
    return;
  }
  try {
    let nameInLowerCase = name.value.toLowerCase();
    const snapshot = await getDoc(doc(db, "facesforssdmodel", nameInLowerCase));
    if(!snapshot.exists || !snapshot.data()){
      alert("Please check the input and try again");
      return;
    }
    await deleteDoc(doc(db, "facesforssdmodel", nameInLowerCase));
    await deleteDoc(doc(db, "facesfortinymodel", nameInLowerCase));
    Ref = ref(storage, "images/" + nameInLowerCase);
    await deleteObject(Ref).then(() => {
      alert("Successful");
      name.value = "";
    });
  } catch (e) {
    alert("Please check the input and try again");
    // console.log(e);
  }
  document.getElementById('removedataform').reset();
})

// Signout function
async function signout() {
  signOut(auth)
    .then(() => {
      window.location.href = "/index.html";
    })
    .catch(() => {
      alert("There is some error please check");
    });
}
///////////////////////

// Calling eventlisteners for buttons
signoutbtn.addEventListener("click", signout);
adddatabtn.addEventListener("click", adddatafn);
removedatabyimagebtn.addEventListener("click", removedatabyimgfn);
///////////////////////////////

// To prevent the user from pasting in input tag
name.addEventListener("paste", (e) => {
  e.preventDefault();
});
//////////////////////////////////////////////
