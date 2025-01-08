class Event{
    constructor(eventNum, activationTime, userNum){
        this.eventNum = eventNum;
        this.activationTime = activationTime;
        this.userNum = userNum;
        this.notes = [];
    }

    add(note){
        this.notes.push(note);
    }
}

class Note{
    constructor(hs, relativeTime, relativeVol, sampleNum, userNum){
        this.hs = hs;
        this.relativeTime = relativeTime;
        this.relativeVol = relativeVol;
        this.sampleNum = sampleNum;
        this. userNum = userNum;
    }
}

function readComposition(){
    fetch("./composition.txt")
    .then((res) => res.text())
    .then((text) => {
      console.log(text);
     })
    .catch((e) => console.error(e));
}