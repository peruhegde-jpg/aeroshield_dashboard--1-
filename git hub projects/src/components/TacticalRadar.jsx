import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Compass, 
  Layers, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Map as MapIcon,
  Navigation,
  Wind
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Aircraft Icon for Leaflet
const createAircraftLeafletIcon = (heading = 0) => {
  return L.divIcon({
    className: 'custom-aircraft-icon',
    html: `
      <div style="transform: rotate(${heading}deg); transform-origin: center center; display: flex; align-items: center; justify-content: center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#00f0ff" style="filter: drop-shadow(0 0 6px #00f0ff);">
          <path d="M12 2L15 9L22 13L15 14L14 21L12 18L10 21L9 14L2 13L9 9L12 2Z"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export function TacticalRadar({
  aircraft,
  hazard,
  trajectory = [],
  riskData,
  mlProbability
}) {
  const [viewMode, setViewMode] = useState('radar'); // 'radar' or 'map'
  const [rangeKm, setRangeKm] = useState(30); // 15, 30, 60
  const canvasRef = useRef(null);

  // Radar sweep animation angle
  const sweepAngleRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Trajectory coordinates up to current step
  const trajectoryPoints = useMemo(() => {
    return trajectory.map(t => [t.aircraft.latitude, t.aircraft.longitude]);
  }, [trajectory]);

  // Center coordinate for radar / map
  const mapCenter = useMemo(() => {
    if (hazard && hazard.latitude) {
      return [hazard.latitude, hazard.longitude];
    }
    return [28.7041, 77.1025];
  }, [hazard]);

  // High-performance Tactical Canvas Radar Renderer
  useEffect(() => {
    if (viewMode !== 'radar') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isMounted = true;

    const renderRadar = () => {
      if (!isMounted) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 25;

      ctx.clearRect(0, 0, width, height);

      // 1. Background Grid & Outer Bezel
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Radar Disk Background Gradient
      const diskGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
      diskGrad.addColorStop(0, 'rgba(11, 24, 43, 0.85)');
      diskGrad.addColorStop(1, 'rgba(4, 9, 18, 0.98)');
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Range Rings
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      ringSteps.forEach((stepFrac) => {
        const r = radius * stepFrac;
        const ringKm = (rangeKm * stepFrac).toFixed(0);

        ctx.strokeStyle = stepFrac === 1.0 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = stepFrac === 1.0 ? 1.5 : 1;
        ctx.setLineDash(stepFrac === 1.0 ? [] : [4, 4]);

        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring distance labels
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${ringKm} km`, centerX + 6, centerY - r + 12);
      });

      // 3. Azimuth Radial Spokes & Compass Degrees (Every 30 deg)
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = ((deg - 90) * Math.PI) / 180;
        const x1 = centerX + Math.cos(rad) * (radius * 0.15);
        const y1 = centerY + Math.sin(rad) * (radius * 0.15);
        const x2 = centerX + Math.cos(rad) * radius;
        const y2 = centerY + Math.sin(rad) * radius;

        ctx.strokeStyle = deg % 90 === 0 ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = deg % 90 === 0 ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Compass Ticks outside ring
        const labelR = radius + 14;
        const lx = centerX + Math.cos(rad) * labelR;
        const ly = centerY + Math.sin(rad) * labelR;

        let labelText = `${deg}°`;
        if (deg === 0) labelText = "N 000°";
        else if (deg === 90) labelText = "E 090°";
        else if (deg === 180) labelText = "S 180°";
        else if (deg === 270) labelText = "W 270°";

        ctx.fillStyle = deg % 90 === 0 ? '#00f0ff' : 'rgba(148, 163, 184, 0.6)';
        ctx.font = deg % 90 === 0 ? 'bold 10px "JetBrains Mono", monospace' : '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, lx, ly);
      }

      // 4. Sweeping Radar Beam Animation
      sweepAngleRef.current = (sweepAngleRef.current + 0.8) % 360;
      const sweepRad = ((sweepAngleRef.current - 90) * Math.PI) / 180;
      const sweepGradient = ctx.createConicGradient(sweepRad, centerX, centerY);
      sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
      sweepGradient.addColorStop(0.08, 'rgba(0, 240, 255, 0.03)');
      sweepGradient.addColorStop(0.15, 'transparent');
      sweepGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sweeping sharp line
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepRad) * radius,
        centerY + Math.sin(sweepRad) * radius
      );
      ctx.stroke();

      // Convert lat/lon relative to Hazard Centroid (Centered in radar display)
      // 1 deg Lat ≈ 111 km, 1 deg Lon ≈ 111 * cos(lat) km
      const latKmPerDeg = 111.0;
      const lonKmPerDeg = 111.0 * Math.cos((hazard.latitude * Math.PI) / 180);
      const pixelsPerKm = radius / rangeKm;

      const getXY = (lat, lon) => {
        const deltaLatKm = (lat - hazard.latitude) * latKmPerDeg;
        const deltaLonKm = (lon - hazard.longitude) * lonKmPerDeg;
        // In screen coords: Y goes down (North is up = negative deltaLat)
        const x = centerX + deltaLonKm * pixelsPerKm;
        const y = centerY - deltaLatKm * pixelsPerKm;
        return { x, y };
      };

      // 5. Draw Hazard Area (Centered at centerX, centerY)
      const hazardRadiusPx = hazard.radiusKm * pixelsPerKm;
      const coreRadiusPx = (hazard.coreRadiusKm || 1.2) * pixelsPerKm;

      // Outer Hazard Warning Zone (Pulsing Orange/Red)
      const hazardGrad = ctx.createRadialGradient(
        centerX, centerY, coreRadiusPx,
        centerX, centerY, hazardRadiusPx
      );
      hazardGrad.addColorStop(0, 'rgba(255, 0, 60, 0.45)');
      hazardGrad.addColorStop(0.6, 'rgba(255, 77, 0, 0.25)');
      hazardGrad.addColorStop(1, 'rgba(255, 183, 0, 0.05)');

      ctx.fillStyle = hazardGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, hazardRadiusPx, 0, Math.PI * 2);
      ctx.fill();

      // Outer Hazard Perimeter dashed stroke
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, hazardRadiusPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Severe Downburst Core Circle
      ctx.fillStyle = 'rgba(255, 0, 60, 0.55)';
      ctx.strokeStyle = '#ff003c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadiusPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Outflow Divergence Radial Arrows on Hazard boundary
      for (let a = 0; a < 360; a += 45) {
        const aRad = (a * Math.PI) / 180;
        const arrowStartR = hazardRadiusPx * 0.7;
        const arrowEndR = hazardRadiusPx * 1.15;
        const sx = centerX + Math.cos(aRad) * arrowStartR;
        const sy = centerY + Math.sin(aRad) * arrowStartR;
        const ex = centerX + Math.cos(aRad) * arrowEndR;
        const ey = centerY + Math.sin(aRad) * arrowEndR;

        ctx.strokeStyle = 'rgba(255, 183, 0, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      // Hazard Centroid Marker & Label
      ctx.fillStyle = '#ff003c';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff7b00';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ HAZARD CELL (R=${hazard.radiusKm}km)`, centerX, centerY - hazardRadiusPx - 8);

      // 6. Draw Aircraft Trajectory Trail
      if (trajectory && trajectory.length > 1) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)'; // Yellow trail
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();

        trajectory.forEach((stepData, idx) => {
          const pt = getXY(stepData.aircraft.latitude, stepData.aircraft.longitude);
          if (idx === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Small breadcrumb dots along past path
        trajectory.forEach((stepData, idx) => {
          if (idx % 3 === 0) {
            const pt = getXY(stepData.aircraft.latitude, stepData.aircraft.longitude);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 7. Draw Aircraft Marker & Vectors
      if (aircraft && aircraft.latitude !== undefined) {
        const acPos = getXY(aircraft.latitude, aircraft.longitude);

        // A) Line of Sight / Bearing Dotted Line to Hazard
        ctx.strokeStyle = 'rgba(255, 0, 60, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(acPos.x, acPos.y);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Distance Tag on Midpoint of LOS
        const midX = (acPos.x + centerX) / 2;
        const midY = (acPos.y + centerY) / 2;
        if (riskData && riskData.distanceKm) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(midX - 28, midY - 9, 56, 18);
          ctx.strokeStyle = 'rgba(255, 0, 60, 0.4)';
          ctx.strokeRect(midX - 28, midY - 9, 56, 18);
          ctx.fillStyle = '#00f0ff';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${riskData.distanceKm} km`, midX, midY);
        }

        // B) Aircraft Heading Vector Projection
        const headingRad = ((aircraft.heading - 90) * Math.PI) / 180;
        const vectorLen = Math.max(25, (aircraft.airspeed || 120) * 0.25);
        const vx = acPos.x + Math.cos(headingRad) * vectorLen;
        const vy = acPos.y + Math.sin(headingRad) * vectorLen;

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(acPos.x, acPos.y);
        ctx.lineTo(vx, vy);
        ctx.stroke();

        // Arrow head on heading vector
        const arrowAngle = 0.4;
        const arrowLen = 7;
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(
          vx - arrowLen * Math.cos(headingRad - arrowAngle),
          vy - arrowLen * Math.sin(headingRad - arrowAngle)
        );
        ctx.lineTo(
          vx - arrowLen * Math.cos(headingRad + arrowAngle),
          vy - arrowLen * Math.sin(headingRad + arrowAngle)
        );
        ctx.fill();

        // C) Draw Aircraft Symbol (Cyan Jet Glyphs)
        ctx.save();
        ctx.translate(acPos.x, acPos.y);
        ctx.rotate((aircraft.heading * Math.PI) / 180);

        // Outer Target Glow Ring
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Jet Polygon
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -12);      // Nose
        ctx.lineTo(3.5, -3);     // Right fuselage
        ctx.lineTo(10, 3);       // Right wing tip
        ctx.lineTo(3, 4);        // Right wing trailing
        ctx.lineTo(3, 9);        // Right tail start
        ctx.lineTo(6, 12);       // Right stabilizer
        ctx.lineTo(0, 10);       // Tail center
        ctx.lineTo(-6, 12);      // Left stabilizer
        ctx.lineTo(-3, 9);       // Left tail start
        ctx.lineTo(-3, 4);       // Left wing trailing
        ctx.lineTo(-10, 3);      // Left wing tip
        ctx.lineTo(-3.5, -3);    // Left fuselage
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // D) Aircraft Telemetry Callout Box on Radar
        ctx.fillStyle = 'rgba(6, 10, 18, 0.9)';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 1;
        const boxX = acPos.x + 16;
        const boxY = acPos.y - 32;
        ctx.fillRect(boxX, boxY, 112, 42);
        ctx.strokeRect(boxX, boxY, 112, 42);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`AC-01 | ${aircraft.heading}°`, boxX + 6, boxY + 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SPD: ${aircraft.airspeed}kt`, boxX + 6, boxY + 17);
        ctx.fillText(`ALT: ${aircraft.altitude}m`, boxX + 6, boxY + 28);
      }

      animationFrameRef.current = requestAnimationFrame(renderRadar);
    };

    renderRadar();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [viewMode, rangeKm, aircraft, hazard, trajectory, riskData]);

  // Adjust canvas size to match parent container dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const size = Math.min(width, height > 350 ? height : 520);
        canvas.width = size;
        canvas.height = size;
      }
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [viewMode]);

  return (
    <div className="cockpit-panel rounded-xl overflow-hidden flex flex-col h-full border border-slate-800 shadow-xl">
      
      {/* Radar Control Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              TACTICAL SITUATION RADAR
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
          </div>
        </div>

        {/* View Mode & Range Selector */}
        <div className="flex items-center gap-2">
          {/* Range Scale */}
          {viewMode === 'radar' && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 text-[11px] font-mono">
              {[15, 30, 60].map((km) => (
                <button
                  key={km}
                  onClick={() => setRangeKm(km)}
                  className={`px-2 py-0.5 rounded transition ${
                    rangeKm === km
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          )}

          {/* Toggle Radar vs Map */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('radar')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                viewMode === 'radar'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>RADAR</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                viewMode === 'map'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>MAP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Display Canvas / Leaflet Map Container */}
      <div className="relative flex-1 min-h-[380px] lg:min-h-[460px] flex items-center justify-center bg-[#060a12] p-2 overflow-hidden">
        
        {viewMode === 'radar' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={520}
              height={520}
              className="max-w-full max-h-full aspect-square"
            />
            {/* Visual HUD Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-sm border border-slate-800/80 rounded-lg p-2 text-[11px] font-mono space-y-1">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block shadow-sm shadow-cyan-400" />
                <span>CYAN: Aircraft & Heading</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block" />
                <span>YELLOW: Trajectory Track</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block animate-pulse" />
                <span>RED: Microburst Core (R={hazard.radiusKm}km)</span>
              </div>
            </div>

            {/* Range and Scale Readout */}
            <div className="absolute top-3 right-3 bg-slate-950/85 border border-slate-800 rounded p-2 text-right text-[11px] font-mono">
              <div className="text-slate-400">RANGE SCALE</div>
              <div className="text-cyan-300 font-bold text-sm">{rangeKm} KM</div>
              <div className="text-slate-500 text-[10px]">AZ: 360° SWEEP</div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[420px] rounded-lg overflow-hidden dark-map">
            <MapContainer
              center={mapCenter}
              zoom={11}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', minHeight: '420px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Hazard Perimeter */}
              <Circle
                center={[hazard.latitude, hazard.longitude]}
                radius={hazard.radiusKm * 1000}
                pathOptions={{
                  color: '#ff4500',
                  fillColor: '#ff003c',
                  fillOpacity: 0.25,
                  dashArray: '6, 6'
                }}
              >
                <Tooltip permanent direction="top" className="bg-slate-900 text-red-400 font-mono text-xs">
                  Hazard Boundary ({hazard.radiusKm} km)
                </Tooltip>
              </Circle>

              {/* Hazard Core */}
              <Circle
                center={[hazard.latitude, hazard.longitude]}
                radius={(hazard.coreRadiusKm || 1.2) * 1000}
                pathOptions={{
                  color: '#ff003c',
                  fillColor: '#ff003c',
                  fillOpacity: 0.5
                }}
              />

              {/* Flight Trajectory Track */}
              {trajectoryPoints.length > 1 && (
                <Polyline
                  positions={trajectoryPoints}
                  pathOptions={{ color: '#facc15', weight: 3, dashArray: '4, 4' }}
                />
              )}

              {/* Aircraft Marker */}
              {aircraft && (
                <Marker
                  position={[aircraft.latitude, aircraft.longitude]}
                  icon={createAircraftLeafletIcon(aircraft.heading)}
                >
                  <Popup className="font-mono text-xs">
                    <div className="font-bold text-cyan-600">Aircraft AC-01</div>
                    <div>Alt: {aircraft.altitude} m AGL</div>
                    <div>Spd: {aircraft.airspeed} kt</div>
                    <div>Hdg: {aircraft.heading}°</div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}

      </div>
    </div>
  );
}
