var dir = "./";
//for local development, use this line:
dir = "https://twmcdunn.github.io/etude_for_smart_phones/"

var soundEvents = [];
var mySoundEvents = [];
var myNotes = [];

class SoundEvent {
    constructor(eventNum, activationTime, userNum) {
        this.eventNum = Number(eventNum);
        this.activationTime = Number(activationTime);
        this.userNum = Number(userNum);
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

function readComposition(userNum, totUsers) {
    fetch(dir + "composition.txt")
        .then((res) => res.text())
        .then((text) => {
            console.log(text);
            const lines = text.split("\n");
            for (let n = 0; n < lines.length; n++) {
                if(lines[n] === "EVENT"){
                    var event = new SoundEvent(lines[n+1],lines[n+2],lines[n+3]);
                    n += 4;
                    while(n < lines.length && lines[n] === "NOTE"){
                        var note = new Note(lines[n+1],lines[n+2],lines[n+3],lines[n+4],lines[n+5], event);
                        event.add(note);
                        if(note.userNum % totUsers === userNum){
                            myNotes.push(note);
                        }
                        n += 6;
                    }
                    soundEvents.push(event);
                    if(event.userNum % totUsers === userNum){
                        mySoundEvents.push(event);
                    }
                }
            }
        })
        .catch((e) => console.error(e));
}