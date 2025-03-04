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
userNumText.style.color = "rgb(0,255,255)";
userNumText.style.fontSize = "150%";
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
            ":a": { N: "-1" }
        },
        KeyConditionExpression: "EVENT_NUM = :a",
        ProjectionExpression: "EVENT_NUM,NUM_OF_USERS,PIECE_START_TIME",
        TableName: "EFSP_EVENTS"
    };

    var results = ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else if (data.Items[0].PIECE_START_TIME.N != -1) {//if started
            var params = { // reset
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
        else{//jump rigth to making the button, if db already cleared
            buttonAndUserText();
        }
    });
}
var startButton;
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
           buttonAndUserText();
        }
    });
}


function buttonAndUserText(){
    startButton = document.createElement("BUTTON");
    startButton.innerText = "START PIECE";
    startButton.onclick = startPiece;
    document.body.appendChild(startButton);
    checkUsersInterval = setInterval(checkUsers, 500);
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
            document.getElementById("userNumText").innerHTML = "Number of users connected: " + data.Items[0].NUM_OF_USERS.N + "<br>Scan or go to <b>https://twmcdunn.github.io/etude_for_smart_phones</b>";
        }
    });
}

var startTime;
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

}

var aniTime = 0;
setInterval(animate, 1000);

function animate() {
    aniTime++;
    var brightness = (Math.sin(2 * Math.PI * aniTime / 240.0) + 1) / 2.0;
    brigthness = 64 + 128 * brightness;
    document.body.style.backgroundColor = `rgb(${0}, ${brightness}, ${brigthness})`;//rgb(0,64 + 128 * brightness,64 + 128 * brightness);
}

var checkIfStartedInterval = setInterval(checkIfStarted, 1000);
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
            clearInterval(checkUsersInterval);
            //pieceStartTime = data.Items[0].PIECE_START_TIME.N;
            removeqrCode();
        }
    });
}

function removeqrCode() {
    document.body.removeChild(qrCode);
    document.body.removeChild(startButton);
    document.getElementById("userNumText").innerText = "";
    document.body.removeChild(document.getElementById("userLink"));
}
