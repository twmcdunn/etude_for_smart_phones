/*
This patch is meant to be run locally on the computer that serves as the "conductor"
in Etude for Smart Phones.  The browser script run on the conductor page sends osc
messages to localhost:57110 to activate this patch.  The sounds should be played
over some kind of sound system in the concert hall where the piece is being performed.
Part of the music comes from phones, part of it comes from this patch.
*/
(
s.reboot;
s.waitForBoot({

	SynthDef.new(\filteredNoise, {
		arg freq = 440, maxAmp = 1, maxNoise = 0.5;
		var sig, lfn;
		sig = WhiteNoise.ar();
		lfn = LFNoise2.ar(1/10.0,0.1,0.9);
		25.do({
			sig = BPF.ar(sig,freq,maxNoise.varlag(2) * lfn);
		});
		sig = sig * LFNoise2.ar(1/10.0,0.8,0.2) * maxAmp.varlag(2);
		Out.ar(0,sig.dup);
	}).add;

});

"IN THE WEB BROWSER, MAKE SURE THE IP AND PORT ARE CORRECT".postln;
("IP AND PORT: " + NetAddr.localAddr).postln;
)

a = Synth.new(\filteredNoise);

a.set(\maxNoise, 0.1);
b = Synth.new(\filteredNoise,[\freq,550]);
b.set(\maxNoise, 0.1);
b.set(\maxAmp, 0.2);
c = Synth.new(\filteredNoise,[\freq,660]);
c.set(\maxNoise, 0.01);

d = Synth.new(\filteredNoise,[\freq,440 * 15/8.0]);
d.set(\maxNoise, 0.01);

e = Synth.new(\filteredNoise,[\freq,3 * 440 * 15/(8.0 * 4)]);
e.set(\maxNoise, 0.1);


f = Synth.new(\filteredNoise,[\freq,440 * 2/(3)]);
f.set(\freq, 440 * 4 / 3.0);
f.set(\maxNoise,0.01);

g = Synth.new(\filteredNoise,[\freq,440 * 8/9.0]);
g.set(\maxNoise, 0.1);
g.set(\maxAmp, 1);

h = Synth.new(\filteredNoise,[\freq,440 * 5 * 3 * 3 / 32.0]);
h.set(\maxNoise, 0.1);≤≥≥




