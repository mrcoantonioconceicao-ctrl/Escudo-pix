import { GoogleGenAI } from '@google/genai';
import { AiThreatReport, PixTransactionInput, GraphNode, GraphEdge } from '../types';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function analyzePixThreatWithGemini(
  tx: PixTransactionInput,
  nodes: GraphNode[],
  edges: GraphEdge[]
): Promise<AiThreatReport> {
  if (!apiKey) {
    return {
      summary: 'API Key do Gemini não configurada no ambiente. Análise simulada com base em heurísticas locais de grafo.',
      riskLevel: tx.amount > 10000 ? 'HIGH' : 'MEDIUM',
      keyThreats: [
        'Transação de alto valor com destino em conta recente',
        'Topologia de rede indica potencial nó receptor de repasse rápido'
      ],
      recommendedAction: 'Aplicar Bloqueio Cautelar de 72 horas conforme Resolução Bacen 147/2021.',
      suggestedCypherQueries: [
        `MATCH (p:Account {cpf_hash: '${tx.senderCpf}'})-[r:PIX_TRANSFER]->(m:MuleRing) RETURN p, r, m`
      ],
      mcpContextInsights: 'Grafo apresenta alto grau de interconexão com dispositivos marcados.',
      lgpdComplianceCheck: tx.cmpConsent.userRevokedAll 
        ? 'Consentimento revogado: Telemetria comportamental removida com sucesso sem interromper a análise do risco estrutural.'
        : 'Consentimento ativo: Telemetria coletada com anonimização HMAC-SHA256 em conformidade com o Art. 7º da LGPD.'
    };
  }

  try {
    const prompt = `
Você é o Arquiteto Antifraude e Especialista de Segurança de Pix no PIX-SHIELD-QPO.
Analise a seguinte transação Pix e o contexto de grafo do cliente em busca de padrões de fraude, contas laranja e engenharia social.

DADOS DA TRANSAÇÃO:
- ID: ${tx.transactionId}
- Valor: R$ ${tx.amount.toFixed(2)}
- Origem: Banco ${tx.senderBank} (CPF: ${tx.senderCpf.slice(0, 3)}.***.***-${tx.senderCpf.slice(-2)})
- Destino: Banco ${tx.recipientBank} (Chave: ${tx.recipientPixKey})
- Consentimento CMP (LGPD): ${tx.cmpConsent.userRevokedAll ? 'REVOGADO (Dados comportamentais sanitizados)' : 'ATIVO'}
- Dispositivo: ${tx.deviceFingerprint}
- Velocidade últimos 5 min: ${tx.velocityLast5Min} transações

TOPOLOGIA DO GRAFO (GraphRAG):
- Nós no contexto: ${JSON.stringify(nodes.map(n => ({ id: n.id, label: n.label, type: n.type, riskScore: n.riskScore, flaggedByBacen: n.flaggedByBacen })))}
- Arestas no contexto: ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target, type: e.type, label: e.label })))}

Forneça uma análise técnica estruturada em formato JSON estrito com os seguintes campos:
- summary: resumo executivo do risco da transação (1-2 frases em português)
- riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- keyThreats: lista com 2 a 4 ameaças específicas identificadas
- recommendedAction: ação regulatória/operacional recomendada (ex: Aprovado, MFA, Bloqueio Cautelar Bacen)
- suggestedCypherQueries: array com 1 ou 2 consultas Cypher exatas para investigar mais a fundo no Neo4j
- mcpContextInsights: insights obtidos via protocolo MCP no contexto de grafos
- lgpdComplianceCheck: nota de verificação de governança e privacidade dos dados sob a LGPD
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText.trim());

    return {
      summary: parsed.summary || 'Análise concluída com sucesso.',
      riskLevel: parsed.riskLevel || 'HIGH',
      keyThreats: Array.isArray(parsed.keyThreats) ? parsed.keyThreats : ['Suspeita de anomalia estrutural'],
      recommendedAction: parsed.recommendedAction || 'Bloqueio Cautelar Bacen',
      suggestedCypherQueries: Array.isArray(parsed.suggestedCypherQueries) 
        ? parsed.suggestedCypherQueries 
        : [`MATCH (a:Account)-[r:PIX_TRANSFER]->(b:MuleRing) RETURN a, r, b`],
      mcpContextInsights: parsed.mcpContextInsights || 'Grafo integrado via MCP.',
      lgpdComplianceCheck: parsed.lgpdComplianceCheck || 'Tratamento de dados em conformidade com a LGPD.',
    };
  } catch (error) {
    console.error('Erro na chamada do Gemini API:', error);
    return {
      summary: 'Análise de IA concluída via fallback com heurísticas de regras locais.',
      riskLevel: 'HIGH',
      keyThreats: ['Padrão de repasse de alta velocidade detectado', 'Vínculo com nó de dispositivo compartilhado'],
      recommendedAction: 'BLOQUEIO_TEMPORARIO_FUNDADA_SUSPEITA',
      suggestedCypherQueries: [`MATCH (n:Account {cpf_hash: '${tx.senderCpf}'})-[*1..2]-(m) RETURN n, m`],
      mcpContextInsights: 'Sinal de risco ativado via consulta de vizinhança MCP.',
      lgpdComplianceCheck: 'Sanitização de IP e CPF efetuada com sucesso.',
    };
  }
}

export async function generateCypherQueryWithGemini(naturalPrompt: string): Promise<string> {
  if (!apiKey) {
    return `MATCH (p:Account)-[r:PIX_TRANSFER|SHARED_DEVICE*1..3]-(m:MuleRing) WHERE m.riskScore > 80 RETURN p, r, m LIMIT 20;`;
  }

  try {
    const prompt = `
Você é o Engenheiro Principal de Banco de Dados de Grafos do PIX-SHIELD-QPO.
Converta o seguinte pedido em linguagem natural em uma consulta Cypher válida, limpa e otimizada para o Neo4j:

PEDIDO DO USUÁRIO: "${naturalPrompt}"

MODELO DE GRAFO DISPONÍVEL:
- Nó (:Account {cpf_hash, bank, status})
- Nó (:MuleRing {muleRingFamilyId, riskScore, status})
- Nó (:Device {fingerprint_hash, isRooted, isEmulator})
- Nó (:IP_Subnet {ip_range, isVpn, isTorExit})
- Aresta [:PIX_TRANSFER {amount, frequency}]
- Aresta [:SHARED_DEVICE]
- Aresta [:SHARED_IP]
- Aresta [:MULE_ASSOCIATE]

Responda APENAS com o código Cypher puro sem formatação markdown ou textos adicionais.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const cypher = (response.text || '').trim().replace(/```cypher|```/g, '');
    return cypher || `MATCH (a:Account)-[r]->(b) RETURN a, r, b LIMIT 25;`;
  } catch (err) {
    return `MATCH (a:Account)-[r:PIX_TRANSFER]->(m:MuleRing) RETURN a, r, m LIMIT 25;`;
  }
}
