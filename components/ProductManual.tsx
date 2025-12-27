
import React from 'react';

interface ProductManualProps {
  onClose: () => void;
}

const ProductManual: React.FC<ProductManualProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="h-20 border-b border-slate-800 flex items-center justify-between px-10 glass shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <i className="fas fa-book text-white"></i>
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none">Product Manual & FRD</h2>
            <p className="text-[9px] text-indigo-400 font-bold tracking-[0.2em] mt-2 uppercase">End-to-End Capabilities v2.0</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <nav className="hidden md:flex w-64 border-r border-slate-800 flex-col p-8 space-y-6 overflow-y-auto bg-slate-900/40 shrink-0">
          <div className="space-y-2">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Sections</h4>
            <a href="#baseline" className="block text-[11px] font-bold text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-wider py-1">Strategic Baseline</a>
            <a href="#context" className="block text-[11px] font-bold text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-wider py-1">Context Engine</a>
            <a href="#intelligence" className="block text-[11px] font-bold text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-wider py-1">AI Controls</a>
            <a href="#modules" className="block text-[11px] font-bold text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-wider py-1">Module Pipeline</a>
            <a href="#interaction" className="block text-[11px] font-bold text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-wider py-1">User Interaction</a>
            <a href="#outputs" className="block text-[11px] font-bold text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-wider py-1">Exports & Reports</a>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 lg:p-20 bg-[radial-gradient(circle_at_top_right,#1e1b4b_0%,transparent_40%)]">
          <div className="max-w-4xl mx-auto space-y-24 pb-20">
            
            {/* 1. STRATEGIC BASELINE */}
            <section id="baseline" className="space-y-6">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="text-3xl font-black text-indigo-500/50">01.</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Strategic Baseline (Global Context)</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">The Discovery Pro workspace requires a mandatory global configuration before any module can be analyzed. This baseline acts as the "North Star" for the AI agents, ensuring every output—from Domain to Backlog—is perfectly aligned with your business identity.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { l: "Company Persona", d: "Sets the corporate tone and historical context." },
                  { l: "Target Vertical", d: "Forces the AI to use domain-specific language and benchmarks." },
                  { l: "Market Focus (TAM)", d: "Quantifies the growth expectations and scale constraints." },
                  { l: "Competitive Benchmarks", d: "The anchor for all SWOT and Differentiation analyses." }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">{item.l}</p>
                    <p className="text-xs text-slate-300 font-medium opacity-80">{item.d}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. CONTEXT ENGINE */}
            <section id="context" className="space-y-6">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="text-3xl font-black text-indigo-500/50">02.</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Multimodal Context Engine</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">Unlike basic text-in text-out tools, Discovery Pro features a high-bandwidth ingestion pipeline for multiple media types.</p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0"><i className="fas fa-image text-indigo-400"></i></div>
                  <div>
                    <h5 className="text-[12px] font-black text-white uppercase mb-1">Visual Intelligence</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Upload UI mockups, screenshots, or whiteboard photos. The AI extracts visual components, user flow logic, and design patterns to inform technical stories.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0"><i className="fas fa-link text-amber-400"></i></div>
                  <div>
                    <h5 className="text-[12px] font-black text-white uppercase mb-1">URL Reference Management</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Add multiple external links per stage. The engine scrapes metadata and site structure to build a deeper competitive and technical context.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><i className="fas fa-history text-emerald-400"></i></div>
                  <div>
                    <h5 className="text-[12px] font-black text-white uppercase mb-1">Contextual Import History</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Import generated outputs and user refinements from all previous modules into the current stage with a single click, ensuring cumulative intelligence.</p>
                  </div>
                </li>
              </ul>
            </section>

            {/* 3. AI CONTROLS */}
            <section id="intelligence" className="space-y-6">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="text-3xl font-black text-indigo-500/50">03.</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Intelligence Orchestration</h3>
              </div>
              <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 space-y-6">
                <div className="flex items-start gap-4">
                  <i className="fas fa-brain text-2xl text-indigo-500 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Thinking Mode (LLM Reasoner)</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">Enables a dedicated 32,768-token "reasoning budget." The agent performs internal simulations, logical validation, and multi-step synthesis before generating the final report. Essential for BOD and KPI stages.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-4 border-t border-slate-800">
                  <i className="fas fa-search text-2xl text-amber-500 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Research Grounding (Web Access)</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">Integrates Google Search to validate market trends, competitor claims, and technical standards. Every generated fact is cross-referenced with live citations and source links.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. MODULE PIPELINE */}
            <section id="modules" className="space-y-6">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="text-3xl font-black text-indigo-500/50">04.</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">The 4-Stage Discovery Pipeline</h3>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                   <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">01</div>
                   <div>
                     <h5 className="text-[14px] font-black text-white uppercase tracking-wider">Domain Strategy</h5>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Competitive intelligence, SWOT identification, and strategic moat formulation. Outputs the core value proposition and market position.</p>
                   </div>
                </div>
                <div className="flex items-center gap-6 group">
                   <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">02</div>
                   <div>
                     <h5 className="text-[14px] font-black text-white uppercase tracking-wider">Business Overview (BOD)</h5>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Operational entity mapping, relationship definitions, and process flows. Adheres to uploaded Format Reference templates.</p>
                   </div>
                </div>
                <div className="flex items-center gap-6 group">
                   <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">03</div>
                   <div>
                     <h5 className="text-[14px] font-black text-white uppercase tracking-wider">Metrics & Performance (KPI)</h5>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Establishment of North Star, Leading, and Lagging indicators. Defines specific success thresholds and measurement strategies.</p>
                   </div>
                </div>
                <div className="flex items-center gap-6 group">
                   <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">04</div>
                   <div>
                     <h5 className="text-[14px] font-black text-white uppercase tracking-wider">Engineering Backlog (EPICS)</h5>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Decomposition of strategy into high-level Epics and granular User Stories with functional and non-functional Acceptance Criteria (AC).</p>
                   </div>
                </div>
              </div>
            </section>

            {/* 5. INTERACTION & EXPORTS */}
            <section id="interaction" className="space-y-6">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="text-3xl font-black text-indigo-500/50">05.</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Interaction & Iteration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Live Voice Assistant</h6>
                  <p className="text-xs text-slate-400 leading-relaxed">Hands-free control of the workbench. Use voice to update inputs, switch modules, or answer refinement questions via real-time PCM audio streaming.</p>
                </div>
                <div className="space-y-3">
                  <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Iteration Versioning</h6>
                  <p className="text-xs text-slate-400 leading-relaxed">Every analysis generates a snapshot. Access the Iteration History to compare versions or revert to any previous state (including original inputs and questions).</p>
                </div>
                <div className="space-y-3">
                  <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Presentation View</h6>
                  <p className="text-xs text-slate-400 leading-relaxed">Generate a professional 16:9 branded slide deck (Title, TOC, Content, and Closing slides) ready for executive review or stakeholder presentations.</p>
                </div>
                <div className="space-y-3">
                  <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Contextual ChatBot</h6>
                  <p className="text-xs text-slate-400 leading-relaxed">A persistent assistant that "reads" your current stage and generated output to provide strategic advice, industry benchmarks, or input refinement suggestions.</p>
                </div>
              </div>
            </section>

            <footer className="pt-20 text-center opacity-30">
              <div className="w-12 h-1 w-12 bg-indigo-500 mx-auto mb-6"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">End of Manual</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManual;
