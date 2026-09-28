import { RustCodeFile } from '../types';

export const RUST_CODEBASE: RustCodeFile[] = [
  {
    id: 'domain_entity',
    fileName: 'entity.rs',
    filePath: 'src/domain/entity.rs',
    layer: 'Domain',
    description: 'Entidades de Domínio DDD, Objetos de Valor e Eventos de Domínio Pix com garantias de imutabilidade.',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo de Domínio: Entidades e Objetos de Valor DDD

use std::fmt;
use std::str::FromStr;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DomainError {
    #[error("CPF inválido para chave Pix: {0}")]
    InvalidCpf(String),
    #[error("Valor de transação inválido: R$ {0:.2}")]
    InvalidAmount(f64),
    #[error("Chave Pix com formato incompatível: {0}")]
    InvalidPixKeyFormat(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CpfHash(pub String);

impl CpfHash {
    pub fn from_raw_cpf(raw_cpf: &str, secret_salt: &[u8]) -> Self {
        use hmac::{Hmac, Mac};
        use sha2::Sha256;

        type HmacSha256 = Hmac<Sha256>;
        let mut mac = HmacSha256::new_from_slice(secret_salt)
            .expect("HMAC pode aceitar chaves de qualquer tamanho");
        mac.update(raw_cpf.as_bytes());
        let result = mac.finalize();
        CpfHash(hex::encode(result.into_bytes()))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PixKeyType {
    Cpf,
    Email,
    Phone,
    Evp,
    Account,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PixKey {
    pub key_type: PixKeyType,
    pub value: String,
}

impl PixKey {
    pub fn new(key_type: PixKeyType, value: String) -> Result<Self, DomainError> {
        if value.trim().is_empty() {
            return Err(DomainError::InvalidPixKeyFormat("Chave Pix vazia".into()));
        }
        Ok(Self { key_type, value })
    }
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub struct RiskScore(pub f64);

impl RiskScore {
    pub fn new(score: f64) -> Result<Self, DomainError> {
        if !(0.0..=100.0).contains(&score) {
            return Err(DomainError::InvalidAmount(score));
        }
        Ok(Self(score))
    }

    pub fn is_fundada_suspeita(&self) -> bool {
        self.0 >= 85.0
    }

    pub fn requires_mfa_challenge(&self) -> bool {
        self.0 >= 60.0 && self.0 < 85.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CMPConsent {
    pub behavioral_telemetry: bool,
    pub device_fingerprint: bool,
    pub ip_geolocation: bool,
    pub network_velocity: bool,
    pub revoked_all: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PixTransaction {
    pub id: String,
    pub sender_cpf_hash: CpfHash,
    pub sender_bank_code: String,
    pub recipient_key: PixKey,
    pub recipient_cpf_hash: CpfHash,
    pub recipient_bank_code: String,
    pub amount_cents: u64,
    pub timestamp: DateTime<Utc>,
    pub anonymized_ip: String,
    pub device_fingerprint_hash: Option<String>,
    pub cmp_consent: CMPConsent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DomainEvent {
    TransactionEvaluated {
        transaction_id: String,
        score: f64,
        latency_us: u64,
    },
    FundadaSuspeitaFlagged {
        transaction_id: String,
        sender_hash: CpfHash,
        recipient_hash: CpfHash,
        amount_cents: u64,
        bacen_retention_until: DateTime<Utc>,
    },
    MuleRingDetected {
        mule_account_hash: CpfHash,
        topology_degree: usize,
    },
}
`
  },
  {
    id: 'domain_rules',
    fileName: 'rules.rs',
    filePath: 'src/domain/rules.rs',
    layer: 'Rules',
    description: 'Motor Assíncrono Tokio com Semáforos e Métricas Atômicas para Garantia do SLA P99 < 8ms.',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo de Regras: Avaliação Concorrente de Alto Desempenho

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::Semaphore;
use thiserror::Error;

use crate::domain::entity::{CMPConsent, DomainEvent, PixTransaction, RiskScore};

#[derive(Debug, Error)]
pub enum EngineError {
    #[error("Tempo limite excedido no SLA de 8ms para transação {0}")]
    SlaTimeout(String),
    #[error("Falha na consulta GraphRAG: {0}")]
    GraphRagFailure(String),
    #[error("Violação de Governança LGPD durante limpeza de dados: {0}")]
    LgpdScrubError(String),
}

pub struct EngineMetrics {
    pub total_evaluations: AtomicU64,
    pub total_latencies_us: AtomicU64,
    pub fundada_suspeita_count: AtomicU64,
}

impl EngineMetrics {
    pub fn new() -> Self {
        Self {
            total_evaluations: AtomicU64::new(0),
            total_latencies_us: AtomicU64::new(0),
            fundada_suspeita_count: AtomicU64::new(0),
        }
    }

    pub fn record_latency(&self, duration_us: u64, is_suspicious: bool) {
        self.total_evaluations.fetch_add(1, Ordering::Relaxed);
        self.total_latencies_us.fetch_add(duration_us, Ordering::Relaxed);
        if is_suspicious {
            self.fundada_suspeita_count.fetch_add(1, Ordering::Relaxed);
        }
    }
}

pub struct AntiFraudEngine {
    concurrency_semaphore: Arc<Semaphore>,
    metrics: Arc<EngineMetrics>,
}

impl AntiFraudEngine {
    pub fn new(max_concurrent_tasks: usize) -> Self {
        Self {
            concurrency_semaphore: Arc::new(Semaphore::new(max_concurrent_tasks)),
            metrics: Arc::new(EngineMetrics::new()),
        }
    }

    pub async fn evaluate(
        &self,
        tx: PixTransaction,
        graph_degree: usize,
        is_known_mule_ring: bool,
    ) -> Result<(RiskScore, Vec<DomainEvent>), EngineError> {
        let start = Instant::now();
        let _permit = self
            .concurrency_semaphore
            .acquire()
            .await
            .expect("Semáforo do motor não deve ser fechado");

        let mut base_score: f64 = 5.0;

        // 1. Verificação LGPD Art. 7º: Se consentimento revogado, ignora telemetria comportamental
        if tx.cmp_consent.revoked_all {
            // Recuo seguro sem quebrar o pipeline, ponderando apenas estrutura de conta e grafo
            if is_known_mule_ring {
                base_score += 75.0;
            }
            if graph_degree > 3 {
                base_score += 15.0 * (graph_degree as f64);
            }
        } else {
            // Pondera telemetria comportamental autorizada pelo CMP
            if tx.cmp_consent.network_velocity && tx.amount_cents > 500_000 {
                base_score += 25.0;
            }
            if is_known_mule_ring {
                base_score += 80.0;
            }
            if graph_degree >= 2 {
                base_score += 12.0 * (graph_degree as f64);
            }
        }

        let final_score = base_score.min(100.0);
        let risk_score = RiskScore::new(final_score).unwrap();

        let elapsed_us = start.elapsed().as_micros() as u64;
        if elapsed_us > 8000 {
            return Err(EngineError::SlaTimeout(tx.id.clone()));
        }

        let is_suspicious = risk_score.is_fundada_suspeita();
        self.metrics.record_latency(elapsed_us, is_suspicious);

        let mut events = vec![DomainEvent::TransactionEvaluated {
            transaction_id: tx.id.clone(),
            score: final_score,
            latency_us: elapsed_us,
        }];

        if is_suspicious {
            events.push(DomainEvent::FundadaSuspeitaFlagged {
                transaction_id: tx.id,
                sender_hash: tx.sender_cpf_hash,
                recipient_hash: tx.recipient_cpf_hash,
                amount_cents: tx.amount_cents,
                bacen_retention_until: chrono::Utc::now() + chrono::Duration::hours(72),
            });
        }

        Ok((risk_score, events))
    }
}
`
  },
  {
    id: 'infra_mcp_server',
    fileName: 'mcp_server.rs',
    filePath: 'src/infrastructure/mcp_server.rs',
    layer: 'Infrastructure',
    description: 'Servidor Protocolo MCP (Model Context Protocol) JSON-RPC 2.0 para Injeção de Contexto de Grafos.',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo MCP: Servidor Protocolo MCP JSON-RPC 2.0 para GraphRAG

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::sync::mpsc;
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub id: Value,
    pub method: String,
    pub params: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub id: Value,
    pub result: Option<Value>,
    pub error: Option<JsonRpcError>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
}

#[derive(Debug, Error)]
pub enum McpError {
    #[error("Método MCP não suportado: {0}")]
    MethodNotFound(String),
    #[error("Parâmetros inválidos: {0}")]
    InvalidParams(String),
}

pub struct McpProtocolServer;

impl McpProtocolServer {
    pub fn handle_request(req: JsonRpcRequest) -> JsonRpcResponse {
        match req.method.as_str() {
            "tools/list" => {
                let tools = json!({
                    "tools": [
                        {
                            "name": "query_pix_fraud_graph",
                            "description": "Executa travessia Cypher sub-2ms para verificar topologias de contas laranja e dispositivos compartilhados.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "cpf_hash": { "type": "string" },
                                    "max_depth": { "type": "integer", "default": 3 }
                                },
                                "required": ["cpf_hash"]
                            }
                        },
                        {
                            "name": "evaluate_transaction_context",
                            "description": "Gera síntese estruturada de contexto de risco GraphRAG para o modelo LLM/Antigravity.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "transaction_id": { "type": "string" }
                                },
                                "required": ["transaction_id"]
                            }
                        }
                    ]
                });
                JsonRpcResponse {
                    jsonrpc: "2.0".into(),
                    id: req.id,
                    result: Some(tools),
                    error: None,
                }
            }
            "tools/call" => {
                if let Some(params) = req.params {
                    let tool_name = params.get("name").and_then(|n| n.as_str()).unwrap_or("");
                    match tool_name {
                        "query_pix_fraud_graph" => {
                            let result = json!({
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "{\\"mule_ring_detected\\": true, \\"connected_accounts\\": 4, \\"risk_level\\": \\"HIGH\\"}"
                                    }
                                ]
                            });
                            JsonRpcResponse {
                                jsonrpc: "2.0".into(),
                                id: req.id,
                                result: Some(result),
                                error: None,
                            }
                        }
                        _ => JsonRpcResponse {
                            jsonrpc: "2.0".into(),
                            id: req.id,
                            result: None,
                            error: Some(JsonRpcError {
                                code: -32601,
                                message: format!("Ferramenta MCP desconhecida: {}", tool_name),
                            }),
                        },
                    }
                } else {
                    JsonRpcResponse {
                        jsonrpc: "2.0".into(),
                        id: req.id,
                        result: None,
                        error: Some(JsonRpcError {
                            code: -32602,
                            message: "Parâmetros ausentes na chamada de ferramenta".into(),
                        }),
                    }
                }
            }
            _ => JsonRpcResponse {
                jsonrpc: "2.0".into(),
                id: req.id,
                result: None,
                error: Some(JsonRpcError {
                    code: -32601,
                    message: format!("Método MCP não encontrado: {}", req.method),
                }),
            },
        }
    }
}
`
  },
  {
    id: 'infra_graphrag_adapter',
    fileName: 'graphrag_adapter.rs',
    filePath: 'src/infrastructure/graphrag_adapter.rs',
    layer: 'Infrastructure',
    description: 'Adaptador Async de Banco de Dados de Grafos (Neo4j / Cypher) com Limite de Timeout Sub-2ms.',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo GraphRAG: Adaptador Cypher/Neo4j com Timeout Sub-2ms

use std::collections::HashMap;
use std::time::Duration;
use tokio::time::timeout;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum GraphError {
    #[error("Timeout na travessia de grafo Cypher (>2ms)")]
    QueryTimeout,
    #[error("Erro de comunicação com o cluster de grafos: {0}")]
    ConnectionError(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNodeContext {
    pub cpf_hash: String,
    pub is_mule_ring: bool,
    pub degree: usize,
    pub connected_devices: Vec<String>,
    pub shared_ips: Vec<String>,
}

pub struct GraphRagAdapter {
    neo4j_uri: String,
}

impl GraphRagAdapter {
    pub fn new(neo4j_uri: impl Into<String>) -> Self {
        Self {
            neo4j_uri: neo4j_uri.into(),
        }
    }

    pub async fn fetch_node_topology(
        &self,
        cpf_hash: &str,
    ) -> Result<GraphNodeContext, GraphError> {
        let cypher_query = "
            MATCH (a:Account {cpf_hash: $cpf})-[r:PIX_TRANSFER|SHARED_DEVICE*1..3]-(target)
            RETURN a.cpf_hash AS sender, count(target) AS degree, any(x IN labels(target) WHERE x = 'MuleRing') AS is_mule
        ";

        let query_task = async move {
            // Simulador de driver assíncrono real de Neo4j com I/O sem bloqueio
            tokio::time::sleep(Duration::from_micros(1450)).await;

            GraphNodeContext {
                cpf_hash: cpf_hash.to_string(),
                is_mule_ring: cpf_hash.contains("999") || cpf_hash.contains("bad"),
                degree: 4,
                connected_devices: vec!["dev_fp_982a".into(), "dev_fp_3321".into()],
                shared_ips: vec!["185.220.101.4".into()],
            }
        };

        // Força estritamente limite de 2ms para a travessia de grafo no SLA P99
        match timeout(Duration::from_millis(2), query_task).await {
            Ok(context) => Ok(context),
            Err(_) => Err(GraphError::QueryTimeout),
        }
    }
}
`
  },
  {
    id: 'infra_lgpd_scrubber',
    fileName: 'lgpd_scrubber.rs',
    filePath: 'src/infrastructure/lgpd_scrubber.rs',
    layer: 'Infrastructure',
    description: 'Sanitizador Criptográfico e HMAC-SHA256 para Governança LGPD (Art. 7º) e Verificação de CMP.',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo LGPD: Purificador e Anonimizador Criptográfico

use hmac::{Hmac, Mac};
use sha2::Sha256;
use crate::domain::entity::{CMPConsent, CpfHash};

pub struct LgpdDataScrubber {
    hmac_key: Vec<u8>,
}

impl LgpdDataScrubber {
    pub fn new(secret_key: &[u8]) -> Self {
        Self {
            hmac_key: secret_key.to_vec(),
        }
    }

    pub fn anonymize_cpf(&self, raw_cpf: &str) -> CpfHash {
        CpfHash::from_raw_cpf(raw_cpf, &self.hmac_key)
    }

    pub fn anonymize_ip(&self, raw_ip: &str) -> String {
        let parts: Vec<&str> = raw_ip.split('.').collect();
        if parts.len() == 4 {
            format!("{}.{}.*.***", parts[0], parts[1])
        } else {
            "0.0.0.0/0".to_string()
        }
    }

    pub fn sanitize_payload(
        &self,
        raw_cpf: &str,
        raw_ip: &str,
        raw_device: &str,
        cmp_consent: &CMPConsent,
    ) -> (CpfHash, String, Option<String>) {
        let anon_cpf = self.anonymize_cpf(raw_cpf);
        let anon_ip = self.anonymize_ip(raw_ip);

        // Se o usuário revogou o consentimento de cookies/fingerprint no CMP,
        // removemos o fingerprint do dispositivo para cumprir o Artigo 7º da LGPD.
        let device_fingerprint = if cmp_consent.revoked_all || !cmp_consent.device_fingerprint {
            None
        } else {
            type HmacSha256 = Hmac<Sha256>;
            let mut mac = HmacSha256::new_from_slice(&self.hmac_key).unwrap();
            mac.update(raw_device.as_bytes());
            Some(hex::encode(mac.finalize().into_bytes()))
        };

        (anon_cpf, anon_ip, device_fingerprint)
    }
}
`
  },
  {
    id: 'infra_bacen_med_hooks',
    fileName: 'bacen_med_hooks.rs',
    filePath: 'src/infrastructure/bacen_med_hooks.rs',
    layer: 'Infrastructure',
    description: 'Hooks Regulatórios do Bacen: Resolução 147/2021, Fundada Suspeita e MED (Contestação 7 dias).',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo Bacen: Regulamentação de Fundada Suspeita e MED (Contestação)

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacenSuspicionNotice {
    pub transaction_id: String,
    pub sender_cpf_hash: String,
    pub recipient_cpf_hash: String,
    pub amount_cents: u64,
    pub reason: String,
    pub block_expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MedDisputeClaim {
    pub claim_id: String,
    pub original_tx_id: String,
    pub victim_cpf_hash: String,
    pub claim_timestamp: DateTime<Utc>,
    pub dispute_deadline: DateTime<Utc>, // Janela de 7 dias do Bacen
    pub status: DisputeStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DisputeStatus {
    PendingAnalysis,
    ApprovedRefund,
    RejectedNoFraud,
}

pub struct BacenRegulatoryPublisher {
    sender: broadcast::Sender<BacenSuspicionNotice>,
}

impl BacenRegulatoryPublisher {
    pub fn new(capacity: usize) -> Self {
        let (sender, _) = broadcast::channel(capacity);
        Self { sender }
    }

    pub fn publish_fundada_suspeita(&self, notice: BacenSuspicionNotice) -> Result<usize, String> {
        self.sender
            .send(notice)
            .map_err(|e| format!("Falha ao propagar bloqueio Bacen: {}", e))
    }

    pub fn create_med_7day_claim(tx_id: &str, victim_hash: &str) -> MedDisputeClaim {
        let now = Utc::now();
        MedDisputeClaim {
            claim_id: format!("MED-{}", uuid::Uuid::new_v4()),
            original_tx_id: tx_id.to_string(),
            victim_cpf_hash: victim_hash.to_string(),
            claim_timestamp: now,
            dispute_deadline: now + chrono::Duration::days(7),
            status: DisputeStatus::PendingAnalysis,
        }
    }
}
`
  },
  {
    id: 'cqrs_commands',
    fileName: 'commands.rs',
    filePath: 'src/cqrs/commands.rs',
    layer: 'CQRS',
    description: 'Command Query Responsibility Segregation: Barramento de Comandos e Event Sourcing.',
    code: `// SPDX-License-Identifier: Apache-2.0
// PIX-SHIELD-QPO - Motor Antifraude Pix em Tempo Real (<8ms SLA)
// Módulo CQRS: Barramento de Comandos de Alto Rendimento

use serde::{Deserialize, Serialize};
use crate::domain::entity::{CMPConsent, PixTransaction};

#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluatePixTransactionCommand {
    pub transaction_id: String,
    pub raw_sender_cpf: String,
    pub raw_sender_name: String,
    pub sender_bank: String,
    pub recipient_pix_key: String,
    pub raw_recipient_cpf: String,
    pub raw_recipient_name: String,
    pub recipient_bank: String,
    pub amount_cents: u64,
    pub raw_ip: String,
    pub raw_device: String,
    pub cmp_consent: CMPConsent,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarkFundadaSuspeitaCommand {
    pub transaction_id: String,
    pub reason: String,
    pub operator_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileMedClaimCommand {
    pub original_tx_id: String,
    pub victim_cpf: String,
    pub description: String,
}

pub trait CommandHandler<C> {
    type Output;
    type Error;

    fn handle(&mut self, cmd: C) -> Result<Self::Output, Self::Error>;
}
`
  }
];
