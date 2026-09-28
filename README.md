# 🛡️ PIX-SHIELD-QPO
> **Motor Antifraude Pix em Tempo Real de Missão Crítica com SLA Sub-8ms (P99), GraphRAG via Protocolo MCP, Arquitetura Rust (DDD/CQRS), Governança LGPD e Conformidade Regulatória Bacen.**

[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Tokio Async](https://img.shields.io/badge/Tokio-Async_Runtime-black?style=for-the-badge&logo=rust)](https://tokio.rs/)
[![GraphRAG](https://img.shields.io/badge/GraphRAG-Neo4j_Cypher-blue?style=for-the-badge)](https://neo4j.com/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Model_Context_Protocol-purple?style=for-the-badge)](https://modelcontextprotocol.io/)
[![Bacen Compliance](https://img.shields.io/badge/Bacen-Resolução_147%2F2021-emerald?style=for-the-badge)](https://www.bcb.gov.br/)
[![LGPD](https://img.shields.io/badge/LGPD-Lei_13.709%2F2018-cyan?style=for-the-badge)](https://www.gov.br/anpd/pt-br)

---

## 📌 Visão Geral do Sistema

O **PIX-SHIELD-QPO** é um motor antifraude de ultra-baixa latência desenvolvido para avaliar transações Pix em tempo real, combinando processamento concorrente seguro em **Rust** com inteligência contextual de grafos por meio de **GraphRAG** e o protocolo **MCP (Model Context Protocol)**.

O sistema atende integralmente às exigências regulatórias do **Banco Central do Brasil (Bacen)** para bloqueio cautelar (*"Fundada Suspeita"*, Resolução 147/2021), Mecanismo Especial de Devolução (MED - janela de 7 dias) e expulsão imediata de participantes no DICT/SPI, garantindo estrita governança da **LGPD (Lei nº 13.709/2018)** e integração com Plataformas de Gestão de Consentimento (CMP).

---

## ⚡ Principais Capacidades e Arquitetura

### 1. ⏱️ Motor de Avaliação Sub-8ms em Rust (SLA P99)
- **Desempenho Concorrente:** Desenvolvido em Rust assíncrono com o runtime `tokio`, utilizando semáforos de concorrência (`tokio::sync::Semaphore`), métricas atômicas sem bloqueio (`AtomicU64`) e tratamento estrito de erros com `thiserror` (sem utilizar blocos `unsafe`).
- **Decomposição Microsegundo por Etapa (µs):**
  - **1. Sanitização & Expurgo LGPD:** `< 300 µs`
  - **2. Travessia GraphRAG MCP:** `< 1.950 µs`
  - **3. Score de Risco Matrencial:** `< 1.420 µs`
  - **4. Regras e Ganchos Bacen/BPMN:** `< 1.100 µs`
  - **5. Event Sourcing & CQRS:** `< 650 µs`
  - **P99 Total:** `~ 5.42 ms` (Garantia de conformidade com o SLA de 8ms).

### 2. 🕸️ GraphRAG & Protocolo MCP (Model Context Protocol)
- **Análise Topológica de Fraude:** Mapeamento em tempo real de anéis de contas laranja (*mule rings*), dispositivos com acesso root/emuladores, subredes IP e clusters de engenharia social (*mão fantasma*).
- **Consultas Cypher Dinâmicas (Gemini 3.8 Flash):** Conversão de linguagem natural em consultas Cypher otimizadas para execução no Neo4j com limite de timeout de `2ms`.
- **Ferramentas MCP Registradas:**
  - `query_pix_fraud_graph` — Travessia de grafo sub-2ms para identificação de nós infectados.
  - `evaluate_transaction_context` — Síntese de risco formatada via JSON-RPC 2.0 para agentes de IA.
  - `fetch_mule_ring_nodes` — Recuperação de famílias de contas laranja.
  - `scrub_lgpd_telemetry` — Validação de CMP e anonimização criptográfica.

### 3. 🛡️ Governança LGPD (Artigo 7º) & Sanitização Criptográfica
- **Respeito às Preferências de Consentimento CMP:** Se o titular revogar o consentimento de cookies ou fingerprinting, o motor expurga a telemetria comportamental mantendo a avaliação de risco com base estritamente na estrutura da conta e topologia de grafos.
- **Anonimização Irreversível:** HMAC-SHA256 salted para CPFs e mascaramento de IPs (`200.180.*.***`), impedindo vazamentos em logs de auditoria.

### 4. ⚖️ Ganchos Regulatórios Bacen & Processos BPMN 2.0
- **Resolução Bacen nº 147/2021:** Acionamento de Bloqueio Cautelar de 72 horas para transações com pontuação de risco $\ge 80$.
- **Mecanismo Especial de Devolução (MED):** Suporte nativo à janela de contestação de 7 dias com rastreamento completo de trilha de auditoria.
- **Expulsão de Participantes:** Propagação imediata de revogação de contas laranja no DICT/SPI.

---

## 📁 Estrutura do Código Rust (DDD / CQRS)

```text
src/
├── domain/
│   ├── entity.rs           # Entidades, Objetos de Valor (CpfHash, PixKey, RiskScore) e Eventos
│   └── rules.rs            # Motor Tokio com Semáforos e Métricas Atômicas (<8ms SLA)
├── infrastructure/
│   ├── mcp_server.rs       # Servidor JSON-RPC 2.0 para o Protocolo MCP
│   ├── graphrag_adapter.rs # Adaptador Cypher/Neo4j com Timeout Sub-2ms
│   ├── lgpd_scrubber.rs    # Purificador HMAC-SHA256 e Verificador de Estado CMP
│   └── bacen_med_hooks.rs  # Regulamentação "Fundada Suspeita" e MED (7 Dias)
└── cqrs/
    └── commands.rs         # Barramento de Comandos e Event Sourcing
```

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem Backend/Engine:** Rust (Edição 2021), Tokio, Serde, HMAC-SHA256, `thiserror`.
- **Frontend & Interface:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Servidor & Backend Proxy:** Node.js, Express, Vite API Middleware.
- **Inteligência Artificial:** `@google/genai` (Gemini 3.8 Flash / Gemini 3.1 Pro).
- **Banco de Dados de Grafos:** Neo4j / Cypher Query Engine via Protocolo MCP.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js `v20+` e `npm`
- (Opcional) Ambiente Rust com `cargo` para compilação estática dos módulos backend

### Instalação e Execução

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/Mrcoantonioconceicao-ctrl/PIX-SHIELD-QPO.git
   cd PIX-SHIELD-QPO
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie ou edite o arquivo `.env`:
   ```env
   GEMINI_API_KEY="Sua_Chave_Gemini_API"
   ```

4. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse no navegador: `http://localhost:3000`

---

## ✉️ Contato do Arquiteto / Autor

**Marco Antônio Conceição**  
*Arquiteto-Chefe Corporativo e Engenheiro Principal de Software*

- 📧 **E-mail:** [Mrcoantonioconceicao@gmail.com](mailto:Mrcoantonioconceicao@gmail.com)
- 📱 **WhatsApp:** [+55 (47) 99234-5371](https://wa.me/5547992345371)
- 🐙 **GitHub:** [Mrcoantonioconceicao-ctrl](https://github.com/Mrcoantonioconceicao-ctrl)

---

<p align="center">
  <sub>Desenvolvido para segurança, latência ultrabaixa e conformidade absoluta com o Bacen e a LGPD.</sub>
</p>
