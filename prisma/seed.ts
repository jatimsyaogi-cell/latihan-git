import { PrismaClient, EmployeeStatus } from "@prisma/client";

const prisma = new PrismaClient();

const employees = [
  {
    nip: "EMP001",
    name: "Andi Wijaya",
    email: "andi.wijaya@example.com",
    phone: "081234567890",
    department: "Engineering",
    position: "Software Engineer",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2022-01-15"),
  },
  {
    nip: "EMP002",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "081234567891",
    department: "Human Resources",
    position: "HR Specialist",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2021-06-01"),
  },
  {
    nip: "EMP003",
    name: "Citra Lestari",
    email: "citra.lestari@example.com",
    phone: "081234567892",
    department: "Finance",
    position: "Accountant",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2020-03-20"),
  },
  {
    nip: "EMP004",
    name: "Dewi Anggraini",
    email: "dewi.anggraini@example.com",
    phone: null,
    department: "Marketing",
    position: "Marketing Manager",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2019-11-10"),
  },
  {
    nip: "EMP005",
    name: "Eko Prasetyo",
    email: "eko.prasetyo@example.com",
    phone: "081234567894",
    department: "Operations",
    position: "Operations Lead",
    status: EmployeeStatus.INACTIVE,
    joinedAt: new Date("2018-08-05"),
  },
  {
    nip: "EMP006",
    name: "Fitri Handayani",
    email: "fitri.handayani@example.com",
    phone: "081234567895",
    department: "Sales",
    position: "Sales Executive",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2023-02-14"),
  },
  {
    nip: "EMP007",
    name: "Gilang Ramadhan",
    email: "gilang.ramadhan@example.com",
    phone: "081234567896",
    department: "Engineering",
    position: "Frontend Developer",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2023-07-01"),
  },
  {
    nip: "EMP008",
    name: "Hana Putri",
    email: "hana.putri@example.com",
    phone: null,
    department: "Human Resources",
    position: "Recruiter",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2024-01-08"),
  },
  {
    nip: "EMP009",
    name: "Irfan Maulana",
    email: "irfan.maulana@example.com",
    phone: "081234567898",
    department: "Finance",
    position: "Financial Analyst",
    status: EmployeeStatus.INACTIVE,
    joinedAt: new Date("2021-09-30"),
  },
  {
    nip: "EMP010",
    name: "Joko Susilo",
    email: "joko.susilo@example.com",
    phone: "081234567899",
    department: "Sales",
    position: "Account Manager",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2022-05-12"),
  },
  {
    nip: "EMP011",
    name: "Kartika Sari",
    email: "kartika.sari@example.com",
    phone: "081298765432",
    department: "Marketing",
    position: "Content Specialist",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2024-03-18"),
  },
  {
    nip: "EMP012",
    name: "Lukman Hakim",
    email: "lukman.hakim@example.com",
    phone: "081276543210",
    department: "Operations",
    position: "Logistics Coordinator",
    status: EmployeeStatus.ACTIVE,
    joinedAt: new Date("2020-12-01"),
  },
];

async function main() {
  await prisma.employee.deleteMany();
  await prisma.employee.createMany({ data: employees });
  console.log(`Seeded ${employees.length} employees`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
