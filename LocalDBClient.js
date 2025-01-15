

class LocalDBClient {

    constructor() {
       
        this.id = 0;
        this.callbackMap = new Map();
        
    }

    async connect(callback){
        var promise = new Promise((resolve,reject) => {
            var myWs = new WebSocket("ws://localhost:8080");
            myWs.onopen = () => {
                callback();
                resolve(myWs);
              };
              myWs.onerror = (error) => {
                reject(error);
              };
        });
        this.ws = await promise;
        this.ws.addEventListener('message', function (event) {
            console.log(event.data);
            this.callbackMap.get(event.data.Id)(event.data.Content.response);
            this.callbackMap.delete(event.data.Id);
        });
    }

    query(params, callback) {
        this.ws.
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


