//consult this page:
// https://doc.sccode.org/Guides/OSC_communication.html

//import {OSC} from 'osc-js';
//const OSC = osc;
const OSC = require(['osc-js']);
//const DatagramPlugin = require(['osc-js']).DatagramPlugin;

  const osc = new OSC();

  
  //osc.open({Port: 57120});

//var osc1 = new OSC();


//osc1.open();
//osc1.open({host: '127.0.0.1', port: 57120});// sc server port
//can't we send directly to the sc server? Do we really need a 
//local websocket server bridge?
var button = document.createElement("TEST_OSC");
button.innerText = "TEST OSC";
button.onclick = testOSC;
document.body.appendChild(button);

function testOSC(){
    var message = new OSC.Message('/s_new/filteredNoise',2);
    //'/test/random', Math.random());
    osc.send(message);
}