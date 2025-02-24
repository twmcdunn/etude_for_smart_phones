var audioContext = new AudioContext();
var buffers = [];
var attackBuffers = [];
function queueSounds1() {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((mediastream) => {
        mediastream.getAudioTracks().forEach((trk) => {
            //trk.enabled = false;
            //trk.stop();
            trk.applyConstraints({
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false
            });
        })
    });

    if (audioContext.state != "running") {
        audioContext.resume();
    }

    for (let n = 1; n <= 7; n++) {//n is sampleNum
        getAudioBuffer(n, (buff) => {
            buffers.push(buff);
        });
    }

    for (let n = 101; n <= 293; n++) {//n is sampleNum
        getAudioBuffer(n, (buff) => {
            attackBuffers.push(buff);
        });
    }
}


function getAudioBuffer(sampleNum, callback) {
    var url = "https://twmcdunn.github.io/etude_for_smart_phones/" + sampleNum + ".wav";//could go back to mp3 w/ audacity batch process if needed
    var req = new XMLHttpRequest();
    req.responseType = "arraybuffer";
    req.onload = function () {
        audioContext.decodeAudioData(req.response, function (buffer) {
            callback(buffer);
        })
    };
    req.open("GET", url);
    req.send();
}

function playOct4() {
    var buff = buffers[6];

    if (audioContext.state != "running") {
        audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    source.buffer = buff;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);


    //source.playbackRate.value = (c0Freq * (2 ** (note.hs / 20.0))) / refFreqs[Number(note.sampleNum) - 1];
    var ratio = 4;//(c0Freq * (2 ** (note.hs / 20.0))) / 2077;
    var cents = Math.log2(ratio) * 1200;
    //console.log("CENTS: " + cents);
    //source.detune.value = cents;

    if (audioContext.state != "running") {
        audioContext.resume();
    }
    source.start(0);
}


function playAttack() {
    var buff = attackBuffers.shift();

    if (audioContext.state != "running") {
        audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    console.log("DETUNE:"+source.detune.value);
    source.buffer = buff;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
    source.connect(gainNode);

    gainNode.connect(audioContext.destination);


    if (audioContext.state != "running") {
        audioContext.resume();
    }
    source.start(0);
}

var button = document.createElement("button");
button.innerText = "QUEUE SOUNDS";
button.onclick = queueSounds1;
document.body.appendChild(button);

button = document.createElement("button");
button.innerText = "PLAY OCT 4";
button.onclick = playOct4;
document.body.appendChild(button);


button = document.createElement("button");
button.innerText = "PLAY ATTACK";
button.onclick = playAttack;
document.body.appendChild(button);