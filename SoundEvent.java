import java.util.ArrayList;
public class SoundEvent {
    int eventNum, activationTime,userNum;
    ArrayList<Note> notes;

    SoundEvent(int eventNum, int activationTime, int userNum) {
        this.eventNum = eventNum;
        this.activationTime = activationTime;
        this.userNum = userNum;
        this.notes = new ArrayList<Note>();
    }

    void add(Note note) {
        this.notes.add(note);
    }

    @Override
    public String toString(){
        String a = "EVENT\n" + eventNum + "\n" + activationTime + "\n" + userNum + "\n";
        for(Note note: notes){
            a += note;
        }
        return a;
    }
}