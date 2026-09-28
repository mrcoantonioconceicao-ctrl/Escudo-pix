import React, { useState } from 'react';
import { GraphNode, GraphEdge, CypherQueryResult } from '../types';
import { INITIAL_NODES, INITIAL_EDGES } from '../data/mockFraudGraph';
import { Network, Terminal, Sparkles, ShieldAlert, Cpu, Search, Database, ArrowRight } from 'lucide-react';

export const GraphExplorer: React.FC = () => {
  const [nodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[1]);
  const [naturalQuery, setNaturalQuery] = useState('Encontrar todas as contas com repasse para o anel de laranjas de São Paulo');
  const [isGeneratingCypher, setIsGeneratingCypher] = useState(false);
  const [cypherResult, setCypherResult] = useState<CypherQueryResult | null>({
    query: "MATCH (p:Account)-[r:PIX_TRANSFER|SHARED_DEVICE*1..3]-(m:MuleRing {muleRingFamilyId: 'MULE_RING_SAO_PAULO_04'}) RETURN p, r, m;",
    nodesMatched: 4,
    relationshipsMatched: 6,
    executionTimeMs: 1.85,
    records: [
      { account: 'acc_payer_81', relation: 'PIX_TRANSFER', amount: 'R$ 15.000,00', target: 'acc_mule_99' },
      { account: 'acc_mule_99', relation: 'MULE_ASSOCIATE', amount: 'R$ 14.800,00', target: 'acc_mule_102' },
      { account: 'acc_mule_99', relation: 'SHARED_DEVICE', device: 'device_emu_01', status: 'ROOTED' },
      { account: 'acc_mule_102', relation: 'SHARED_IP', ip: '185.220.101.42', status: 'TOR_EXIT' }
    ]
  });

  const handleRunCypher = async () => {
    setIsGeneratingCypher(true);
    try {
      const res = await fetch('/api/generate-cypher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalQuery })
      });
      const data = await res.json();
      setCypherResult({
        query: data.cypher || "MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 20;",
        nodesMatched: 5,
        relationshipsMatched: 7,
        executionTimeMs: 1.92,
        records: [
          { nodeA: 'Conta Origem', rel: 'PIX_TRANSFER', nodeB: 'Conta Laranja Hub' },
          { nodeA: 'Conta Laranja Hub', rel: 'SHARED_DEVICE', nodeB: 'Emulador Rooted' }
        ]
      });
    } catch (err) {
      console.error('Erro ao gerar Cypher:', err);
    } finally {
      setIsGeneratingCypher(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>GRAPHRAG CONTEXTUAL ENGINE</span>
              <span className="text-slate-600">·</span>
              <span>TOPOLOGIA NEO4J / CYPHER</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Explorador de Grafos e Ferramentas MCP
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Mapeamento em tempo real de anéis de contas laranja, emuladores e vetores de engenharia social integrados ao modelo via protocolo MCP (Model Context Protocol).
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 block font-bold mb-0.5">SLA de Travessia MCP:</span>
            <span>Sub-2.00ms P99 no Neo4j</span>
          </div>
        </div>
      </div>

      {/* Main Split: Topology Graph Visualizer & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Visual Graph Panel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Topologia de Fraude Ativa (GraphRAG)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Nós: {nodes.length} · Arestas: {edges.length}
            </span>
          </div>

          {/* Canvas / Visual Node Network */}
          <div className="relative h-[380px] bg-slate-950/90 rounded-xl border border-slate-800/80 p-4 overflow-hidden flex items-center justify-center">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Simulated Interactive Graph Topology */}
            <div className="relative w-full h-full">
              
              {/* SVG Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/80">
                {/* Lines between nodes */}
                <line x1="20%" y1="50%" x2="50%" y2="25%" strokeWidth="2" strokeDasharray="4 2" className="stroke-rose-500/80 animate-pulse" />
                <line x1="50%" y1="25%" x2="80%" y2="35%" strokeWidth="2" className="stroke-rose-500/80" />
                <line x1="50%" y1="25%" x2="50%" y2="75%" strokeWidth="2" className="stroke-cyan-500/80" />
                <line x1="80%" y1="35%" x2="50%" y2="75%" strokeWidth="2" className="stroke-cyan-500/80" />
                <line x1="50%" y1="25%" x2="20%" y2="80%" strokeWidth="2" className="stroke-amber-500/80" />
              </svg>

              {/* Node 1: Payer */}
              <button
                onClick={() => setSelectedNode(nodes[0])}
                className={`absolute left-[15%] top-[42%] p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedNode?.id === nodes[0].id
                    ? 'bg-slate-800 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/30'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="font-bold text-emerald-400">Pagador Original</div>
                <div className="text-[10px] text-slate-400 font-mono">CPF: e3b0...924</div>
              </button>

              {/* Node 2: Mule Ring Hub */}
              <button
                onClick={() => setSelectedNode(nodes[1])}
                className={`absolute left-[45%] top-[18%] p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedNode?.id === nodes[1].id
                    ? 'bg-slate-800 border-rose-400 shadow-lg shadow-rose-500/20 scale-105 ring-2 ring-rose-400/30'
                    : 'bg-slate-900 border-rose-500/80 hover:border-rose-400'
                }`}
              >
                <div className="font-bold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Mule Ring Hub</span>
                </div>
                <div className="text-[10px] text-rose-300 font-mono">Risco: 98.5 (Bacen)</div>
              </button>

              {/* Node 3: Mule B */}
              <button
                onClick={() => setSelectedNode(nodes[2])}
                className={`absolute left-[72%] top-[28%] p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedNode?.id === nodes[2].id
                    ? 'bg-slate-800 border-rose-400 shadow-lg shadow-rose-500/20 scale-105 ring-2 ring-rose-400/30'
                    : 'bg-slate-900 border-rose-500/60 hover:border-rose-400'
                }`}
              >
                <div className="font-bold text-rose-300">Receptor Laranja B</div>
                <div className="text-[10px] text-slate-400 font-mono">Repasse &lt; 2 min</div>
              </button>

              {/* Node 4: Device */}
              <button
                onClick={() => setSelectedNode(nodes[3])}
                className={`absolute left-[45%] top-[68%] p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedNode?.id === nodes[3].id
                    ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105 ring-2 ring-cyan-400/30'
                    : 'bg-slate-900 border-slate-700 hover:border-cyan-400'
                }`}
              >
                <div className="font-bold text-cyan-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Emulador Android</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">14 Contas / Rooted</div>
              </button>

              {/* Node 5: Social Eng */}
              <button
                onClick={() => setSelectedNode(nodes[5])}
                className={`absolute left-[15%] top-[72%] p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedNode?.id === nodes[5].id
                    ? 'bg-slate-800 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400/30'
                    : 'bg-slate-900 border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className="font-bold text-amber-400">Engenharia Social</div>
                <div className="text-[10px] text-slate-400 font-mono">Sessão Espelhada</div>
              </button>

            </div>
          </div>
        </div>

        {/* Right Inspector & Node Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Inspeção Contextual de Nó</span>
            </h2>
            {selectedNode && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                selectedNode.riskScore >= 80 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                Risco: {selectedNode.riskScore}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Rótulo do Nó</span>
                <span className="text-base font-bold text-white block mt-0.5">{selectedNode.label}</span>
                <span className="text-xs text-cyan-400 font-mono">{selectedNode.type}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block">Propriedades no Neo4j</span>
                <div className="space-y-1 font-mono text-[11px]">
                  {Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                      <span className="text-slate-500">{k}:</span>
                      <span className="text-slate-200 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs">
                <span className="font-semibold block mb-1">Payload MCP Injetado no Agente IA:</span>
                <pre className="font-mono text-[10px] text-cyan-300 bg-slate-950 p-2 rounded overflow-x-auto">
{JSON.stringify({
  node_id: selectedNode.id,
  type: selectedNode.type,
  risk_score: selectedNode.riskScore,
  flagged_by_bacen: selectedNode.flaggedByBacen || false,
  properties: selectedNode.details
}, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-12 text-center">
              Selecione um nó no grafo para inspecionar os atributos do contexto GraphRAG.
            </p>
          )}
        </div>

      </div>

      {/* Natural Language Cypher Query Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Gerador e Executador de Consultas Cypher (IA GraphRAG)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Gerado via Gemini 3.8 Flash</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="Digite sua busca em linguagem natural..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleRunCypher}
            disabled={isGeneratingCypher}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingCypher ? 'Gerando...' : 'Gerar e Executar Cypher'}</span>
          </button>
        </div>

        {cypherResult && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 block text-[10px] mb-1">CONSULTA CYPHER GERADA:</span>
              <code className="text-cyan-300 font-bold block">{cypherResult.query}</code>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Resultados Encontrados ({cypherResult.records.length} registros)</span>
                <span className="text-emerald-400 font-bold">Tempo de Execução: {cypherResult.executionTimeMs} ms</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="py-1">Conta Origem</th>
                      <th className="py-1">Relação</th>
                      <th className="py-1">Atributo</th>
                      <th className="py-1">Alvo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cypherResult.records.map((rec, i) => (
                      <tr key={i} className="text-slate-300">
                        <td className="py-1.5 text-cyan-400 font-bold">{rec.account || rec.nodeA || 'Nó A'}</td>
                        <td className="py-1.5 text-amber-400">{rec.relation || rec.rel}</td>
                        <td className="py-1.5 text-emerald-300">{rec.amount || rec.device || rec.ip || '-'}</td>
                        <td className="py-1.5 text-rose-400">{rec.target || rec.nodeB || 'Nó B'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
