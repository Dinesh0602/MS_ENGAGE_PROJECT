//               *******     Initialising Firebase    *******
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getAuth,
  signOut,onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import {
  getStorage,
  ref,deleteObject
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
  if(!user){
  window.location.href="index.html";
  }
  })
////////////////////////////////////////////////////////////////////////////////////

// Declaration of variables
const removedata = document.getElementById("removebtn");
const signoutbtn = document.getElementById("signoutbtn");
const fileInput = document.getElementById("file-input");
const imageContainer = document.getElementById("images");
const numOfFiles = document.getElementById("num-of-files");
var fadeTarget =  document.getElementById("loader-wrapper");
var Ref;
////////////////////////////

// Loading required models
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
]).then(gatherdata);
//////////////////////////

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


async function gatherdata() {
  // Slow fade effect for preloader
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
  ///////////////////////////////////
  
  // Load labeled images for Ssd model
  const labeledFaceDescriptorsForSsdModel = await loadLabeledImages(
    "facesforssdmodel"
  );
  const faceMatcherForSsdModel = new faceapi.FaceMatcher(
    labeledFaceDescriptorsForSsdModel,
    0.5
  );
  ///////////////////////////////////

  //Load labeled images for Tiny model
  const labeledFaceDescriptorsForTinyModel = await loadLabeledImages(
    "facesfortinymodel"
  );
  const faceMatcherForTinyModel = new faceapi.FaceMatcher(
    labeledFaceDescriptorsForTinyModel,
    0.5
  );
  /////////////////////////////////////
  
  removedata.addEventListener("click", async () => {
    // If file input is empty then give an alert and stop the function
    if (fileInput.files.length == 0) {
      alert("Please provide image of the person");
      return;
    }
    ///////////////////////////////////////////////////////////////////

    // Detect all faces in the image with both the models
    const image = await faceapi.bufferToImage(fileInput.files[0]);
    const detection = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const detection2 = await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    /////////////////////////////////////////////////////////
    
    //Number of detections in each image should be one
    if (detection.length != 1) {
      alert("Please upload image with single face");
      return;
    }
    //////////////////////////////////////////////////////

    //Finding best match in both the models
    const matchedimagefaceforssdmodel = faceMatcherForSsdModel.findBestMatch(
      detection[0].descriptor
    );
    const matchedimagefacefortinymodel = faceMatcherForTinyModel.findBestMatch(
      detection2[0].descriptor
    );
    // Delete the doc in both the models if the distance is less than 0.5 
    if (matchedimagefacefortinymodel.distance < 0.5) {
      try {
        let nameInLowerCase = matchedimagefacefortinymodel.label.toLowerCase();
        await deleteDoc(doc(db, "facesfortinymodel", nameInLowerCase));
      } catch (e) {
        alert("There is some error encountered, please try again");
        console.log(e);
      }
    
    if (matchedimagefaceforssdmodel.distance < 0.5) {
      let nameInLowerCase = matchedimagefaceforssdmodel.label.toLowerCase();
      try {
        
        await deleteDoc(doc(db, "facesforssdmodel", nameInLowerCase));
      } catch (e) {
        alert("There is some error encountered, please try again");
        console.log(e);
      }
      // Delete image related to this person  from firebase storage
      Ref=ref(storage, 'images/'+nameInLowerCase);
      await deleteObject(Ref).then(() => {
        imageContainer.innerHTML = "";
        numOfFiles.textContent = `0 Files Selected`;
        fileInput.value = "";
        alert("Successfull!");
      });
      //////////////////////////////////////////////////////////////
    }}
    else{
      imageContainer.innerHTML = "";
        numOfFiles.textContent = `0 Files Selected`;
        fileInput.value = "";
        alert("Not Found!");
    }
   /////////////////////////////////////////////////////////////////////////////////////
  });
}


// Single function to load labeled images for both the models
async function loadLabeledImages(x) {
  const labels = [];
  //Pushing document id's of all the documents in x collection
  const querysnapshot = await getDocs(collection(db, x));
  querysnapshot.forEach((doc) => {
    labels.push(doc.id);
  });
  //////////////////////////////////////////////////////////

  return Promise.all(
    // Traversing through all the image detections present in images subcollection of every doc 
    //  and returning them with their name as label
    labels.map(async (docid) => {
      let descriptions = [];
      const colRef = await getDocs(collection(db, x, docid, "images"));
      const label2 = [];
      colRef.forEach(async (docRef) => {
        label2.push(docRef.id);
      });
      label2.map(async (imagedocid) => {
        const imagedocRef = await getDoc(
          doc(db, x, docid, "images", imagedocid)
        );
        const data = imagedocRef.data();
        //Converting the detections string to Float32Array
        const obj = Object.values(JSON.parse(data.detection));
        var arr1 = new Float32Array(obj);
        ///////////////////////////////////////////////////
        descriptions.push(arr1);
      });
      return new faceapi.LabeledFaceDescriptors(docid, descriptions);
    })
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  );
}
////////////////////////////////////////////////////////////

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
/////////////////////
