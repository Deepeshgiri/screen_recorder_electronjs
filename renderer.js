const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const video = document.getElementById('video');
const sourceSelect = document.getElementById('sourceSelect');

let mediaRecorder;
let recordedChunks = [];

// Populate video sources
async function getVideoSourcesAndPopulate() {
  try {
    const sources = await window.electronAPI.getVideoSources();

    sourceSelect.innerHTML = ''; // Clear existing options
    sources.forEach((source, index) => {
      const option = document.createElement('option');
      option.value = index;
      // Properly slice the source name
      option.innerText = source.name.length > 50 ? source.name.slice(0, 50) + '...' : source.name; // Show source name

      sourceSelect.appendChild(option);
    });

    if (sources.length === 0) {
      alert('No video sources found. Please ensure permissions are granted.');
    }
  } catch (error) {
    console.error('Error getting sources:', error);
    alert('Error fetching sources. Check console for details.');
  }
}

// Select and start capturing the chosen source
async function selectSource(source) {
  const constraints = {
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      },
    },
    //there is some issue 
    // audio: {
    //   mandatory: {
    //     chromeMediaSource: 'desktop',
    //     chromeMediaSourceId: source.id,
    //   },
    // },
  };

  try {
    console.log(constraints)
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.play();

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const filename = Date.now() + '.webm';

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      recordedChunks = []; // Clear recorded chunks for the next recording
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (error) {
    console.error('Error starting media capture:', error);
    alert('Failed to start capture. Please check your device permissions.');
  }
}

// Load sources on window load
window.onload = getVideoSourcesAndPopulate;

// Start button click handler
startBtn.onclick = async () => {
  const selectedSourceIndex = sourceSelect.value; // Get the selected video source index
  const inputSources = await window.electronAPI.getVideoSources();
  const videoSource = inputSources[selectedSourceIndex]; // Select the user-chosen video source
  await selectSource(videoSource);
};

// Stop button click handler
stopBtn.onclick = () => {
  mediaRecorder.stop();
  video.srcObject.getTracks().forEach(track => track.stop());
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
