
//var spawn = require(['child_process']).spawn;
import {spawn} from 'child_process' 
var child = spawn('python', ['readFakeDB.py', "0"]);
child.stdout.on('data', (data) => {
    console.log("EXECUTED CHIDL PROCESS!");
    console.log(data);
});