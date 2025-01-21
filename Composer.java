import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Random;

public class Composer {
    public static ArrayList<SoundEvent> composition = new ArrayList<SoundEvent>();
    public static double[] sig = ReadSound.readSoundDoubles("1.wav");
    public static double f2 = 2077;
    public static WaveWriter ww = new WaveWriter("mockup");
    public static double c0Freq = 440 * Math.pow(2, 3 / 12.0) * Math.pow(2, -5);
    public static int user = 0, event = 0, eventUser = 0;
    public static Sequencer seq = new Sequencer(3);

    public static void main(String[] args) {
        new Composer();
    }

    public Composer() {

        double time = 3;
        int[][] chords1 = seq.getChords();
        basicChord(chords1[0], time, 6, new double[] { 0 }, 0,0);
        basicChord(chords1[1], time + 3, 6, new double[] { 0 }, 0,0);

        time += 30; // 30 seconds to breath
        // 18 sec of chords
        double ad = 2;
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            
            basicChord(chords[0], time, 6, new double[] { 0 }, 0, ad);
            ad = 0;
            basicChord(chords[1], time + 3, 6, new double[] { 0 }, 0, ad);
            time += 3;
        }

        time += 20; // 20 seconds to breath

        // 18 sec of chords in 2 octaves (unison)
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            basicChord(chords[0], time, 6, new double[] { 0, -1 }, i / 3,0);

            basicChord(chords[1], time + 3, 6, new double[] { 0, -1 }, i / 3,1);
            time += 3;
        }

        time += 12; // 12 seconds to breath

        // 18 sec of chords in 3 octaves (unison)
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();

            basicChord(chords[0], time, 6, new double[] { 0, -1, 1 }, 1 + i / 3,0);

            basicChord(chords[1], time + 3, 6, new double[] { 0, -1, 1 }, 1 + i / 3,0);

            time += 3;
        }

        // 18 sec of chords in 3 voices
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            int[] octArr = new int[7];
            for (int n = 0; n < 3; n++)
                octArr[n] = n;
            for (int n = 0; n < 3; n++) {
                basicChord(chords[0], time, 5, new double[] { octArr[n] }, 2 + i / 3,0.5);
                basicChord(chords[1], time + 3, 5, new double[] { octArr[n] }, 2 + i / 3,0);
            }
            time += 3;
        }

        // 18 sec of chords in 7 voices
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            int[] octArr = new int[7];
            for (int n = 0; n < 7; n++)
                octArr[n] = n;
            shuffleArray(octArr);
            for (int n = 0; n < 7; n++) {
                basicChord(chords[0], time, 4, new double[] { octArr[n] }, n % 4,0.25 * Math.random());
                basicChord(chords[1], time + 3, 4, new double[] { octArr[n] }, n % 4,0.25 * Math.random());
            }
            time += 3;
        }

        // 18 sec of chords in 7 voices w/ planing triads
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            for (int n = 0; n < 7; n++) {
                basicChord(chords[0], time, 4, new double[] { n, n + 4 / 12.0, n + 7 / 12.0 }, n % 4,2 * Math.random());
                basicChord(chords[1], time + 3, 4, new double[] { n, n + 3 / 12.0, n + 7 / 12.0 }, n % 4, 2 * Math.random());
            }
            time += 3;
        }

        System.out.println(seq.myGame);
        writeComposition();
        recordComposition();
    }

    public static void basicChord(int[] chord, double time, int oct, double[] doublingOcts, int arpSetting,
            double attackDur) {
        double dur = 0.05;
        double relVol = 1;
        double relTime = 0;
        SoundEvent soundEvent = new SoundEvent(event, (int) Math.rint(time * 1000), eventUser);
        eventUser++;
        // user++;

        int[] c1 = new int[chord.length];
        ArrayList<Integer> c1ArrayList = new ArrayList<Integer>();
        for (int i = 0; i < chord.length; i++) {
            c1[i] = chord[i] + 20 * oct;
            c1ArrayList.add(c1[i]);
        }

        int[] c2 = chordComplement(c1, c1, 20);

        ArrayList<Integer> c2ArrayList = new ArrayList<Integer>();
        for (int i = 0; i < chord.length; i++) {
            c2ArrayList.add(c2[i]);
        }

        switch (arpSetting) {
            case 1:// descending
                Collections.sort(c1ArrayList, new Comparator<Integer>() {
                    public int compare(Integer a, Integer b) {
                        return b - a;
                    }
                });
                Collections.sort(c2ArrayList, new Comparator<Integer>() {
                    public int compare(Integer a, Integer b) {
                        return b - a;
                    }
                });
                for (int i = 0; i < chord.length; i++) {
                    c1[i] = c1ArrayList.get(i);
                    c2[i] = c2ArrayList.get(i);
                }
                break;
            case 2:// ascending
                Collections.sort(c1ArrayList);
                Collections.sort(c2ArrayList);
                for (int i = 0; i < chord.length; i++) {
                    c1[i] = c1ArrayList.get(i);
                    c2[i] = c2ArrayList.get(i);
                }
                break;
            case 3:// up and then down
                Collections.sort(c1ArrayList);
                Collections.sort(c2ArrayList);
                c1 = new int[c1.length * 2];
                c2 = new int[c2.length * 2];
                for (int i = 0; i < chord.length; i++) {
                    c1[i] = c1ArrayList.get(i);
                    c2[i] = c2ArrayList.get(i);
                }
                for (int i = 0; i < chord.length; i++) {// also switch voices on way down
                    c1[i + c1.length / 2] = c2ArrayList.get(c1ArrayList.size() - 1 - i);
                    c2[i + c1.length / 2] = c1ArrayList.get(c1ArrayList.size() - 1 - i);
                }
                break;
        }

        int[] melody = new int[c1.length * 2];
        for (int i = 0; i < c1.length; i++) {
            melody[i] = c1[i];
            melody[i + c1.length] = c2[i];
        }
        while (relTime < 6) {
            for (double dbleOct : doublingOcts) {
                int u = user;
                if (relTime == 0)
                    u = eventUser;// first note goes to person triggering the event
                Note note = new Note(melody[user % melody.length] + 20 * dbleOct, // chord[(int)(Math.random() *
                                                                                  // chord.length)] + 20 * oct,
                        (int) Math.rint(1000 * (relTime + attackDur)), relVol, 1,
                        u);

                soundEvent.add(note);
                if (attackDur > 0
                && Math.random() < attackDur / 6.0) {//thins it out so that density is the same as in decay
                    Note note1 = new Note(melody[user % melody.length] + 20 * dbleOct, // chord[(int)(Math.random() *
                                                                                       // chord.length)] + 20 * oct,
                            (int) Math.rint(1000 * (attackDur - attackDur * relTime / 6.0)), relVol, 1,
                            u);
                    soundEvent.add(note1);
                }
                if (relTime != 0)
                    user++;
            }
            relTime += dur;
            dur *= 1.01;
            relVol *= 0.95;
        }
        Collections.sort(soundEvent.notes, new Comparator<Note>(){
            public int compare(Note a, Note b){
                return a.relativeTime - b.relativeTime;
            }
        });

        composition.add(soundEvent);
        event++;
    }

    // assume audience members might vary their responses by about 30 seconds
    public static void recordComposition() {
        for (SoundEvent soundEvent : composition) {
            double eventTime = soundEvent.activationTime / 1000.0 + 20 * Math.random();
            double eventVol = Math.random() * 0.5 + 0.5;
            for (Note note : soundEvent.notes) {
                recordNote(c0Freq * Math.pow(2, note.hs / 20.0), eventTime + note.relativeTime / 1000.0,
                        eventVol * note.relativeVol);
            }
        }
        ww.render(1);
    }

    public static void recordNote(double freq, double time, double vol) {
        double f1 = freq;
        double[] processed = new double[(int) (sig.length * f2 / f1)];
        int startFrame = (int) Math.rint(time * WaveWriter.SAMPLE_RATE);

        for (int i = 0; i < processed.length; i++) {
            double exInd = i * f1 / f2;
            int index = (int) exInd;
            double fract = exInd - index;
            double frame1 = sig[index];
            double frame2 = frame1;
            if (index + 1 < sig.length)
                frame2 = sig[index + 1];
            double frame = frame1 * (1 - fract) + frame2 * fract;
            frame *= vol;
            try {
                ww.df[0][i + startFrame] += frame;
            } catch (Exception e) {
                System.out.println(e);
            }
        }
    }

    // preconiditions: must have sound events sorted by activationTime
    // must have notes sorted by relativeTime
    public static void writeComposition() {
        TextIO.writeFile("composition.txt");
        for (SoundEvent soundEvent : composition) {
            TextIO.putln(soundEvent);
        }
    }

    public static int[] chordComplement(int[] chord, int[] secondChord, int tet) {
        ArrayList<ArrayList<Integer>> vls = allVLs(chord, secondChord, new ArrayList<Integer>(), tet);
        int leastSteps = Integer.MAX_VALUE;
        ArrayList<Integer> bestVL = null;
        for (ArrayList<Integer> vl : vls) {
            int tot = 0;
            boolean hasCommonTone = false;
            for (int i = 0; i < chord.length; i++) {
                if (chord[i] == vl.get(i)) {
                    hasCommonTone = true;
                    break;
                }
                tot += Math.abs(vl.get(i) - chord[i]);
            }
            if (!hasCommonTone && tot < leastSteps) {
                bestVL = vl;
                leastSteps = tot;
            }
        }
        int[] vl = new int[chord.length];
        for (int i = 0; i < chord.length; i++)
            vl[i] = bestVL.get(i);
        return vl;
    }

    public static ArrayList<ArrayList<Integer>> allVLs(int[] chord, int[] secondChord, ArrayList<Integer> vl, int tet) {

        ArrayList<ArrayList<Integer>> completeVLs = new ArrayList<ArrayList<Integer>>();
        if (vl.size() == chord.length) {
            completeVLs.add(vl);
            return completeVLs;
        }
        int target = secondChord[vl.size()];
        for (int i = 0; i < chord.length; i++) {
            ArrayList<Integer> vlCopy = new ArrayList<Integer>();
            vlCopy.addAll(vl);
            vlCopy.add(closestOct(target, chord[i], tet));
            completeVLs.addAll(allVLs(chord, secondChord, vlCopy, tet));
        }

        return completeVLs;
    }

    public static int closestOct(int target, int pc, int tet) {
        int oct = (int) Math.rint((target - pc) / (double) tet);

        return oct * tet + pc;
    }

    public static void shuffleArray(int[] ar) {
        Random rnd = new Random();
        for (int i = ar.length - 1; i > 0; i--) {
            int index = rnd.nextInt(i + 1);
            // Simple swap
            int a = ar[index];
            ar[index] = ar[i];
            ar[i] = a;
        }
    }
}
