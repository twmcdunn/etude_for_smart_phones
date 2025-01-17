public class Note {//changed hs to double
    int relativeTime, sampleNum, userNum;
    double relativeVol, hs;
    Note(double hs, int relativeTime, double relativeVol, int sampleNum, int userNum) {
        this.hs = hs;
        this.relativeTime = relativeTime;
        this.relativeVol = relativeVol;
        this.sampleNum = sampleNum;
        this.userNum = userNum;
    }

    @Override
    public String toString(){
        String a = "NOTE\n" + hs + "\n" + relativeTime + "\n" + relativeVol + "\n" + sampleNum + "\n" + userNum + "\n";
        return a;
    }
}