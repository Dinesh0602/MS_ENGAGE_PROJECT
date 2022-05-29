//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
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
// ///////////////////////////////////////////////////////////////

// If user is not authenticated then navigate the user to login page(index.html)
onAuthStateChanged(auth, (user) => {
if(!user){
window.location.href="index.html";
}
})
////////////////////////////////////////////////////////

// Declaration of variables
const adddata = document.getElementById("addbtn");
const signoutbtn = document.getElementById("signoutbtn");
const name = document.getElementById("name");
const fileInput = document.getElementById("file-input");
const imageContainer = document.getElementById("images");
const numOfFiles = document.getElementById("num-of-files");
var fadeTarget = document.getElementById("loader-wrapper");
var nameInLowerCase;
//////////////////////////////////////////////////////

// Loading required models
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
]).then(gatherdata);
/////////////////////////////////////////////////////

// To prevent the user from pasting in input tag
name.addEventListener("paste", (e) => {
  e.preventDefault();
});
///////////////////////////////////

// Display Images
function preview() {
  imageContainer.innerHTML = "";
  numOfFiles.textContent = `${fileInput.files.length} Files Selected`;

  for (let i of fileInput.files) {
    let reader = new FileReader();
    let figure = document.createElement("figure");
    let figCap = document.createElement("figcaption");
    figCap.innerText = i.name;
    figure.appendChild(figCap);
    reader.onload = () => {
      let img = document.createElement("img");
      img.setAttribute("src", reader.result);
      figure.insertBefore(img, figCap);
    };
    imageContainer.appendChild(figure);
    reader.readAsDataURL(i);
  }
}
fileInput.addEventListener("change", preview);
///////////////////////////////////////////////

// Slow fade effect for preloader
async function gatherdata() {
  var fadeEffect = setInterval(function () {
    if (!fadeTarget.style.opacity) {
          fadeTarget.style.opacity = 1;
      }
      if (fadeTarget.style.opacity > 0) {
          fadeTarget.style.opacity -= 0.1;
      } else {
        fadeTarget.style.display="none";
          clearInterval(fadeEffect);
      }
  }, 200);
  /////////////////////////////////////


  adddata.addEventListener("click", async () => {

    // If nameinput or fileinput is null we will not run this addeventlistener
    if (name.value.trim() == "" || fileInput.files.length == 0) {
      alert("Please provide both name and image of the person");
      return;
    }
    /////////////////////////////////////////////////

    // store detections of each person in these delared arrays
    //detections is for ssdMobilenetv1 model and the other variable for tinyFaceDetector model
    const detections = [];
    const detections2 = [];
    //////////////////////////////////////////////////

    // Looping through each image and storing the detections from each image as above mentioned  
    for (var i of fileInput.files) {
      const image = await faceapi.bufferToImage(i);
      const detection = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();
      const detection2 = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      detections2.push(detection2);
      detections.push(detection);

    // Return the function if any image of the uploaded images contain multiple faces or no face.
      if (detection.length != 1&&detection2.length!=1) {
        alert("Please upload images with single face");
        return;
      }
    }
    /////////////////////////////////////////////////////

    nameInLowerCase=name.value.toLowerCase();

    // Upload the first image of the input files to the firebase storage with file name as input name
    const imageRef = ref(storage, "images/" + nameInLowerCase);
    var file = fileInput.files[0];
    var metadata = {
      contentType: "image/jpeg",
    };
    const uploadTask = uploadBytesResumable(imageRef, file, metadata).then(
      () => {
        name.value = "";
    imageContainer.innerHTML = "";
    numOfFiles.textContent = `0 Files Selected`;
    fileInput.value = "";
    alert("Successfully uploaded");
      }
    );
    ////////////////////////////////
   

    // Creating a new doc in firestore database if the doc does not exits
    // If the document with inputname exists in collections then that doc will be retrieved from firestore and changes are made to the existing document
    const newFaceForSsdModel = doc(
      db,
      "facesforssdmodel",
      nameInLowerCase
    );
    const newFaceForTinyModel = doc(
      db,
      "facesfortinymodel",
      nameInLowerCase
    );
    const newImageForSsdModel = doc(
      collection(db, "facesforssdmodel", nameInLowerCase, "images")
    );
    const newImageForTinyModel = doc(
      collection(db, "facesfortinymodel", nameInLowerCase, "images")
    );
    var data = {
      name: name.value,
    };

    await setDoc(newFaceForSsdModel, data);
    await setDoc(newFaceForTinyModel, data);

   // Storing the face detections as string using JSON 
    for (let i = 0; i < detections.length; i++) {
      const mystring = JSON.stringify(detections[i][0].descriptor);
      const mystring2 = JSON.stringify(detections2[i][0].descriptor);
      await setDoc(newImageForSsdModel, {
        detection: mystring,
      });
      await setDoc(newImageForTinyModel, {
        detection: mystring2,
      });
    }
    ///////////////////////////////////////////////////
  });
}


// Signout function
async function signout() {
  signOut(auth)
    .then(() => {
      window.location.href = "/index.html";
    })
    .catch(() => {
      alert("There is some error please try again");
    });
}
signoutbtn.addEventListener("click", signout);
////////////////////////////////////
