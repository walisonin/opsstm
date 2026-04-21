import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from './lib/db.js';

const DEFAULT_FORUM_CATEGORIES = [
  { name: 'Avisos & Comunicados', description: 'Anúncios oficiais da diretoria e RH', icon: 'megaphone', color: '#c72124', order: 1 },
  { name: 'Operações de Loja', description: 'Rotinas, escala, abastecimento, caixa', icon: 'store', color: '#9fb42c', order: 2 },
  { name: 'TI & Infraestrutura', description: 'VPS, sistemas, acessos, chamados', icon: 'server', color: '#1f6fb8', order: 3 },
  { name: 'Compras & Fornecedores', description: 'Novos itens, negociações, trocas', icon: 'cart', color: '#f2801f', order: 4 },
  { name: 'RH & Gente', description: 'Vagas, benefícios, treinamentos', icon: 'users', color: '#7e3f62', order: 5 },
  { name: 'Ideias & Sugestões', description: 'Um espaço pra brainstorm', icon: 'bulb', color: '#eeb23e', order: 6 },
  { name: 'Off-topic', description: 'Assuntos livres', icon: 'chat', color: '#1f8a8a', order: 7 },
];

const DEFAULT_CHAT_CHANNELS = [
  { name: 'geral', topic: 'Canal geral da galera', type: 'text', order: 1 },
  { name: 'avisos', topic: 'Avisos oficiais — apenas admins postam', type: 'announce', order: 2 },
  { name: 'ti-devops', topic: 'Assuntos técnicos da infra', type: 'text', order: 3 },
  { name: 'lojas', topic: 'Papo entre gerentes e supervisores', type: 'text', order: 4 },
];

const DEFAULT_VAULT_CATEGORIES = [
  { name: 'Servidores', icon: 'server', color: '#1f6fb8', order: 1 },
  { name: 'Bancos de dados', icon: 'db', color: '#7e3f62', order: 2 },
  { name: 'SaaS & Ferramentas', icon: 'box', color: '#9fb42c', order: 3 },
  { name: 'Redes sociais', icon: 'share', color: '#ea431b', order: 4 },
  { name: 'Fornecedores', icon: 'truck', color: '#f2801f', order: 5 },
];

function randomPassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(length);
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[bytes[i] % chars.length];
  return pw;
}

export async function seedIfEmpty() {
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@stmarche.com.br').toLowerCase();
    const adminHandle = adminEmail.split('@')[0].replace(/[^a-z0-9._-]/g, '');
    const adminPassword = process.env.ADMIN_PASSWORD || randomPassword();
    const hash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        handle: adminHandle,
        name: adminName,
        passwordHash: hash,
        role: 'super_admin',
        status: 'offline',
        color: '#9fb42c',
        title: 'Super Admin',
        roleDesc: 'Administrador do Portal',
        mustChangePw: !process.env.ADMIN_PASSWORD,
      },
    });

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  🎉 PORTAL INSTALADO — CREDENCIAIS DE ACESSO             ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Nome:  ${adminName.padEnd(49)} ║`);
    console.log(`║  Email: ${adminEmail.padEnd(49)} ║`);
    console.log(`║  Senha: ${adminPassword.padEnd(49)} ║`);
    console.log('║                                                          ║');
    console.log('║  ⚠  ANOTE A SENHA ACIMA — você precisa trocá-la no      ║');
    console.log('║     primeiro login. Ela só aparece 1 vez neste log.     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
  }

  // Forum categories
  if ((await prisma.forumCategory.count()) === 0) {
    for (const c of DEFAULT_FORUM_CATEGORIES) {
      await prisma.forumCategory.create({ data: c });
    }
    console.log('[seed] categorias de fórum criadas');
  }

  // Chat channels
  if ((await prisma.chatChannel.count()) === 0) {
    for (const c of DEFAULT_CHAT_CHANNELS) {
      await prisma.chatChannel.create({ data: c });
    }
    console.log('[seed] canais de chat criados');
  }

  // Vault categories
  if ((await prisma.vaultCategory.count()) === 0) {
    for (const c of DEFAULT_VAULT_CATEGORIES) {
      await prisma.vaultCategory.create({ data: c });
    }
    console.log('[seed] categorias do cofre criadas');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedIfEmpty().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
