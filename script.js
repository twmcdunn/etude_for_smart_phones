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

console.log("hi");

var buttonFuncs = [readNotesFromDB, startPieceLocal, startPieceGlobal, test, readComposition];
var buttonTexts = [
    "Read Notes from DB",
    "Start Piece Local",
    "Start Piece Global",
    "TEST",
    "Read Composition"
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

let myUserNum = -1;
async function startPieceLocal() {
    console.log("SSTART");
    if (myUserNum == -1) {
        await getUserNum().promise();
        incrementUsers();
    }

    putToDB(myUserNum, new Date().getTime() + 3000, 23, 0, 0);
    //r = await r.promise();
    console.log("IN SPL", myUserNum);
    //r.then((results) => {console.log("Results", myUserNum)});//
    //setInterval(readNotesFromDB ,50, true);

    //startPieceGlobal();
}

//startPieceLocal();

function getUserNum() {
    var params = {
        ExpressionAttributeValues: {
            ":a": { N: "-1" },
            ":t": { N: "-1" }
        },
        KeyConditionExpression: "USER_NUM = :a and TIME_NUM = :t",
        ProjectionExpression: "NUM_OF_USERS",
        TableName: "EFSP_NOTES"
    };

    var results = ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else {
            myUserNum = data.Items[0].NUM_OF_USERS.N;
            console.log("IN ADDUSER", myUserNum);
        }
    });
    return results;
}

function incrementUsers() {
    var params = {
        ExpressionAttributeValues: {
            ":increment": { N: "1" }
        },
        Key: {
            USER_NUM: {
                N: "-1"
            },
            TIME_NUM: {
                N: "-1"
            }
        },
        UpdateExpression: "SET NUM_OF_USERS = NUM_OF_USERS + :increment",
        TableName: "EFSP_NOTES"
    };
    ddb.updateItem(params, function (err, data) {
        //document.writeln("RESULT", data.Items[0].element.NUM_OF_USERS.N);
        if (err) {
            console.log("error", err);
        }
    });
}

async function startPieceGlobal() {
    if (myUserNum == -1) await getUserNum().promise();
    for (let i = 0; i < myUserNum; i++) {
        readNotesFromDB(false, i);
    }
    console.log("removed notes");
    //return;

    console.log("start piece global...");

    ["NUM_OF_USERS", "CHORD_NUM"].forEach(function (attr) {
        var params = {
            ExpressionAttributeValues: {
                ":zero": { N: "0" }
            },
            Key: {
                USER_NUM: {
                    N: "-1"
                },
                TIME_NUM: {
                    N: "-1"
                }
            },
            UpdateExpression: "SET " + attr + " = :zero",
            TableName: "EFSP_NOTES"
        };
        ddb.updateItem(params, function (err, data) {
            if (err) {
                console.log("error", err);
            }
        });
    });

    var params = {
        ExpressionAttributeValues: {
            ":now": { N: new Date().getTime().toString() }
        },
        Key: {
            USER_NUM: {
                N: "-1"
            },
            TIME_NUM: {
                N: "-1"
            }
        },
        UpdateExpression: "SET START_TIME_NUM = :now",
        TableName: "EFSP_NOTES"
    };
    ddb.updateItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
    });
    myUserNum = 0;
}

function readNotesFromDB(play, un) {
    console.log("READING w/ usernum = ", myUserNum);
    var locUn = myUserNum;
    if (un != undefined) {
        locUn = un;
    }
    var params = {
        ExpressionAttributeValues: {
            ":a": { N: locUn.toString() },
            ":t": { N: new Date().getTime().toString() }
        },
        KeyConditionExpression: "USER_NUM = :a and TIME_NUM < :t",
        ProjectionExpression: "USER_NUM, TIME_NUM, NOTE_HS, NOTE_VOL, NOTE_SAMPLE",
        TableName: "EFSP_NOTES"
    };

    ddb.query(params, function (err, data) {
        if (err) {
            console.log("error", err);
        } else {
            data.Items.forEach(function (element, index, array) {
                if (play) {
                    console.log("PLAY = ", play);
                    playNote(
                        element.EVENT_NUM.N,
                        element.EVENT_VOL.N
                    );
                }

                removeFromDB(element.USER_NUM.N, element.TIME_NUM.N);
            });
        }
    });
}

function playNote(eventNum, eventVol) {
    console.log("PLAY NOTE", eventNum);
}

function removeFromDB(userNum, timeNum) {
    var params = {
        Key: {
            USER_NUM: {
                N: userNum.toString()
            },
            TIME_NUM: {
                N: timeNum.toString()
            }
        },
        TableName: "EFSP_NOTES"
    };

    ddb.deleteItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
    });
}

function putToDB(userNum, timeNum, noteHs, noteVol, noteSample) {
    var params = {
        Item: {
            USER_NUM: {
                N: userNum.toString()
            },
            TIME_NUM: {
                N: timeNum.toString()
            },
            NOTE_HS: {
                N: noteHs.toString()
            },
            NOTE_VOL: {
                N: noteVol.toString()
            },
            NOTE_SAMPLE: {
                N: noteSample.toString()
            }
        },
        TableName: "EFSP_NOTES"
    };
    ddb.putItem(params, function (err, data) {
        if (err) {
            console.log("error", err);
        }
    });
}
