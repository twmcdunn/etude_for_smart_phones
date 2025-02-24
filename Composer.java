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
    public static int user = 0, event = 0, eventUser = 0, attackNum = 1;
    public static Sequencer seq = new Sequencer(3);
    public static ArrayList<SampleFreq> sampleFreqs, attackSampeFreqs;

    public static void main(String[] args) {
        new Composer();
        // createTimbres();
    }

    public Composer() {
        loadSampleFreqs();

        double time = 3;
        int[][] chords1 = seq.getChords();
        basicChord(chords1[0], time, 6, 1, 0, 0);
        basicChord(chords1[1], time + 3, 6, 1, 0, 0);

        time += 30; // 30 seconds to breath
        // 18 sec of chords
        double ad = 2;
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();

            basicChord(chords[0], time, 6, 1, 0, ad);
            ad = 0;
            basicChord(chords[1], time + 3, 6, 1, 0, ad);
            time += 4;
        }

        time += 20; // 20 seconds to breath

        // 18 sec of chords in 2 octaves (unison)
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            basicChord(chords[0], time, 6, 2, i / 3, 0);

            basicChord(chords[1], time + 3, 6, 2, i / 3, 3);
            time += 4;
        }

        time += 12; // 12 seconds to breath

        // 18 sec of chords in 3 octaves (unison)
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();

            basicChord(chords[0], time, 6, 3, 1 + i / 3, 0);

            basicChord(chords[1], time + 3, 6, 3, 1 + i / 3, 0);

            time += 4;
        }

        // 18 sec of chords in 3 voices
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            int[] octArr = new int[7];
            for (int n = 0; n < 3; n++)
                octArr[n] = n;
            for (int n = 0; n < 3; n++) {
                basicChord(chords[0], time, 5 + octArr[n], 1, 2 + i / 3, 2);
                basicChord(chords[1], time + 3, 5 + octArr[n], 1, 2 + i / 3, 0);
            }
            time += 4;
        }

        // 60 sec of chords in 7 voices
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            int[] octArr = new int[7];
            for (int n = 0; n < 7; n++)
                octArr[n] = n;
            shuffleArray(octArr);
            for (int n = 0; n < 7; n++) {
                basicChord(chords[0], time, 4 + octArr[n], 1, n % 4, 3 * Math.random());
                basicChord(chords[1], time + 3, 4 + octArr[n], 1, n % 4, 3 * Math.random());
            }
            time += 10;
        }

        // 60 sec of chords in 7 voices w/ planing triads
        for (int i = 0; i < 6; i++) {
            int[][] chords = seq.getChords();
            for (int n = 0; n < 7; n++) {
                basicChord(chords[0], time, 4 + n, 4, n % 4,
                        6 * Math.random());
                basicChord(chords[1], time + 3, 4 + n, 5, n % 4,
                        6 * Math.random());
            }
            time += 10;
        }

        time += 30;

        chords1 = seq.getChords();
        basicChord(chords1[0], time, 6, 1, 0, 0);
        basicChord(chords1[1], time + 3, 6, 1, 0, 0);

        /*
         * need to add final ting browser side so that it's synchronized
         * time += 3;
         * 
         * for (int i = 0; i < 20; i++) {
         * SoundEvent soundEvent = new SoundEvent(event, (int) Math.rint(time * 1000),
         * eventUser, seq.modeTrans);
         * new Note(20 * Math.log(2077 / c0Freq) / Math.log(2), 0, 1, 1, eventUser);
         * eventUser++;
         * event++;
         * composition.add(soundEvent);
         * }
         */

        System.out.println(seq.myGame);
        writeComposition();
        recordComposition();
    }

    public static void basicChord(int[] chord, double time, int oct, int timbre, int arpSetting,
            double attackDur) {
        double dur = 0.05;
        double relVol = 1;
        double relTime = 0;
        SoundEvent soundEvent = new SoundEvent(event, (int) Math.rint(time * 1000), eventUser, seq.modeTrans);
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
        WaveWriter attackWriter = null;
        if (attackDur > 0)
            attackWriter = new WaveWriter((100 + attackNum) + "");

        while (relTime < 6) {
            int u = user;
            if (relTime == 0) {
                // u = eventUser;// first note goes to person triggering the event
                if (attackDur > 0) {
                    int t = 100 + attackNum;
                    Note note = new Note(0, (int) Math.rint(1000 * (relTime)), relVol, t, eventUser);
                    soundEvent.add(note);
                }
            }
            Note note = new Note(melody[user % melody.length], // chord[(int)(Math.random() *
                                                               // chord.length)] + 20 * oct,
                    (int) Math.rint(1000 * (relTime + attackDur)), relVol, timbre,
                    u);

            soundEvent.add(note);
            if (attackDur > 0
            // && Math.random() < attackDur / 6.0// thins it out so that density is the same
            // as in decay
            ) {
                /*
                 * Note note1 = new Note(melody[user % melody.length], //
                 * chord[(int)(Math.random() *
                 * // chord.length)] + 20 * oct,
                 * (int) Math.rint(1000 * (attackDur - attackDur * relTime / 6.0)), relVol,
                 * timbre,
                 * u);
                 * soundEvent.add(note1);
                 */
                recordNote(c0Freq * Math.pow(2, melody[user % melody.length] / 20.0),
                        attackDur - attackDur * relTime / 6.0, relVol, timbre, attackWriter);
            }
            if (relTime != 0)
                user++;

            relTime += dur;
            dur *= 1.01;
            relVol *= 0.95;
        }

        if (attackDur > 0) {
            attackWriter.render(1);
            attackNum++;
        }

        Collections.sort(soundEvent.notes, new Comparator<Note>() {
            public int compare(Note a, Note b) {
                return a.relativeTime - b.relativeTime;
            }
        });

        composition.add(soundEvent);
        event++;
    }

    // assume audience members might vary their responses by about 30 seconds
    public static void recordComposition() {
        attackSampeFreqs = new ArrayList<SampleFreq>();
        for(int i = 101; i < attackNum + 100; i++){
            attackSampeFreqs.add(new SampleFreq(1, i));
        }
        for (SoundEvent soundEvent : composition) {
            double eventTime = soundEvent.activationTime / 1000.0 + 20 * Math.random();
            double eventVol = Math.random() * 0.5 + 0.5;
            for (Note note : soundEvent.notes) {
                recordNote(c0Freq * Math.pow(2, note.hs / 20.0), eventTime + note.relativeTime / 1000.0,
                        eventVol * note.relativeVol, note.sampleNum);
            }
        }
        ww.render(1);
    }

    public static void loadSampleFreqs() {
        sampleFreqs = new ArrayList<SampleFreq>();
        for (int i = 1; i <= 5; i++) {
            sampleFreqs.add(new SampleFreq(2077, i));
        }
    }

    public static void recordNote(double freq, double time, double vol, int timbre) {
        recordNote(freq, time, vol, timbre, ww);
    }

    public static void recordNote(double freq, double time, double vol, int timbre, WaveWriter ww) {
        double f1 = freq;
        SampleFreq sf = null;
        if (timbre < 100) {
            sf = sampleFreqs.get(timbre - 1);
        } else {
            sf = attackSampeFreqs.get(timbre - 101);
            f1 = sf.freq;
        }
        double[] processed = new double[(int) (sf.sample.length * sf.freq / f1)];
        int startFrame = (int) Math.rint(time * WaveWriter.SAMPLE_RATE);

        for (int i = 0; i < processed.length; i++) {
            double exInd = i * f1 / sf.freq;
            int index = (int) exInd;
            double fract = exInd - index;
            double frame1 = sf.sample[index];
            double frame2 = frame1;
            if (index + 1 < sf.sample.length)
                frame2 = sf.sample[index + 1];
            double frame = frame1 * (1 - fract) + frame2 * fract;
            frame *= vol;
            try {
                ww.df[0][i + startFrame] += frame;
            } catch (Exception e) {
                System.out.println(e);
            }
        }
    }

    public static void createTimbres() {
        double[][] octsData = { { 2, 0, -1 }, { 3, 0, -1, 1 }, { 4, 0, 4 / 12.0, 7 / 12.0 },
                { 5, 0, 4 / 12.0, 7 / 12.0 } };

        for (double[] od : octsData) {
            WaveWriter ww = new WaveWriter("" + ((int) od[0]));
            for (int n = 1; n < od.length; n++) {
                double f1 = f2 * Math.pow(2, od[n]);
                double[] processed = new double[(int) (sig.length * f2 / f1)];

                for (int i = 0; i < processed.length; i++) {
                    double exInd = i * f1 / f2;
                    int index = (int) exInd;
                    double fract = exInd - index;
                    double frame1 = sig[index];
                    double frame2 = frame1;
                    if (index + 1 < sig.length)
                        frame2 = sig[index + 1];
                    double frame = frame1 * (1 - fract) + frame2 * fract;
                    // frame *= 1;
                    try {
                        ww.df[0][i] += frame;
                    } catch (Exception e) {
                        System.out.println(e);
                    }
                }
            }
            ww.render(1);
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
