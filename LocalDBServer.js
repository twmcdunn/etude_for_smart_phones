/*
Had to write this beccause AWS's local DB VM doesn't work properly
methods to implement: 
ddb.query
ddb.updateItem
ddb.putItem
ddb.deleteItem

in order to work, ws must be installed:
npm install ws
*/


import { createRequire } from 'module';
const require = createRequire(import.meta.url);


// Importing the required modules
var WebSocketServer = require('ws');
//import WebSocketServer from 'ws';
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })

var spawn = require('child_process').spawn;




//console.log("TEST");

class LocalDDBSimulator {
    constructor() {
        this.dataBase = [];
        this.dataBase.push(Object.fromEntries([
            ["EVENT_NUM", {N:-1}],
            ["CURRENT_EVENT_NUM", {N:0}],
            ["NUM_OF_USERS", {N:0}],
            ["PIECE_START_TIME", {N:-1}]
        ]));
    }

    query(params, callback) {
        var dataOut;
        var basicBool = precessExpressionAttributeValues(params);
        var Items = [];
        this.dataBase.forEach((item) => {
            var refinedBool = basicBool;
            var map = new Map(Object.entries(item));
            map.forEach((value, key) => {
                refinedBool = refinedBool.replaceAll(key, value.N);
            });
            var value = eval(refinedBool);
            if (value)
                Items.push(item);
            dataOut = { Items, "Count": Items.length };
            callback(undefined, dataOut);
        });
        return dataOut;
    }

    updateItem(params, callback) {
        var dataOut;
        var Attributes = null;

        var keyMap = new Map(Object.entries(params.Key));

        var ue = params.UpdateExpression;

        this.dataBase.forEach((item) => {
            var objMatchesKeys = true;

            keyMap.forEach((value, key) => {
                if (item[key.toString()].N != value.N)
                    objMatchesKeys = false;
            });

            if (objMatchesKeys) {
                Attributes = item;
                dataOut = { Attributes };
                callback(undefined, dataOut);

                if (ue.startsWith("SET ")) {
                    var itemMap = new Map(Object.entries(item));
                    ue = ue.replace("SET ", "");
                    var eavMap = new Map(Object.entries(params.ExpressionAttributeValues));
                    eavMap.forEach((value, key) => {
                        ue = ue.replaceAll(key.toString(), value.N.toString());
                    });
                    var setStatements = ue.split(",");
                    itemMap.forEach((value, key) => {
                        setStatements.forEach((setStatement) => {
                            if (setStatement.startsWith(key)) {
                                //perform opperation
                                var str = "let " + key + " = " + value.N +
                                    ";\n" + setStatement +
                                    ";\item[key].N = " + key;
                                eval(str);
                                //assignRessult
                            }
                        });
                    })
                }
                else {
                    //Console.log("ERROR: the desired update item command \nhasn't been implemented in the local DB simulator\n" + ue);
                }
            }
        });

        if(Attributes === null){
            dataOut = { Attributes };
            callback(undefined, dataOut);
        }
        return dataOut;
    }

    deleteItem(params, callback) {
        var dataOut;
        var Attributes = null;

        this.dataBase.forEach((item) => {
            var objMatchesKeys = true;
            var keyMap = new Map(Object.entries(params.Key));

            keyMap.forEach((value, key) => {
                if (item[key.toString()].N != value.N)
                    objMatchesKeys = false;
            });
            if (objMatchesKeys) {
                Attributes = item;
            }
        });
        this.dataBase = this.dataBase.filter((item) => item != Attributes);

        dataOut = { Attributes };
        callback(undefined, dataOut);
        return dataOut;
    }

    putItem(params, callback) {
        this.dataBase.push(params.Item);

        callback(undefined, undefined);

        return undefined;
    }

}

function createPropertiesObject(arr, projection) {
    var proj = -1;
    if (projection != undefined)
        proj = projection.split(",");
    var propertyEntries = [];
    for (let i = 0; i < arr.length; i += 2) {
        if (proj === -1 || proj.includes(arr[i]))
            propertyEntries.push([arr[i], { N: arr[i + 1] }]);
    }
    return Object.fromEntries(propertyEntries);
}


function precessExpressionAttributeValues(params) {
    var basicBool = params.KeyConditionExpression;//get("KeyConditioonExpression");
    //console.log(basicBool);

    //console.log(params.ExpressionAttributeValues);

    var map = new Map(Object.entries(params.ExpressionAttributeValues));

    map.forEach((value, key) => {
        //console.log("key: " + key + " value: " +  value);
        basicBool = basicBool.replaceAll(key.toString(), value.N.toString());
    });


    /*
        var iterator = map.keys();
    
        var key = iterator.next().value;
        while (key != undefined) {
            basicBool = basicBool.replaceAll(key, map.get(key).N);
            key = iterator.next().value;
        }
            */
    //console.log(basicBool);

    basicBool = basicBool.replaceAll("=", "===");
    //console.log(basicBool);
    return basicBool;
}





var db = new LocalDDBSimulator();

// Creating connection using websocket
wss.on("connection", ws => {
    //Console.log("new client connected");
    // sending message to client
    //ws.send('Welcome, you are connected!');
    //on message from client
    ws.on("message", data => {
        //Console.log("HI");
        //Console.log(`Client has sent us: ${data}`);
        var json = JSON.parse(data);
        //Console.log("WE've PARSED ", json);

        var callback = function (err, response) {
            //console.log("returning response", response)
            ws.send(JSON.stringify({
                Content: response,
                Id: json.Id
            }));
        };
        switch (Number(json.callNum)) {
            case 0:
                db.query(json.params, callback);
                break;
            case 1:
                db.updateItem(json.params, callback);
                break;
            case 2:
                db.putItem(json.params, callback);
                break;
            case 3:
                db.deleteItem(json.params, callback);
                break;
        }
    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        //Console.log("the client has disconnected");
    });
    // handling client connection error
    ws.onerror = function () {
        //Console.log("Some Error occurred")
    }
});
//console.log("The WebSocket server is running on port 8080");
