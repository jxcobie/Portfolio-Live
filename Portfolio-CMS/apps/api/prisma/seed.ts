import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

const defaultWorkingHours = [
  { day_of_week: 1, start_time: '09:00', end_time: '12:00', is_working: true },
  { day_of_week: 1, start_time: '13:00', end_time: '17:00', is_working: true },
  { day_of_week: 2, start_time: '09:00', end_time: '12:00', is_working: true },
  { day_of_week: 2, start_time: '13:00', end_time: '17:00', is_working: true },
  { day_of_week: 3, start_time: '09:00', end_time: '12:00', is_working: true },
  { day_of_week: 3, start_time: '13:00', end_time: '17:00', is_working: true },
  { day_of_week: 4, start_time: '09:00', end_time: '12:00', is_working: true },
  { day_of_week: 4, start_time: '13:00', end_time: '17:00', is_working: true },
  { day_of_week: 5, start_time: '09:00', end_time: '12:00', is_working: true },
  { day_of_week: 5, start_time: '13:00', end_time: '17:00', is_working: true },
  { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_working: false },
  { day_of_week: 6, start_time: '09:00', end_time: '17:00', is_working: false }
];

async function main() {
  const workingHoursCount = await prisma.working_hours.count();
  if (workingHoursCount === 0) {
    await prisma.working_hours.createMany({ data: defaultWorkingHours });
  }

  console.log('✅ Prisma seed completed');
}

main()
  .catch((error) => {
    console.error('❌ Prisma seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
