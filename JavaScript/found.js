//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

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
////////////////////////////////////////////////////////////////////////////////

// If the user is not authenticated then navigate the page to login page(index.html)
onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    }
  });
  ////////////////////////////////////////////////////////////////////////////////////

const table= document.getElementById('foundTable');

async function displayFoundPeople(){
    const querysnapshot=await getDocs(collection(db,'foundppl'));
 querysnapshot.forEach(i => {
    console.log(i);
    var foundPersonName=i.data().nameOfThepersonFound;
    const foundby=i.data().foundby;
    const founddate=i.data().dateFound;
    const mediafound=i.data().media;
    const similarity=i.data().similarity
    let s = foundPersonName.charAt(0);
        s = s.toUpperCase();
        foundPersonName = s + foundPersonName.substring(1);
    const data=[foundPersonName,similarity,foundby,founddate,mediafound];
    const tr=document.createElement('tr');
    for(let j=0;j<5;j++){
    const td=document.createElement('td');
    td.innerText=data[j];
    tr.appendChild(td);
    }
    table.appendChild(tr);
 });
}
displayFoundPeople();

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
  signoutbtn.addEventListener("click", signout);
  ///////////////////