public class SampleFreq {
    double freq;
    double[] sample;

    public SampleFreq(double f, int sn) {
        sample = ReadSound.readSoundDoubles(sn + ".wav");
        freq = f;
    }
}