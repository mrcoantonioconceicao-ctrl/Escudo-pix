/*
 * Project: PIX-SHIELD-QPO
 * Author: Marco Antônio Conceição <Mrcoantonioconceicao@gmail.com>
 * Copyright (c) 2026 Marco Antônio Conceição. All rights reserved.
 * 
 * Mission-Critical Real-Time Pix Anti-Fraud Engine with Sub-8ms SLA,
 * GraphRAG via MCP Protocol, Rust DDD/CQRS Architecture, and Bacen/LGPD Governance.
 */

export type RiskDecision = 
  | 'APROVADO' 
  | 'DESAFIO_MFA_REQUERIDO' 
  | 'BLOQUEIO_TEMPORARIO_FUNDADA_SUSPEITA' 
  | 'REJEITADO_MULE_RING_CONFIRMADO';

export interface CMPConsentState {
  behavioralTelemetry: boolean;
  deviceFingerprint: boolean;
  ipGeolocation: boolean;
  networkVelocity: boolean;
  userRevokedAll: boolean;
}

export interface PixTransactionInput {
  transactionId: string;
  senderCpf: string;
  senderName: string;
  senderBank: string;
  recipientPixKey: string;
  recipientCpf: string;
  recipientName: string;
  recipientBank: string;
  amount: number;
  pixType: 'EVP' | 'CPF' | 'EMAIL' | 'PHONE' | 'ACCOUNT';
  ipAddress: string;
  deviceFingerprint: string;
  timestamp: string;
  velocityLast5Min: number;
  cmpConsent: CMPConsentState;
}

export interface LatencyBreakdown {
  lgpdScrubMicroseconds: number;     // e.g. 280 µs (0.28 ms)
  graphRagMcpMicroseconds: number;   // e.g. 1950 µs (1.95 ms)
  riskMatrixMicroseconds: number;     // e.g. 1420 µs (1.42 ms)
  bacenBpmnMicroseconds: number;     // e.g. 1100 µs (1.10 ms)
  cqrsDispatchMicroseconds: number;  // e.g. 650 µs (0.65 ms)
  totalMicroseconds: number;         // e.g. 5400 µs (5.40 ms)
  p99SlaMet: boolean;
}

export interface EvaluationResult {
  transactionId: string;
  decision: RiskDecision;
  riskScore: number; // 0.0 to 100.0
  reasons: string[];
  anonymizedSenderCpf: string;
  anonymizedIp: string;
  telemetryPurgedByLgpd: boolean;
  latency: LatencyBreakdown;
  mcpToolsInvoked: string[];
  graphTraversalDepth: number;
  bacenMarkedSuspicious: boolean;
  medDisputeEligible: boolean;
  timestamp: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'ACCOUNT' | 'MULE_RING' | 'DEVICE' | 'IP_SUBNET' | 'SOCIAL_ENG';
  riskScore: number;
  details: Record<string, string | number | boolean>;
  flaggedByBacen?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'PIX_TRANSFER' | 'SHARED_DEVICE' | 'SHARED_IP' | 'MULE_ASSOCIATE' | 'SUSPECT_LINK';
  label: string;
  amount?: number;
  frequency?: number;
}

export interface CypherQueryResult {
  query: string;
  nodesMatched: number;
  relationshipsMatched: number;
  executionTimeMs: number;
  records: Array<Record<string, any>>;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface McpRpcMessage {
  id: string;
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, any>;
  result?: Record<string, any>;
  error?: { code: number; message: string };
  timestamp: string;
}

export interface RustCodeFile {
  id: string;
  fileName: string;
  filePath: string;
  layer: 'Domain' | 'Infrastructure' | 'CQRS' | 'Rules';
  description: string;
  code: string;
}

export interface BpmnStep {
  id: string;
  title: string;
  description: string;
  actor: 'PIX-SHIELD-QPO' | 'BACEN-SPI' | 'BANCO_RECEBEDOR' | 'BANCO_PAGADOR';
  slaHours?: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'BLOCKED';
  legalBasis: string;
}

export interface AiThreatReport {
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  keyThreats: string[];
  recommendedAction: string;
  suggestedCypherQueries: string[];
  mcpContextInsights: string;
  lgpdComplianceCheck: string;
}
