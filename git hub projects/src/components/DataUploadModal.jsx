import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  FileText,
  HelpCircle,
  Play
} from 'lucide-react';
import { 
  parseCSVString, 
  processUnifiedDataset, 
  mergeSeparateDatasets, 
  generateSampleCSVs 
} from '../logic/csvParser';
import { DEMO_DATASET } from '../data/demoDataset';

export function DataUploadModal({ isOpen, onClose, onApplyDataset }) {
  const [tab, setTab] = useState('unified'); // 'unified' or 'separate'
  const [unifiedFile, setUnifiedFile] = useState(null);
  const [aircraftFile, setAircraftFile] = useState(null);
  const [weatherFile, setWeatherFile] = useState(null);
  const [mlFile, setMlFile] = useState(null);
  
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSample = (type) => {
    const samples = generateSampleCSVs(DEMO_DATASET);
    const content = samples[type] || samples.unified;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'unified' ? 'unified_dataset' : type + '_data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readFileText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const handleProcessUpload = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (tab === 'unified') {
        if (!unifiedFile) {
          throw new Error("Please select a unified CSV file to upload.");
        }
        const text = await readFileText(unifiedFile);
        const rows = await parseCSVString(text);
        const processed = processUnifiedDataset(rows);
        
        setStatusMessage(`Successfully parsed ${processed.length} synchronized timesteps from unified dataset.`);
        onApplyDataset(processed, `LOADED CSV (${unifiedFile.name})`);
        setTimeout(() => onClose(), 1200);
      } else {
        if (!aircraftFile && !weatherFile && !mlFile) {
          throw new Error("Please upload at least one dataset file.");
        }
        let acRows = null;
        let wxRows = null;
        let mlRows = null;

        if (aircraftFile) {
          const t = await readFileText(aircraftFile);
          acRows = await parseCSVString(t);
        }
        if (weatherFile) {
          const t = await readFileText(weatherFile);
          wxRows = await parseCSVString(t);
        }
        if (mlFile) {
          const t = await readFileText(mlFile);
          mlRows = await parseCSVString(t);
        }

        const processed = mergeSeparateDatasets(acRows, wxRows, mlRows);
        setStatusMessage(`Successfully combined ${processed.length} time-steps from multiple CSV streams.`);
        onApplyDataset(processed, `CUSTOM MERGED (${processed.length} steps)`);
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to parse CSV file. Ensure headers match the expected format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl font-mono">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                LOAD LOCAL TELEMETRY & ML DATA (CSV)
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Seamlessly inject your research group's flight and sensor recordings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setTab('unified')}
              className={`flex-1 py-2 rounded-md font-bold transition flex items-center justify-center gap-2 ${
                tab === 'unified'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unified Dataset (1 File)</span>
            </button>
            <button
              onClick={() => setTab('separate')}
              className={`flex-1 py-2 rounded-md font-bold transition flex items-center justify-center gap-2 ${
                tab === 'separate'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Separate Files (3 Streams)</span>
            </button>
          </div>

          {/* Unified Upload Mode */}
          {tab === 'unified' ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center bg-slate-950/60 transition">
                <FileSpreadsheet className="w-10 h-10 text-cyan-400 mx-auto mb-2 opacity-80" />
                <p className="text-slate-200 font-bold mb-1">
                  Upload Unified Dataset CSV
                </p>
                <p className="text-[11px] text-slate-400 mb-4 font-sans">
                  Expected columns: timestamp, latitude, longitude, altitude, heading, airspeed, temperature, humidity, pressure, wind_speed, wind_direction, rain, microburst_probability, predicted_class
                </p>
                
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setUnifiedFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                />
                
                {unifiedFile && (
                  <div className="mt-3 text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Selected: {unifiedFile.name} ({(unifiedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Need template?</span>
                <button
                  onClick={() => handleDownloadSample('unified')}
                  className="flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample unified_dataset.csv</span>
                </button>
              </div>
            </div>
          ) : (
            /* Separate Files Mode */
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                
                {/* 1. Aircraft Data */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200">1. aircraft_data.csv</span>
                    <button
                      onClick={() => handleDownloadSample('aircraft')}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Template
                    </button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setAircraftFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Columns: timestamp, latitude, longitude, altitude, heading, airspeed</div>
                </div>

                {/* 2. Weather Data */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200">2. weather_data.csv</span>
                    <button
                      onClick={() => handleDownloadSample('weather')}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Template
                    </button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setWeatherFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Columns: timestamp, temperature, humidity, pressure, wind_speed, wind_direction, rain</div>
                </div>

                {/* 3. ML Predictions */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-200">3. ml_predictions.csv</span>
                    <button
                      onClick={() => handleDownloadSample('ml')}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Template
                    </button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setMlFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Columns: timestamp, microburst_probability, predicted_class</div>
                </div>

              </div>
            </div>
          )}

          {/* Feedback messages */}
          {statusMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessUpload}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black tracking-wider transition shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{isLoading ? "PARSING..." : "APPLY & LOAD DATA"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
