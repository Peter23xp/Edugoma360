import prisma from '../../lib/prisma';

export class MaterialService {
  async getItems(schoolId: string, query: { category?: string; status?: string; search?: string }) {
    const where: any = { schoolId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.name = { contains: query.search };
    }

    const items = await prisma.materialItem.findMany({
      where,
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { createdBy: { select: { nom: true, postNom: true } } },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    let filtered = items;
    if (query.status) {
      filtered = items.filter((item) => {
        const total = item.goodQty + item.usedQty + item.brokenQty;
        if (query.status === 'LOW_STOCK') return total < item.minStock;
        if (query.status === 'BROKEN_HIGH') return total > 0 && item.brokenQty / total > 0.1;
        return true;
      });
    }

    const allItems = filtered;
    const stats = {
      totalItems: allItems.reduce((s, i) => s + i.goodQty + i.usedQty + i.brokenQty, 0),
      goodItems: allItems.reduce((s, i) => s + i.goodQty, 0),
      usedItems: allItems.reduce((s, i) => s + i.usedQty, 0),
      brokenItems: allItems.reduce((s, i) => s + i.brokenQty, 0),
      totalValue: allItems.reduce((s, i) => s + (i.goodQty + i.usedQty) * i.unitValue, 0),
    };

    const mappedItems = allItems.map((item) => {
      const totalQty = item.goodQty + item.usedQty + item.brokenQty;
      return {
        ...item,
        totalQty,
        totalValue: (item.goodQty + item.usedQty) * item.unitValue,
        isLowStock: totalQty < item.minStock,
      };
    });

    return { items: mappedItems, stats };
  }

  async createItem(schoolId: string, data: {
    name: string;
    category: string;
    goodQty: number;
    usedQty: number;
    brokenQty: number;
    unitValue: number;
    minStock: number;
    location?: string;
    acquiredAt?: string;
    notes?: string;
  }) {
    const item = await prisma.materialItem.create({
      data: {
        schoolId,
        name: data.name,
        category: data.category,
        goodQty: data.goodQty,
        usedQty: data.usedQty,
        brokenQty: data.brokenQty,
        unitValue: data.unitValue,
        minStock: data.minStock,
        location: data.location,
        acquiredAt: data.acquiredAt ? new Date(data.acquiredAt) : undefined,
        notes: data.notes,
      },
    });
    return item;
  }

  async updateItem(schoolId: string, id: string, data: Partial<{
    name: string;
    category: string;
    goodQty: number;
    usedQty: number;
    brokenQty: number;
    unitValue: number;
    minStock: number;
    location: string;
    notes: string;
  }>) {
    const item = await prisma.materialItem.findFirst({ where: { id, schoolId } });
    if (!item) throw new Error('Article non trouvé');

    return prisma.materialItem.update({
      where: { id },
      data,
    });
  }

  async deleteItem(schoolId: string, id: string) {
    const item = await prisma.materialItem.findFirst({ where: { id, schoolId } });
    if (!item) throw new Error('Article non trouvé');

    await prisma.materialItem.delete({ where: { id } });
  }

  async createMovement(schoolId: string, itemId: string, userId: string, data: {
    type: string;
    quantity: number;
    fromStatus?: string;
    toStatus?: string;
    reason: string;
    date: string;
  }) {
    const item = await prisma.materialItem.findFirst({ where: { id: itemId, schoolId } });
    if (!item) throw new Error('Article non trouvé');

    const updateData: any = {};

    if (data.type === 'ENTRY') {
      const status = data.toStatus || 'GOOD';
      if (status === 'GOOD') updateData.goodQty = item.goodQty + data.quantity;
      else if (status === 'USED') updateData.usedQty = item.usedQty + data.quantity;
      else if (status === 'BROKEN') updateData.brokenQty = item.brokenQty + data.quantity;
    } else if (data.type === 'EXIT') {
      const status = data.fromStatus || 'GOOD';
      if (status === 'GOOD') {
        if (item.goodQty < data.quantity) throw new Error('Quantité insuffisante');
        updateData.goodQty = item.goodQty - data.quantity;
      } else if (status === 'USED') {
        if (item.usedQty < data.quantity) throw new Error('Quantité insuffisante');
        updateData.usedQty = item.usedQty - data.quantity;
      } else if (status === 'BROKEN') {
        if (item.brokenQty < data.quantity) throw new Error('Quantité insuffisante');
        updateData.brokenQty = item.brokenQty - data.quantity;
      }
    } else if (data.type === 'STATUS_CHANGE') {
      if (!data.fromStatus || !data.toStatus) throw new Error('Statuts requis pour un changement');
      if (data.fromStatus === data.toStatus) throw new Error('Les statuts source et cible doivent être différents');
      const fromKey = data.fromStatus === 'GOOD' ? 'goodQty' : data.fromStatus === 'USED' ? 'usedQty' : 'brokenQty';
      const toKey = data.toStatus === 'GOOD' ? 'goodQty' : data.toStatus === 'USED' ? 'usedQty' : 'brokenQty';
      if ((item as any)[fromKey] < data.quantity) throw new Error('Quantité insuffisante');
      updateData[fromKey] = (item as any)[fromKey] - data.quantity;
      updateData[toKey] = (item as any)[toKey] + data.quantity;
    }

    const [updatedItem] = await prisma.$transaction([
      prisma.materialItem.update({ where: { id: itemId }, data: updateData }),
      prisma.stockMovement.create({
        data: {
          itemId,
          type: data.type,
          quantity: data.quantity,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          reason: data.reason,
          date: new Date(data.date),
          createdById: userId,
        },
      }),
    ]);

    return updatedItem;
  }

  async getMovements(schoolId: string, itemId: string) {
    const item = await prisma.materialItem.findFirst({ where: { id: itemId, schoolId } });
    if (!item) throw new Error('Article non trouvé');

    return prisma.stockMovement.findMany({
      where: { itemId },
      include: { createdBy: { select: { nom: true, postNom: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const materialService = new MaterialService();
