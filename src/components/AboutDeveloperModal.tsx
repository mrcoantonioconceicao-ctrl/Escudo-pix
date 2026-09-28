import React from 'react';
import { User, Mail, Phone, Github, ExternalLink, X, ShieldAlert, Code2, Award } from 'lucide-react';

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDeveloperModal: React.FC<AboutDeveloperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Sobre o Desenvolvedor</h2>
              <span className="text-xs text-slate-400 font-mono">PIX-SHIELD-QPO Lead Architect</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Developer Profile Card */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-lg font-bold text-white">Marco Antônio Conceição</h3>
            <p className="text-xs text-emerald-400 font-mono font-medium">
              Arquiteto-Chefe Corporativo &amp; Engenheiro Principal de Software (Rust / GraphRAG)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Especialista em motores de alta performance de missão crítica para transações financeiras em tempo real (&lt;8ms SLA), arquiteturas distribuídas descentralizadas, concorrência segura e integração contínua de IA via Protocolo MCP.
            </p>
          </div>

          {/* Contact Links */}
          <div className="space-y-2 text-xs">
            
            {/* Email */}
            <a
              href="mailto:mrcoantonioconceicao@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">E-mail Corporativo</span>
                  <span className="font-mono text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    mrcoantonioconceicao@gmail.com
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5547992345371"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">WhatsApp Direto</span>
                  <span className="font-mono text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    +55 (47) 99234-5371
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Mrcoantonioconceicao-ctrl"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Perfil GitHub</span>
                  <span className="font-mono text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Mrcoantonioconceicao-ctrl
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </a>

          </div>

          {/* Highlights */}
          <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Engine Rust &amp; Tokio</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">GraphRAG &amp; Bacen</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
