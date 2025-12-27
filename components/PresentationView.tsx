
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface PresentationViewProps {
  title: string;
  stageName: string;
  content: string;
  onClose: () => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ title, stageName, content, onClose }) => {
  // Parse markdown to identify sections for slides
  const sections = content.split(/\n(?=##\s)/).filter(s => s.trim().length > 0);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Controls */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-desktop text-white text-xs"></i>
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-widest">Presentation Preview</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <i className="fas fa-file-pdf"></i> Export PDF Deck
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
            Exit
          </button>
        </div>
      </div>

      {/* Slide Container */}
      <div className="flex-1 overflow-y-auto bg-slate-800 p-10 print:p-0 print:bg-white print:overflow-visible">
        <div className="max-w-5xl mx-auto space-y-20 print:space-y-0">
          
          {/* Slide 1: Title (Teal Style) */}
          <div className="slide aspect-[16/9] bg-[#1a5f7a] relative flex flex-col justify-end p-20 text-white overflow-hidden shadow-2xl print:shadow-none print:break-after-page">
            <div className="absolute top-10 left-10 text-3xl font-black tracking-tighter">Material<span className="text-indigo-300">+</span></div>
            <div className="absolute top-10 right-10 grid grid-cols-4 gap-4 opacity-20">
              {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 text-white">+</div>)}
            </div>
            <div className="mb-auto mt-20">
              <h1 className="text-6xl font-light tracking-tight">&lt;{stageName}&gt;</h1>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold opacity-90">Prepared For: Internal M+ Product Team</p>
              <p className="text-sm opacity-70 uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>
            <p className="mt-10 text-[8px] opacity-50 max-w-xs">The contents of this document are the sole and confidential property of Material+ and may not be reproduced or distributed without express written permission.</p>
          </div>

          {/* Slide 2: Table of Contents (Black Style) */}
          <div className="slide aspect-[16/9] bg-black text-white p-20 relative shadow-2xl print:shadow-none print:break-after-page">
            <h2 className="text-4xl font-bold mb-16">Table of Contents</h2>
            <div className="grid grid-cols-2 gap-x-20 gap-y-10">
              {sections.slice(0, 4).map((section, idx) => {
                const header = section.match(/##\s+(.*)/)?.[1] || "Section Title";
                const firstLine = section.split('\n').find(l => l.trim() && !l.startsWith('#')) || "Description one liner";
                return (
                  <div key={idx} className="flex gap-6 border-t border-slate-800 pt-6">
                    <span className="text-5xl font-bold text-indigo-500">{idx + 1}</span>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-wide">&lt;{header}&gt;</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-1">{firstLine}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-10 left-10 text-xs font-bold opacity-30">M+</div>
            <div className="absolute bottom-10 right-10 text-[8px] opacity-30">© Material {new Date().getFullYear()}. All Rights Reserved. CONFIDENTIAL.</div>
          </div>

          {/* Slide 3...N: Content Sections (White Style) */}
          {sections.map((section, idx) => {
             const header = section.match(/##\s+(.*)/)?.[1] || "Content";
             const contentOnly = section.replace(/##\s+.*\n?/, '');
             return (
              <div key={idx} className="slide aspect-[16/9] bg-white text-slate-900 p-20 flex flex-col shadow-2xl print:shadow-none print:break-after-page relative">
                <div className="absolute top-10 right-10 text-[10px] font-bold text-slate-300">0{idx + 3}</div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-[#1a5f7a] mb-10">&lt;{header}&gt;</h2>
                <div className="flex-1 overflow-hidden">
                   <div className="markdown-light scale-110 origin-top-left">
                     <MarkdownRenderer content={contentOnly} />
                   </div>
                </div>
                <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a5f7a]">Material+ Discovery</span>
                  <span className="text-[10px] font-bold">CONFIDENTIAL</span>
                </div>
              </div>
             );
          })}

          {/* Slide Final: Thank You (Black Style) */}
          <div className="slide aspect-[16/9] bg-black text-white p-20 relative flex flex-col justify-between shadow-2xl print:shadow-none print:break-after-page">
            <div className="flex items-center gap-6">
              <div className="text-4xl font-black tracking-tighter">srijan:</div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-[10px] font-bold leading-tight opacity-70">A<br/>Material+<br/>Company</div>
            </div>
            
            <div className="mb-20">
              <h1 className="text-8xl font-black tracking-tighter">Thank You</h1>
            </div>

            <div className="grid grid-cols-3 gap-10 text-[10px] opacity-70 font-medium">
               <div>
                  <p className="font-bold mb-2">Head Offices</p>
                  <p>NA- HQ</p>
                  <p>2430 Highway 34</p>
                  <p>Manasquan, NJ 08736, USA</p>
               </div>
               <div>
                  <p className="font-bold mb-2 opacity-0">Office 2</p>
                  <p>12th Floor, Tower C</p>
                  <p>DLF Cyber City, Gurugram</p>
                  <p>122 002 Haryana, India</p>
               </div>
               <div>
                  <p className="font-bold mb-2 opacity-0">Office 3</p>
                  <p>Suite 71, Unit 3A</p>
                  <p>Hatton Garden, London</p>
                  <p>United Kingdom, EC1N 8DX</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .slide { 
            width: 100vw !important; 
            height: 100vh !important; 
            margin: 0 !important;
            page-break-after: always !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          header, nav, .print\\:hidden { display: none !important; }
        }
        .markdown-light .markdown-content p, 
        .markdown-light .markdown-content li,
        .markdown-light .markdown-content td {
          color: #334155 !important;
          font-weight: 600 !important;
        }
        .markdown-light .markdown-content h3 {
          color: #1a5f7a !important;
          font-weight: 800 !important;
          margin-top: 1rem !important;
        }
        .markdown-light table {
          border-color: #e2e8f0 !important;
        }
        .markdown-light th {
          background-color: #f8fafc !important;
          color: #1a5f7a !important;
          border-color: #e2e8f0 !important;
        }
        .markdown-light td {
          border-color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};

export default PresentationView;
