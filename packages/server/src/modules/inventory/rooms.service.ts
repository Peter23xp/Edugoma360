import prisma from '../../lib/prisma';

export class RoomsService {
  async getRooms(schoolId: string, query: { type?: string; status?: string }) {
    const where: any = { schoolId };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        assignedClass: {
          select: {
            id: true,
            name: true,
            _count: { select: { enrollments: true } },
          },
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            postNom: true,
            prenom: true,
            telephone: true,
            email: true,
          },
        },
        maintenanceRequests: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          select: { id: true },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    const mapped = rooms.map((room) => {
      let equipments: string[] = [];
      try { equipments = JSON.parse(room.equipments); } catch { /* ignore corrupt data */ }
      return {
        ...room,
        equipments,
        currentOccupancy: (room.assignedClass as any)?._count?.enrollments || 0,
        maintenanceRequestsCount: room.maintenanceRequests.length,
      };
    });

    const stats = {
      total: rooms.length,
      good: rooms.filter((r) => r.status === 'GOOD').length,
      degraded: rooms.filter((r) => r.status === 'DEGRADED').length,
      closed: rooms.filter((r) => r.status === 'CLOSED').length,
    };

    return { rooms: mapped, stats };
  }

  async createRoom(schoolId: string, data: {
    name: string;
    type: string;
    capacity: number;
    status?: string;
    building?: string;
    floor?: string;
    classId?: string;
    responsableId?: string;
    equipments?: string[];
    stateDescription?: string;
  }) {
    const room = await prisma.room.create({
      data: {
        schoolId,
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        status: data.status || 'GOOD',
        building: data.building,
        floor: data.floor,
        assignedClassId: data.classId,
        responsableId: data.responsableId,
        equipments: JSON.stringify(data.equipments || []),
        stateDescription: data.stateDescription,
      },
    });
    return room;
  }

  async updateRoom(schoolId: string, id: string, data: Partial<{
    name: string;
    type: string;
    capacity: number;
    status: string;
    building: string;
    floor: string;
    classId: string | null;
    responsableId: string | null;
    equipments: string[];
    stateDescription: string;
  }>) {
    const room = await prisma.room.findFirst({ where: { id, schoolId } });
    if (!room) throw new Error('Salle non trouvée');

    const updateData: any = { ...data };
    if (data.equipments) updateData.equipments = JSON.stringify(data.equipments);
    if ('classId' in data) {
      updateData.assignedClassId = data.classId;
      delete updateData.classId;
    }

    return prisma.room.update({ where: { id }, data: updateData });
  }

  async deleteRoom(schoolId: string, id: string) {
    const room = await prisma.room.findFirst({ where: { id, schoolId } });
    if (!room) throw new Error('Salle non trouvée');
    await prisma.room.delete({ where: { id } });
  }

  async getOccupancy(schoolId: string) {
    const rooms = await prisma.room.findMany({
      where: { schoolId, type: 'CLASSROOM' },
      include: {
        assignedClass: {
          select: {
            name: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rooms.map((room) => {
      const effectif = (room.assignedClass as any)?._count?.enrollments || 0;
      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        className: room.assignedClass?.name || null,
        effectif,
        occupancyRate: room.capacity > 0 && room.assignedClass
          ? Math.round((effectif / room.capacity) * 100)
          : 0,
      };
    });
  }
}

export const roomsService = new RoomsService();
