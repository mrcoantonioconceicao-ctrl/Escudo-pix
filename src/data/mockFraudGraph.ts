import { GraphNode, GraphEdge, McpTool } from '../types';

export const INITIAL_NODES: GraphNode[] = [
  {
    id: 'acc_payer_81',
    label: 'Conta Origem (Pagador)',
    type: 'ACCOUNT',
    riskScore: 12.0,
    details: {
      cpf_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
      bank: '001 - Banco do Brasil',
      accountAgeMonths: 48,
      status: 'REGULAR'
    }
  },
  {
    id: 'acc_mule_99',
    label: 'Conta Laranja (Mule Ring Hub)',
    type: 'MULE_RING',
    riskScore: 98.5,
    flaggedByBacen: true,
    details: {
      cpf_hash: 'a591a6d40bf420404a011733cfb7b190',
      bank: '260 - Nu Pagamentos S.A.',
      accountAgeMonths: 1,
      muleRingFamilyId: 'MULE_RING_SAO_PAULO_04',
      status: 'BLOQUEADA_BACEN'
    }
  },
  {
    id: 'acc_mule_102',
    label: 'Conta Receptor Laranja B',
    type: 'MULE_RING',
    riskScore: 92.0,
    flaggedByBacen: true,
    details: {
      cpf_hash: '9f86d081884c7d659a2feaa0c55ad015',
      bank: '336 - C6 Bank',
      accountAgeMonths: 2,
      status: 'SOB_INVESTIGACAO'
    }
  },
  {
    id: 'device_emu_01',
    label: 'Emulador Android Comprometido',
    type: 'DEVICE',
    riskScore: 95.0,
    details: {
      fingerprint_hash: 'fp_emu_android_v14_root',
      isRooted: true,
      isEmulator: true,
      concurrentAccountsCount: 14
    }
  },
  {
    id: 'ip_tor_exit_42',
    label: 'Subrede IP Suspeita',
    type: 'IP_SUBNET',
    riskScore: 88.0,
    details: {
      ip_range: '185.220.101.0/24',
      location: 'São Paulo, BR (VPN/Proxy)',
      isVpn: true,
      isTorExit: true
    }
  },
  {
    id: 'social_eng_cluster',
    label: 'Cluster Engenharia Social',
    type: 'SOCIAL_ENG',
    riskScore: 91.0,
    details: {
      vector: 'Falso Atendimento Telefônico / Mão Fantasma',
      reportedIncidents: 27,
      activeTriggers: 'Uso de aplicativo de acesso remoto (AnyDesk/TeamViewer)'
    }
  }
];

export const INITIAL_EDGES: GraphEdge[] = [
  {
    id: 'edge_tx_01',
    source: 'acc_payer_81',
    target: 'acc_mule_99',
    type: 'PIX_TRANSFER',
    label: 'PIX R$ 15.000,00',
    amount: 15000,
    frequency: 1
  },
  {
    id: 'edge_mule_link',
    source: 'acc_mule_99',
    target: 'acc_mule_102',
    type: 'MULE_ASSOCIATE',
    label: 'Repasse Rápido (<2min)',
    amount: 14800,
    frequency: 8
  },
  {
    id: 'edge_dev_share_1',
    source: 'acc_mule_99',
    target: 'device_emu_01',
    type: 'SHARED_DEVICE',
    label: 'Mesmo Dispositivo'
  },
  {
    id: 'edge_dev_share_2',
    source: 'acc_mule_102',
    target: 'device_emu_01',
    type: 'SHARED_DEVICE',
    label: 'Mesmo Dispositivo'
  },
  {
    id: 'edge_ip_share_1',
    source: 'acc_mule_99',
    target: 'ip_tor_exit_42',
    type: 'SHARED_IP',
    label: 'Acesso via Proxy IP'
  },
  {
    id: 'edge_social_link',
    source: 'acc_payer_81',
    target: 'social_eng_cluster',
    type: 'SUSPECT_LINK',
    label: 'Sessão Espelhada Ativa'
  }
];

export const MCP_TOOLS_LIST: McpTool[] = [
  {
    name: 'query_pix_fraud_graph',
    description: 'Executa consulta Cypher sub-2ms no banco de dados de grafos para travessia de contas laranja e dispositivos associados.',
    inputSchema: {
      type: 'object',
      properties: {
        cpf_hash: { type: 'string', description: 'Hash HMAC-SHA256 do CPF do cliente' },
        max_depth: { type: 'number', description: 'Profundidade máxima de busca no grafo (padrão: 3)' }
      },
      required: ['cpf_hash']
    }
  },
  {
    name: 'evaluate_transaction_context',
    description: 'Retorna a síntese de contexto GraphRAG formatada para consumo do modelo LLM via protocolo MCP.',
    inputSchema: {
      type: 'object',
      properties: {
        transaction_id: { type: 'string', description: 'Identificador único da transação Pix' }
      },
      required: ['transaction_id']
    }
  },
  {
    name: 'fetch_mule_ring_nodes',
    description: 'Recupera nós de contas laranja e redes de laranjas confirmadas pelo Banco Central.',
    inputSchema: {
      type: 'object',
      properties: {
        mule_family_id: { type: 'string', description: 'ID da família de laranjas' }
      },
      required: ['mule_family_id']
    }
  },
  {
    name: 'scrub_lgpd_telemetry',
    description: 'Verifica o estado de consentimento do CMP e aplica sanitização criptográfica de acordo com o Art. 7º da LGPD.',
    inputSchema: {
      type: 'object',
      properties: {
        raw_cpf: { type: 'string' },
        cmp_consent: { type: 'object' }
      },
      required: ['raw_cpf', 'cmp_consent']
    }
  }
];
