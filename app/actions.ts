"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { clearSession, getCurrentUser, isConfiguredAdminEmail, setSession } from "@/lib/session";
import { createMissingStarterHabits } from "@/lib/bootstrap";
import { parseDateOnly, todayUtc, addDays, toDateOnlyString } from "@/lib/dates";

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function authDatabaseError() {
  return {
    error:
      "Database is not ready yet. Please check Neon DATABASE_URL and run Prisma db push + seed."
  };
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please enter a valid name, email, and password." };

  try {
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "This email is already registered." };

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        isAdmin: isConfiguredAdminEmail(email)
      }
    });

    await createMissingStarterHabits(user.id);
    await setSession(user.id);
    redirect("/");
  } catch (error) {
    console.error("Register failed", error);
    return authDatabaseError();
  }
}

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please enter your email and password." };

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });

    if (!user) {
      return { error: "No account found for this email. Please register first." };
    }

    if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return { error: "Wrong password. Please try again." };
    }

    if (!user.isAdmin && isConfiguredAdminEmail(user.email)) {
      await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
    }

    await createMissingStarterHabits(user.id);
    await setSession(user.id);
    redirect("/");
  } catch (error) {
    console.error("Login failed", error);
    return authDatabaseError();
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}


const ProfileSchema = z.object({
  name: z.string().min(2).max(50),
  mascot: z.string().min(1).max(8),
  themeColor: z.enum(["pink", "purple", "blue", "green", "yellow", "orange"])
});

export async function updateProfileAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please choose a name, mascot, and dashboard color." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      mascot: parsed.data.mascot,
      themeColor: parsed.data.themeColor
    }
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: "Profile updated — your dashboard feels more like you ✨" };
}

const HabitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(80),
  description: z.string().max(160).default(""),
  icon: z.string().min(1).max(6),
  color: z.string().min(2).max(30),
  targetPerWeek: z.coerce.number().min(1).max(7)
});

export async function saveHabitAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = HabitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check your habit details." };

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.habit.updateMany({
      where: { id, userId: user.id },
      data
    });
  } else {
    await prisma.habit.create({
      data: {
        userId: user.id,
        ...data
      }
    });
  }

  revalidatePath("/");
  redirect("/");
}

export async function archiveHabitAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await prisma.habit.updateMany({
    where: { id, userId: user.id },
    data: { archivedAt: new Date() }
  });

  revalidatePath("/");
  redirect("/");
}

const RewardSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(80),
  description: z.string().max(160),
  icon: z.string().min(1).max(6),
  points: z.coerce.number().min(0).max(999),
  ruleType: z.string().min(2).max(80),
  ruleValue: z.coerce.number().min(1).max(9999),
  sortOrder: z.coerce.number().min(0).max(9999),
  isActive: z.preprocess((v) => v === "on" || v === "true", z.boolean())
});

export async function saveRewardAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) return { error: "Admin access is needed to edit rewards." };

  const parsed = RewardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check reward details." };

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.rewardBadgeDefinition.update({ where: { id }, data });
  } else {
    await prisma.rewardBadgeDefinition.create({ data });
  }

  revalidatePath("/rewards/manage");
  redirect("/rewards/manage");
}

export async function saveRewardDirectAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/rewards");

  const parsed = RewardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/rewards/manage?error=invalid-reward");
  }

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.rewardBadgeDefinition.update({ where: { id }, data });
  } else {
    await prisma.rewardBadgeDefinition.create({ data });
  }

  revalidatePath("/rewards/manage");
  redirect("/rewards/manage");
}

export async function deleteRewardAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/rewards");
  const id = String(formData.get("id") ?? "");
  await prisma.rewardBadgeDefinition.delete({ where: { id } });
  revalidatePath("/rewards/manage");
}

function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const BattleSchema = z.object({
  name: z.string().min(2).max(80),
  emoji: z.string().min(1).max(6),
  description: z.string().max(160),
  startDate: z.string().min(10),
  endDate: z.string().min(10)
});

export async function createBattleAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = BattleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the battle room details." };

  let code = generateJoinCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.challengeRoom.findUnique({ where: { joinCode: code } });
    if (!exists) break;
    code = generateJoinCode();
  }

  const room = await prisma.challengeRoom.create({
    data: {
      ownerId: user.id,
      name: parsed.data.name,
      emoji: parsed.data.emoji,
      description: parsed.data.description,
      startDate: parseDateOnly(parsed.data.startDate),
      endDate: parseDateOnly(parsed.data.endDate),
      joinCode: code,
      members: {
        create: { userId: user.id }
      }
    }
  });

  revalidatePath("/battle");
  redirect(`/battle/${room.id}`);
}

export async function joinBattleAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const code = String(formData.get("joinCode") ?? "").trim().toUpperCase();
  const room = await prisma.challengeRoom.findUnique({ where: { joinCode: code } });
  if (!room) return { error: "Battle code not found." };

  await prisma.challengeMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
    update: {},
    create: { roomId: room.id, userId: user.id }
  });

  const badge = await prisma.rewardBadgeDefinition.findFirst({ where: { code: "BATTLE_SPARK" } });
  if (badge) {
    await prisma.userRewardBadge.upsert({
      where: { userId_rewardBadgeId: { userId: user.id, rewardBadgeId: badge.id } },
      update: {},
      create: { userId: user.id, rewardBadgeId: badge.id }
    });
  }

  redirect(`/battle/${room.id}`);
}

export async function defaultBattleDates() {
  const today = todayUtc();
  return {
    start: toDateOnlyString(today),
    end: toDateOnlyString(addDays(today, 6))
  };
}
