import { useState, useEffect } from 'react';

export const USERS = [
  { id: 'u1', name: 'Rafael Moura', role: 'Head de Operações', handle: 'rafa', status: 'online', color: '#9fb42c', posts: 842, reputation: 4820, joined: 'Mar 2021', bio: 'Responsável pelas lojas da região central. Amo um bom hortifruti.', title: 'Líder' },
  { id: 'u2', name: 'Juliana Prado', role: 'Gerente de TI', handle: 'juprado', status: 'online', color: '#7e3f62', posts: 1204, reputation: 6120, joined: 'Ago 2020', bio: 'Mantendo a VPS no ar desde 2020.', title: 'Admin' },
  { id: 'u3', name: 'Bruno Carvalho', role: 'Supervisor de Loja', handle: 'bcarva', status: 'online', color: '#1f6fb8', posts: 312, reputation: 1540, joined: 'Jun 2022', bio: 'Loja Pinheiros', title: 'Supervisor' },
  { id: 'u4', name: 'Camila Tanaka', role: 'Designer', handle: 'camit', status: 'away', color: '#ea431b', posts: 98, reputation: 640, joined: 'Fev 2024', bio: 'Cuidando da identidade visual.', title: 'Design' },
  { id: 'u5', name: 'Diego Fontes', role: 'DevOps', handle: 'dfontes', status: 'online', color: '#f2801f', posts: 512, reputation: 3100, joined: 'Set 2022', bio: 'Servidores, CI/CD, Docker.', title: 'Dev' },
  { id: 'u6', name: 'Aline Ribeiro', role: 'Compras', handle: 'aliner', status: 'online', color: '#eeb23e', posts: 187, reputation: 910, joined: 'Nov 2023', bio: 'Negociando com fornecedores.', title: 'Compras' },
  { id: 'u7', name: 'Marcos Lemos', role: 'Financeiro', handle: 'mlemos', status: 'dnd', color: '#c72124', posts: 76, reputation: 430, joined: 'Jan 2024', bio: 'Fechando o mês.', title: 'Financeiro' },
  { id: 'u8', name: 'Patrícia Alves', role: 'RH', handle: 'palves', status: 'online', color: '#1f8a8a', posts: 289, reputation: 1380, joined: 'Out 2022', bio: 'Gente faz a diferença.', title: 'RH' },
  { id: 'u9', name: 'Thiago Barros', role: 'Analista de Dados', handle: 'tbarros', status: 'away', color: '#947034', posts: 443, reputation: 2210, joined: 'Abr 2023', bio: 'SQL, Python e café.', title: 'Dados' },
  { id: 'u10', name: 'Larissa Cruz', role: 'Marketing', handle: 'lcruz', status: 'online', color: '#b4c93d', posts: 612, reputation: 2940, joined: 'Mai 2021', bio: 'Campanhas, social, branding.', title: 'MKT' },
  { id: 'u11', name: 'Felipe Nunes', role: 'Sup. de Padaria', handle: 'fnunes', status: 'offline', color: '#7e3f62', posts: 54, reputation: 210, joined: 'Jul 2024', bio: 'Pão quentinho toda manhã.' },
  { id: 'u12', name: 'Giovanna Lima', role: 'Qualidade', handle: 'giolima', status: 'online', color: '#1f6fb8', posts: 221, reputation: 1080, joined: 'Dez 2023', bio: 'Auditoria interna.' },
  { id: 'u13', name: 'Renato Sá', role: 'Logística', handle: 'rensa', status: 'offline', color: '#ea431b', posts: 134, reputation: 680, joined: 'Ago 2023', bio: 'Recebimento e abastecimento.' },
  { id: 'u14', name: 'Beatriz Melo', role: 'Atendimento', handle: 'bmelo', status: 'online', color: '#eeb23e', posts: 92, reputation: 380, joined: 'Mar 2025', bio: 'Relacionamento com o cliente.' },
];

export const ME = USERS[0];

export const FORUM_CATEGORIES = [
  { id: 'c1', name: 'Avisos & Comunicados', desc: 'Anúncios oficiais da diretoria e RH', icon: 'megaphone', color: '#c72124', topics: 28, posts: 342, lastTopicId: 't1' },
  { id: 'c2', name: 'Operações de Loja', desc: 'Rotinas, escala, abastecimento, caixa', icon: 'store', color: '#9fb42c', topics: 147, posts: 2108, lastTopicId: 't2' },
  { id: 'c3', name: 'TI & Infraestrutura', desc: 'VPS, sistemas, acessos, chamados', icon: 'server', color: '#1f6fb8', topics: 84, posts: 1237, lastTopicId: 't3' },
  { id: 'c4', name: 'Compras & Fornecedores', desc: 'Novos itens, negociações, trocas', icon: 'cart', color: '#f2801f', topics: 62, posts: 814, lastTopicId: 't4' },
  { id: 'c5', name: 'RH & Gente', desc: 'Vagas, benefícios, treinamentos', icon: 'users', color: '#7e3f62', topics: 41, posts: 512, lastTopicId: 't5' },
  { id: 'c6', name: 'Ideias & Sugestões', desc: 'Um espaço pra brainstorm', icon: 'bulb', color: '#eeb23e', topics: 76, posts: 941, lastTopicId: 't6' },
  { id: 'c7', name: 'Off-topic', desc: 'Assuntos livres, receitas, futebol', icon: 'chat', color: '#1f8a8a', topics: 203, posts: 2876, lastTopicId: 't7' },
];

export const TOPICS = [
  { id: 't1', categoryId: 'c1', title: 'Política de uso do portal — leia antes de postar', author: 'u2', pinned: true, locked: true, replies: 3, views: 1284, last: { by: 'u8', when: 'há 2 dias' }, tags: ['regras', 'oficial'], hot: false },
  { id: 't2', categoryId: 'c2', title: 'Nova rotina de recebimento nas lojas da zona sul', author: 'u1', pinned: true, replies: 42, views: 3120, last: { by: 'u13', when: 'há 18 min' }, tags: ['rotina', 'zona-sul'], hot: true },
  { id: 't3', categoryId: 'c3', title: 'VPS caiu ontem à noite — post-mortem', author: 'u5', replies: 18, views: 847, last: { by: 'u2', when: 'há 1 h' }, tags: ['vps', 'incidente'], hot: true },
  { id: 't4', categoryId: 'c4', title: 'Fornecedor X aumentou 12% — vamos negociar?', author: 'u6', replies: 24, views: 612, last: { by: 'u1', when: 'há 32 min' }, tags: ['compras', 'urgente'], hot: false },
  { id: 't5', categoryId: 'c5', title: 'Treinamento de atendimento — inscrições abertas', author: 'u8', replies: 12, views: 489, last: { by: 'u14', when: 'há 4 h' }, tags: ['treinamento'], hot: false },
  { id: 't6', categoryId: 'c6', title: 'E se tivéssemos um app para o cliente fiel?', author: 'u10', replies: 67, views: 2014, last: { by: 'u4', when: 'há 22 min' }, tags: ['app', 'fidelidade'], hot: true },
  { id: 't7', categoryId: 'c7', title: 'Melhor padaria pra ir no almoço', author: 'u11', replies: 89, views: 1502, last: { by: 'u7', when: 'há 12 min' }, tags: ['off', 'padaria'], hot: true },
  { id: 't8', categoryId: 'c2', title: 'Como lidar com quebra de estoque no hortifrúti', author: 'u3', replies: 15, views: 412, last: { by: 'u12', when: 'há 3 h' }, tags: ['hortifruti'], hot: false },
  { id: 't9', categoryId: 'c3', title: 'Migração para o novo PDV — checklist', author: 'u5', replies: 31, views: 892, last: { by: 'u5', when: 'há 6 h' }, tags: ['pdv', 'migracao'], hot: false },
  { id: 't10', categoryId: 'c6', title: 'Trocar o layout da gôndola de cervejas?', author: 'u4', replies: 28, views: 723, last: { by: 'u10', when: 'há 5 h' }, tags: ['layout', 'cerveja'], hot: false },
];

export const POSTS_BY_TOPIC = {
  t3: [
    { id: 'p1', author: 'u5', when: '12/04 às 22:47', body: 'Pessoal, registrando aqui o post-mortem da queda da VPS ontem à noite.\n\n**O que aconteceu:**\nPor volta das 22h18, os serviços no painel começaram a retornar 502. A causa-raiz foi um loop infinito em um cron de sincronização do ERP que consumiu toda a memória disponível.\n\n**Impacto:** Fórum e Chat ficaram fora ~47 min. Vault permaneceu no ar (está em host separado).\n\n**Ação imediata:** Reiniciei o processo, adicionei `memory_limit` e um alerta no Grafana.\n\n**Ação de longo prazo:** Vou migrar aquele cron pra uma fila com retry exponencial.', reactions: { '👍': 8, '🙏': 3, '🔥': 1 }, signature: 'Diego • DevOps' },
    { id: 'p2', author: 'u2', when: '12/04 às 23:02', body: 'Excelente registro, Diego. Concordo com mover pra fila. Posso te ajudar a desenhar o contrato do job — me chama no DM.', reactions: { '👍': 4 }, signature: 'Ju Prado • Admin' },
    { id: 'p3', author: 'u1', when: '13/04 às 08:11', body: 'Obrigado pela transparência, time. Que a gente use essa situação como benchmark pra próxima. @dfontes anota aí pra gente discutir no comitê de infra da semana que vem.', reactions: { '👍': 6, '💪': 2 }, signature: 'Rafael • Head' },
    { id: 'p4', author: 'u9', when: '13/04 às 09:25', body: 'Deixa eu adicionar: nosso dashboard de monitoramento não pegou o spike de memória porque o intervalo de scraping estava em 5min. Já ajustei pra 30s.', reactions: { '👍': 3 }, signature: '' },
  ],
};

export const CHAT_CHANNELS = [
  { id: 'ch1', name: 'geral', topic: 'Canal geral da galera', type: 'text', unread: 0, members: 48 },
  { id: 'ch2', name: 'avisos', topic: 'Avisos oficiais — apenas admins postam', type: 'announce', unread: 2, members: 52 },
  { id: 'ch3', name: 'ti-devops', topic: 'Assuntos técnicos da infra', type: 'text', unread: 7, members: 14 },
  { id: 'ch4', name: 'lojas', topic: 'Papo entre gerentes e supervisores', type: 'text', unread: 0, members: 23 },
  { id: 'ch5', name: 'padaria', topic: '🥖 quem entende de pão', type: 'text', unread: 1, members: 11 },
  { id: 'ch6', name: 'memes', topic: 'Solta os meme', type: 'text', unread: 14, members: 41 },
  { id: 'ch7', name: 'random', topic: 'Conversa livre', type: 'text', unread: 0, members: 38 },
];

export const CHAT_MESSAGES = {
  ch1: [
    { id: 'm1', author: 'u8', when: '09:12', body: 'Bom dia, time! Lembrando que o treinamento de atendimento começa às 14h.' },
    { id: 'm2', author: 'u10', when: '09:13', body: 'Show! Já inscrevi minha equipe 🙌' },
    { id: 'm3', author: 'u3', when: '09:34', body: 'Alguém sabe se vai ter café?' },
    { id: 'm4', author: 'u8', when: '09:35', body: '@bcarva vai ter sim, rs. Pão de queijo também.', reply: 'm3' },
    { id: 'm5', author: 'u4', when: '09:41', body: 'Gente, terminei o novo banner do Dia das Mães. Posto aqui?' },
    { id: 'm6', author: 'u1', when: '09:42', body: 'Manda aí, Camila!' },
    { id: 'm7', author: 'u4', when: '09:43', body: '', attachment: { type: 'image', name: 'banner-maes-v3.png', size: '2.4 MB' } },
    { id: 'm8', author: 'u10', when: '09:44', body: 'Tá lindo! 🔥 Mas acho o verde poderia ser mais escuro — mais St Marché', reactions: { '🔥': 3, '❤️': 2 } },
    { id: 'm9', author: 'u4', when: '09:45', body: 'Boa sugestão. Ajusto e posto versão final ainda hoje.' },
    { id: 'm10', author: 'u2', when: '09:51', body: 'Quem puder testar o novo deploy do fórum em staging, me avisa. Link na pinned.' },
    { id: 'm11', author: 'u5', when: '09:52', body: 'Já tô testando 👍' },
  ],
};

export const VAULT_CATEGORIES = [
  { id: 'vc1', name: 'Servidores', icon: 'server', color: '#1f6fb8' },
  { id: 'vc2', name: 'Bancos de dados', icon: 'db', color: '#7e3f62' },
  { id: 'vc3', name: 'SaaS & Ferramentas', icon: 'box', color: '#9fb42c' },
  { id: 'vc4', name: 'Redes sociais', icon: 'share', color: '#ea431b' },
  { id: 'vc5', name: 'Fornecedores', icon: 'truck', color: '#f2801f' },
];

export const VAULT_ITEMS = [
  { id: 'v1', categoryId: 'vc1', name: 'VPS Produção (Hetzner)', url: 'console.hetzner.cloud', user: 'stm-prod@stmarche.com.br', password: '••••••••••••', tags: ['prod', 'critico'], updatedBy: 'u5', updatedAt: 'há 3 dias' },
  { id: 'v2', categoryId: 'vc1', name: 'VPS Staging', url: 'staging.stm.internal', user: 'deploy', password: '••••••••••••', tags: ['staging'], updatedBy: 'u5', updatedAt: 'há 1 semana' },
  { id: 'v3', categoryId: 'vc2', name: 'PostgreSQL Principal', url: 'pg-prod.stm.internal:5432', user: 'stm_app', password: '••••••••••••', tags: ['prod', 'db'], updatedBy: 'u2', updatedAt: 'há 2 dias' },
  { id: 'v4', categoryId: 'vc2', name: 'Redis Cache', url: 'redis-prod.stm.internal:6379', user: '—', password: '••••••••••••', tags: ['prod'], updatedBy: 'u5', updatedAt: 'há 5 dias' },
  { id: 'v5', categoryId: 'vc3', name: 'Cloudflare', url: 'dash.cloudflare.com', user: 'ti@stmarche.com.br', password: '••••••••••••', tags: ['dns', 'cdn'], updatedBy: 'u2', updatedAt: 'há 2 semanas' },
  { id: 'v6', categoryId: 'vc3', name: 'Google Workspace Admin', url: 'admin.google.com', user: 'admin@stmarche.com.br', password: '••••••••••••', tags: ['email'], updatedBy: 'u2', updatedAt: 'há 1 mês' },
  { id: 'v7', categoryId: 'vc3', name: 'Figma Organização', url: 'figma.com', user: 'design@stmarche.com.br', password: '••••••••••••', tags: ['design'], updatedBy: 'u4', updatedAt: 'há 3 semanas' },
  { id: 'v8', categoryId: 'vc4', name: 'Instagram @stmarche', url: 'instagram.com', user: 'stmarche', password: '••••••••••••', tags: ['social'], updatedBy: 'u10', updatedAt: 'há 1 semana' },
  { id: 'v9', categoryId: 'vc4', name: 'LinkedIn Company', url: 'linkedin.com', user: 'mkt@stmarche.com.br', password: '••••••••••••', tags: ['social'], updatedBy: 'u10', updatedAt: 'há 2 semanas' },
  { id: 'v10', categoryId: 'vc5', name: 'Portal Fornecedor SAP', url: 'sap.fornecedor.com.br', user: 'stm_compras', password: '••••••••••••', tags: ['erp'], updatedBy: 'u6', updatedAt: 'há 4 dias' },
];

export const DEFAULT_SHORTCUTS = [
  { id: 's1', label: 'Painel de Vendas', url: 'vendas.stm.internal', icon: 'chart', color: '#9fb42c', clicks: 1247 },
  { id: 's2', label: 'Chamados TI', url: 'chamados.stm.internal', icon: 'ticket', color: '#1f6fb8', clicks: 842 },
  { id: 's3', label: 'Ponto Eletrônico', url: 'ponto.stm.internal', icon: 'clock', color: '#f2801f', clicks: 2104 },
  { id: 's4', label: 'Estoque Central', url: 'estoque.stm.internal', icon: 'box', color: '#7e3f62', clicks: 612 },
  { id: 's5', label: 'Escala', url: 'escala.stm.internal', icon: 'calendar', color: '#ea431b', clicks: 1489 },
  { id: 's6', label: 'Relatórios BI', url: 'bi.stm.internal', icon: 'pie', color: '#eeb23e', clicks: 320 },
];

export const RANKING = [...USERS].sort((a, b) => b.reputation - a.reputation);

export const ACTIVITY_DATA = [42, 58, 51, 73, 68, 34, 22, 61, 82, 77, 94, 88, 102, 71];

export const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Nova rotina de recebimento — lojas zona sul', author: 'u1', when: 'há 2h', priority: 'high' },
  { id: 'a2', title: 'Manutenção da VPS agendada para sábado 03h', author: 'u2', when: 'há 5h', priority: 'medium' },
  { id: 'a3', title: 'Treinamento de atendimento — inscrições abertas', author: 'u8', when: 'há 1 dia', priority: 'low' },
];

export function userById(id) { return USERS.find(u => u.id === id); }
export function initials(name) { return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase(); }

// Toast system
let toastIdCounter = 0;
const toastListeners = new Set();
export function toast(msg, kind = 'ok') {
  const t = { id: ++toastIdCounter, msg, kind };
  toastListeners.forEach(fn => fn(t));
}
export function useToasts() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const fn = t => {
      setList(prev => [...prev, t]);
      setTimeout(() => setList(prev => prev.filter(x => x.id !== t.id)), 3200);
    };
    toastListeners.add(fn);
    return () => toastListeners.delete(fn);
  }, []);
  return list;
}
