/*
Had to write this beccause AWS's local DB VM doesn't work properly
methods to implement: 
ddb.updateItem
ddb.putItem
ddb.query
ddb.deleteItem
*/
var fakeDBDir = 
class LocalDDBSimulator{
    query(params,callback){
        fetch(fakeDBDir + "db.txt")
        .then((res) => res.text())
        .then((text) => {
            console.log(text);
            const lines = text.split("\n");
        });
    }
}