const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ACTIVE_SECTORS = [
  { key: "electricity", name: "Electricity", icon: "⚡", isActive: true, fields: [
    { key: "type", label: "Update Type", type: "select", options: ["Power outage","Transformer fault","Scheduled maintenance","New connection","Power restoration"], required: true },
    { key: "affectedHouseholds", label: "Affected Households (est.)", type: "number", required: false },
    { key: "parish", label: "Parish", type: "text", required: false },
  ]},
  { key: "roads", name: "Roads", icon: "🛣️", isActive: true, fields: [
    { key: "type", label: "Update Type", type: "select", options: ["Construction","Repair","Maintenance","Bridge construction","Closure"], required: true },
    { key: "roadName", label: "Road Name", type: "text", required: false },
    { key: "distanceKm", label: "Distance (km)", type: "number", required: false },
  ]},
  { key: "water", name: "Water", icon: "💧", isActive: true, fields: [
    { key: "type", label: "Update Type", type: "select", options: ["Supply interruption","Borehole repair","New connection","Pipeline maintenance","Quality inspection"], required: true },
    { key: "expectedCompletion", label: "Expected Completion", type: "date", required: false },
  ]},
  { key: "health", name: "Health", icon: "🏥", isActive: true, fields: [
    { key: "type", label: "Update Type", type: "select", options: ["Immunization campaign","Disease outbreak","Health center upgrade","Medical outreach","Public health notice"], required: true },
    { key: "targetPopulation", label: "Target Population", type: "text", required: false },
    { key: "dateRangeStart", label: "Date Range Start", type: "date", required: false },
    { key: "dateRangeEnd", label: "Date Range End", type: "date", required: false },
  ]},
  { key: "education", name: "Education", icon: "🎓", isActive: true, fields: [
    { key: "type", label: "Update Type", type: "select", options: ["School construction","Classroom renovation","Teacher recruitment","Examination activity","School inspection"], required: true },
    { key: "schoolName", label: "School Name", type: "text", required: true },
  ]},
  { key: "land", name: "Land", icon: "🗺️", isActive: true, fields: [
    { key: "type", label: "Update Type", type: "select", options: ["Registration","Boundary dispute","Land allocation","Survey","Community sensitization"], required: true },
    { key: "partiesInvolved", label: "Parties Involved", type: "text", required: false },
  ]},
];

async function main() {
  console.log("Seeding database…");

  for (const s of ACTIVE_SECTORS) {
    await prisma.sector.upsert({
      where: { key: s.key },
      update: { name: s.name, icon: s.icon, isActive: s.isActive, fieldSchema: JSON.stringify(s.fields) },
      create: { key: s.key, name: s.name, icon: s.icon, isActive: s.isActive, fieldSchema: JSON.stringify(s.fields) },
    });
  }
  console.log("✓ Sectors seeded");

  const sectors = await prisma.sector.findMany();
  const sMap = {};
  for (const s of sectors) sMap[s.key] = s.id;

  async function createUpdate(data) {
    const exists = await prisma.update.findFirst({ where: { title: data.title } });
    if (exists) return exists;
    return prisma.update.create({ data });
  }

  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 86400000);

  await createUpdate({ sectorId: sMap["electricity"], title: "Transformer Fault at Bar Ogole", description: "A transformer serving Bar Ogole trading centre has developed a fault, resulting in loss of power to approximately 340 households in the surrounding area. UMEME technicians have been notified and an assessment team is en route. Estimated restoration within 8 hours pending parts availability.", location: "Bar Ogole, Erute County", priority: "high", status: "approved", sectorFields: JSON.stringify({ type: "Transformer fault", affectedHouseholds: "340", parish: "Bar Ogole Parish" }), attachments: "[]", submittedById: "user-electricity", submittedAt: daysAgo(5), reviewedById: "user-admin", reviewedAt: daysAgo(4), publishedAt: daysAgo(4) });
  await createUpdate({ sectorId: sMap["electricity"], title: "Scheduled Maintenance — Lira Municipality Substation", description: "Routine scheduled maintenance on the Lira Municipality substation will result in a planned outage on Saturday 22 August from 08:00 to 16:00. Affected areas include Ojwina, Railwoods, and Central Business District.", location: "Lira Municipality", priority: "medium", status: "pending", sectorFields: JSON.stringify({ type: "Scheduled maintenance", affectedHouseholds: "1200", parish: "Ojwina Parish" }), attachments: "[]", submittedById: "user-electricity", submittedAt: daysAgo(1) });
  await createUpdate({ sectorId: sMap["electricity"], title: "New Grid Connection — Adyel Division", description: "Successful completion of new grid connection project covering 78 households in Adyel Division previously relying on off-grid solar. UMEME connection fees waived under rural electrification program.", location: "Adyel Division, Lira City", priority: "low", status: "needs_correction", sectorFields: JSON.stringify({ type: "New connection", affectedHouseholds: "78", parish: "Adyel Parish" }), attachments: "[]", submittedById: "user-electricity", submittedAt: daysAgo(8), reviewedById: "user-admin", reviewedAt: daysAgo(7), reviewComment: "Please confirm whether the 78 households figure is current meter connections or estimated total beneficiaries." });
  await createUpdate({ sectorId: sMap["roads"], title: "Lira–Pader Road Repair Works", description: "Emergency road repair works on the Lira–Pader highway section between Agwata sub-county and Aromo trading centre. Potholes and road surface degradation have been escalating since the last rainy season. UNRA contractor mobilised.", location: "Agwata–Aromo stretch, Lira–Pader Highway", priority: "high", status: "approved", sectorFields: JSON.stringify({ type: "Repair", roadName: "Lira–Pader Highway", distanceKm: "14.5" }), attachments: "[]", submittedById: "user-roads", submittedAt: daysAgo(10), reviewedById: "user-admin", reviewedAt: daysAgo(9), publishedAt: daysAgo(9) });
  await createUpdate({ sectorId: sMap["roads"], title: "Bridge Construction — Ayago River Crossing", description: "Construction of a new all-weather bridge over Ayago River to replace the seasonal ford that becomes impassable during wet season, cutting off Ayago and Barr sub-counties from district services.", location: "Ayago River, Barr Sub-County", priority: "high", status: "pending", sectorFields: JSON.stringify({ type: "Bridge construction", roadName: "Barr Community Road", distanceKm: "0.08" }), attachments: "[]", submittedById: "user-roads", submittedAt: daysAgo(2) });
  await createUpdate({ sectorId: sMap["roads"], title: "Routine Grading — Ogur–Agali Road", description: "Routine grading and murram re-application on the Ogur–Agali district road following seasonal erosion. Works completed on 12 km section.", location: "Ogur Sub-County", priority: "low", status: "rejected", sectorFields: JSON.stringify({ type: "Maintenance", roadName: "Ogur–Agali Road", distanceKm: "12" }), attachments: "[]", submittedById: "user-roads", submittedAt: daysAgo(15), reviewedById: "user-admin", reviewedAt: daysAgo(14), reviewComment: "This update duplicates the report already submitted in the previous cycle. Please consolidate or mark as a follow-up to the original submission." });
  await createUpdate({ sectorId: sMap["water"], title: "Borehole Maintenance in Aromo", description: "Rehabilitation of three hand-pump boreholes in Aromo Sub-County that had been non-functional for over four months. Works include pump replacement, casing inspection, and water quality testing. All three boreholes now operational.", location: "Aromo Sub-County", priority: "medium", status: "approved", sectorFields: JSON.stringify({ type: "Borehole repair", expectedCompletion: "2026-08-10" }), attachments: "[]", submittedById: "user-water", submittedAt: daysAgo(12), reviewedById: "user-admin", reviewedAt: daysAgo(11), publishedAt: daysAgo(11) });
  await createUpdate({ sectorId: sMap["water"], title: "Water Supply Interruption — Lira City West", description: "Scheduled pipeline maintenance by National Water & Sewerage Corporation will cause interruption to piped water supply in Lira City West division on 20 August 2026 from 07:00 to 18:00. Alternative water points identified at three public standpipes.", location: "Lira City West Division", priority: "medium", status: "pending", sectorFields: JSON.stringify({ type: "Supply interruption", expectedCompletion: "2026-08-20" }), attachments: "[]", submittedById: "user-water", submittedAt: daysAgo(1) });
  await createUpdate({ sectorId: sMap["health"], title: "Measles Vaccination Campaign", description: "District-wide measles vaccination campaign targeting children 6 months to 5 years old. Campaign to run across all sub-counties with mobile outreach teams deployed to hard-to-reach areas. Target coverage 95%.", location: "All Sub-Counties, Lira District", priority: "high", status: "approved", sectorFields: JSON.stringify({ type: "Immunization campaign", targetPopulation: "Children 6 months–5 years", dateRangeStart: "2026-08-01", dateRangeEnd: "2026-08-15" }), attachments: "[]", submittedById: "user-health", submittedAt: daysAgo(20), reviewedById: "user-admin", reviewedAt: daysAgo(19), publishedAt: daysAgo(19) });
  await createUpdate({ sectorId: sMap["health"], title: "Health Center Upgrade — Ogur HCIII", description: "Completion of maternity ward expansion at Ogur Health Centre III, adding 12 delivery beds and a new theatre. Commissioned by the District Health Officer on 5 August 2026.", location: "Ogur Town, Ogur Sub-County", priority: "medium", status: "approved", sectorFields: JSON.stringify({ type: "Health center upgrade", targetPopulation: "Maternal health patients", dateRangeStart: "2026-06-01", dateRangeEnd: "2026-08-05" }), attachments: "[]", submittedById: "user-health", submittedAt: daysAgo(13), reviewedById: "user-admin", reviewedAt: daysAgo(12), publishedAt: daysAgo(12) });
  await createUpdate({ sectorId: sMap["health"], title: "Cholera Preparedness Alert — Rainy Season", description: "District Health team has issued a preparedness advisory ahead of the rainy season following KCCA reports of cholera cases in Kampala. CHEWs have been briefed and hygiene promotion activities are underway in schools and markets.", location: "Lira District", priority: "high", status: "pending", sectorFields: JSON.stringify({ type: "Public health notice", targetPopulation: "General population", dateRangeStart: "2026-08-18" }), attachments: "[]", submittedById: "user-health", submittedAt: daysAgo(0) });
  await createUpdate({ sectorId: sMap["education"], title: "New Classroom Block Completed, Ogur Primary School", description: "A four-classroom permanent block at Ogur Primary School has been completed and handed over to the school management. The block was funded under the government's school infrastructure program and will house P5–P7 learners.", location: "Ogur Town", priority: "medium", status: "approved", sectorFields: JSON.stringify({ type: "School construction", schoolName: "Ogur Primary School" }), attachments: "[]", submittedById: "user-education", submittedAt: daysAgo(7), reviewedById: "user-admin", reviewedAt: daysAgo(6), publishedAt: daysAgo(6) });
  await createUpdate({ sectorId: sMap["education"], title: "Primary Leaving Examinations 2026 — District Supervision", description: "District Education Office has deployed inspectors to all 87 PLE examination centres across Lira District. Supervision to run from 20–24 October 2026. Any examination irregularities to be reported to DEO immediately.", location: "All Sub-Counties, Lira District", priority: "high", status: "pending", sectorFields: JSON.stringify({ type: "Examination activity", schoolName: "All registered PLE centres" }), attachments: "[]", submittedById: "user-education", submittedAt: daysAgo(3) });
  await createUpdate({ sectorId: sMap["education"], title: "Teacher Recruitment — 23 Positions, Primary Level", description: "The District Service Commission has advertised 23 primary teacher positions across under-staffed schools in Erute, Moroto, and Aruu sub-counties. Applications open until 30 August 2026.", location: "Multiple Sub-Counties", priority: "medium", status: "approved", sectorFields: JSON.stringify({ type: "Teacher recruitment", schoolName: "Multiple — see description" }), attachments: "[]", submittedById: "user-education", submittedAt: daysAgo(18), reviewedById: "user-admin", reviewedAt: daysAgo(17), publishedAt: daysAgo(17) });
  await createUpdate({ sectorId: sMap["land"], title: "Boundary Dispute Resolution Meeting", description: "A formal mediation meeting between the Ogenga and Opio families regarding a disputed 3.4-acre boundary along Ogur–Barr road has been convened by the District Land Office. Agreement reached and boundary survey pegs installed.", location: "Ogur Sub-County", priority: "medium", status: "approved", sectorFields: JSON.stringify({ type: "Boundary dispute", partiesInvolved: "Ogenga family vs. Opio family" }), attachments: "[]", submittedById: "user-land", submittedAt: daysAgo(9), reviewedById: "user-admin", reviewedAt: daysAgo(8), publishedAt: daysAgo(8) });
  await createUpdate({ sectorId: sMap["land"], title: "Land Titling Drive — Erute County", description: "District Land Office in partnership with Uganda Land Commission is conducting a systematic land titling exercise in Erute County. 420 households have been mapped and are in queue for title processing.", location: "Erute County", priority: "medium", status: "pending", sectorFields: JSON.stringify({ type: "Registration", partiesInvolved: "420 households, Uganda Land Commission" }), attachments: "[]", submittedById: "user-land", submittedAt: daysAgo(4) });

  console.log("✓ Demo updates seeded");
  console.log("Seeding complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
