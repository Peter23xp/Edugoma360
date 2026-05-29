import prisma from '../../lib/prisma';

export class LibraryService {
  async getBooks(schoolId: string, query: { matiere?: string; niveau?: string; disponible?: string; search?: string }) {
    const where: any = { schoolId };

    if (query.matiere) where.matiere = query.matiere;
    if (query.search) where.titre = { contains: query.search };

    const books = await prisma.book.findMany({
      where,
      include: {
        loans: {
          where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
          include: {
            student: { select: { nom: true, postNom: true, prenom: true, matricule: true } },
          },
        },
      },
      orderBy: [{ matiere: 'asc' }, { titre: 'asc' }],
    });

    let filtered = books;
    if (query.niveau) {
      const niveau = parseInt(query.niveau, 10);
      filtered = books.filter((b) => {
        try {
          const niveaux = JSON.parse(b.niveaux) as number[];
          return niveaux.includes(niveau);
        } catch {
          return false;
        }
      });
    }
    if (query.disponible === 'true') {
      filtered = filtered.filter((b) => b.availableQty > 0);
    }

    const stats = {
      total: filtered.reduce((s, b) => s + b.totalQty, 0),
      available: filtered.reduce((s, b) => s + b.availableQty, 0),
      loaned: filtered.reduce((s, b) => s + (b.totalQty - b.availableQty), 0),
      overdue: 0,
    };

    const activeLoans = await prisma.bookLoan.count({
      where: { book: { schoolId }, status: 'OVERDUE' },
    });
    stats.overdue = activeLoans;

    return { books: filtered, stats };
  }

  async createBook(schoolId: string, data: {
    titre: string;
    auteur?: string;
    isbn?: string;
    matiere: string;
    niveaux: number[];
    totalQty: number;
    etat: string;
    unitValue?: number;
    acquiredAt?: string;
  }) {
    const book = await prisma.book.create({
      data: {
        schoolId,
        titre: data.titre,
        auteur: data.auteur,
        isbn: data.isbn,
        matiere: data.matiere,
        niveaux: JSON.stringify(data.niveaux),
        totalQty: data.totalQty,
        availableQty: data.totalQty,
        etat: data.etat,
        unitValue: data.unitValue,
        acquiredAt: data.acquiredAt ? new Date(data.acquiredAt) : undefined,
      },
    });
    return book;
  }

  async updateBook(schoolId: string, id: string, data: Partial<{
    titre: string;
    auteur: string;
    isbn: string;
    matiere: string;
    niveaux: number[];
    totalQty: number;
    etat: string;
    unitValue: number;
  }>) {
    const book = await prisma.book.findFirst({ where: { id, schoolId } });
    if (!book) throw new Error('Livre non trouvé');

    const updateData: any = { ...data };
    if (data.niveaux) updateData.niveaux = JSON.stringify(data.niveaux);
    if (data.totalQty !== undefined) {
      const loanedQty = book.totalQty - book.availableQty;
      if (data.totalQty < loanedQty) {
        throw new Error(`Impossible : ${loanedQty} exemplaire(s) actuellement prêté(s)`);
      }
      updateData.availableQty = data.totalQty - loanedQty;
    }

    return prisma.book.update({ where: { id }, data: updateData });
  }

  async createLoan(schoolId: string, bookId: string, userId: string, data: {
    studentId: string;
    exemplaire?: string;
    datePret: string;
    dateRetourPrevue: string;
    notes?: string;
  }) {
    const book = await prisma.book.findFirst({ where: { id: bookId, schoolId } });
    if (!book) throw new Error('Livre non trouvé');
    if (book.availableQty <= 0) throw new Error('Aucun exemplaire disponible');

    const [loan] = await prisma.$transaction([
      prisma.bookLoan.create({
        data: {
          bookId,
          studentId: data.studentId,
          exemplaire: data.exemplaire,
          loanDate: new Date(data.datePret),
          expectedReturn: new Date(data.dateRetourPrevue),
          notes: data.notes,
          createdById: userId,
        },
        include: {
          student: { select: { nom: true, postNom: true, prenom: true } },
          book: { select: { titre: true } },
        },
      }),
      prisma.book.update({
        where: { id: bookId },
        data: { availableQty: book.availableQty - 1 },
      }),
    ]);

    return loan;
  }

  async returnLoan(schoolId: string, loanId: string, data: {
    etatRetour: string;
    coutReparation?: number;
  }) {
    const loan = await prisma.bookLoan.findFirst({
      where: { id: loanId, book: { schoolId } },
      include: { book: true },
    });
    if (!loan) throw new Error('Prêt non trouvé');
    if (loan.status === 'RETURNED') throw new Error('Prêt déjà retourné');

    const [updatedLoan] = await prisma.$transaction([
      prisma.bookLoan.update({
        where: { id: loanId },
        data: {
          actualReturn: new Date(),
          etatRetour: data.etatRetour,
          coutReparation: data.coutReparation,
          status: 'RETURNED',
        },
        include: {
          student: { select: { nom: true, postNom: true } },
          book: { select: { titre: true } },
        },
      }),
      prisma.book.update({
        where: { id: loan.bookId },
        data: { availableQty: loan.book.availableQty + 1 },
      }),
    ]);

    return updatedLoan;
  }

  async getLoans(schoolId: string, query: { status?: string; bookId?: string; studentId?: string }) {
    const where: any = { book: { schoolId } };
    if (query.status) where.status = query.status;
    if (query.bookId) where.bookId = query.bookId;
    if (query.studentId) where.studentId = query.studentId;

    return prisma.bookLoan.findMany({
      where,
      include: {
        book: { select: { titre: true, matiere: true } },
        student: { select: { nom: true, postNom: true, prenom: true, matricule: true, enrollments: { take: 1, orderBy: { enrolledAt: 'desc' }, include: { class: { select: { name: true } } } } } },
      },
      orderBy: { loanDate: 'desc' },
    });
  }

  async markOverdueLoans(schoolId: string) {
    const now = new Date();
    const result = await prisma.bookLoan.updateMany({
      where: {
        book: { schoolId },
        status: 'ACTIVE',
        expectedReturn: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });
    return result.count;
  }

  async getOverdueLoans(schoolId: string) {
    return prisma.bookLoan.findMany({
      where: { book: { schoolId }, status: 'OVERDUE' },
      include: {
        book: { select: { titre: true } },
        student: {
          select: {
            nom: true, postNom: true, prenom: true, matricule: true,
            telPere: true, telMere: true, telTuteur: true,
            enrollments: { take: 1, orderBy: { enrolledAt: 'desc' }, include: { class: { select: { name: true } } } },
          },
        },
      },
      orderBy: { expectedReturn: 'asc' },
    });
  }
}

export const libraryService = new LibraryService();
