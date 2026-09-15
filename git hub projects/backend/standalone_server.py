import json
import math
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

sim_step = 0

def generate_alert_payload():
    global sim_step
    sim_step += 1
    
    # 120s flight approach cycle
    progress = (sim_step % 120) / 120.0
    is_hazard = 35 <= (sim_step % 120) <= 85
    
    # Aircraft dynamics
    lat = 28.7450 - (progress * 0.035) + 0.005 * math.sin(progress * 6)
    lon = 77.0850 + (progress * 0.030) + 0.005 * math.cos(progress * 6)
    alt = max(200, 3000 - (sim_step % 120) * 22)
    ias = 85.0 - (18.0 if is_hazard else 0.0) + 2.0 * math.sin(sim_step * 0.2)
    vs = -4.5 if is_hazard else -1.5
    hdg = int((135 + 15 * math.sin(progress * 4)) % 360)

    # Atmospheric dynamics
    wspd = 28.5 if is_hazard else (8.0 + 3.0 * math.sin(sim_step * 0.1))
    wdir = int((240 + 40 * math.sin(sim_step * 0.15)) % 360)
    temp = 25.0 if is_hazard else 29.0
    hum = 92.0 if is_hazard else 58.0
    pres = 998.0 if is_hazard else 1012.0
    precip = 12.0 if is_hazard else 0.0

    # Risk & ML probability
    prob = 0.94 if is_hazard else (0.58 if (sim_step % 120) >= 25 else 0.08)
    risk_level = "HIGH" if prob >= 0.75 else ("CAUTION" if prob >= 0.30 else "LOW")
    message = "HIGH MICROBURST RISK" if risk_level == "HIGH" else ("MICROBURST CONDITIONS DEVELOPING" if risk_level == "CAUTION" else "NO SIGNIFICANT MICROBURST RISK")

    return {
        "status": "success",
        "microburst_probability": prob,
        "risk_level": risk_level,
        "warning": risk_level in ["CAUTION", "HIGH"],
        "message": message,
        "aircraft": {
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "altitude": round(alt, 1),
            "ias": round(ias, 1),
            "vertical_speed": round(vs, 1),
            "heading": hdg
        },
        "atmosphere": {
            "wind_speed": round(wspd, 1),
            "wind_direction": wdir,
            "temperature": round(temp, 1),
            "humidity": round(hum, 1),
            "pressure": round(pres, 1),
            "precipitation": round(precip, 1)
        },
        "indicators": {
            "rapid_wind_change": is_hazard,
            "rapid_direction_change": is_hazard,
            "falling_pressure": is_hazard
        },
        "features": {
            "wind_speed_change": 12.0 if is_hazard else 0.5,
            "wind_speed_rate": 2.4 if is_hazard else 0.1,
            "pressure_rate": -0.6 if is_hazard else 0.0,
            "ias_change": -18.0 if is_hazard else 0.0
        }
    }

class AeroShieldAPIHandler(BaseHTTPRequestHandler):
    def _set_cors(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors()

    def do_GET(self):
        self._set_cors()
        if self.path == '/' or self.path == '/health':
            res = {"system": "AeroShield", "status": "running"}
        elif self.path in ['/alert', '/predict', '/current-data', '/features']:
            res = generate_alert_payload()
        else:
            res = {"status": "running", "endpoint": self.path}
        
        self.wfile.write(json.dumps(res).encode('utf-8'))

    def do_POST(self):
        self._set_cors()
        self.wfile.write(json.dumps({"status": "received"}).encode('utf-8'))

    def log_message(self, format, *args):
        return # suppress console noise

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('0.0.0.0', port), AeroShieldAPIHandler)
    print(f"AeroShield Person 5 Backend API listening on http://localhost:{port}")
    server.serve_forever()
