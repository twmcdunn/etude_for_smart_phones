var osc = new OSC();
osc.open({host: '127.0.0.1', port: 57110});// sc server port
//can't we send directly to the sc server? Do we really need a 
//local websocket server bridge?
var button = document.createElement("TEST_OSC");
button.innerText = "TEST OSC";
button.onclick = testOSC;
document.body.appendChild(button);

function testOSC(){
    var message = new OSC.Message('/test/random', Math.random());
    osc.send(message);
}