import React, { useState } from 'react';
import { PixTransactionInput, EvaluationResult } from '../types';
import { Cpu, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Lock, Zap, ArrowRight, ShieldAlert, FileSpreadsheet } from 'lucide-react';

interface PipelineSimulatorProps {
  onEvaluationComplete?: (result: EvaluationResult, tx: PixTransactionInput) => void;
}

const PRESETS: { label: string; tx: PixTransactionInput }[] = [
  {
    label: '🟢 Pix Cotidiano (Baixo Risco - R$ 150)',
    tx: {
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
    }
  },
  {
    label: '🔴 Mule Ring Confirmado (Alta Velocidade - R$ 15.000)',
    tx: {
      transactionId: 'TX-PIX-2026-9902',
      senderCpf: '33344455566',
      senderName: 'Ana Maria Oliveira',
      senderBank: '104 - Caixa Econômica',
      recipientPixKey: 'laranja.mule99@mulebank.com',
      recipientCpf: '99988877711',
      recipientName: 'Conta Laranja Hub SP',
      recipientBank: '260 - Nu Pagamentos S.A.',
      amount: 15000.0,
      pixType: 'EVP',
      ipAddress: '185.220.101.42',
      deviceFingerprint: 'fp_emu_android_v14_root',
      timestamp: new Date().toISOString(),
      velocityLast5Min: 6,
      cmpConsent: {
        behavioralTelemetry: true,
        deviceFingerprint: true,
        ipGeolocation: true,
        networkVelocity: true,
        userRevokedAll: false
      }
    }
  },
  {
    label: '🛡️ LGPD Art. 7º: Consentimento Revogado pelo Titular (R$ 8.500)',
    tx: {
      transactionId: 'TX-PIX-2026-7703',
      senderCpf: '55566677788',
      senderName: 'Roberto Mendes',
      senderBank: '237 - Bradesco',
      recipientPixKey: '55566677788',
      recipientCpf: '9f86d081884c7d659a2feaa0c55ad015',
      recipientName: 'Investimentos Parallelo',
      recipientBank: '336 - C6 Bank',
      amount: 8500.0,
      pixType: 'CPF',
      ipAddress: '177.92.12.80',
      deviceFingerprint: 'dev_fp_anonymized_cmp_blocked',
      timestamp: new Date().toISOString(),
      velocityLast5Min: 2,
      cmpConsent: {
        behavioralTelemetry: false,
        deviceFingerprint: false,
        ipGeolocation: false,
        networkVelocity: false,
        userRevokedAll: true
      }
    }
  },
  {
    label: '⚠️ Engenharia Social / Mão Fantasma (R$ 45.000)',
    tx: {
      transactionId: 'TX-PIX-2026-4404',
      senderCpf: '77788899900',
      senderName: 'Helena Souza Santos',
      senderBank: '033 - Santander',
      recipientPixKey: '+5511998877665',
      recipientCpf: '11122233344',
      recipientName: 'Central Falsa Atendimento',
      recipientBank: '260 - Nu Pagamentos S.A.',
      amount: 45000.0,
      pixType: 'PHONE',
      ipAddress: '189.40.220.15',
      deviceFingerprint: 'dev_fp_remote_anydesk_active',
      timestamp: new Date().toISOString(),
      velocityLast5Min: 4,
      cmpConsent: {
        behavioralTelemetry: true,
        deviceFingerprint: true,
        ipGeolocation: true,
        networkVelocity: true,
        userRevokedAll: false
      }
    }
  }
];

export const PipelineSimulator: React.FC<PipelineSimulatorProps> = ({ onEvaluationComplete }) => {
  const [currentTx, setCurrentTx] = useState<PixTransactionInput>(PRESETS[0].tx);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const handleApplyPreset = (presetTx: PixTransactionInput) => {
    setCurrentTx({ ...presetTx, timestamp: new Date().toISOString() });
    setEvaluationResult(null);
  };

  const handleRunPipeline = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/simulate-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTx)
      });
      const data: EvaluationResult = await res.json();
      setEvaluationResult(data);
      if (onEvaluationComplete) {
        onEvaluationComplete(data, currentTx);
      }
    } catch (err) {
      console.error('Erro ao chamar motor sub-8ms:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-emerald-400 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>SLA P99 META: &lt; 8.00ms</span>
              <span className="text-slate-600">·</span>
              <span>CONCORRÊNCIA TOKIO ASYNC</span>
              <span className="text-slate-600">·</span>
              <span>LGPD ART. 7º</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Simulador do Motor Antifraude Pix em Tempo Real
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Avalie transações Pix com travessia de grafo via MCP (GraphRAG), sanitização criptográfica LGPD e marcação imediata de "Fundada Suspeita" regulamentada pelo Bacen.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunPipeline}
              disabled={isEvaluating}
              className="px-5 py-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Cpu className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Executando Pipeline...' : 'Executar Avaliação Sub-8ms'}</span>
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-2 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> Presets de Teste:
          </span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset.tx)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Config Form & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Parâmetros da Transação Pix</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">ID: {currentTx.transactionId}</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* Sender Info */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-300 block">Dados do Pagador (Origem)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">CPF Pagador</label>
                  <input
                    type="text"
                    value={currentTx.senderCpf}
                    onChange={(e) => setCurrentTx({ ...currentTx, senderCpf: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Banco Origem</label>
                  <input
                    type="text"
                    value={currentTx.senderBank}
                    onChange={(e) => setCurrentTx({ ...currentTx, senderBank: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-300 block">Dados do Recebedor (Destino)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Chave Pix</label>
                  <input
                    type="text"
                    value={currentTx.recipientPixKey}
                    onChange={(e) => setCurrentTx({ ...currentTx, recipientPixKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Banco Destino</label>
                  <input
                    type="text"
                    value={currentTx.recipientBank}
                    onChange={(e) => setCurrentTx({ ...currentTx, recipientBank: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Amount & Velocity */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <label className="text-slate-400 block mb-1">Valor Transação (R$)</label>
                <input
                  type="number"
                  value={currentTx.amount}
                  onChange={(e) => setCurrentTx({ ...currentTx, amount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-sm"
                />
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <label className="text-slate-400 block mb-1">Velocidade (5 min)</label>
                <input
                  type="number"
                  value={currentTx.velocityLast5Min}
                  onChange={(e) => setCurrentTx({ ...currentTx, velocityLast5Min: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* CMP / LGPD Governance Toggle */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Estado de Consentimento CMP (LGPD)</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  currentTx.cmpConsent.userRevokedAll 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {currentTx.cmpConsent.userRevokedAll ? 'REVOGADO (Art. 7º)' : 'AUTORIZADO'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Se o consentimento for revogado, a telemetria comportamental e de cookies é expurgada do pipeline antes da avaliação de risco.
              </p>
              <button
                onClick={() => setCurrentTx({
                  ...currentTx,
                  cmpConsent: {
                    ...currentTx.cmpConsent,
                    userRevokedAll: !currentTx.cmpConsent.userRevokedAll,
                    behavioralTelemetry: currentTx.cmpConsent.userRevokedAll,
                    deviceFingerprint: currentTx.cmpConsent.userRevokedAll
                  }
                })}
                className="w-full py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {currentTx.cmpConsent.userRevokedAll ? 'Reativar Consentimento CMP' : 'Simular Revogação de Consentimento (LGPD)'}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Execution Output & Microsecond Latency Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Resultado da Avaliação &amp; Telemetria Sub-8ms</span>
              </h2>
              {evaluationResult && (
                <span className="text-xs font-mono text-slate-400">
                  {evaluationResult.timestamp.slice(11, 19)}
                </span>
              )}
            </div>

            {!evaluationResult ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                  <Cpu className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-400">
                  Clique em <span className="text-emerald-400 font-semibold">"Executar Avaliação Sub-8ms"</span> para processar esta transação no pipeline Rust.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                
                {/* Decision Badge & Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    evaluationResult.decision === 'APROVADO'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : evaluationResult.decision === 'DESAFIO_MFA_REQUERIDO'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Decisão do Motor Antifraude
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      {evaluationResult.decision === 'APROVADO' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
                      {evaluationResult.decision === 'DESAFIO_MFA_REQUERIDO' && <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />}
                      {(evaluationResult.decision.includes('BLOQUEIO') || evaluationResult.decision.includes('REJEITADO')) && (
                        <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <span className="text-base font-bold tracking-tight">
                        {evaluationResult.decision.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Score de Risco Calculado</span>
                      <span className="text-xs font-mono font-bold text-white">{evaluationResult.riskScore} / 100</span>
                    </div>
                    
                    {/* Meter bar */}
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          evaluationResult.riskScore >= 80
                            ? 'bg-rose-500'
                            : evaluationResult.riskScore >= 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${evaluationResult.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Microsecond Latency SLA Breakdown */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Decomposição de Latência Microsegundos (µs)</span>
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      evaluationResult.latency.p99SlaMet 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      P99 Total: {(evaluationResult.latency.totalMicroseconds / 1000).toFixed(2)} ms {evaluationResult.latency.p99SlaMet ? '✓ SLA Atendido (<8ms)' : '✗ Excedeu SLA'}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px]">1. LGPD SCRUB</span>
                      <span className="font-bold text-emerald-400">{evaluationResult.latency.lgpdScrubMicroseconds} µs</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px]">2. GRAPHRAG MCP</span>
                      <span className="font-bold text-cyan-400">{evaluationResult.latency.graphRagMcpMicroseconds} µs</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px]">3. RISK MATRIX</span>
                      <span className="font-bold text-amber-400">{evaluationResult.latency.riskMatrixMicroseconds} µs</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px]">4. BACEN RULES</span>
                      <span className="font-bold text-indigo-400">{evaluationResult.latency.bacenBpmnMicroseconds} µs</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px]">5. CQRS DISPATCH</span>
                      <span className="font-bold text-rose-400">{evaluationResult.latency.cqrsDispatchMicroseconds} µs</span>
                    </div>
                  </div>
                </div>

                {/* Audit & Compliance Insights */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                  <span className="font-semibold text-slate-300 block">Razões e Fatores de Decisão</span>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    {evaluationResult.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      <span>CPF Sanitizado HMAC: </span>
                      <span className="text-slate-200">{evaluationResult.anonymizedSenderCpf}</span>
                    </div>
                    <div>
                      <span>IP Mascarado: </span>
                      <span className="text-slate-200">{evaluationResult.anonymizedIp}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {evaluationResult?.bacenMarkedSuspicious && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Ganchos do Bacen Disparados: Bloqueio Cautelar de 72h e Elegibilidade MED (7 Dias).</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200">
                Resolução 147/2021
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
