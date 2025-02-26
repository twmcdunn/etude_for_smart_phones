var dir = "./";
//for local development, use this line:
dir = "https://twmcdunn.github.io/etude_for_smart_phones/"

var soundEvents = [];
var mySoundEvents = [];
var myNotes = [];

class SoundEvent {
    constructor(eventNum, activationTime, userNum, modeTrans) {
        this.eventNum = Number(eventNum);
        this.activationTime = Number(activationTime);
        this.userNum = Number(userNum);
        this.modeTrans = modeTrans;
        this.notes = [];
    }

    add(note) {
        this.notes.push(note);
    }
}

class Note {
    constructor(hs, relativeTime, relativeVol, sampleNum, userNum, parentSoundEvent) {
        this.hs = Number(hs);
        this.relativeTime = Number(relativeTime);
        this.relativeVol = Number(relativeVol);
        this.sampleNum = Number(sampleNum);
        this.userNum = Number(userNum);
        this.parentEventNum = parentSoundEvent.eventNum;
        this.parentActivationTime = parentSoundEvent.activationTime;
    }
}

function readComposition(userNum, totUsers, callback) {
    var req = new XMLHttpRequest();
    req.responseType = "text";
    req.onload = function(){
        var text = req.response;
        const lines = text.split("\n");
        for (let n = 0; n < lines.length; n++) {
            if(lines[n] === "EVENT"){
                var event = new SoundEvent(lines[n+1],lines[n+2],lines[n+3],lines[n+4]);
                n += 5;
                while(n < lines.length && lines[n] === "NOTE"){
                    var note = new Note(lines[n+1],lines[n+2],lines[n+3],lines[n+4],lines[n+5], event);
                    event.add(note);
                    if(note.userNum % Number(totUsers) === Number(userNum)){
                        myNotes.push(note);
                    }
                    n += 6;
                }
                soundEvents.push(event);
                if(Number(event.userNum) % Number(totUsers) === Number(userNum)){
                    /*
                    console.log("claiming sound event,\n    num: " + Number(event.userNum) 
                    + "\n    my user num: " + userNum + "\n    totUsers: " +  Number(totUsers));
                        */
                    mySoundEvents.push(event);
                }
            }
        }
        if(callback != undefined){
            callback();
        }
    };
    req.open("GET",dir + "composition.txt");
    req.send();
    /*
    fetch(dir + "composition.txt")
        .then((res) => res.text())
        .then((text) => {
            //console.log(text);
            const lines = text.split("\n");
            for (let n = 0; n < lines.length; n++) {
                if(lines[n] === "EVENT"){
                    var event = new SoundEvent(lines[n+1],lines[n+2],lines[n+3],lines[n+4]);
                    n += 5;
                    while(n < lines.length && lines[n] === "NOTE"){
                        var note = new Note(lines[n+1],lines[n+2],lines[n+3],lines[n+4],lines[n+5], event);
                        event.add(note);
                        if(note.userNum % Number(totUsers) === Number(userNum)){
                            myNotes.push(note);
                        }
                        n += 6;
                    }
                    soundEvents.push(event);
                    if(Number(event.userNum) % Number(totUsers) === Number(userNum)){
                        
                        mySoundEvents.push(event);
                    }
                }
            }
            if(callback != undefined){
                callback();
            }
        })
        .catch((e) => console.error(e));

        */
}

