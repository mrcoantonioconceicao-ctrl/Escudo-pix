import React, { useState } from 'react';
import { PixTransactionInput, AiThreatReport } from '../types';
import { Sparkles, ShieldAlert, Terminal, FileText, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';

interface AiThreatAnalystProps {
  currentTx: PixTransactionInput;
}

export const AiThreatAnalyst: React.FC<AiThreatAnalystProps> = ({ currentTx }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threatReport, setThreatReport] = useState<AiThreatReport | null>(null);

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx: currentTx })
      });
      const data: AiThreatReport = await res.json();
      setThreatReport(data);
    } catch (err) {
      console.error('Erro na análise de IA:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AGENTE IA DE SEGURANÇA E GRAPHRAG (GEMINI 3.8 FLASH)</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Análise Contextual de Ameaças Pix por Inteligência Artificial
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Assistente especializado na síntese de contextos de grafos via protocolo MCP, geração de consultas Cypher para investigação de campo e auditoria de segurança em memória no motor Rust.
            </p>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="px-5 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analisando Grafo...' : 'Iniciar Análise por IA'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Output */}
      {threatReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Executive Summary & Risk Badge (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Relatório Executivo de Ameaça</span>
              </h2>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                threatReport.riskLevel === 'CRITICAL' || threatReport.riskLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                Nível de Risco: {threatReport.riskLevel}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-semibold text-slate-400 block uppercase font-mono">Síntese de Inteligência</span>
              <p className="text-slate-200 text-sm leading-relaxed">{threatReport.summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-semibold text-slate-400 block uppercase font-mono">Voto e Ação Recomendada</span>
              <p className="text-emerald-400 font-bold text-sm">{threatReport.recommendedAction}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-semibold text-slate-400 block uppercase font-mono">Principais Ameaças Mapeadas</span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                {threatReport.keyThreats.map((threat, idx) => (
                  <li key={idx}>{threat}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* GraphRAG Cypher Suggestions & LGPD Audit (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Consultas Cypher para Investigação</span>
              </h2>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
              <span className="text-slate-500 block text-[10px]">CONSULTA RECOMENDADA PELO AGENTE:</span>
              <code className="text-cyan-300 block">{threatReport.suggestedCypherQueries[0]}</code>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-semibold text-slate-400 block uppercase font-mono">Insight do Contexto MCP</span>
              <p className="text-slate-300 leading-relaxed">{threatReport.mcpContextInsights}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-semibold text-slate-400 block uppercase font-mono">Parecer de Conformidade LGPD</span>
              <p className="text-emerald-300 leading-relaxed">{threatReport.lgpdComplianceCheck}</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Clique em <span className="text-cyan-400 font-semibold">"Iniciar Análise por IA"</span> para solicitar ao modelo Gemini a síntese do contexto da transação ativa.
          </p>
        </div>
      )}

    </div>
  );
};
