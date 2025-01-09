var dir = "./";
//for local development, use this line:
dir = "https://twmcdunn.github.io/etude_for_smart_phones/"

var soundEvents = [];

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
    constructor(hs, relativeTime, relativeVol, sampleNum, userNum) {
        this.hs = Number(hs);
        this.relativeTime = Number(relativeTime);
        this.relativeVol = Number(relativeVol);
        this.sampleNum = Number(sampleNum);
        this.userNum = Number(userNum);
    }
}

function readComposition() {
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
                        event.add(new Note(lines[n+1],lines[n+2],lines[n+3],lines[n+4],lines[n+5]));
                        n += 6;
                    }
                    soundEvents.push(event);
                }
            }
        })
        .catch((e) => console.error(e));
}