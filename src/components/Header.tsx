import React, { useState } from 'react';
import { ShieldAlert, Cpu, Network, FileCode, Lock, Workflow, Sparkles, User } from 'lucide-react';
import { AboutDeveloperModal } from './AboutDeveloperModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenQuickSimulate }) => {
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Zone 1: Brand Title (Single element wordmark) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-sm shadow-emerald-900/20">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <button 
              onClick={() => setActiveTab('simulator')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                PIX-SHIELD-QPO
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with hover indicators) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Simulador Sub-8ms</span>
            </button>

            <button
              onClick={() => setActiveTab('graphrag')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'graphrag'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>GraphRAG &amp; MCP</span>
            </button>

            <button
              onClick={() => setActiveTab('rust')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'rust'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Motor Rust (DDD/CQRS)</span>
            </button>

            <button
              onClick={() => setActiveTab('lgpd')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'lgpd'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Governança LGPD &amp; CMP</span>
            </button>

            <button
              onClick={() => setActiveTab('bpmn')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'bpmn'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>BPMN &amp; Bacen</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agente IA Threat</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Developer Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SLA P99: &lt; 8ms</span>
            </div>

            {/* Developer Contact Button */}
            <button
              onClick={() => setIsDeveloperModalOpen(true)}
              title="Sobre o Desenvolvedor (Marco Antônio Conceição)"
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline text-xs font-medium">Desenvolvedor</span>
            </button>

            <button
              onClick={onOpenQuickSimulate}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Nova Avaliação</span>
            </button>
          </div>

        </div>
      </header>

      {/* About Developer Modal */}
      <AboutDeveloperModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
      />
    </>
  );
};
