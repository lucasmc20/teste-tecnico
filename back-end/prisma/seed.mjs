import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_ITEMS = [
  {
    name: 'Notebook Dell XPS 15',
    description: 'Intel i7 12ª geração, 16 GB RAM, SSD 512 GB, tela 4K OLED.',
    price: 8499.9,
    stock: 12,
  },
  {
    name: 'Monitor LG UltraWide 34"',
    description: 'Resolução 3440×1440, painel IPS, 144 Hz, HDR10.',
    price: 3299.0,
    stock: 8,
  },
  {
    name: 'Teclado Mecânico Keychron K8',
    description: 'Switch Brown, layout TKL, retroiluminação RGB, wireless.',
    price: 599.9,
    stock: 35,
  },
  {
    name: 'Mouse Logitech MX Master 3',
    description: 'Sensor MagSpeed, até 7 dispositivos, recarregável via USB-C.',
    price: 479.9,
    stock: 20,
  },
  {
    name: 'Headset Sony WH-1000XM5',
    description: 'Cancelamento de ruído líder de mercado, bateria 30 h, Bluetooth 5.2.',
    price: 1799.0,
    stock: 15,
  },
  {
    name: 'Webcam Logitech Brio 4K',
    description: 'Resolução 4K 30 fps, HDR, correção de luz automática.',
    price: 1199.0,
    stock: 10,
  },
  {
    name: 'Hub USB-C Anker 7-em-1',
    description: 'HDMI 4K, 3× USB-A 3.0, SD, microSD, USB-C Power Delivery 85 W.',
    price: 229.9,
    stock: 50,
  },
];

async function main() {
  const count = await prisma.item.count();

  if (count > 0) {
    console.log(`[seed] ${count} item(s) já existem — seed ignorado.`);
    return;
  }

  await prisma.item.createMany({ data: SEED_ITEMS });
  console.log(`[seed] ${SEED_ITEMS.length} itens inseridos com sucesso.`);
}

main()
  .catch((err) => {
    console.error('[seed] Erro:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
