var local = false;

AWS.config.update({
    region: "us-east-2",
    identityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
});
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-2:946b7ec1-dda0-4ef9-9b2f-e05141fc25d0"
});

// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

if(local)
    ddb = new LocalDBClient();


var userNumText = document.createElement("p");
userNumText.id = "userNumText";
document.body.appendChild(userNumText);

if (local)
    ddb.connect(resetDatabase);
else
    resetDatabase();

function resetDatabase() {
    var params = {
        ExpressionAttributeValues: {
            ":zero": { N: "0" },
            ":negOne": { N: "-1"}
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
        else{
            deleteEventRecord(0);
        }
    });
}

function deleteEventRecord(eventNum){
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
        else if(data.Attributes){ // if something was deleted, try to delete next event
            deleteEventRecord(eventNum + 1);
        }
        else{
            var button = document.createElement("BUTTON");
            button.innerText = "START PIECE";
            button.onclick = startPiece;
            document.body.appendChild(button);
            checkUsersInterval = setInterval(checkUsers, 500);
        }
    });
}

function checkUsers(){
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

function startPiece(){
    var params = {
        ExpressionAttributeValues: {
            ":now": { N: new Date().getTime().toString()}
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