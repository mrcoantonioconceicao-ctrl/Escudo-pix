import React, { useState } from 'react';
import { McpTool, McpRpcMessage } from '../types';
import { MCP_TOOLS_LIST } from '../data/mockFraudGraph';
import { Terminal, Send, Cpu, CheckCircle2, Code2 } from 'lucide-react';

export const McpProtocolViewer: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<McpTool>(MCP_TOOLS_LIST[0]);
  const [rpcHistory, setRpcHistory] = useState<McpRpcMessage[]>([
    {
      id: 'rpc-101',
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'query_pix_fraud_graph',
        arguments: { cpf_hash: 'e3b0c44298fc1c149afbf4c8996fb924', max_depth: 3 }
      },
      result: {
        content: [
          {
            type: 'text',
            text: '{"mule_ring_detected": true, "connected_accounts": 4, "risk_level": "HIGH"}'
          }
        ]
      },
      timestamp: new Date().toISOString()
    }
  ]);

  const [isSending, setIsSending] = useState(false);

  const handleSendRpc = async () => {
    setIsSending(true);
    const msgId = `rpc-${Math.floor(Math.random() * 900 + 100)}`;
    const rpcPayload: McpRpcMessage = {
      id: msgId,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: selectedTool.name,
        arguments: {
          cpf_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
          transaction_id: 'TX-PIX-2026-8801'
        }
      },
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/mcp/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcPayload)
      });
      const responseData: McpRpcMessage = await res.json();
      setRpcHistory((prev) => [responseData, ...prev]);
    } catch (err) {
      console.error('Erro na chamada MCP RPC:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>MODEL CONTEXT PROTOCOL (MCP) JSON-RPC 2.0</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Console e Definição de Ferramentas MCP
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Interface oficial de comunicação entre o agente de inteligência artificial e os adaptadores de banco de dados de grafos e serviços de segurança em tempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: Tool List & RPC Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tool Schema List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Ferramentas MCP Registradas</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{MCP_TOOLS_LIST.length} disponíveis</span>
          </div>

          <div className="space-y-2 text-xs">
            {MCP_TOOLS_LIST.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setSelectedTool(tool)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedTool.name === tool.name
                    ? 'bg-slate-800 border-cyan-500/60 shadow-md text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="font-mono text-xs font-bold text-cyan-400 mb-1">{tool.name}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{tool.description}</p>
              </button>
            ))}
          </div>

          {/* Trigger RPC Call Button */}
          <button
            onClick={handleSendRpc}
            disabled={isSending}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Enviando JSON-RPC...' : `Disparar Chamada RPC (${selectedTool.name})`}</span>
          </button>
        </div>

        {/* Live RPC Message Stream (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Histórico de Mensagens JSON-RPC 2.0</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Stream MCP</span>
          </div>

          <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
            {rpcHistory.map((msg, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-1">
                  <span>RPC ID: {msg.id}</span>
                  <span>{msg.timestamp.slice(11, 19)}</span>
                </div>
                <pre className="text-[11px] text-cyan-300 overflow-x-auto">
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
