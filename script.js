//This video outlines the extensions needed in VS Code for 
//web development: https://www.youtube.com/watch?v=5deeCvboSos


AWS.config.update({
    region: "us-east-2",
    identityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
});
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
});


// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

ddb = new LocalDBClient();



//useLocalDB();

//var ddb = null;//new AWS.DynamoDB();//{ apiVersion: "2012-08-10" });

async function useLocalDB(){

    AWS.config.logger = console;

    /*
    AWS.config.credentials = new AWS.Credentials();
    AWS.config.credentials.accessKeyId = "FAKEKEYID";
    AWS.config.credentials.seccretAccessKey = "FAKESECRET";
    AWS.config.region = "FAKEREGION";
    AWS.config.endpoint = new AWS.Endpoint("http://localhost:8000");

    AWS.config.update({
        region: "FAKEREGION",
        accessKeyId: "FAKEID",
        seccretAccessKey: "FAKESECRET",
        endpoint: 'http://localhost:8000'
    });
    var config = AWS.config;
    ddb = new AWS.DynamoDB();
    */
    

     
    AWS.config.update({
        endpoint: 'http://localhost:8000', // Default DynamoDB Local endpoint
        region: 'local', // Dummy region

        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy'
        }
    });

    ddb = new AWS.DynamoDB({
        endpoint: 'http://localhost:8000', // Default DynamoDB Local endpoint
        region: 'local', // Dummy region
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy'
        }
      });
     
     
     //{ apiVersion: "2012-08-10" });
    //ddb.endpoint = new AWS.Endpoint("http://localhost:8000");

    /*
    var response = await ddb.listTables(function(err, data){
        if(err)
            console.log(err);
        else
            console.log("TABLE LISTED", data);
    }).promise();
    */

    var params = {
        AttributeDefinitions: [
            {
                AttributeName: "EVENT_NUM",
                AttributeType: "N"
            }
        ],
        KeySchema: [
            {
                AttributeName: "EVENT_NUM",
                KeyType: "HASH"
            }
        ],
        TableName: "EFSP_EVENTS"
    }
    
    await ddb.createTable(params,function(err, data){
        if(err)
            console.log(err);
        else
            console.log("TABLE CREATED", data);
    }).promise();
    
}

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
ddb.connect(resetLocalData);
    //resetLocalData() ;
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
function updateAndGetUserNum(){
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
        else{
            console.log("USER_NUM_UPDATED. OLD = ", data.Attributes.NUM_OF_USERS);
            myUserNum = data.Attributes.NUM_OF_USERS.N;
            checkIfStartedInterval = setInterval(checkIfStarted, 1000);
        }
    });
}


function checkIfStarted(){
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
        } else if(data.Items[0].PIECE_START_TIME.N != -1){
            clearInterval(checkIfStartedInterval);
            pieceStartTime = data.Items[0].PIECE_START_TIME.N;
            startPiece();
        }
    });
}

function startPiece(){
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
        } else{
            readComposition(myUserNum, data.Items[0].NUM_OF_USERS.N, function(){
                scheduleEventActivations();
                scheduleEventListener();
            });
        }
    });
}

//allows this user to instantiate an event
var eventActivationIntervals = [];
function scheduleEventActivations(){
    mySoundEvents.forEach(function(event){
        eventActivationIntervals.push(setInterval(activateSoundEvent, pieceStartTime + event.activationTime - new Date().getTime()));
    });
}

//allows this user to schedule his child notes of an
//event written to the database
var eventListenerInterval = -1;
function scheduleEventListener(){//"Even listeners" are really home grown
    //listen at regular intervals a little smaller than the relative time of the next note to play
   // var now = new Date().getTime();
    var t = Math.max(Number(myNotes[0].relativeTime) - 500, 50)
    eventListenerInterval = setInterval(listenForEvent, t);
}

function listenForEvent(){
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
        } else if(data.Count > 0){
            //since this method pops all notes that are children of the event
            //there will be no duplicate invocations
            scheduleNotes(eventNum, data.Items[0].TIME_NUM.N,data.Items[0].EVENT_VOL.N);
        }
    });
}

var noteIntervals = [];
function scheduleNotes(eventNum, eventTime, eventVol){
    clearInterval(eventListenerInterval);
    while(myNotes.length > 0 && myNotes[0].parentEventNum === eventNum){
        let note = myNotes.shift();
        console.log("EVENT TIME: " + (eventTime));
        console.log("RELATIVE TIME : " + (note.relativeTime));
        console.log("now: " + (new Date().getTime()));

        console.log("NOTE SCHEDULE: " + (Number(eventTime) + Number(note.relativeTime) - Number(new Date().getTime())));
        noteIntervals.push(setInterval(function(){
            clearInterval(noteIntervals.shift());
            playNote(note.hs, note.relativeVol * eventVol, note.sampleNum);
        }, Number(eventTime) + Number(note.relativeTime) - Number(new Date().getTime())));
    }    
    scheduleEventListener();
}

var c0Freq = 440 * (2**(3/12)) * (2 ** -5);
var refFreqs = [2077];
var sounds = [];
for(let n = 1; n <= 1; n++){//n is sample num
    var soundArr = [];
    for(let i = 0; i < 20; i++){
        soundArr.push(new Audio("./" + n + ".wav"));
    }
    sounds.push(soundArr);
}
var sound = new Audio("./" + 1 + ".wav");
function playNote(hs,vol,sampleNum){
    console.log("PLAY NOTE ", hs, vol, sampleNum);
    //c0Freq * Math.pow(2, note.hs/20.0)
    var sound = sounds[sampleNum - 1].pop();
    sound.preservesPitch = false;
    sound.playbackRate = (c0Freq * (2 ** (hs/20.0))) / refFreqs[sampleNum - 1];
    sound.volume = vol * 0.1;
    sound.play();
    sounds[sampleNum - 1].push(new Audio("./" + sampleNum + ".wav"));
}

function activateSoundEvent(){
    activeSoundEvents++;
    if(activeSoundEvents == 1){
        addInstructionsGraphic();
    }
    clearInterval(eventActivationIntervals.shift());
}

function instantiateSoundEvent(eventVol){
    activeSoundEvents--;

    if(!Number.isFinite(eventVol)) eventVol = 1;//for testing

    if(activateSoundEvent == 0){
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
        else{
            console.log("CURRENT_EVENT_NUM UPDATED. OLD = ", data.Attributes.CURRENT_EVENT_NUM.N);
            writeEventToDB(data.Attributes.CURRENT_EVENT_NUM.N, eventVol);
        }
    });
}

function writeEventToDB(eventNum, eventVol){
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

function addInstructionsGraphic(){
    var button = document.createElement("BUTTON");
    button.id = "instantiateSoundEventButton";
    button.innerText = "Instantiate Sound Event";
    button.onclick = instantiateSoundEvent;
    document.body.appendChild(button);

}


function removeInstructionsGraphic(){
    document.body.removeChild(document.body.getElementById("instantiateSoundEventButton"));
}



//startPieceLocal();



