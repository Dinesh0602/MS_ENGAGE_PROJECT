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
  getDoc,
  setDoc,
  doc,
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
/////////////////////////////////////////////////////////////////


// Declaration of variables
var labeledFaceDescriptorsForSsdModel,
  faceMatcherForSsdModel,
  labeledFaceDescriptorsForTinyModel,
  faceMatcherForTinyModel,
  detections,
  faceMatcher;
const media = document.getElementById("media");
const signoutbtn = document.getElementById("signoutbtn");
var video = document.getElementById("myvideo");
const videouploadbtn = document.getElementById("videouploadbtn");
const fileInput = document.getElementById("videoinput");
var fadeTarget = document.getElementById("loader-wrapper");
var canvas,
useremail,
  v = 0,
  displaySize;
///////////////////////////

// If the user is not authenticated then navigate the user to the login page(index.html)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
  useremail=(auth.currentUser.email).toString();
});
// //////////////////////////////////////////////////////////////////////////////////////

//Loading required models
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
]).then(loadfaces);
///////////////////////

// Function to pause and resume the video on clicking pauseresumebtn
async function pauseresume() {
  if (video.src != "" && v == 1) {
    video.pause();
    v = 0;
    pauseresumebtn.innerHTML = "Play &#9658";
  } else if (video.src != "" && v == 0) {
    video.play();
    v = 1;
    pauseresumebtn.innerHTML = "Pause &#9208";
  }
}

async function loadfaces() {
  // Fade effect for preloader
  var fadeEffect = setInterval(function () {
    if (!fadeTarget.style.opacity) {
      fadeTarget.style.opacity = 1;
    }
    if (fadeTarget.style.opacity > 0) {
      fadeTarget.style.opacity -= 0.1;
    } else {
      fadeTarget.style.display = "none";
      clearInterval(fadeEffect);
    }
  }, 200);
  /////////////////////////////

  // Load labeled images for Ssd model
  labeledFaceDescriptorsForSsdModel = await loadLabeledImages(
    "facesforssdmodel"
  );
  faceMatcherForSsdModel = new faceapi.FaceMatcher(
    labeledFaceDescriptorsForSsdModel,
    0.5
  );
   ///////////////////////////////////

  //Load labeled images for Tiny model
  labeledFaceDescriptorsForTinyModel = await loadLabeledImages(
    "facesfortinymodel"
  );
  faceMatcherForTinyModel = new faceapi.FaceMatcher(
    labeledFaceDescriptorsForTinyModel,
    0.5
  );
  /////////////////////////////////////

  pauseresumebtn.addEventListener("click", pauseresume);
  video.addEventListener("play", async () => {
    const foundPeople=[];
    setInterval(async () => {
      // Remove canvas if it is already present
      if (canvas) canvas.remove();
      //////////////////////////////////////

      // Appending canvas into media div
      canvas = faceapi.createCanvasFromMedia(video);
      media.appendChild(canvas);
      //////////////////////////////////

      // Matching canvas dimensions with video dimensions
      displaySize = { width: video.clientWidth, height: video.clientHeight };
      faceapi.matchDimensions(canvas, displaySize);
      ///////////////////////////////////////////////////
      
      // Choosing the model with which we should recognize and match the faces
      if (document.getElementById("choosemodel").value == "tinyFaceDetector") {
        detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
        faceMatcher = faceMatcherForTinyModel;
      } else {
        detections = await faceapi
          .detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();
        faceMatcher = faceMatcherForSsdModel;
      }
      ///////////////////////////////////////////////////////////////////////

      // Finding the best match among the labeledimages with detections which we have got from database(maximium difference is 0.5)
      // Draw canvas for all the recognized face
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });
      results.forEach(async (result, i) => {
       //sending the newly found person to the database
        const name=result._label;
        var check=0;
        if(name!='unknown'){
          for(var j of foundPeople){
            if(j==name){
              check=1;
            }
          }
       
        if(!check){
          foundPeople.push(name);
          const newPersonFound = doc(
           collection( db,
            "foundppl",
          ));
          const data={
            nameOfThepersonFound:name,
            foundby:useremail,
            dateFound:Date().toString().slice(0,24),
            media:"Video",
            similarity:1-result._distance
          }
          await setDoc(newPersonFound, data);
        }}
        ////////////////////////////////////////////

        const box = resizedDetections[i].detection.box;
        result._distance=1-result._distance;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvas);
      });
      /////////////////////////////////////////////////////////////////////////////////
    }, 100);
  });

  // Loading the input video file input into video element
  fileInput.addEventListener("change", async (event) => {
    videouploadbtn.addEventListener("click", async () => {
      let file = event.target.files[0];
      let blobURL = URL.createObjectURL(file);
      document.querySelector("#myvideo").src = blobURL;
    });
  });
  //////////////////////////////////////////////////////////
}


// Single function to load labeled images for both the models
async function loadLabeledImages(x) {
  const labels = [];
  //Pushing document id's of all the documents in x collection
  const querysnapshot = await getDocs(collection(db, x));
  querysnapshot.forEach((doc) => {
    labels.push(doc.id);
  });
  /////////////////////////////////////////////////////////////

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
  signOut(auth).then(() => {
    window.location.href = "/index.html";
  });
}
signoutbtn.addEventListener("click", signout);
///////////////////
