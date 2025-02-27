var local = false;

function getDDB() {
    AWS.config.update({
        region: "us-east-2",
        identityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
    });
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
    });

    // Create DynamoDB service object
    var addb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

    if (local)
        addb = new LocalDBClient();
    return addb;
}


var ddb = getDDB();


var userNumText = document.createElement("p");
userNumText.id = "userNumText";
document.body.appendChild(userNumText);

var qrCode = document.createElement("img");
qrCode.src = "../efsp.svg";
qrCode.height = "800";
qrCode.width = "800";
document.body.appendChild(qrCode);

if (local)
    ddb.connect(resetDatabase);
else
    resetDatabase();

readComposition(0, 1);

function resetDatabase() {
    var params = {
        ExpressionAttributeValues: {
            ":zero": { N: "0" },
            ":negOne": { N: "-1" }
        },
        Key: {
            EVENT_NUM: {
                N: "-1"
            }
        },
        UpdateExpression: "SET CURRENT_EVENT_NUM = :zero,NUM_OF_USERS = :zero,PIECE_START_TIME= :negOne",
        TableName: "EFSP_EVENTS"
    };
    ddb.updateItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
        else {
            deleteEventRecord(0);
        }
    });
}

function deleteEventRecord(eventNum) {
    var params = {
        Key: {
            EVENT_NUM: {
                N: eventNum.toString()
            }
        },
        TableName: "EFSP_EVENTS",
        ReturnValues: "ALL_OLD"
    };
    ddb.deleteItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
        else if (data.Attributes) { // if something was deleted, try to delete next event
            deleteEventRecord(eventNum + 1);
        }
        else {
            var button = document.createElement("BUTTON");
            button.innerText = "START PIECE";
            button.onclick = startPiece;
            document.body.appendChild(button);
            checkUsersInterval = setInterval(checkUsers, 500);
        }
    });
}

function checkUsers() {
    var params = {
        ExpressionAttributeValues: {
            ":a": { N: "-1" }
        },
        KeyConditionExpression: "EVENT_NUM = :a",
        ProjectionExpression: "NUM_OF_USERS",
        TableName: "EFSP_EVENTS"
    };

    ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else {
            document.getElementById("userNumText").innerText = "Number of users connected: " + data.Items[0].NUM_OF_USERS.N;
        }
    });
}

var startTime;
var checkInterval;
function startPiece() {
    startTime = new Date().getTime();
    var params = {
        ExpressionAttributeValues: {
            ":now": { N: startTime.toString() }
        },
        Key: {
            EVENT_NUM: {
                N: "-1"
            }
        },
        UpdateExpression: "SET PIECE_START_TIME= :now",
        TableName: "EFSP_EVENTS"
    };
    ddb.updateItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
    });
    checkInterval = setInterval(checkProgress, 1000);
}

var aniTime = 0;
setInterval(animate, 1000);

function animate(){
    aniTime++;
    var brightness = (Math.sin(2 * Math.PI * aniTime / 240.0) + 1) / 2.0;
    brigthness = 64 + 128 * brightness;
    document.body.style.backgroundColor = `rgb(${0}, ${brightness}, ${brigthness})`;//rgb(0,64 + 128 * brightness,64 + 128 * brightness);
}


function checkProgress() {//force events to take place if its been 20 seconds since activation

    var params = {
        ExpressionAttributeValues: {
            ":a": { N: (-1).toString() }
        },
        KeyConditionExpression: "EVENT_NUM = :a",
        ProjectionExpression: "EVENT_NUM,CURRENT_EVENT_NUM",
        TableName: "EFSP_EVENTS"
    };

    ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else{
            var eNum = data.Items[0].CURRENT_EVENT_NUM.N;
            while(soundEvents.length > 0 && soundEvents[0].eventNum < eNum){
                soundEvents.shift();
            }
            if(Number(soundEvents[0].activationTime) + 20000 < new Date().getTime() - startTime){
                soundEvents.shift();
                instantiateSoundEvent();
            }
            if(soundEvents.length == 0){
                clearInterval(checkInterval);
            }
        }
    });
}

function instantiateSoundEvent(eventVol) {
    //deactivateEvent();
    console.log("EVENT INSTANTIATED @");

    if (!Number.isFinite(eventVol)) eventVol = Math.random();//for timeouts (and testing)

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
    console.log("EVENT TIMEOUT: " + new Date().getTime().toString());
    ddb.putItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
    });
}