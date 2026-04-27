/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  X,
  History,
  LifeBuoy
} from "lucide-react";
import { analyzeEmergency } from "./services/geminiService";
import { EmergencyAnalysis, UrgencyLevel, EmergencyCategory, NextStep } from "./types";

// Design Tokens (Technical / Hardware feel)
const UI_GRID = "border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl";

export default function App() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmergencyAnalysis | null>(null);
  const [history, setHistory] = useState<{input: string, result: EmergencyAnalysis, timestamp: number}[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => (result as any)[0])
          .map((result: any) => result.transcript)
          .join("");
        setInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setError("Microphone access failed. Please try typing.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeEmergency(input);
      setResult(analysis);
      setHistory(prev => [{ input, result: analysis, timestamp: Date.now() }, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please try again or call local emergency services immediately.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSession = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">SafeTap</h1>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Emergency Intelligence Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Engine: Ready</span>
            </div>
          </div>
        </header>

        {/* Main Interface */}
        <main className="flex-1 space-y-8">
          <section className="space-y-4">
            <div className={`rounded-2xl p-1 ${UI_GRID}`}>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the emergency or use the microphone..."
                  className="w-full h-40 bg-transparent p-6 text-lg focus:outline-none placeholder:text-zinc-600 resize-none leading-relaxed"
                />
                
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <button
                    onClick={toggleListening}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isListening 
                        ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse" 
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                    title={isListening ? "Stop listening" : "Start listening"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !input.trim()}
                    className={`h-12 px-8 rounded-full font-bold flex items-center gap-2 transition-all ${
                      input.trim() && !isAnalyzing
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        TAP FOR HELP
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-sm flex items-center gap-3"
              >
                <X className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </section>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Category & Urgency */}
                  <div className={`p-4 rounded-xl ${UI_GRID}`}>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">Classification</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        result.category === EmergencyCategory.MEDICAL ? "bg-blue-500" :
                        result.category === EmergencyCategory.FIRE_HAZARD ? "bg-orange-500" :
                        result.category === EmergencyCategory.SECURITY_THREAT ? "bg-red-500" :
                        "bg-zinc-500"
                      }`} />
                      <span className="font-bold text-lg">{result.category}</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${UI_GRID}`}>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">Urgency Level</label>
                    <span className={`font-black text-lg uppercase italic tracking-wider ${
                      result.urgency === UrgencyLevel.HIGH ? "text-red-500" :
                      result.urgency === UrgencyLevel.MEDIUM ? "text-orange-500" :
                      "text-blue-500"
                    }`}>
                      {result.urgency}
                    </span>
                  </div>
                </div>

                {/* Safety Guidance */}
                <div className="bg-white text-black rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <LifeBuoy className="w-32 h-32" />
                  </div>
                  
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" />
                      Immediate Action
                    </div>
                    <h2 className="text-2xl font-bold leading-tight decoration-red-500 decoration-4">
                      {result.immediate_action}
                    </h2>
                  </div>

                  <div className="pt-6 border-t border-zinc-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Best Next Step</label>
                        <p className="text-lg font-black uppercase italic tracking-tight">{result.recommended_next_step}</p>
                      </div>
                      <button 
                        onClick={clearSession}
                        className="p-3 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                      >
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Technical Reasoning */}
                <div className={`p-4 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500 font-mono`}>
                  <div className="flex items-center justify-between mb-2">
                    <span>ENGINE_LOG_OUTPUT</span>
                    <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <p className="leading-relaxed">REASONING: {result.reason}</p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* History / Micro-labels */}
          {!result && history.length > 0 && (
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pt-8"
            >
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
                <History className="w-3 h-3" />
                Recent Activity
              </div>
              <div className="space-y-2">
                {history.slice(0, 3).map((item, idx) => (
                  <div key={item.timestamp} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg flex items-center justify-between text-xs transition-colors hover:bg-zinc-900/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-600">0{history.length - idx}</span>
                      <span className="truncate max-w-[200px] text-zinc-400">"{item.input}"</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold uppercase tracking-widest ${
                        item.result.urgency === UrgencyLevel.HIGH ? "text-red-500/70" : "text-zinc-600"
                      }`}>{item.result.category}</span>
                      <span className="text-zinc-600">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </main>

        {/* Footer Info */}
        <footer className="mt-12 pt-8 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Terminal: SafeTap_v1.0.4</span>
            <span className="hidden sm:inline">Node: ASIA-SE-1</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            <span>Secure Protocol Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
