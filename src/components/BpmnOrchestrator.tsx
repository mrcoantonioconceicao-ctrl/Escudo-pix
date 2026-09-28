import React, { useState } from 'react';
import { BpmnStep } from '../types';
import { Workflow, ShieldAlert, Clock, ArrowRight, CheckCircle2, Building, Scale, FileCheck } from 'lucide-react';

const BPMN_STEPS: BpmnStep[] = [
  {
    id: 'step_eval',
    title: '1. Avaliação Sub-8ms PIX-SHIELD-QPO',
    description: 'Processamento assíncrono do payload Pix com travessia GraphRAG via MCP e sanitização LGPD.',
    actor: 'PIX-SHIELD-QPO',
    status: 'COMPLETED',
    legalBasis: 'Manual de Segurança do Pix (Bacen Res. 1/2020)'
  },
  {
    id: 'step_gateway',
    title: '2. Gateway de Decisão de Risco',
    description: 'Score de Risco >= 80 ativa bloqueio preventivo cautelar antes da liquidação no SPI.',
    actor: 'PIX-SHIELD-QPO',
    status: 'COMPLETED',
    legalBasis: 'Resolução Bacen nº 147/2021 - Bloqueio Cautelar'
  },
  {
    id: 'step_fundada_suspeita',
    title: '3. Bloqueio Cautelar 72 Horas',
    description: 'Retenção cautelar do recurso na conta do recebedor por até 72 horas para análise aprofundada.',
    actor: 'BANCO_RECEBEDOR',
    slaHours: 72,
    status: 'ACTIVE',
    legalBasis: 'Art. 39-B do Regulamento do Pix (Bacen)'
  },
  {
    id: 'step_med_claim',
    title: '4. Gancho MED (Contestação 7 Dias)',
    description: 'Notificação de fraude via Mecanismo Especial de Devolução com janela de 7 dias para análise de contestação.',
    actor: 'BANCO_PAGADOR',
    slaHours: 168, // 7 days = 168 hours
    status: 'PENDING',
    legalBasis: 'Resolução Bacen nº 103/2021 - Diretrizes do MED'
  },
  {
    id: 'step_eviction',
    title: '5. Expulsão Imediata de Participantes',
    description: 'Propagação da revogação da conta laranja em todo o Diretório de Posições do Bacen (DICT).',
    actor: 'BACEN-SPI',
    status: 'PENDING',
    legalBasis: 'Regulamento de Segurança DICT/SPI (Bacen)'
  }
];

export const BpmnOrchestrator: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<BpmnStep>(BPMN_STEPS[2]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <Workflow className="w-4 h-4 text-indigo-400" />
              <span>ORQUESTRAÇÃO DE PROCESSOS BPMN 2.0</span>
              <span className="text-slate-600">·</span>
              <span>CONFORMIDADE REGULATÓRIA BACEN</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Ganchos Regulatórios: "Fundada Suspeita", MED e Revogação
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Fluxo formal de atendimento às diretrizes do Banco Central para retenção cautelar de 72 horas, contestações via MED em até 7 dias e notificação em tempo real ao DICT/SPI.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300">
            <span className="text-slate-400 block mb-0.5">Janela MED Regulamentar:</span>
            <span className="font-bold text-white">7 Dias de Contestação</span>
          </div>
        </div>
      </div>

      {/* Visual BPMN Process Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Diagrama de Fluxo BPMN da Notificação de Fraude</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Bacen Resolução 147/2021 &amp; MED</span>
        </div>

        {/* Timeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {BPMN_STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedStep.id === step.id
                  ? 'bg-slate-800 border-indigo-500/80 shadow-lg ring-2 ring-indigo-500/20 text-white'
                  : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : step.status === 'ACTIVE'
                      ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.status}
                  </span>
                  {step.slaHours && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {step.slaHours}h
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">{step.title}</h3>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-indigo-300">
                Ator: {step.actor}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Step Inspector */}
        {selectedStep && (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 block">DETALHES DO ETAPA BPMN</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedStep.title}</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Ator Responsável: {selectedStep.actor}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Descrição Operacional</span>
                <p className="text-slate-200 mt-1">{selectedStep.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Base Legal e Regulatória</span>
                <p className="text-indigo-300 font-semibold mt-1">{selectedStep.legalBasis}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Janela de SLA Legal</span>
                <p className="text-amber-300 font-mono font-bold mt-1">
                  {selectedStep.slaHours ? `${selectedStep.slaHours} Horas Regulamentares` : 'Execução Sub-8ms em Tempo Real'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
