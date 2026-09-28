import { PixTransactionInput, EvaluationResult, LatencyBreakdown, RiskDecision, McpRpcMessage } from '../types';
import { INITIAL_NODES, INITIAL_EDGES } from '../data/mockFraudGraph';
import { analyzePixThreatWithGemini, generateCypherQueryWithGemini } from './geminiService';

export function simulateSub8msPipeline(tx: PixTransactionInput): EvaluationResult {
  const startTime = performance.now();

  // 1. LGPD Scrubbing (< 0.4ms)
  const lgpdStart = performance.now();
  const anonymizedSenderCpf = tx.senderCpf.replace(/(\d{3})\d{6}(\d{2})/, '$1.***.***-$2');
  const anonymizedIp = tx.ipAddress.split('.').slice(0, 2).join('.') + '.*.***';
  const telemetryPurgedByLgpd = tx.cmpConsent.userRevokedAll || !tx.cmpConsent.behavioralTelemetry;
  const lgpdEnd = performance.now();
  const lgpdUs = Math.round((lgpdEnd - lgpdStart) * 1000) + 180; // Add simulated ultra-fast CPU cycles (microsecond scale)

  // 2. GraphRAG MCP Lookup (< 2.2ms)
  const graphStart = performance.now();
  const connectedMules = INITIAL_NODES.filter(n => n.type === 'MULE_RING');
  const graphDepth = connectedMules.length > 0 ? 3 : 1;
  const graphEnd = performance.now();
  const graphUs = Math.round((graphEnd - graphStart) * 1000) + 1750;

  // 3. Risk Score Matrix Calculation (< 1.8ms)
  const riskStart = performance.now();
  let score = 8.0;

  if (tx.amount > 10000) score += 30;
  if (tx.velocityLast5Min > 3) score += 25;
  if (connectedMules.length > 0 && tx.amount > 2000) score += 35;
  if (tx.recipientPixKey.includes('mule') || tx.recipientBank.includes('Nu') || tx.recipientBank.includes('C6')) {
    score += 15;
  }

  // Cap score 0 - 100
  score = Math.min(Math.max(score, 0), 100);

  let decision: RiskDecision = 'APROVADO';
  let bacenMarked = false;
  let medEligible = false;

  if (score >= 80) {
    decision = 'BLOQUEIO_TEMPORARIO_FUNDADA_SUSPEITA';
    bacenMarked = true;
    medEligible = true;
  } else if (score >= 50) {
    decision = 'DESAFIO_MFA_REQUERIDO';
  }

  if (tx.recipientCpf.includes('999') || tx.recipientPixKey.includes('bad')) {
    decision = 'REJEITADO_MULE_RING_CONFIRMADO';
    score = 99.0;
    bacenMarked = true;
  }

  const riskEnd = performance.now();
  const riskUs = Math.round((riskEnd - riskStart) * 1000) + 1200;

  // 4. Bacen & BPMN Validation (< 1.2ms)
  const bpmnStart = performance.now();
  const reasons: string[] = [];
  if (score > 75) reasons.push('Alta probabilidade de pertencimento a Anel de Laranjas (Mule Ring)');
  if (tx.amount > 10000) reasons.push('Atipicidade de valor em janela noturna ou alta velocidade');
  if (telemetryPurgedByLgpd) reasons.push('Consentimento CMP revogado pelo titular - Análise realizada estritamente por grafos de rede');
  if (tx.velocityLast5Min > 3) reasons.push(`Múltiplos lançamentos efetuados em janela de 5 min (${tx.velocityLast5Min} ops)`);

  if (reasons.length === 0) reasons.push('Transação dentro do perfil habitual do pagador');

  const bpmnEnd = performance.now();
  const bpmnUs = Math.round((bpmnEnd - bpmnStart) * 1000) + 950;

  // 5. CQRS Event Dispatch (< 0.8ms)
  const cqrsStart = performance.now();
  const mcpToolsInvoked = [
    'scrub_lgpd_telemetry',
    'query_pix_fraud_graph',
    'evaluate_transaction_context'
  ];
  const cqrsEnd = performance.now();
  const cqrsUs = Math.round((cqrsEnd - cqrsStart) * 1000) + 520;

  const totalUs = lgpdUs + graphUs + riskUs + bpmnUs + cqrsUs;

  const latency: LatencyBreakdown = {
    lgpdScrubMicroseconds: lgpdUs,
    graphRagMcpMicroseconds: graphUs,
    riskMatrixMicroseconds: riskUs,
    bacenBpmnMicroseconds: bpmnUs,
    cqrsDispatchMicroseconds: cqrsUs,
    totalMicroseconds: totalUs,
    p99SlaMet: totalUs <= 8000
  };

  return {
    transactionId: tx.transactionId,
    decision,
    riskScore: Number(score.toFixed(1)),
    reasons,
    anonymizedSenderCpf,
    anonymizedIp,
    telemetryPurgedByLgpd,
    latency,
    mcpToolsInvoked,
    graphTraversalDepth: graphDepth,
    bacenMarkedSuspicious: bacenMarked,
    medDisputeEligible: medEligible,
    timestamp: new Date().toISOString()
  };
}

export function handleMcpRpcRequest(msg: McpRpcMessage): McpRpcMessage {
  const now = new Date().toISOString();

  if (msg.method === 'tools/list') {
    return {
      id: msg.id,
      jsonrpc: '2.0',
      method: msg.method,
      timestamp: now,
      result: {
        tools: [
          {
            name: 'query_pix_fraud_graph',
            description: 'Travessia de grafo Cypher sub-2ms para identificação de contas laranja e nós infectados.',
            inputSchema: { type: 'object', properties: { cpf_hash: { type: 'string' } }, required: ['cpf_hash'] }
          },
          {
            name: 'evaluate_transaction_context',
            description: 'Gera a síntese de contexto de risco para os agentes de IA do PIX-SHIELD-QPO.',
            inputSchema: { type: 'object', properties: { transaction_id: { type: 'string' } }, required: ['transaction_id'] }
          }
        ]
      }
    };
  }

  if (msg.method === 'tools/call') {
    const toolName = msg.params?.name;
    if (toolName === 'query_pix_fraud_graph') {
      return {
        id: msg.id,
        jsonrpc: '2.0',
        method: msg.method,
        timestamp: now,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                mule_ring_detected: true,
                mule_ring_family: 'MULE_RING_SAO_PAULO_04',
                risk_score: 98.5,
                connected_accounts_count: 4,
                bacen_blocked: true,
                traversal_time_us: 1850
              }, null, 2)
            }
          ]
        }
      };
    }
  }

  return {
    id: msg.id,
    jsonrpc: '2.0',
    method: msg.method || 'unknown',
    timestamp: now,
    error: {
      code: -32601,
      message: `Método MCP '${msg.method}' não implementado`
    }
  };
}
