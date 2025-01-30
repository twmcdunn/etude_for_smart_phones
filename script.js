//This video outlines the extensions needed in VS Code for 
//web development: https://www.youtube.com/watch?v=5deeCvboSos

//const {Howl, Howler} = require('howler');

/*
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {Howl, Howler} = require('howler');
*/

// Importing the required modules

var local = true;

AWS.config.update({
    region: "us-east-2",
    identityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
});
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
});


// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

if (local)
    ddb = new LocalDBClient();

console.log("hi");

var buttonFuncs = [resetLocalData, test, readComposition, updateAndGetUserNum];
var buttonTexts = [
    "Reset Local Data",
    "TEST",
    "Read Composition",
    "Update and get user num"
];

for (let i = 0; i < buttonFuncs.length; i++) {
    var button = document.createElement("BUTTON");
    button.innerText = buttonTexts[i];
    button.onclick = buttonFuncs[i];
    document.body.appendChild(button);
}

var audioContext = new AudioContext();
StartAudioContext(audioContext);

async function test() {
    console.log("test");

    var params = {
        ExpressionAttributeValues: {
            ":a": { N: "-1" },
            ":t": { N: "-1" }
        },
        KeyConditionExpression: "USER_NUM = :a and TIME_NUM = :t",
        ProjectionExpression: "NUM_OF_USERS",
        TableName: "EFSP_NOTES"
    };

    await ddb
        .query(params, function (err, data) {
            if (err) {
                console.log("error", err);
            } else {
                myUserNum = data.Items[0].NUM_OF_USERS.N;
                console.log("IN ADDUSER", myUserNum);
            }
        })
        .promise();

    //await getUserNum().promise();
    console.log("teset1");
    //r = await getUserNum().promise();
}

//within an async function this syntax works
// await db.call
//however, it only seems to work once per visit to the
//site.



let myUserNum = -1;
let activeSoundEvents = 0;
let pieceStartTime = -1;

if (local)
    ddb.connect(resetLocalData);
else
    resetLocalData();

function resetLocalData() {
    //alert("I'm gonna need to play sound from your phone.\nIf this is cool with you, please turn the volume \nall the way up and click ok.");
    myUserNum = -1;
    activeSoundEvents = 0;
    pieceStartTime = -1;

    var button = document.createElement("BUTTON");
    button.id = "start";
    button.innerText = "Start";
    button.onclick = updateAndGetUserNum;
    document.body.appendChild(button);

}

var checkIfStartedInterval = -1;
function updateAndGetUserNum() {
    //backgroundSound();
    queueSounds1();
    var params = {
        ExpressionAttributeValues: {
            ":increment": { N: "1" }
        },
        Key: {
            EVENT_NUM: {
                N: "-1"
            }
        },
        UpdateExpression: "SET NUM_OF_USERS = NUM_OF_USERS + :increment",
        TableName: "EFSP_EVENTS",
        ReturnValues: "UPDATED_OLD"
    };
    ddb.updateItem(params, function (err, data) {
        //document.writeln("RESULT", data.Items[0].element.NUM_OF_USERS.N);

        if (err) {
            console.log("error", err);
        }
        else {
            console.log("USER_NUM_UPDATED. OLD = ", data.Attributes.NUM_OF_USERS);
            myUserNum = data.Attributes.NUM_OF_USERS.N;
            checkIfStartedInterval = setInterval(checkIfStarted, 1000);
        }
    });

}

function backgroundSound(){
    var osc = new OscillatorNode(audioContext);
    osc.connect(audioContext.destination);
    if (audioContext.state != "running") {
        audioContext.resume();
    }
    osc.start();
}

var c0Freq = 440 * (2 ** (3 / 12)) * (2 ** -5);
var refFreqs = [2077];
var sounds = [];
function queueSounds() {
    for (let n = 1; n <= 1; n++) {//n is sample num
        var soundArr = [];
        for (let i = 0; i < 20; i++) {
            /*
            var audio = new Audio("./" + n + ".mp3");//new Howl({ src: ['./' + n + '.mp3'] });
            //audio.loop = true;
            //audio.muted = true;
            //audio.play();
            //audio.load();
            var track = audioContext.createMediaElementSource(audio);
            track.connect(audioContext.destination);
            soundArr.push(audio);
            */
            
            getAudioBuffer(n, (audio) => {
                soundArr.push(audio);
            });
        }
        sounds.push(soundArr);
    }
    if (audioContext.state != "running") {
        audioContext.resume();
    }
}

var buffers = [];
function queueSounds1(){
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

    for (let n = 1; n <= 1; n++) {//n is sampleNum
        getAudioBuffer(n, (buff) => {
            buffers.push(buff);
        });
    }
}


function checkIfStarted() {
    var params = {
        ExpressionAttributeValues: {
            ":a": { N: "-1" }
        },
        KeyConditionExpression: "EVENT_NUM = :a",
        ProjectionExpression: "EVENT_NUM,NUM_OF_USERS,PIECE_START_TIME",
        TableName: "EFSP_EVENTS"
    };

    var results = ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else if (data.Items[0].PIECE_START_TIME.N != -1) {
            clearInterval(checkIfStartedInterval);
            pieceStartTime = data.Items[0].PIECE_START_TIME.N;
            startPiece();
        }
    });
}

function startPiece() {
    var params = {
        ExpressionAttributeValues: {
            ":a": { N: "-1" }
        },
        KeyConditionExpression: "EVENT_NUM = :a",
        ProjectionExpression: "EVENT_NUM,NUM_OF_USERS",
        TableName: "EFSP_EVENTS"
    };

    var results = ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else {
            readComposition(myUserNum, data.Items[0].NUM_OF_USERS.N, function () {
                scheduleEventActivations();
                scheduleEventListener();
            });
        }
    });
}

//allows this user to instantiate an event
function scheduleEventActivations() {
    mySoundEvents.forEach(function (event) {
        setTimeout(activateSoundEvent, Number(pieceStartTime) + Number(event.activationTime) - Number(new Date().getTime()));
    });
}

//allows this user to schedule his child notes of an
//event written to the database
var eventListenerInterval = -1;
function scheduleEventListener() {//"Even listeners" are really home grown
    //listen at regular intervals a little smaller than the relative time of the next note to play
    // var now = new Date().getTime();
    var t = Math.max(Number(myNotes[0].relativeTime) - 500, 50)
    eventListenerInterval = setInterval(listenForEvent, t);
}

function listenForEvent() {
    var eventNum = Number(myNotes[0].parentEventNum);
    var params = {
        ExpressionAttributeValues: {
            ":a": { N: eventNum.toString() }
        },
        KeyConditionExpression: "EVENT_NUM = :a",
        ProjectionExpression: "EVENT_NUM,TIME_NUM,EVENT_VOL",
        TableName: "EFSP_EVENTS"
    };

    var results = ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else if (Number(data.Count) > 0) {
            //since this method pops all notes that are children of the event
            //there will be no duplicate invocations
            scheduleNotes(eventNum, data.Items[0].TIME_NUM.N, data.Items[0].EVENT_VOL.N);
        }
    });
}

var noteIntervals = [];
function scheduleNotes(eventNum, eventTime, eventVol) {
    clearInterval(eventListenerInterval);
    while (myNotes.length > 0 && myNotes[0].parentEventNum === eventNum) {
        let note = myNotes.shift();
        //console.log("EVENT TIME: " + (eventTime));
        //console.log("RELATIVE TIME : " + (note.relativeTime));
        //console.log("now: " + (new Date().getTime()));

        //console.log("NOTE SCHEDULE: " + (Number(eventTime) + Number(note.relativeTime) - Number(new Date().getTime())));
        

        var buff = buffers[note.sampleNum - 1];

        if (audioContext.state != "running") {
            audioContext.resume();
        }
    
        const source = audioContext.createBufferSource();
        source.buffer = buff;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = Number(eventVol) * Number(note.relativeVol) * (0.5 ** (Number(audioContext.destination.numberOfInputs) + 1));
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
    
       
        source.playbackRate.value = (c0Freq * (2 ** (note.hs / 20.0))) / refFreqs[note.sampleNum - 1];
        if (audioContext.state != "running") {
            audioContext.resume();
        }
        source.start(Math.max(audioContext.currentTime + 
            ((Number(eventTime) + Number(note.relativeTime) - Number(new Date().getTime())) / 1000.0),0));

        /*
        noteIntervals.push(setInterval(function () {
            clearInterval(noteIntervals.shift());
            playNote(note.hs, note.relativeVol * eventVol, note.sampleNum);
        }, Number(eventTime) + Number(note.relativeTime) - Number(new Date().getTime())));
        */
    }
    scheduleEventListener();
}

function getAudioBuffer(sampleNum, callback){
    var url = "https://twmcdunn.github.io/etude_for_smart_phones/" + sampleNum + ".mp3";
    var req = new XMLHttpRequest();
    req.responseType = "arraybuffer";
    req.onload = function(){
        audioContext.decodeAudioData(req.response, function(buffer){
            callback(buffer);
        })
    };
    req.open("GET", url);
    req.send();
}


function playNote(hs, vol, sampleNum) {

    //console.log("PLAY NOTE ", hs, vol, sampleNum);
    //c0Freq * Math.pow(2, note.hs/20.0)
    var buff = buffers[sampleNum - 1];

    if (audioContext.state != "running") {
        audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    source.buffer = buff;
    source.connect(audioContext.destination);

   
    source.playbackRate.value = (c0Freq * (2 ** (hs / 20.0))) / refFreqs[sampleNum - 1];
    if (audioContext.state != "running") {
        audioContext.resume();
    }
    source.start();
     //sound.preservesPitch = false;
   /*
    sound.addEventListener('timeupdate', function(){
        if(!isNaN(sound.currentTime)) {
            sound.playbackRate = (c0Freq * (2 ** (hs / 20.0))) / refFreqs[sampleNum - 1];
        }
    });
    */
    //console.log("RATE: " + sound.playbackRate);
    //sound.volume = vol * 0.1;
    //sound.currentTime = 0;
    //sound.muted = false;
   
    /*
    setTimeout(function(){
        sound.muted = true;
        sounds[sampleNum - 1].push(sound);
    }, 1000);
    */

    //var audio = //new Audio("./" + sampleNum + ".wav");
    

    /*
    var track = audioContext.createMediaElementSource(audio);
    track.connect(audioContext.destination);
    */


}

var timeOutsForEventInstantiation = [];
function activateSoundEvent() {
    activeSoundEvents++;
    if (activeSoundEvents == 1) {
        addInstructionsGraphic();
    }
    timeOutsForEventInstantiation.push(setTimeout(instantiateSoundEvent, 20000));
}

function instantiateSoundEvent(eventVol) {
    clearTimeout(timeOutsForEventInstantiation.shift());
    activeSoundEvents--;
    console.log("EVENT INSTANTIATED @ ACTIVE = " + activeSoundEvents);

    if (!Number.isFinite(eventVol)) eventVol = Math.random();//for timeouts (and testing)

    if (activeSoundEvents == 0) {
        removeInstructionsGraphic();
    }

    var params = {
        ExpressionAttributeValues: {
            ":increment": { N: "1" }
        },
        Key: {
            EVENT_NUM: {
                N: "-1"
            }
        },
        UpdateExpression: "SET CURRENT_EVENT_NUM = CURRENT_EVENT_NUM + :increment",
        TableName: "EFSP_EVENTS",
        ReturnValues: "UPDATED_OLD"
    };
    ddb.updateItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
        else {
            console.log("CURRENT_EVENT_NUM UPDATED. OLD = ", data.Attributes.CURRENT_EVENT_NUM.N);
            writeEventToDB(data.Attributes.CURRENT_EVENT_NUM.N, eventVol);
        }
    });
}

function writeEventToDB(eventNum, eventVol) {
    var params = {
        Item: {
            EVENT_NUM: {
                N: eventNum.toString()
            },
            TIME_NUM: {
                N: new Date().getTime().toString()
            },
            EVENT_VOL: {
                N: eventVol.toString()
            }
        },
        TableName: "EFSP_EVENTS"
    };
    ddb.putItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
    });
}

var instantiateSoundEventButton = null;
function addInstructionsGraphic() {
    console.log("ADDING GRAPHIC @ active sound events =" + activeSoundEvents);
    instantiateSoundEventButton = document.createElement("BUTTON");
    instantiateSoundEventButton.id = "instantiateSoundEventButton";
    instantiateSoundEventButton.innerText = "Instantiate Sound Event";
    instantiateSoundEventButton.onclick = instantiateSoundEvent;
    document.body.appendChild(instantiateSoundEventButton);

}


function removeInstructionsGraphic() {
    console.log("REMOVING GRAPHIC @ active sound events =" + activeSoundEvents);
    document.body.removeChild(instantiateSoundEventButton);
}



//startPieceLocal();



