import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const templates = [
    ["SLEEP_8_HOURS", "Sleep 8 Hours", "Rest and recharge for a better tomorrow", "😴", "purple", 7, 10],
    ["DRINK_WATER", "Drink Water", "8 glasses / 3 liters a day", "💧", "blue", 7, 20],
    ["WORKOUT", "Workout", "Move your body and build energy", "💪", "green", 4, 30],
    ["BREAKFAST", "Eat Breakfast", "Start the day with a proper meal", "🍳", "yellow", 7, 40],
    ["LUNCH", "Eat Lunch", "Take a real lunch break", "🍱", "orange", 7, 50],
    ["DINNER", "Eat Dinner", "Finish the day with a balanced dinner", "🍽️", "pink", 7, 60]
  ] as const;

  for (const [code, name, description, icon, color, targetPerWeek, sortOrder] of templates) {
    await prisma.habitTemplate.upsert({
      where: { code },
      update: { name, description, icon, color, targetPerWeek, sortOrder, isActive: true },
      create: { code, name, description, icon, color, targetPerWeek, sortOrder, isActive: true }
    });
  }

  const rewards = [
    ["FIRST_HUG", "First Hug", "Complete your first habit.", "💖", 10, "TOTAL_COMPLETIONS", 1, 10],
    ["WEEK_GLOW", "7-Day Glow", "Complete 7 habit check-ins.", "🔥", 30, "TOTAL_COMPLETIONS", 7, 20],
    ["COZY_CHAMPION", "Cozy Champion", "Complete 100 habit check-ins.", "👑", 100, "TOTAL_COMPLETIONS", 100, 30],
    ["BATTLE_SPARK", "Battle Spark", "Join your first battle room.", "⚔️", 20, "BATTLE_JOINED", 1, 40]
  ] as const;

  for (const [code, name, description, icon, points, ruleType, ruleValue, sortOrder] of rewards) {
    await prisma.rewardBadgeDefinition.upsert({
      where: { code },
      update: { name, description, icon, points, ruleType, ruleValue, sortOrder, isActive: true },
      create: { code, name, description, icon, points, ruleType, ruleValue, sortOrder, isActive: true }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
