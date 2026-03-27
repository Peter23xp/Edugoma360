import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { env } from "../../config/env";

// ── Password generator ──────────────────────────────────────────────────────
function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&!";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ── Default permissions matrix ──────────────────────────────────────────────
const DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  SUPER_ADMIN: {
    students: ["read", "create", "update", "archive"],
    grades: ["read", "create", "validate"],
    finance: ["read", "create", "reports"],
    teachers: ["read", "create", "update", "delete"],
    settings: ["read", "update"],
    attendance: ["read", "create"],
    communication: ["read", "create"],
  },
  PREFET: {
    students: ["read", "create", "update", "archive"],
    grades: ["read", "validate"],
    finance: ["read", "reports"],
    teachers: ["read", "create", "update"],
    settings: ["read"],
    attendance: ["read", "create"],
    communication: ["read", "create"],
  },
  ECONOME: {
    students: ["read"],
    grades: [],
    finance: ["read", "create", "reports"],
    teachers: ["read"],
    settings: [],
    attendance: ["read"],
    communication: ["read"],
  },
  SECRETAIRE: {
    students: ["read", "create", "update"],
    grades: ["read"],
    finance: ["read", "create"],
    teachers: ["read"],
    settings: [],
    attendance: ["read", "create"],
    communication: ["read", "create"],
  },
  ENSEIGNANT: {
    students: ["read"],
    grades: ["read", "create"],
    finance: [],
    teachers: [],
    settings: [],
    attendance: ["read", "create"],
    communication: ["read"],
  },
  PARENT: {
    students: ["read"],
    grades: ["read"],
    finance: ["read"],
    teachers: [],
    settings: [],
    attendance: ["read"],
    communication: ["read"],
  },
};

// ── Interfaces ──────────────────────────────────────────────────────────────
interface CreateUserDto {
  email?: string;
  nom: string;
  postNom: string;
  prenom?: string;
  phone?: string;
  role: string;
  password?: string;
  autoGeneratePassword: boolean;
  mustChangePassword?: boolean;
  isActive?: boolean;
  teacherId?: string;
  parentStudents?: string[];
  sendEmailCredentials?: boolean;
}

interface UserFilters {
  schoolId: string;
  role?: string;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
}

// ── Service ─────────────────────────────────────────────────────────────────
class UsersService {
  /**
   * List all users with optional filters
   */
  async getUsers(filters: UserFilters) {
    const where: any = { schoolId: filters.schoolId };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status === "ACTIVE") {
      where.isActive = true;
    } else if (filters.status === "INACTIVE") {
      where.isActive = false;
    }

    if (filters.search) {
      where.OR = [
        { nom: { contains: filters.search } },
        { postNom: { contains: filters.search } },
        { prenom: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nom: true,
        postNom: true,
        prenom: true,
        phone: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [{ role: "asc" }, { nom: "asc" }],
    });

    const formattedUsers = users.map(u => ({
        ...u,
        email: u.email?.startsWith("__no_email_") ? null : u.email,
        phone: u.phone?.startsWith("__no_phone_") ? null : u.phone,
    }));

    // Stats
    const allUsers = await prisma.user.findMany({
      where: { schoolId: filters.schoolId },
      select: { isActive: true, lastLoginAt: true },
    });

    const total = allUsers.length;
    const active = allUsers.filter((u) => u.isActive).length;
    const inactive = total - active;
    // "Online" = logged in within last 30 minutes
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const online = allUsers.filter(
      (u) => u.lastLoginAt && u.lastLoginAt > thirtyMinAgo,
    ).length;

    return {
      users: formattedUsers,
      stats: { total, active, inactive, online },
    };
  }

  /**
   * Create a new user
   */
  async createUser(schoolId: string, data: CreateUserDto) {
    // Generate or use manual password
    const plainPassword = data.autoGeneratePassword
      ? generateSecurePassword()
      : data.password || generateSecurePassword();

    const passwordHash = await bcrypt.hash(plainPassword, env.BCRYPT_ROUNDS);

    // Assign default permissions based on role
    const permissions = DEFAULT_PERMISSIONS[data.role] || {};

    // Generate unique placeholders for empty phone/email to avoid SQLite unique constraint issues
    const emailValue = data.email && data.email.trim() !== ""
      ? data.email.trim()
      : `__no_email_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const phoneValue = data.phone && data.phone.trim() !== ""
      ? data.phone.trim()
      : `__no_phone_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Check for duplicates before creating
    if (data.email && data.email.trim() !== "") {
      const existingEmail = await prisma.user.findFirst({
        where: { schoolId, email: emailValue },
      });
      if (existingEmail) {
        throw new Error("Un utilisateur avec cet email existe déjà dans cette école.");
      }
    }
    if (data.phone && data.phone.trim() !== "") {
      const existingPhone = await prisma.user.findFirst({
        where: { schoolId, phone: phoneValue },
      });
      if (existingPhone) {
        throw new Error("Un utilisateur avec ce numéro de téléphone existe déjà dans cette école.");
      }
    }

    console.log("[USERS] Creating user with:", { schoolId, email: emailValue, phone: phoneValue, role: data.role });

    const user = await prisma.user.create({
      data: {
        schoolId,
        nom: data.nom,
        postNom: data.postNom,
        prenom: data.prenom || null,
        email: emailValue,
        phone: phoneValue,
        role: data.role,
        passwordHash,
        isActive: data.isActive !== false,
        mustChangePassword: data.mustChangePassword !== false,
        permissions: JSON.stringify(permissions),
        ...(data.role === "ENSEIGNANT" && data.teacherId && {
            teacher: { connect: { id: data.teacherId } },
        }),
        ...(data.role === "PARENT" && data.parentStudents?.length && {
            parentStudents: { connect: data.parentStudents.map(id => ({ id })) },
        }),
      },
      select: {
        id: true,
        email: true,
        nom: true,
        postNom: true,
        prenom: true,
        phone: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    if (data.sendEmailCredentials && data.email) {
        // Send email mock
        console.log(`[EMAIL MOCK] Email sent to ${data.email} with password: ${plainPassword}`);
    }

    const formattedUser = {
      ...user,
      email: user.email?.startsWith("__no_email_") ? null : user.email,
      phone: user.phone?.startsWith("__no_phone_") ? null : user.phone,
    };

    return {
      user: formattedUser,
      generatedPassword: data.autoGeneratePassword ? plainPassword : undefined,
    };
  }

  /**
   * Update user permissions
   */
  async updatePermissions(
    userId: string,
    schoolId: string,
    permissions: Record<string, string[]>,
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId, schoolId },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    // We store as JSON string since sqlite doesn't support json column
    await prisma.user.update({
      where: { id: userId },
      data: { permissions: JSON.stringify(permissions) }
    });

    return {
      user: {
        id: user.id,
        nom: user.nom,
        role: user.role,
        permissions,
      },
    };
  }

  /**
   * Reset a user's password
   */
  async resetPassword(
    userId: string,
    schoolId: string,
    data: {
      newPassword?: string;
      autoGenerate: boolean;
      mustChangePassword?: boolean;
      sendEmail?: boolean;
    },
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId, schoolId },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const plainPassword = data.autoGenerate
      ? generateSecurePassword()
      : data.newPassword || generateSecurePassword();

    const passwordHash = await bcrypt.hash(plainPassword, env.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash, 
        mustChangePassword: data.mustChangePassword !== false,
      },
    });

    if (data.sendEmail && user.email) {
        // Mock sending email
        console.log(`[EMAIL MOCK] Password reset for ${user.email}. New password: ${plainPassword}`);
    }

    return {
      success: true,
      generatedPassword: data.autoGenerate ? plainPassword : undefined,
    };
  }

  /**
   * Toggle active status
   */
  async toggleStatus(userId: string, schoolId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, schoolId },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    // Prevent disabling last SUPER_ADMIN
    if (user.role === "SUPER_ADMIN" && user.isActive) {
      const adminCount = await prisma.user.count({
        where: { schoolId, role: "SUPER_ADMIN", isActive: true },
      });
      if (adminCount <= 1) {
        throw new Error("CANNOT_DISABLE_LAST_ADMIN");
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        nom: true,
        postNom: true,
        isActive: true,
      },
    });

    return { user: updated, isActive: updated.isActive };
  }

  /**
   * Delete user permanently
   */
  async deleteUser(userId: string, schoolId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, schoolId },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    if (user.role === "SUPER_ADMIN") {
      const adminCount = await prisma.user.count({
        where: { schoolId, role: "SUPER_ADMIN" },
      });
      if (adminCount <= 1) {
        throw new Error("CANNOT_DELETE_LAST_ADMIN");
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    return { success: true };
  }

  /**
   * Get default permissions for a role
   */
  getDefaultPermissions(role: string) {
    return DEFAULT_PERMISSIONS[role] || {};
  }
}

export const usersService = new UsersService();
