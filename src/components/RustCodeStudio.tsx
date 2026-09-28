import React, { useState } from 'react';
import { RUST_CODEBASE } from '../data/rustCodebase';
import { FileCode, Copy, Check, ShieldCheck, Cpu, Layers, Terminal, Search, Lock } from 'lucide-react';

export const RustCodeStudio: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(RUST_CODEBASE[0].id);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedFile = RUST_CODEBASE.find((f) => f.id === selectedFileId) || RUST_CODEBASE[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = RUST_CODEBASE.filter(
    (f) =>
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.layer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>ARQUITETURA RUST EM NÍVEL DE PRODUÇÃO</span>
              <span className="text-slate-600">·</span>
              <span>CLEAN CODE / DDD / CQRS</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Código-Fonte Rust de Alta Concorrência (<span className="text-emerald-400">&lt;8ms SLA</span>)
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Implementação completa em Rust assíncrono com Tokio runtime, semáforos de concorrência, tipos seguros, zero mocks/simulações e tratamento estrito de erros com <code className="text-emerald-300 font-mono">thiserror</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Arquivo Rust'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Studio Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File Navigation List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Módulos do Sistema
              </span>
              <span className="text-xs text-slate-500 font-mono">{RUST_CODEBASE.length} arquivos</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome ou camada..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          {/* File Items */}
          <div className="space-y-1.5">
            {filteredFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedFileId === file.id
                    ? 'bg-slate-800 border-emerald-500/50 shadow-md text-white'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-400">{file.fileName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {file.layer}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              </button>
            ))}
          </div>

          {/* Rust Compiler Safeguards Summary Box */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantias do Compilador Rust</span>
            </span>
            <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              <li>Zero blocos <code className="text-amber-400 font-mono">unsafe</code> em código de produção</li>
              <li>Métricas sem bloqueio via <code className="text-emerald-300 font-mono">AtomicU64</code></li>
              <li>SLA sub-8ms via <code className="text-cyan-300 font-mono">tokio::sync::Semaphore</code></li>
              <li>Sanitização LGPD HMAC-SHA256 em memória</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-bold">{selectedFile.filePath}</span>
            </div>
            <span className="text-slate-500">Camada: {selectedFile.layer}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-300">{selectedFile.description}</p>
          </div>

          {/* Code Viewer Panel */}
          <div className="relative bg-slate-950 rounded-xl border border-slate-800/90 p-4 font-mono text-xs overflow-x-auto max-h-[560px] leading-relaxed text-slate-300">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
