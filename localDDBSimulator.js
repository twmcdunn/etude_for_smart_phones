/*
Had to write this beccause AWS's local DB VM doesn't work properly
methods to implement: 
ddb.updateItem
ddb.putItem
ddb.query DONE
ddb.deleteItem

in order to work, ws must be installed:
nmp install ws
*/
// Importing the required modules
const WebSocketServer = require('ws');
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })

db = new LocalDDBSimulator();

// Creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connected");
    // sending message to client
    ws.send('Welcome, you are connected!');
    //on message from client
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`);
        var json = JSON.parse(data);
        switch(json.callNum){
            case 0:
                db.query(json.params, json.callback);
                break;
        }
    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has connected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8080");


var spawn = require(['child_process']).spawn;




//console.log("TEST");

class LocalDDBSimulator {

    
    query(params, callback) {
        var dataOut;
        var basicBool = precessExpressionAttributeValues(params);
        var Items = [];

        var child = spawn('python', ['readFakeDB.py', "0"]);
        child.stdout.on('data', (data) => {
            //console.log("stdout callback function", data.toString());
            const lines = data.toString().split("\n");
            lines.pop();
            lines.forEach((line) => {
                
                var refinedBool = basicBool;
                const cells = line.split(",");

                for (let n = 0; n < cells.length - 1; n++) {
                    refinedBool = refinedBool.replaceAll(cells[n], cells[n + 1]);
                }

                var value = eval(refinedBool);
                if (value)
                    Items.push(createPropertiesObject(cells, params.ProjectionExpression));
            });
            dataOut = { Items };
            callback(undefined, dataOut);
        });
        return dataOut;
    }

    updateItem(params, callback) {
        var dataOut;
        var Attributes = [];


        var child = spawn('python', ['readFakeDB.py', "0"]);
        child.stdout.on('data', (data) => {
            //console.log("stdout callback function", data.toString());
            const lines = data.toString().split("\n");
            var dbStr = "";
            lines.pop();
            lines.forEach((line) => {
                
                const cells = line.split(",");
                var obj = createPropertiesObject(cells);
                var objMatchesKeys = true;
                var keyMap = new Map(Object.entries(params.Key));

                keyMap.forEach((value,key) => {
                    if(obj[key.toString()] != value)
                        objMatchesKeys = false;
                });

                if (objMatchesKeys) {
                    Attributes.push(obj);
                    obj = structuredClone(obj);
                    var ue = params.UpdateExpression;
                    if (ue.startsWith("SET ")) {
                        ue = ue.replace("SET ", "");
                        var eavMap = new Map(Object.entries(params.ExpressionAttributeValues));
                        eavMap.forEach((value, key) => {
                            ue = ue.replaceAll(key.toString(), value.N.toString());
                        });
                        var setStatements = ue.split(",");
                        for (let n = 0; n < cells.length - 1; n += 2) {
                            setStatements.forEach((setStatement) => {
                                if (setStatement.startsWith(cells[n])) {
                                    //perform opperation
                                    var str = "let " + cells[n] + " = " + cells[n + 1] + 
                                    ";\n" + setStatement + 
                                    ";\ncells[n + 1] = " + cells[n];
                                    eval(str);
                                    //assignRessult
                                }
                            });
                        }
                    }
                    else{
                        //Console.log("ERROR: the desired update item command \nhasn't been implemented in the local DB simulator\n" + ue);
                    }
                    dbStr += cells.join();
                }
                else{
                    dbStr += line + "\n";
                }
            });
            var child1 = spawn('python', ['readFakeDB.py', "1", dbStr]);
            child1.stdout.on('data', (data) => {});
            dataOut = { Attributes };
            callback(undefined, dataOut);
        });
        return dataOut;
    }

    deleteItem(params, callback) {
        var dataOut;
        var Attributes = [];


        var child = spawn('python', ['readFakeDB.py', "0"]);
        child.stdout.on('data', (data) => {
            //console.log("stdout callback function", data.toString());
            const lines = data.toString().split("\n");
            var dbStr = "";
            lines.pop();
            lines.forEach((line) => {
                
                const cells = line.split(",");
                var obj = createPropertiesObject(cells);
                var objMatchesKeys = true;
                var keyMap = new Map(Object.entries(params.Key));

                keyMap.forEach((value,key) => {
                    if(obj[key.toString()].N != value.N)
                        objMatchesKeys = false;
                });

                if (objMatchesKeys) {
                    Attributes.push(obj);
                }
                else{
                    dbStr += line + "\n";
                }
            });
            var child1 = spawn('python', ['readFakeDB.py', "1", dbStr]);
            child1.stdout.on('data', (data) => {});
            if(Attributes.length == 0)
                Attributes = undefined;
            dataOut = { Attributes };
            callback(undefined, dataOut);
        });
        return dataOut;
    }

    putItem(params, callback){
       
        var map = new Map(Object.entries(params.Item));
        var cells = []
        map.forEach((value,key) => {
            cells.push(key.toString(), value.N.toString());
        });
            var child1 = spawn('python', ['readFakeDB.py', "2", "\n" + cells.join()]);
            child1.stdout.on('data', (data) => {});
            callback(undefined, undefined);
        
        return undefined;
    }

}

function createPropertiesObject(arr, projection) {
    var proj = -1;
    if(projection != undefined)
        proj = projection.split(",");
    var propertyEntries = [];
    for (let i = 0; i < arr.length; i += 2) {
        if(proj === -1 || proj.includes(arr[i]))
            propertyEntries.push([arr[i], { N: arr[i + 1] }]);
    }
    return Object.fromEntries(propertyEntries);
}


function precessExpressionAttributeValues(params) {
    var basicBool = params.KeyConditionExpression;//get("KeyConditioonExpression");
    //console.log(basicBool);

    //console.log(params.ExpressionAttributeValues);

    var map = new Map(Object.entries(params.ExpressionAttributeValues));

    
    var iterator = map.keys();

    var key = iterator.next().value;
    while (key != undefined) {
        basicBool = basicBool.replaceAll(key, map.get(key).N);
        key = iterator.next().value;
    }
    //console.log(basicBool);

    basicBool = basicBool.replaceAll("=", "===");
    //console.log(basicBool);
    return basicBool;
}


