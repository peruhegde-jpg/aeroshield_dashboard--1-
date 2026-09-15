/**
 * AeroShield Web Audio API Alert Synthesizer
 * 
 * Generates realistic aviation cockpit warning sounds purely through browser
 * Web Audio synthesis — completely offline with zero external audio assets.
 */

class CockpitAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = false;
    this.lastPlayedRisk = null;
    this.masterAlarmInterval = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (enabled) {
      this.init();
      // Play a short pleasant confirmation beep
      this.playTestBeep();
    } else {
      this.stopContinuousAlerts();
    }
  }

  getEnabled() {
    return this.isEnabled;
  }

  playTestBeep() {
    if (!this.isEnabled) return;
    this.init();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
      
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.18);
    } catch (e) {
      console.warn("Audio test failed:", e);
    }
  }

  /**
   * Play standard 2-tone aviation CAUTION alert chime (D5 -> A5)
   */
  playCautionChime() {
    if (!this.isEnabled) return;
    this.init();
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn("Caution chime error:", e);
    }
  }

  /**
   * Play urgent Master Warning 2-pulse alarm (1046Hz high alert burst)
   */
  playMasterWarning() {
    if (!this.isEnabled) return;
    this.init();
    try {
      const now = this.audioCtx.currentTime;

      // Pulse 1
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(950, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.14);

      // Pulse 2
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1250, now + 0.18);
      gain2.gain.setValueAtTime(0.18, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.36);

      // Pulse 3
      const osc3 = this.audioCtx.createOscillator();
      const gain3 = this.audioCtx.createGain();
      osc3.type = 'square';
      osc3.frequency.setValueAtTime(1250, now + 0.40);
      gain3.gain.setValueAtTime(0.18, now + 0.40);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      osc3.connect(gain3);
      gain3.connect(this.audioCtx.destination);
      osc3.start(now + 0.40);
      osc3.stop(now + 0.58);
    } catch (e) {
      console.warn("Master warning error:", e);
    }
  }

  stopContinuousAlerts() {
    if (this.masterAlarmInterval) {
      clearInterval(this.masterAlarmInterval);
      this.masterAlarmInterval = null;
    }
  }

  /**
   * Handle risk level transition sound triggers
   */
  handleRiskTransition(newRisk) {
    if (!this.isEnabled) return;

    if (newRisk === 'HIGH') {
      if (this.lastPlayedRisk !== 'HIGH') {
        this.playMasterWarning();
      }
    } else if (newRisk === 'CAUTION') {
      if (this.lastPlayedRisk !== 'CAUTION') {
        this.playCautionChime();
      }
    }
    this.lastPlayedRisk = newRisk;
  }
}

export const soundManager = new CockpitAudioSynthesizer();
