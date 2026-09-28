import React, { useState } from 'react';
import { CMPConsentState } from '../types';
import { Lock, ShieldCheck, UserCheck, AlertOctagon, Eye, EyeOff, Zap, FileText } from 'lucide-react';

export const LgpdConsentCenter: React.FC = () => {
  const [cmpState, setCmpState] = useState<CMPConsentState>({
    behavioralTelemetry: true,
    deviceFingerprint: true,
    ipGeolocation: true,
    networkVelocity: true,
    userRevokedAll: false
  });

  const [rawCpf, setRawCpf] = useState('123.456.789-00');
  const [rawName, setRawName] = useState('Carlos Eduardo Silva');
  const [rawIp, setRawIp] = useState('189.40.220.15');
  const [rawDevice, setRawDevice] = useState('iphone_ios18_fp_hash_9821a');

  const handleToggleCategory = (key: keyof CMPConsentState) => {
    if (key === 'userRevokedAll') {
      const nextRevoked = !cmpState.userRevokedAll;
      setCmpState({
        behavioralTelemetry: !nextRevoked,
        deviceFingerprint: !nextRevoked,
        ipGeolocation: !nextRevoked,
        networkVelocity: !nextRevoked,
        userRevokedAll: nextRevoked
      });
    } else {
      setCmpState({
        ...cmpState,
        [key]: !cmpState[key]
      });
    }
  };

  // Simulated HMAC-SHA256 hash for display
  const anonCpf = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const anonIp = rawIp.split('.').slice(0, 2).join('.') + '.*.***';
  const finalDevice = cmpState.userRevokedAll || !cmpState.deviceFingerprint 
    ? '[EXPURGADO_LGPD_ART_7]' 
    : 'hmac_sha256_fp_' + rawDevice.slice(-8);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>GOVERNANÇA LGPD (LEI Nº 13.709/2018)</span>
              <span className="text-slate-600">·</span>
              <span>PLATAFORMA CMP (CONSENT MANAGEMENT)</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Gestão de Consentimento e Purificação de Telemetria
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Garantia de conformidade com o Artigo 7º da LGPD. Se o titular revogar o consentimento de cookies ou fingerprint, o motor expurga os dados comportamentais sem interromper a análise do risco estrutural do Pix.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block mb-0.5">Estado Geral CMP:</span>
            <span className={`font-bold ${cmpState.userRevokedAll ? 'text-rose-400' : 'text-emerald-400'}`}>
              {cmpState.userRevokedAll ? 'REVOGADO PELO TITULAR' : 'AUTORIZADO COM SANITIZAÇÃO'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split: CMP Toggles & Sanitization Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CMP Category Toggles (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Controles da Plataforma CMP</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Art. 7º LGPD</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* Revoke All Toggle */}
            <div className={`p-4 rounded-xl border transition-all ${
              cmpState.userRevokedAll 
                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">Revogar Todo o Consentimento (Bloqueio Total CMP)</span>
                <button
                  onClick={() => handleToggleCategory('userRevokedAll')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    cmpState.userRevokedAll ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {cmpState.userRevokedAll ? 'Ativo' : 'Revogar'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Simula o bloqueio total de cookies e fingerprint pelo titular. O motor opera em modo restrito estritamente com base em dados de conta e topologia de grafos.
              </p>
            </div>

            {/* Category Items */}
            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Telemetria Comportamental</span>
                  <span className="text-[10px] text-slate-400">Cadência de digitação e navegação</span>
                </div>
                <input
                  type="checkbox"
                  checked={cmpState.behavioralTelemetry}
                  onChange={() => handleToggleCategory('behavioralTelemetry')}
                  className="w-4 h-4 rounded border-slate-700 accent-emerald-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Fingerprint de Dispositivo</span>
                  <span className="text-[10px] text-slate-400">Identificador do aparelho e emuladores</span>
                </div>
                <input
                  type="checkbox"
                  checked={cmpState.deviceFingerprint}
                  onChange={() => handleToggleCategory('deviceFingerprint')}
                  className="w-4 h-4 rounded border-slate-700 accent-emerald-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Geolocalização de IP</span>
                  <span className="text-[10px] text-slate-400">Mapeamento de subrede e VPN</span>
                </div>
                <input
                  type="checkbox"
                  checked={cmpState.ipGeolocation}
                  onChange={() => handleToggleCategory('ipGeolocation')}
                  className="w-4 h-4 rounded border-slate-700 accent-emerald-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Live Sanitization Transformation Engine (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <span>Simulador do Purificador Criptográfico em Rust</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">HMAC-SHA256 Salted</span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Input Data */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-400 block text-[11px] uppercase font-mono">
                Dados Brutos do Payload (Antes da Sanitização)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block text-[10px] mb-0.5">CPF do Cliente</label>
                  <input
                    type="text"
                    value={rawCpf}
                    onChange={(e) => setRawCpf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] mb-0.5">Nome Completo</label>
                  <input
                    type="text"
                    value={rawName}
                    onChange={(e) => setRawName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] mb-0.5">IP de Origem</label>
                  <input
                    type="text"
                    value={rawIp}
                    onChange={(e) => setRawIp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] mb-0.5">Fingerprint Dispositivo</label>
                  <input
                    type="text"
                    value={rawDevice}
                    onChange={(e) => setRawDevice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Output Transformed Data */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/90 space-y-3 font-mono">
              <span className="font-semibold text-emerald-400 block text-[11px] uppercase">
                Payload Purificado Enviado para Avaliação do Motor
              </span>

              <div className="space-y-2 text-[11px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">CPF Anonymized (HMAC):</span>
                  <span className="text-emerald-300 font-bold truncate max-w-xs">{anonCpf}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Nome Pessoal:</span>
                  <span className="text-rose-400 font-bold">[EXPURGADO_NOME_NAO_ARMAZENADO]</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">IP Mascarado:</span>
                  <span className="text-cyan-300 font-bold">{anonIp}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Fingerprint Dispositivo:</span>
                  <span className={`font-bold ${cmpState.userRevokedAll ? 'text-rose-400' : 'text-amber-300'}`}>
                    {finalDevice}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Guarantee Badge */}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p>
                Garantia Jurídica e Regulatória: A anonimização irreversível por HMAC-SHA256 impede o vazamento de PII em spans de log e atende integralmente ao Bacen e à ANPD.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
