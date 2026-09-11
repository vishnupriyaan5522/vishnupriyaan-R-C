// Web Audio API helper for sound chimes and focus ambient sounds

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbient: string | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Cheerful chime: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {
      // AudioContext might be blocked until user gesture, safe fallback
    }
  }

  playTimerFinishAlarm() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // 3 pleasant bell tones
      [0, 0.4, 0.8].forEach((timeOffset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + timeOffset); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + timeOffset + 0.35);
        
        gain.gain.setValueAtTime(0.3, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.38);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.4);
      });
    } catch {
      // ignore
    }
  }

  playClickSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  startAmbient(type: 'rain' | 'whitenoise' | 'waves'): boolean {
    try {
      this.stopAmbient();
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'rain') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 2.5; // boost rain volume slightly
        }
      } else if (type === 'waves') {
        for (let i = 0; i < bufferSize; i++) {
          const t = i / ctx.sampleRate;
          const noise = (Math.random() * 2 - 1) * 0.15;
          const modulation = Math.sin(t * Math.PI * 0.8) * 0.5 + 0.5;
          data[i] = noise * modulation;
        }
      } else {
        // white noise
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.08;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter for warm sound
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 1200 : 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      this.ambientSource = noiseSource;
      this.ambientGain = gain;
      this.currentAmbient = type;
      return true;
    } catch {
      return false;
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
      this.ambientGain = null;
      this.currentAmbient = null;
    }
  }

  getCurrentAmbient(): string | null {
    return this.currentAmbient;
  }
}

export const soundManager = new SoundManager();
