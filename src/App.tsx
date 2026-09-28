import React, { useState } from 'react';
import { Header } from './components/Header';
import { PipelineSimulator } from './components/PipelineSimulator';
import { GraphExplorer } from './components/GraphExplorer';
import { RustCodeStudio } from './components/RustCodeStudio';
import { LgpdConsentCenter } from './components/LgpdConsentCenter';
import { BpmnOrchestrator } from './components/BpmnOrchestrator';
import { AiThreatAnalyst } from './components/AiThreatAnalyst';
import { McpProtocolViewer } from './components/McpProtocolViewer';
import { PixTransactionInput, EvaluationResult } from './types';
import { ShieldCheck, Lock, Scale, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [lastTx, setLastTx] = useState<PixTransactionInput>({
    transactionId: 'TX-PIX-2026-8801',
    senderCpf: '12345678901',
    senderName: 'Carlos Eduardo Silva',
    senderBank: '001 - Banco do Brasil',
    recipientPixKey: 'carlos.recebedor@email.com',
    recipientCpf: '98765432100',
    recipientName: 'Mercado Local Ltda',
    recipientBank: '341 - Itaú Unibanco',
    amount: 150.0,
    pixType: 'EMAIL',
    ipAddress: '200.180.45.12',
    deviceFingerprint: 'dev_fp_iphone_ios18_clean',
    timestamp: new Date().toISOString(),
    velocityLast5Min: 1,
    cmpConsent: {
      behavioralTelemetry: true,
      deviceFingerprint: true,
      ipGeolocation: true,
      networkVelocity: true,
      userRevokedAll: false
    }
  });

  const handleEvaluationComplete = (result: EvaluationResult, tx: PixTransactionInput) => {
    setLastTx(tx);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSimulate={() => setActiveTab('simulator')}
      />

      {/* Secondary Quick Subnav Bar for Mobile & Screen Optimization */}
      <div className="border-b border-slate-800/60 bg-slate-900/50 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1 rounded ${activeTab === 'simulator' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Simulador
          </button>
          <button
            onClick={() => setActiveTab('graphrag')}
            className={`px-3 py-1 rounded ${activeTab === 'graphrag' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            GraphRAG
          </button>
          <button
            onClick={() => setActiveTab('rust')}
            className={`px-3 py-1 rounded ${activeTab === 'rust' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Rust Engine
          </button>
          <button
            onClick={() => setActiveTab('lgpd')}
            className={`px-3 py-1 rounded ${activeTab === 'lgpd' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            LGPD / CMP
          </button>
          <button
            onClick={() => setActiveTab('bpmn')}
            className={`px-3 py-1 rounded ${activeTab === 'bpmn' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            BPMN / Bacen
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1 rounded ${activeTab === 'ai' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Agente IA
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-3 py-1 rounded ${activeTab === 'mcp' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Console MCP
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'simulator' && (
          <PipelineSimulator onEvaluationComplete={handleEvaluationComplete} />
        )}

        {activeTab === 'graphrag' && (
          <GraphExplorer />
        )}

        {activeTab === 'rust' && (
          <RustCodeStudio />
        )}

        {activeTab === 'lgpd' && (
          <LgpdConsentCenter />
        )}

        {activeTab === 'bpmn' && (
          <BpmnOrchestrator />
        )}

        {activeTab === 'ai' && (
          <AiThreatAnalyst currentTx={lastTx} />
        )}

        {activeTab === 'mcp' && (
          <McpProtocolViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PIX-SHIELD-QPO</span>
            <span>·</span>
            <span>Motor Antifraude Pix de Alta Performance (&lt;8ms SLA)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Bacen Res. 147/2021
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> LGPD Lei nº 13.709/2018
            </span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('mcp')}
              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" /> Protocolo MCP
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
