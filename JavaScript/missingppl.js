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
import {
  getStorage,
  ref,
  getDownloadURL,
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
////////////////////////////////////////////////////////////////////////////////

// If the user is not authenticated then navigate the page to login page(index.html)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/index.html";
  }
});
////////////////////////////////////////////////////////////////////////////////////

// Declaration of variables
const search = document.getElementById("search");
const signoutbtn = document.getElementById("signoutbtn");
const searchdata = document.getElementById("row");
const name = document.getElementById("name");
var querysnapshot;
////////////////////////////

// Function to display images related to search
search.addEventListener("submit",async(e)=> {
  e.preventDefault();
  // If the input field is empty then give an alert message and stop the function
  if (name.value == "") {
    alert("Please give input");
    return;
  }
  
  // Traversing through all the docs and if the documentid(name of the person whose images are present in it)
  // has a input name substring then display the image of that person.
  searchdata.innerHTML = "";
  querysnapshot = await getDocs(collection(db, "facesforssdmodel"));

    
  
    document.getElementById('displayinfo').innerHTML="Nothing to display";
  
  querysnapshot.forEach(async (doc) => {
    if (doc.id.includes(name.value.toLowerCase())) {
      document.getElementById('displayinfo').innerHTML="Content found";
      // Downloading the image from firebase storage and appending it to our html page
      const imageRef = ref(storage, "images/" + doc.id);
     const url=await getDownloadURL(imageRef)
        const div = document.createElement("div");
        div.id = "img";
        const img = document.createElement("img");
        img.setAttribute("src", url);
        img.style.width = "inherit";
        img.style.maxWidth = "100%";
        const p = document.createElement("p");
        let x = JSON.parse(JSON.stringify(doc.id));
        let s = x.charAt(0);
        s = s.toUpperCase();
        x = s + x.substring(1);
        p.innerHTML = x;
        div.appendChild(img);
        div.append(p);
        searchdata.appendChild(div);
      };
    })

  })
    ////////////////////////////////////////////////////////////////////////////////////
  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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


