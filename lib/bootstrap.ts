import { prisma } from "@/lib/db";

export async function createMissingStarterHabits(userId: string) {
  const templates = await prisma.habitTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  if (templates.length === 0) return;

  const existing = await prisma.habit.findMany({
    where: { userId, archivedAt: null },
    select: { name: true }
  });

  const existingNames = new Set(existing.map((h: { name: string }) => h.name.toLowerCase()));

  for (const template of templates) {
    if (existingNames.has(template.name.toLowerCase())) continue;

    await prisma.habit.create({
      data: {
        userId,
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: template.color,
        targetPerWeek: template.targetPerWeek
      }
    });
  }
}
