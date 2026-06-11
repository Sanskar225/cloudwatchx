import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudwatchx.io' },
    update: {},
    create: {
      email: 'admin@cloudwatchx.io',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 12);
  await prisma.user.upsert({
    where: { email: 'viewer@cloudwatchx.io' },
    update: {},
    create: {
      email: 'viewer@cloudwatchx.io',
      name: 'Viewer User',
      password: viewerPassword,
      role: 'VIEWER',
    },
  });

  // Demo servers
  const servers = [
    { name: 'Production API', hostname: 'prod-api-01', ipAddress: '10.0.1.10', group: 'Production', tags: ['api', 'production'] },
    { name: 'Production DB', hostname: 'prod-db-01', ipAddress: '10.0.1.20', group: 'Production', tags: ['database', 'production'] },
    { name: 'Staging API', hostname: 'staging-api-01', ipAddress: '10.0.2.10', group: 'Staging', tags: ['api', 'staging'] },
    { name: 'Load Balancer', hostname: 'lb-01', ipAddress: '10.0.0.1', group: 'Infrastructure', tags: ['lb', 'nginx'] },
  ];

  for (const s of servers) {
    await prisma.server.upsert({
      where: { hostname: s.hostname },
      update: {},
      create: { ...s, status: 'HEALTHY', lastSeen: new Date() },
    });
  }

  const server = await prisma.server.findFirst({ where: { hostname: 'prod-api-01' } });

  // Default monitoring rules
  const rules = [
    { name: 'High CPU', metric: 'cpu', operator: '>', threshold: 80, severity: 'HIGH' as const },
    { name: 'Critical CPU', metric: 'cpu', operator: '>', threshold: 90, severity: 'CRITICAL' as const },
    { name: 'High RAM', metric: 'ram', operator: '>', threshold: 85, severity: 'HIGH' as const },
    { name: 'Critical RAM', metric: 'ram', operator: '>', threshold: 95, severity: 'CRITICAL' as const },
    { name: 'High Disk', metric: 'disk', operator: '>', threshold: 80, severity: 'MEDIUM' as const },
    { name: 'Critical Disk', metric: 'disk', operator: '>', threshold: 90, severity: 'CRITICAL' as const },
  ];

  for (const rule of rules) {
    await prisma.monitoringRule.create({ data: rule });
  }

  // Sample incident
  if (server) {
    await prisma.incident.create({
      data: {
        title: 'High CPU: Production API',
        description: 'CPU utilization exceeded 80% on prod-api-01',
        severity: 'HIGH',
        status: 'OPEN',
        serverId: server.id,
        assignedToId: admin.id,
      },
    });
  }

  console.log('✅ Database seeded successfully');
  console.log('👤 Admin: admin@cloudwatchx.io / admin123');
  console.log('👤 Viewer: viewer@cloudwatchx.io / viewer123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
