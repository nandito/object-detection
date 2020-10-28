import throttle from 'lodash/throttle';

let front = false;
let videoTrack = null;
let requestAnimationFrameId = null;
let model;

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

function debounce(func, wait, immediate) {
  let timeout;
  return (...args) => {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const children = [];
function clearHighlights() {
  for (let i = 0; i < children.length; i += 1) {
    liveView.removeChild(children[i]);
  }
  children.splice(0);
}

const cache = [];
const persisted = [];

const persistPredictions = throttle(() => {
  const newPredictions = cache.filter((cp) => !persisted.some((pp) => pp.class === cp.class));
  const removedPredictions = persisted.filter((cp) => !cache.some((pp) => pp.class === cp.class));

  for (let i = 0; i < newPredictions.length; i += 1) {
    persisted.push(newPredictions[i]);
  }
  for (let i = 0; i < removedPredictions.length; i += 1) {
    for (let j = 0; j < persisted.length; j += 1) {
      if (persisted[j].class === removedPredictions[i].class) {
        persisted[j].out = Date();
      }
    }
  }

  console.log({cache, persisted});

  cache.splice(0);
}, 5000);

function cachePrediction(prediction) {
  if (!cache.some((p) => p.class === prediction.class)) {
    cache.push({ ...prediction, in: Date() });
  }
}

// Placeholder function for next step.
function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then((predictions) => {
    // Remove any highlighting we did previous frame.
    clearHighlights();
    persistPredictions();

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n += 1) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        // console.log(predictions[n].class, Math.round(parseFloat(predictions[n].score) * 100));
        cachePrediction(predictions[n]);

        const p = document.createElement('p');
        p.innerText = `${predictions[n].class} - with ${
          Math.round(parseFloat(predictions[n].score) * 100)
        }% confidence.`;
        p.style = `margin-left: ${predictions[n].bbox[0]}px; margin-top: ${
          predictions[n].bbox[1] - 10}px; width: ${
          predictions[n].bbox[2] - 10}px; top: 0; left: 0;`;

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = `left: ${predictions[n].bbox[0]}px; top: ${
          predictions[n].bbox[1]}px; width: ${
          predictions[n].bbox[2]}px; height: ${
          predictions[n].bbox[3]}px;`;

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    requestAnimationFrameId = window.requestAnimationFrame(predictWebcam);
  });
}

// Placeholder function for next step. Paste over this in the next step.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }

  // Hide the button once clicked.
  event.target.classList.add('removed');

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    audio: false,
    video: {
      width: { ideal: window.innerWidth, max: 1920 },
      height: { max: 1080 },
      facingMode: (front ? 'user' : 'environment'),
    },
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    const videoTracks = stream.getVideoTracks();

    if (videoTracks.length) {
      [videoTrack] = videoTracks;
    }

    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices
    && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  // Show demo section now model is ready to use.
  demosSection.classList.remove('invisible');
});

document.getElementById('flipButton').addEventListener('click', () => {
  if (videoTrack) {
    front = !front;

    videoTrack.applyConstraints({
      facingMode: (front ? 'user' : 'environment'),
    });
  }
});

document.getElementById('stopButton').addEventListener('click', () => {
  if (videoTrack) {
    videoTrack.stop();
  }

  clearHighlights();
  video.removeEventListener('loadeddata', predictWebcam);
  window.cancelAnimationFrame(requestAnimationFrameId);
  video.srcObject = null;
  videoTrack = null;
  requestAnimationFrameId = null;
  enableWebcamButton.classList.remove('removed');
});

const setVideoConstraints = debounce(() => {
  console.log('resize');
  if (videoTrack) {
    videoTrack.applyConstraints({
      width: window.innerWidth,
    });
  }
}, 500);

window.addEventListener('resize', setVideoConstraints);
