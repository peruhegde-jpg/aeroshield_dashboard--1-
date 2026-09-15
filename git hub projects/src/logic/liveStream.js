/**
 * AeroShield Live Telemetry Client for Person 5 FastAPI Backend
 * 
 * Supports polling Person 5's FastAPI endpoints:
 * - GET http://localhost:8000/alert
 * - GET http://localhost:8000/predict
 */

class LiveStreamManager {
  constructor() {
    this.isConnected = false;
    this.callbacks = new Set();
    this.pollingTimer = null;
    this.apiUrl = 'http://localhost:8000/alert';
  }

  /**
   * Start polling Person 5's FastAPI backend at 1 Hz
   */
  startFastApiPolling(url = 'http://localhost:8000/alert', intervalMs = 1000) {
    this.disconnect();
    this.apiUrl = url;
    this.isConnected = true;
    this.notifyStatus('CONNECTING');

    const poll = async () => {
      if (!this.isConnected) return;
      try {
        const res = await fetch(this.apiUrl, { mode: 'cors' });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' || data.aircraft || data.features) {
            // Adapt Person 5's alert/predict payload into AeroShield step format
            const adapted = this.adaptPerson5Payload(data);
            this.notifyData(adapted);
            this.notifyStatus('CONNECTED');
          } else if (data.status === 'waiting') {
            this.notifyStatus('WAITING_FOR_DATA');
          }
        } else {
          this.notifyStatus('BACKEND_OFFLINE');
        }
      } catch (err) {
        this.notifyStatus('BACKEND_OFFLINE');
      }
    };

    poll();
    this.pollingTimer = setInterval(poll, intervalMs);
  }

  /**
   * Adapt Person 5's FastAPI `/alert` or `/predict` payload into AeroShield format
   */
  adaptPerson5Payload(p5Data) {
    const ac = p5Data.aircraft || p5Data.features || {};
    const wx = p5Data.atmosphere || p5Data.features || {};
    const prob = (Number(p5Data.microburst_probability) || 0) * (p5Data.microburst_probability <= 1 ? 100 : 1);
    const riskLevel = p5Data.risk_level || (prob >= 75 ? 'HIGH' : prob >= 30 ? 'CAUTION' : 'LOW');

    const alt = ac.altitude ?? 3000;
    const lat = ac.latitude ?? 28.7218;
    const lon = ac.longitude ?? 77.1000;
    const ias = ac.ias ?? 75;
    const vs = ac.vertical_speed ?? 0;
    const hdg = ac.heading ?? 180;

    const wspd = wx.wind_speed ?? 8;
    const wdir = wx.wind_direction ?? 180;
    const temp = wx.temperature ?? 29;
    const hum = wx.humidity ?? 55;
    const pres = wx.pressure ?? 1010;
    const precip = wx.precipitation ?? 0;
    const rain = precip > 5 ? "Heavy Downpour" : precip > 0.5 ? "Moderate Rain" : "No";

    const timestampStr = new Date().toLocaleTimeString();

    return {
      step: Date.now(),
      timestamp: timestampStr,
      isoTimestamp: new Date().toISOString(),
      phase: prob >= 75 ? 3 : prob >= 30 ? 2 : 1,
      phaseName: `Live P5 Backend: ${p5Data.message || riskLevel}`,
      aircraft: {
        timestamp: timestampStr,
        latitude: Number(lat.toFixed(5)),
        longitude: Number(lon.toFixed(5)),
        altitude: Math.round(alt * 0.3048), // convert ft to m if needed
        altitudeFt: Math.round(alt),
        heading: Math.round(hdg),
        airspeed: Math.round(ias),
        vertical_speed: Math.round(vs * 60) // convert to fpm if in ft/s
      },
      weather: {
        timestamp: timestampStr,
        temperature: Number(temp.toFixed(1)),
        humidity: Number(hum.toFixed(1)),
        pressure: Number(pres.toFixed(1)),
        wind_speed: Number(wspd.toFixed(1)),
        wind_direction: Math.round(wdir),
        rain: rain
      },
      dynamicFeatures: {
        delta_ias: p5Data.features?.ias_change ?? 0,
        delta_vs: p5Data.features?.vs_rate ?? 0,
        delta_wind_speed: p5Data.features?.wind_speed_change ?? (p5Data.indicators?.rapid_wind_change ? 2.0 : 0)
      },
      ml: {
        timestamp: timestampStr,
        microburst_probability: Number(prob.toFixed(1)),
        predicted_class: prob >= 75 ? "WET" : prob >= 30 ? "DRY" : "NORM"
      }
    };
  }

  disconnect() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isConnected = false;
    this.notifyStatus('DISCONNECTED');
  }

  onData(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  notifyData(data) {
    this.callbacks.forEach(cb => {
      try { cb('data', data); } catch (e) { console.error(e); }
    });
  }

  notifyStatus(status) {
    this.callbacks.forEach(cb => {
      try { cb('status', status); } catch (e) { console.error(e); }
    });
  }
}

export const liveStreamClient = new LiveStreamManager();
