

class LocalDBClient {

    constructor() {
       
        this.id = 0;
        this.callbackMap = new Map();
        
    }

    async connect(callback){
        var promise = new Promise((resolve,reject) => {
            var myWs = new WebSocket("ws://localhost:8080");//"ws://localhost:8080");
            this.ws = myWs;
            myWs.onopen = () => {
                callback();
                resolve(myWs);
              };
              myWs.onerror = (error) => {
                console.log(error);
                var map = new Map(Object.entries(error));
                var log = ""
                map.forEach((value,key) => {
                    log += key + ": " + value;
                });
                document.body.innerText = "ERROR log: " + log;
                reject(error);
              };
        });
        this.ws = await promise;
        this.ws.addEventListener('message',  (event) => {
            var json = JSON.parse(event.data);
            //console.log(json);
            var func = this.callbackMap.get(Number(json.Id));
            func(undefined, json.Content);
            this.callbackMap.delete(json.Id);
        });
    }

    query(params, callback) {
        this.callbackMap.set(this.id, callback);
        this.ws.send(JSON.stringify(
            {
                params,
                Id: this.id.toString(),
                callNum: "0"
            }
        ));
        this.id++;
    }

    updateItem(params, callback) {
        this.callbackMap.set(this.id, callback);
        this.ws.send(JSON.stringify(
            {
                params,
                Id: this.id.toString(),
                callNum: "1"
            }
        ));
        this.id++;
    }

    putItem(params, callback) {
        this.callbackMap.set(this.id, callback);
        this.ws.send(JSON.stringify(
            {
                params,
                Id: this.id.toString(),
                callNum: "2"
            }
        ));
        this.id++;
    }

    deleteItem(params, callback) {
        this.callbackMap.set(this.id, callback);
        this.ws.send(JSON.stringify(
            {
                params,
                Id: this.id.toString(),
                callNum: "3"
            }
        ));
        this.id++;
    }
}


