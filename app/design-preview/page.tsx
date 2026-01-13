"use client";

import React from "react";
import {
  Hash, MoveRight, Box, ArrowUpRight
} from "lucide-react";

// Mock Data
const MOCK_SUBS = [
  { url: "https://api.nexus.io/sub/v1?token=xyz", prefix: "HK_Premium" },
  { url: "https://backup.node/clash.yaml", prefix: "US_Backup" }
];

export default function DesignGalleryPage() {
  return (
    <div className="min-h-screen bg-[#e6e6e6] font-mono p-6 md:p-16 transition-colors">
      <div className="max-w-[1600px] mx-auto space-y-20">
        <header className="text-center space-y-6 mb-24">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black">
            Layouts Selected: Color Exploration
          </h1>
          <p className="text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Refining the <strong>Architectural Grid</strong> and <strong>Scientific Journal</strong> styles with new palettes.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* 1. Grid: Industrial Orange */}
          <section className="group flex flex-col">
            <h3 className="text-sm font-bold text-neutral-500 mb-6 uppercase tracking-widest">01 / Grid: Industrial Orange</h3>
            <div className="bg-[#FFFBF0] border border-neutral-200 min-h-[500px] flex flex-col relative overflow-hidden shadow-sm">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(#FF4400 1px, transparent 1px), linear-gradient(90deg, #FF4400 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}>
              </div>

              <div className="p-8 flex-1 flex flex-col border-l-4 border-[#FF4400] bg-white/70 relative z-10 backdrop-blur-[1px]">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <span className="text-[#FF4400] text-xs font-bold uppercase block">Safety / Converters</span>
                    <h2 className="text-2xl font-bold tracking-tighter text-black">Sub_Converter</h2>
                  </div>
                  <div className="bg-[#FF4400] text-white px-3 py-1 text-xs font-bold">
                    V.2.0
                  </div>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      <Hash className="w-3 h-3 text-[#FF4400]" /> Active_Nodes
                    </div>
                    {MOCK_SUBS.map((sub, i) => (
                      <div key={i} className="flex justify-between items-baseline border-b border-neutral-200 pb-2 group/row hover:bg-[#FF4400]/5 transition-colors cursor-pointer">
                        <span className="font-bold text-sm text-neutral-800">{sub.prefix}</span>
                        <span className="text-neutral-500 text-xs">{sub.url.slice(0, 30)}...</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-[1fr_auto] gap-4">
                  <input className="bg-white border border-neutral-200 p-4 text-xs font-bold placeholder:text-neutral-400 focus:outline-[#FF4400]" placeholder="INPUT_NEW_SOURCE..." />
                  <button className="bg-[#FF4400] text-white px-8 font-bold hover:bg-[#CC3600] transition-colors flex items-center gap-2 text-sm uppercase">
                    Run
                  </button>
                </div>
              </div>
            </div>
          </section>


          {/* 2. Grid: Precision Teal */}
          <section className="group flex flex-col">
            <h3 className="text-sm font-bold text-neutral-500 mb-6 uppercase tracking-widest">02 / Grid: Precision Teal</h3>
            <div className="bg-[#F0FAFA] border border-teal-100 min-h-[500px] flex flex-col relative overflow-hidden shadow-sm">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(#0D9488 1px, transparent 1px), linear-gradient(90deg, #0D9488 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}>
              </div>

              <div className="p-8 flex-1 flex flex-col border-l-4 border-teal-600 bg-white/60 relative z-10 backdrop-blur-[1px]">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <span className="text-teal-600 text-xs font-bold uppercase block">Lab / Net</span>
                    <h2 className="text-2xl font-bold tracking-tighter text-teal-900">Sub_Converter</h2>
                  </div>
                  <div className="border border-teal-600 text-teal-600 px-2 py-1 text-xs font-bold rounded-full">
                    Stable
                  </div>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                      <Hash className="w-3 h-3" /> Coordinates
                    </div>
                    {MOCK_SUBS.map((sub, i) => (
                      <div key={i} className="flex justify-between items-baseline border-b border-teal-100 pb-2 group/row hover:bg-teal-50 transition-colors cursor-pointer">
                        <span className="font-bold text-sm text-teal-900">{sub.prefix}</span>
                        <span className="text-teal-500 text-xs">{sub.url.slice(0, 30)}...</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-[1fr_auto] gap-4">
                  <input className="bg-white border border-teal-100 p-4 text-xs font-bold placeholder:text-teal-300 text-teal-900 focus:outline-teal-600" placeholder="INPUT_NEW_SOURCE..." />
                  <button className="bg-teal-600 text-white px-8 font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm uppercase">
                    Build
                  </button>
                </div>
              </div>
            </div>
          </section>


          {/* 3. Journal: Midnight Blue */}
          <section className="group flex flex-col">
            <h3 className="text-sm font-bold text-neutral-500 mb-6 uppercase tracking-widest">03 / Journal: Midnight Blue</h3>
            <div className="bg-[#F5F7FA] border-y-[6px] border-[#1e3a8a] min-h-[500px] flex flex-col relative shadow-md">
              <div className="p-10 flex-1 flex flex-col">
                <header className="mb-12 border-b-2 border-[#1e3a8a] pb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-1 text-[#1e3a8a]">Config<br />System.</h1>
                    <p className="text-[#64748b] text-xs mt-2">Maritime / International</p>
                  </div>
                  <div className="w-12 h-12 bg-[#1e3a8a] text-white flex items-center justify-center rounded-full font-bold text-xl">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </header>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="text-xs font-bold text-[#94a3b8] rotate-180 py-1" style={{ writingMode: 'vertical-rl' }}>MANIFEST</span>
                    <div className="space-y-2">
                      {MOCK_SUBS.map((sub, i) => (
                        <div key={i} className="bg-white p-4 border border-blue-100 rounded-sm hover:border-[#1e3a8a] transition-colors cursor-pointer block group/card shadow-sm">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm bg-[#1e3a8a] text-white px-2 py-0.5">{sub.prefix}</span>
                            <span className="text-[10px] text-blue-300 font-bold group-hover/card:text-[#1e3a8a]">ID-{i + 20}</span>
                          </div>
                          <div className="text-xs text-slate-600 truncate">{sub.url}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button className="w-full border-2 border-[#1e3a8a] py-4 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex justify-between px-6">
                    <span>Compile</span>
                    <span className="font-normal opacity-50">Deep Ocean Theme</span>
                  </button>
                </div>
              </div>
            </div>
          </section>


          {/* 4. Journal: Field Olive */}
          <section className="group flex flex-col">
            <h3 className="text-sm font-bold text-neutral-500 mb-6 uppercase tracking-widest">04 / Journal: Field Olive</h3>
            <div className="bg-[#fcfcf9] border-y-[6px] border-[#424b38] min-h-[500px] flex flex-col relative shadow-md">
              <div className="p-10 flex-1 flex flex-col">
                <header className="mb-12 border-b-2 border-[#424b38] pb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-1 text-[#424b38]">Field<br />Ops.</h1>
                    <p className="text-[#78836b] text-xs mt-2">Tactical Data Link</p>
                  </div>
                  <div className="w-12 h-12 bg-[#424b38] text-[#fcfcf9] flex items-center justify-center font-bold text-xl">
                    <Box className="w-6 h-6" />
                  </div>
                </header>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="text-xs font-bold text-[#aab3a1] rotate-180 py-1" style={{ writingMode: 'vertical-rl' }}>LOGISTICS</span>
                    <div className="space-y-2">
                      {MOCK_SUBS.map((sub, i) => (
                        <div key={i} className="bg-[#f4f5f0] p-4 border border-[#e2e4dd] rounded-sm hover:border-[#424b38] transition-colors cursor-pointer block group/card">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm bg-[#424b38] text-[#fcfcf9] px-2 py-0.5">{sub.prefix}</span>
                            <span className="text-[10px] text-[#78836b] font-bold">SECURE</span>
                          </div>
                          <div className="text-xs text-[#5e6653] truncate">{sub.url}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button className="w-full border-2 border-[#424b38] bg-[#424b38] text-[#fcfcf9] py-4 hover:opacity-90 transition-opacity text-sm font-bold uppercase tracking-widest flex justify-between px-6 shadow-[0_4px_10px_rgba(66,75,56,0.2)]">
                    <span>Execute Order</span>
                    <span className="opacity-70">Ready</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
