// ⚠️ Dados 100% fictícios e ilustrativos — usados apenas na seção de demonstração.
// Regra do briefing: nunca apresentar dado inventado como se fosse real.
// Fontes reais (CNES/DATASUS e base SINDHOSPE) alimentam apenas as telas fora da demo.

export const HOSPITAL_DEMO = {
  nome_fantasia: "Hospital Exemplo de Pernambuco",
  razao_social: "Instituto de Saúde Exemplo do Agreste LTDA",
  cnpj: "12.345.678/0001-90",
  cnes: "9876543",
  registro: "1234",
  tipo: "Hospital Geral",
  natureza_juridica: "Associação Privada sem fins lucrativos",
  gestao: "Estadual",
  situacao: "Ativo",
  updatedAt: "22/09/2026",
  endereco: {
    logradouro: "Av. Exemplo da Saúde, 456",
    bairro: "Boa Vista",
    municipio: "Caruaru",
    cep: "55000-000",
    regiao: "Agreste",
  },
};

export const RESPONSAVEIS_DEMO = [
  {
    nome: "Maria Exemplo da Silva",
    cargo: "Diretora Técnica",
    conselho: "CRM-PE 00000",
    since: "03/2021",
  },
  {
    nome: "João Exemplo de Oliveira",
    cargo: "Responsável pela Gestão Administrativa",
    conselho: "—",
    since: "08/2023",
  },
];

export const LEITOS_POR_PERIODO_DEMO = [
  { competencia: "202406", leitos_totais: 92, leitos_sus: 38, leitos_nao_sus: 54, leitos_complementares: 10 },
  { competencia: "202409", leitos_totais: 92, leitos_sus: 38, leitos_nao_sus: 54, leitos_complementares: 10 },
  { competencia: "202412", leitos_totais: 95, leitos_sus: 40, leitos_nao_sus: 55, leitos_complementares: 12 },
  { competencia: "202503", leitos_totais: 95, leitos_sus: 40, leitos_nao_sus: 55, leitos_complementares: 12 },
  { competencia: "202506", leitos_totais: 100, leitos_sus: 42, leitos_nao_sus: 58, leitos_complementares: 12 },
  { competencia: "202509", leitos_totais: 100, leitos_sus: 42, leitos_nao_sus: 58, leitos_complementares: 14 },
  { competencia: "202512", leitos_totais: 105, leitos_sus: 45, leitos_nao_sus: 60, leitos_complementares: 14 },
  { competencia: "202603", leitos_totais: 105, leitos_sus: 45, leitos_nao_sus: 60, leitos_complementares: 16 },
  { competencia: "202606", leitos_totais: 110, leitos_sus: 48, leitos_nao_sus: 62, leitos_complementares: 16 },
];

// Benchmarks agregados (fictícios) usados no relatório dinâmico —
// na versão real, saem de consultas agregadas sobre o PostgreSQL.
export const BENCHMARK_MUNICIPIO_DEMO = {
  nome: "Caruaru",
  total_estabelecimentos_mesmo_tipo: 12,
  media_leitos: 84,
  media_leitos_complementares: 9.6,
  pct_leitos_sus: 0.42,
};

export const BENCHMARK_ESTADO_DEMO = {
  nome: "Pernambuco",
  total_estabelecimentos_mesmo_tipo: 186,
  media_leitos: 62,
  media_leitos_complementares: 7.8,
  pct_leitos_sus: 0.48,
};

// Notas de estrutura (1 = possui, 2 = ampliada, 3 = completa) — fictícias
export const PERFIL_ESTRUTURA_DEMO = [
  { dimensao: "Urgência e emergência", voce: 3, municipio: 2.4 },
  { dimensao: "Centro cirúrgico", voce: 2, municipio: 1.5 },
  { dimensao: "Centro obstétrico", voce: 2, municipio: 1.2 },
  { dimensao: "Diagnóstico por imagem", voce: 1, municipio: 0.8 },
  { dimensao: "Laboratório", voce: 1, municipio: 0.6 },
];

// ===== Tela 4 — Estrutura física e capacidade (comparação entre períodos) =====
export const ESTRUTURA_ATUAL_DEMO = {
  competencia: "202606",
  leitos_por_especialidade: [
    { especialidade: "Clínica médica (cirúrgica)", atual: 28, anterior: 26 },
    { especialidade: "Clínica médica (clínica)", atual: 34, anterior: 32 },
    { especialidade: "Pediatria clínica", atual: 16, anterior: 16 },
    { especialidade: "Obstetrícia (CUS)", atual: 12, anterior: 14 },
    { especialidade: "UTI adulto", atual: 10, anterior: 8 },
    { especialidade: "UTI neonatal", atual: 6, anterior: 6 },
  ],
  salas_funcionais: [
    { nome: "Centro cirúrgico (salas de cirurgia)", atual: 3, anterior: 2 },
    { nome: "Centro obstétrico (salas de parto)", atual: 2, anterior: 2 },
    { nome: "Consultórios ambulatoriais", atual: 14, anterior: 12 },
    { nome: "Salas de emergência", atual: 6, anterior: 5 },
  ],
  equipamentos_destaque: [
    { nome: "Ventiladores mecânicos", atual: 18, anterior: 15 },
    { nome: "Aparelhos de raio-x", atual: 2, anterior: 2 },
    { nome: "Ultrassonógrafos", atual: 3, anterior: 2 },
    { nome: "Equip. de hemodiálise", atual: 0, anterior: 0 },
  ],
};

// ===== Tela 5 — Serviços oferecidos (catálogo + lacunas vs. grupo) =====
export const CATALOGO_SERVICOS_DEMO = [
  { codigo: "HB01", nome: "Urgência e emergência", grupo: "Ambulatorial e urgência", complexidade: "Média", homologado: "Sim" },
  { codigo: "HB02", nome: "Centro cirúrgico", grupo: "Internação", complexidade: "Média", homologado: "Sim" },
  { codigo: "HB03", nome: "Centro obstétrico", grupo: "Internação", complexidade: "Média", homologado: "Sim" },
  { codigo: "SR01", nome: "Diagnóstico por imagem — raio-x", grupo: "Apoio diagnóstico", complexidade: "Média", homologado: "Sim" },
  { codigo: "SR02", nome: "Laboratório de análises clínicas", grupo: "Apoio diagnóstico", complexidade: "Baixa", homologado: "Sim" },
  { codigo: "SR03", nome: "Cardiologia — hemodinâmica", grupo: "Apoio diagnóstico/terapêutico", complexidade: "Alta", homologado: "Não" },
  { codigo: "SR04", nome: "Oncologia — quimioterapia", grupo: "Atenção especializada", complexidade: "Alta", homologado: "Não" },
  { codigo: "SR05", nome: "Fisioterapia ambulatorial", grupo: "Atenção especializada", complexidade: "Baixa", homologado: "Sim" },
];

export const LACUNAS_SERVICOS_DEMO = [
  { servico: "Hemodinâmica (cardiologia intervencionista)", possui: "Não", noGrupo: "31% dos hospitais gerais do grupo têm" },
  { servico: "Quimioterapia", possui: "Não", noGrupo: "22% têm" },
  { servico: "Hemodiálise", possui: "Não", noGrupo: "18% têm" },
  { servico: "Ressonância magnética", possui: "Não", noGrupo: "27% têm" },
];

// ===== Tela 6 — Indicadores (operacionais; financeiros são fase 2 — fora do CNES) =====
export const INDICADORES_OPERACIONAIS_DEMO = [
  {
    nome: "Taxa de ocupação hospitalar (estimada)",
    valor: "83%",
    referencia: "meta gestora 80–85%",
    bom: true,
    nota: "Estimada a partir de autorizações de internação (AIH) — proxy operacional, não financeira.",
  },
  {
    nome: "Leitos críticos / leitos totais",
    valor: "15%",
    referencia: "média do grupo: 9%",
    bom: true,
    nota: "Proporção de UTI sobre a capacidade total — mede densidade de estrutura crítica.",
  },
  {
    nome: "Cobertura obstétrica",
    valor: "12 leitos CUS",
    referencia: "referência regional: 10",
    bom: true,
    nota: "Capacidade de parto normal/hospitalar habilitada no CNES.",
  },
  {
    nome: "Serviços de alta complexidade habilitados",
    valor: "2",
    referencia: "média do grupo: 3",
    bom: false,
    nota: "Quantidade de habilitações de alta complexidade ativas — menor que o grupo semelhante.",
  },
];

// ===== Conformidade cadastral (tela 2) — greve de dados rastreável pelo portal =====
export const CONFORMIDADE_CADASTRAL_DEMO = [
  { campo: "Dados da diretoria", status: "completo" },
  { campo: "CNPJ e natureza jurídica", status: "completo" },
  { campo: "Endereço e contato", status: "completo" },
  { campo: "Leitos por especialidade", status: "completo" },
  { campo: "Equipamentos principais", status: "atencao" },
  { campo: "Profissionais vinculados (CNES)", status: "faltando" },
  { campo: "Contratos de gestão (SUS)", status: "faltando" },
];

export const ASSOCIADOS_DEMO = [
  {
    nome_fantasia: "Hospital Exemplo de Pernambuco",
    cnpj: "12.345.678/0001-90",
    cnes: "9876543",
    municipio: "Caruaru",
    situacao: "Ativo",
    atualizado_em: "05/09/2026",
  },
  {
    nome_fantasia: "Maternidade Exemplo da Igaraçu",
    cnpj: "23.456.789/0001-01",
    cnes: "8765432",
    municipio: "Olinda",
    situacao: "Ativo",
    atualizado_em: "05/09/2026",
  },
  {
    nome_fantasia: "Clínica Exemplo de Diagnóstico",
    cnpj: "34.567.890/0001-12",
    cnes: "7654321",
    municipio: "Recife",
    situacao: "Pendente",
    atualizado_em: "12/09/2026",
  },
  {
    nome_fantasia: "Centro Médico Exemplo do Litoral",
    cnpj: "45.678.901/0001-23",
    cnes: "6543210",
    municipio: "Jaboatão",
    situacao: "Inativo",
    atualizado_em: "28/08/2026",
  },
];

export const AUDITORIA_DEMO = [
  { evento: "Vínculo associado ↔ CNES 7654321 registrado", usuario: "Iberê (SINDHOSPE)", quando: "12/09/2026 10:14" },
  { evento: "Sincronização CNES/DATASUS concluída — competência 202606", usuario: "Sistema", quando: "10/09/2026 03:00" },
  { evento: "Solicitação de revisão cadastral aprovada", usuario: "SINDHOSPE (admin)", quando: "05/09/2026 16:47" },
  { evento: "Novo associado cadastrado: Maternidade Exemplo da Igaraçu", usuario: "SINDHOSPE (admin)", quando: "01/09/2026 09:20" },
];

export const SINCRONIZACAO_DEMO = {
  fonte: "CNES / DATASUS — LT (Estabelecimentos) e DC (Complementar)",
  ultima_execucao: "10/09/2026 03:00",
  competencia_importada: "Jun/2026",
  registros_processados: "52.480",
  status: "Concluída",
};

export const SERVICOS_HABILITADOS_DEMO = [
  { codigo: "HB01", nome: "Urgência e emergência", porte: "Porte II" },
  { codigo: "HB02", nome: "Centro cirúrgico", porte: "Porte I" },
  { codigo: "HB03", nome: "Centro obstétrico", porte: "Porte I" },
  { codigo: "SR01", nome: "Diagnóstico por imagem", porte: "—" },
  { codigo: "SR02", nome: "Laboratório de análises clínicas", porte: "—" },
];
