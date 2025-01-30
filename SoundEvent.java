import java.util.ArrayList;
public class SoundEvent {
    int eventNum, activationTime,userNum, modeTrans;
    ArrayList<Note> notes;

    SoundEvent(int eventNum, int activationTime, int userNum, int modeTrans) {
        this.eventNum = eventNum;
        this.activationTime = activationTime;
        this.userNum = userNum;
        this.notes = new ArrayList<Note>();
        this.modeTrans = modeTrans;
    }

    void add(Note note) {
        this.notes.add(note);
    }

    @Override
    public String toString(){
        String a = "EVENT\n" + eventNum + "\n" 
        + activationTime + "\n" + userNum + "\n" + modeTrans + "\n";
        for(Note note: notes){
            a += note;
        }
        return a;
    }
}