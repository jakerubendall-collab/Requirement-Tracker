import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter, log: ["error"] });

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  await prisma.$transaction([
    prisma.magicLink.deleteMany(),
    prisma.weeklyUpdate.deleteMany(),
    prisma.sourceSignal.deleteMany(),
    prisma.dDRoomActivity.deleteMany(),
    prisma.marketingMetric.deleteMany(),
    prisma.offer.deleteMany(),
    prisma.lOI.deleteMany(),
    prisma.buyer.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.property.deleteMany(),
    prisma.user.deleteMany(),
    prisma.requirement.deleteMany(),
  ]);

  // ── Users ─────────────────────────────────────────────────────────────────
  const broker = await prisma.user.create({
    data: { email: "broker@williamsroth.com", name: "Jake Williams", role: "BROKER" },
  });

  const sellerA = await prisma.user.create({
    data: { email: "seller@example.com", name: "Robert Chen", role: "SELLER", phone: "(619) 555-0101" },
  });

  const sellerB = await prisma.user.create({
    data: { email: "seller2@example.com", name: "Maria Gonzalez", role: "SELLER", phone: "(858) 555-0202" },
  });

  const sellerC = await prisma.user.create({
    data: { email: "seller3@example.com", name: "David Park", role: "SELLER", phone: "(760) 555-0303" },
  });

  // ── Property A: SALE, Offers In (flagship demo property) ──────────────────
  const propA = await prisma.property.create({
    data: {
      name: "Miramar Distribution Center",
      addressLine: "8750 Aero Dr, San Diego, CA 92123",
      submarket: "Miramar",
      transactionType: "SALE",
      buildingSF: 48500,
      lotSF: 72000,
      clearHeightFt: 30,
      dockDoors: 8,
      gradeLevelDoors: 2,
      officeSF: 3200,
      yearBuilt: 2004,
      askingPrice: 16_750_000,
      status: "OFFERS_IN",
      listedDate: daysAgo(62),
      primaryContactId: sellerA.id,
      heroImageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
      brokerNotes: "Strong demand from both owner-users and investors. Two serious groups in DD, one offer countered. Otay Mesa comp closed at $330/SF last week — supports our pricing.",
    },
  });

  // Buyers for propA
  const buyerA1 = await prisma.buyer.create({ data: { propertyId: propA.id, name: "Marcus Reyes", firm: "Reyes Capital Partners", type: "EXCHANGE_1031", stage: "OFFER_SUBMITTED", lastActivityAt: daysAgo(2), notes: "Doing a 1031 from a Riverside sale. Motivated, tight timeline — must close by Oct 15." } });
  const buyerA2 = await prisma.buyer.create({ data: { propertyId: propA.id, name: "Sandra Howell", firm: "Pacific Rim Industrial Fund", type: "INSTITUTIONAL", stage: "REVIEWING_DD", lastActivityAt: daysAgo(1), notes: "Institutional buyer, all cash, longer due diligence. Wants full environmental and seismic." } });
  const buyerA3 = await prisma.buyer.create({ data: { propertyId: propA.id, name: "Thomas Vance", firm: "SoCal Owner-Users LLC", type: "OWNER_USER", stage: "OFFER_SUBMITTED", lastActivityAt: daysAgo(3), notes: "Electrical manufacturer, 38 employees. Wants to move from Kearny Mesa. SBA financing." } });
  const buyerA4 = await prisma.buyer.create({ data: { propertyId: propA.id, name: "Jennifer Liu", firm: "Apex Industrial REIT", type: "PRIVATE_INVESTOR", stage: "REVIEWING_DD", lastActivityAt: daysAgo(4), notes: "Cap rate focused. Wants signed tenant or clear path to lease-up before close." } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Kevin O'Brien", firm: "O'Brien Family Trust", type: "FAMILY_OFFICE", stage: "NDA_SIGNED", lastActivityAt: daysAgo(7), notes: "Third property for this family. Reviewing OM and T12." } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Priya Sharma", firm: "Westfield Properties", type: "PRIVATE_INVESTOR", stage: "TOURED", lastActivityAt: daysAgo(10), notes: "Toured with her partner. Liked the dock configuration. Wants to see comps." } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Derek Chang", firm: "Chang Industrial Holdings", type: "EXCHANGE_1031", stage: "TOURED", lastActivityAt: daysAgo(12), notes: "Flexible timeline but motivated by depreciation. Waiting on their DST structure to clear." } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Lisa Martino", firm: "SunState Capital", type: "SYNDICATOR", stage: "PROSPECT", lastActivityAt: daysAgo(14) } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Brian Torres", firm: "Torres & Associates", type: "OWNER_USER", stage: "PROSPECT", lastActivityAt: daysAgo(16) } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Angela Foster", firm: "Foster Logistics", type: "OWNER_USER", stage: "PROSPECT", lastActivityAt: daysAgo(18) } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Carlos Mendez", firm: "Mendez Distribution", type: "OWNER_USER", stage: "PASSED", lastActivityAt: daysAgo(30), notes: "Passed — went under contract on a Chula Vista building instead." } });
  await prisma.buyer.create({ data: { propertyId: propA.id, name: "Rachel Kim", firm: "KBC Investments", type: "PRIVATE_INVESTOR", stage: "PASSED", lastActivityAt: daysAgo(25), notes: "Passed — pricing too high relative to their cap rate requirement." } });

  // Offers for propA
  await prisma.offer.create({
    data: {
      propertyId: propA.id,
      buyerId: buyerA1.id,
      amount: 16_200_000,
      pricePerSF: 334.02,
      status: "COUNTERED",
      termsSummary: "All-cash, 30-day close, 10-day due diligence period",
      contingencies: "Physical inspection only; financing contingency waived",
      closeOfEscrowDays: 30,
      brokerResponse: "Countered at $16.5M with 21-day COE. Buyer reviewing.",
      receivedAt: daysAgo(8),
    },
  });

  await prisma.offer.create({
    data: {
      propertyId: propA.id,
      buyerId: buyerA3.id,
      amount: 15_800_000,
      pricePerSF: 325.77,
      status: "SUBMITTED",
      termsSummary: "SBA 504 financing, 45-day close, standard due diligence",
      contingencies: "SBA loan approval, physical and environmental inspection",
      closeOfEscrowDays: 45,
      brokerResponse: null,
      receivedAt: daysAgo(3),
    },
  });

  await prisma.offer.create({
    data: {
      propertyId: propA.id,
      buyerId: buyerA2.id,
      amount: 16_900_000,
      pricePerSF: 348.45,
      status: "SUBMITTED",
      termsSummary: "All-cash, 60-day close, extended DD for institutional review",
      contingencies: "Full Phase I/II environmental, seismic evaluation, board approval",
      closeOfEscrowDays: 60,
      brokerResponse: null,
      receivedAt: daysAgo(1),
    },
  });

  // DD Room Activity for propA
  const ddData = [
    { buyerId: buyerA2.id, actorLabel: "Pacific Rim Industrial Fund", action: "Downloaded Full OM Package", occurredAt: daysAgo(1) },
    { buyerId: buyerA4.id, actorLabel: "Apex Industrial REIT", action: "Viewed Rent Roll", occurredAt: daysAgo(2) },
    { buyerId: buyerA2.id, actorLabel: "Pacific Rim Industrial Fund", action: "Downloaded T12 Financials", occurredAt: daysAgo(2) },
    { buyerId: buyerA1.id, actorLabel: "Reyes Capital Partners", action: "Granted Secure DD Access", occurredAt: daysAgo(5) },
    { buyerId: buyerA4.id, actorLabel: "Apex Industrial REIT", action: "Granted Secure DD Access", occurredAt: daysAgo(6) },
    { buyerId: buyerA1.id, actorLabel: "Reyes Capital Partners", action: "Downloaded Title Report", occurredAt: daysAgo(6) },
    { buyerId: buyerA2.id, actorLabel: "Pacific Rim Industrial Fund", action: "Granted Secure DD Access", occurredAt: daysAgo(7) },
    { buyerId: null, actorLabel: "Anonymous Prospect", action: "Downloaded Brochure", occurredAt: daysAgo(8) },
    { buyerId: buyerA1.id, actorLabel: "Reyes Capital Partners", action: "Viewed Floor Plans", occurredAt: daysAgo(9) },
    { buyerId: null, actorLabel: "Anonymous Prospect", action: "Downloaded Brochure", occurredAt: daysAgo(11) },
    { buyerId: buyerA4.id, actorLabel: "Apex Industrial REIT", action: "Downloaded Environmental Report", occurredAt: daysAgo(3) },
  ];

  for (const d of ddData) {
    await prisma.dDRoomActivity.create({ data: { propertyId: propA.id, ...d } });
  }

  // Marketing Metrics for propA — 10 weeks
  const weeksBack = [62, 55, 48, 41, 34, 27, 20, 13, 6, 0];
  const views =    [0, 124, 218, 195, 312, 289, 341, 298, 376, 401];
  const omDl =     [0,   4,   8,   6,  12,  10,  14,  11,  16,  18];
  const blasts =   [0,   1,   1,   0,   1,   1,   0,   1,   1,   1];
  const brochure = [0,   6,  11,   9,  17,  14,  18,  15,  21,  23];
  const tours =    [0,   1,   2,   1,   3,   2,   2,   3,   2,   3];

  for (let i = 0; i < weeksBack.length; i++) {
    await prisma.marketingMetric.create({
      data: {
        propertyId: propA.id,
        date: daysAgo(weeksBack[i]),
        listingViews: views[i],
        omDownloads: omDl[i],
        emailBlastsSent: blasts[i],
        brochureDownloads: brochure[i],
        tours: tours[i],
        daysOnMarket: 62 - weeksBack[i],
      },
    });
  }

  // Source Signals for propA
  await prisma.sourceSignal.createMany({
    data: [
      {
        propertyId: propA.id,
        sourceType: "GMAIL",
        rawSnippet: "Re: 8750 Aero Dr — LOI follow-up\n\nJake, our client (the institutional fund) completed their initial review and wants to submit a formal offer. Their guidance is $16.5–$17M all-cash. Can you send the DD checklist? They want to move fast. — Tony R., [Buyer Rep Firm]",
        capturedAt: daysAgo(2),
      },
      {
        propertyId: propA.id,
        sourceType: "GRANOLA",
        rawSnippet: "[Call notes — Reyes Capital]\nMarcus says their DST proceeds clear October 8. They MUST be in escrow by October 5 to qualify. Counter at $16.5M is close but they need the seller to hold at 21-day COE. Will go to $16.35M if seller commits to timeline. Their equity partner is Pacific First Bank.",
        capturedAt: daysAgo(4),
      },
      {
        propertyId: propA.id,
        sourceType: "PIPEDRIVE",
        rawSnippet: "Stage Update: Thomas Vance (SoCal Owner-Users LLC) → Offer Submitted\nSBA pre-approval letter received. Offer at $15.8M. Note: buyer's broker confirmed they have no other active offers. This is their #1 pick.",
        capturedAt: daysAgo(3),
      },
      {
        propertyId: propA.id,
        sourceType: "GMAIL",
        rawSnippet: "Fw: Miramar Industrial — market comps request\n\nJake — quick question, is Aero Dr still available? We have a client (regional logistics company, ~45k SF need) who toured last week and is very serious. They want a best-and-final offer discussion. Let me know if seller is open to moving quickly. — Sarah M., [Co-Broker]",
        capturedAt: daysAgo(5),
      },
      {
        propertyId: propA.id,
        sourceType: "GRANOLA",
        rawSnippet: "[Call notes — Pacific Rim Industrial Fund]\nSandra confirmed board is meeting Thursday to authorize up to $17.2M all-cash. They want full Phase I and seismic. Asked if seller can do a seller credit for any deferred maintenance on the dock levelers. I told her we'd review.",
        capturedAt: daysAgo(1),
      },
      {
        propertyId: propA.id,
        sourceType: "MANUAL",
        rawSnippet: "Walk-in inquiry at Lee & Associates office — Angela Foster, Foster Logistics. Looking to buy a 40–55k SF building in Miramar or Kearny Mesa. Budget $14–17M. Will need 90-day COE minimum for SBA. Gave her the OM. Following up Monday.",
        capturedAt: daysAgo(7),
      },
    ],
  });

  // Weekly Updates for propA
  await prisma.weeklyUpdate.create({
    data: {
      propertyId: propA.id,
      weekOf: daysAgo(7),
      status: "PUBLISHED",
      publishedAt: daysAgo(6),
      aiDraftBody: "This past week saw the most activity we've had since the listing launched 55 days ago. We have three formal offers on the table, ranging from $15.8M to $16.9M — all serious, all-cash or pre-approved. Pacific Rim Industrial Fund submitted the high offer at $16.9M ($348/SF) on Tuesday, driven by their board's Q3 acquisition mandate. Reyes Capital is countering at $16.35M and needs a 21-day close tied to a 1031 exchange deadline. SoCal Owner-Users submitted at $15.8M with SBA financing. Two parties — Pacific Rim and Apex Industrial — are actively in the DD room, with 11 combined documents accessed this week alone. Marketing continues strong: 376 listing views, 16 OM downloads, and 2 property tours this week. I'll be calling you Friday with a full offer summary and my recommendation on how to proceed.",
      finalBody: "Robert — great week on Aero Drive. We now have three formal offers ranging from $15.8M to $16.9M. The high offer is from Pacific Rim Industrial Fund at $16.9M all-cash, subject to board approval this Thursday. Reyes Capital countered at $16.35M with a firm 21-day close requirement tied to their 1031 exchange. The third offer from an owner-user came in at $15.8M with SBA financing. Both Pacific Rim and Apex Industrial are actively in the DD room — 11 document downloads this week across the two groups. Marketing metrics remain strong at 376 views and 16 OM downloads. I'll have a full recommendation ready for your call Friday — my expectation is we'll be in a position to select a preferred buyer by end of next week.",
    },
  });

  await prisma.weeklyUpdate.create({
    data: {
      propertyId: propA.id,
      weekOf: daysAgo(0),
      status: "DRAFT",
      aiDraftBody: null,
      finalBody: null,
    },
  });

  // ── Property B: SALE, On Market ────────────────────────────────────────────
  const propB = await prisma.property.create({
    data: {
      name: "Kearny Mesa Flex/Industrial",
      addressLine: "5285 Ruffin Rd, San Diego, CA 92123",
      submarket: "Kearny Mesa",
      transactionType: "SALE",
      buildingSF: 22_000,
      lotSF: 34_000,
      clearHeightFt: 24,
      dockDoors: 3,
      gradeLevelDoors: 1,
      officeSF: 4_800,
      yearBuilt: 1998,
      askingPrice: 7_150_000,
      status: "ON_MARKET",
      listedDate: daysAgo(28),
      primaryContactId: sellerB.id,
      heroImageUrl: "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&q=80",
      brokerNotes: "Good flex product with heavy office. Attracting owner-users and value-add investors. Need to get into DD room with serious parties.",
    },
  });

  const buyerB1 = await prisma.buyer.create({ data: { propertyId: propB.id, name: "Steven Park", firm: "Park Technical Services", type: "OWNER_USER", stage: "TOURED", lastActivityAt: daysAgo(5), notes: "Aerospace tech firm, 28 employees. Loved the office finish. Wants to see lease comps for flex." } });
  await prisma.buyer.create({ data: { propertyId: propB.id, name: "Gloria Navarro", firm: "NAV Investments", type: "PRIVATE_INVESTOR", stage: "TOURED", lastActivityAt: daysAgo(8) } });
  await prisma.buyer.create({ data: { propertyId: propB.id, name: "Frank Deluca", firm: "DeLuca Holdings", type: "OWNER_USER", stage: "PROSPECT", lastActivityAt: daysAgo(14) } });
  await prisma.buyer.create({ data: { propertyId: propB.id, name: "Amy Chen", firm: "Chen Capital", type: "PRIVATE_INVESTOR", stage: "PROSPECT", lastActivityAt: daysAgo(18) } });

  for (let i = 0; i < 4; i++) {
    await prisma.marketingMetric.create({
      data: {
        propertyId: propB.id,
        date: daysAgo(i * 7),
        listingViews: [94, 142, 167, 183][i],
        omDownloads: [2, 4, 5, 6][i],
        emailBlastsSent: [1, 0, 1, 1][i],
        brochureDownloads: [3, 6, 8, 9][i],
        tours: [0, 1, 2, 1][i],
        daysOnMarket: 28 - i * 7,
      },
    });
  }

  await prisma.sourceSignal.createMany({
    data: [
      { propertyId: propB.id, sourceType: "GMAIL", rawSnippet: "Inquiry: 5285 Ruffin Rd — Steven from Park Technical reached out wanting a second tour with his architect next week. Very motivated.", capturedAt: daysAgo(5) },
      { propertyId: propB.id, sourceType: "MANUAL", rawSnippet: "CoStar/LoopNet inquiry — unnamed buyer rep asking about clear height on dock doors. Sent specs, awaiting response.", capturedAt: daysAgo(3) },
    ],
  });

  await prisma.weeklyUpdate.create({
    data: {
      propertyId: propB.id,
      weekOf: daysAgo(7),
      status: "PUBLISHED",
      publishedAt: daysAgo(6),
      aiDraftBody: "Strong early traction on Ruffin Road in week four. Two tours completed this week — a Kearny Mesa aerospace tenant and a private investor. Both requested follow-up materials. OM downloads are up to 6 total and our email blast last Monday generated 167 property views. The owner-user prospect (Park Technical) has indicated they plan to return with their architect for a second look, which is a positive signal. We are in active dialogue with three additional prospects from the CoStar and LoopNet platforms. No offers yet, but activity level is healthy for week four.",
      finalBody: "Maria — week four on Ruffin Road is showing good momentum. We've had two property tours, including a very engaged aerospace firm that wants to return with their architect. OM downloads are at 6 total and our latest email blast pushed 167 views to the listing page. Broker outreach generated two additional qualified inquiries this week. No offers yet, but we have a pipeline of motivated prospects and I expect first written interest in the next 2–3 weeks. I'll keep you updated as things develop.",
    },
  });

  // ── Property C: LEASE, On Market ──────────────────────────────────────────
  const propC = await prisma.property.create({
    data: {
      name: "Otay Mesa Logistics Hub",
      addressLine: "2250 Airway Ave, Otay Mesa, CA 92154",
      submarket: "Otay Mesa",
      transactionType: "LEASE",
      buildingSF: 85_000,
      lotSF: 145_000,
      clearHeightFt: 36,
      dockDoors: 18,
      gradeLevelDoors: 4,
      officeSF: 5_000,
      yearBuilt: 2018,
      askingRateNNN: 1.45,
      status: "ON_MARKET",
      listedDate: daysAgo(21),
      primaryContactId: sellerC.id,
      heroImageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80",
      brokerNotes: "Class A logistics product near border crossing. High demand from cross-border logistics operators and food/beverage distributors. Strong competition from two new spec buildings in the submarket.",
    },
  });

  const tenantC1 = await prisma.tenant.create({ data: { propertyId: propC.id, name: "Carlos Vega", company: "Vega Freight Solutions", industry: "Cross-Border Logistics", requirementSF: 80000, stage: "REVIEWING_TERMS", lastActivityAt: daysAgo(3), notes: "Active cross-border operator. Strong credit. Wants 5-year term, NNN." } });
  const tenantC2 = await prisma.tenant.create({ data: { propertyId: propC.id, name: "Sarah Kim", company: "Pacific Cold Chain Inc", industry: "Food Distribution", requirementSF: 75000, stage: "TOURED", lastActivityAt: daysAgo(7), notes: "Interested but needs approval for refrigeration build-out. TI negotiation will be key." } });
  await prisma.tenant.create({ data: { propertyId: propC.id, name: "Marco Silva", company: "Silva Import Group", industry: "Import/Export", requirementSF: 60000, stage: "PROSPECT", lastActivityAt: daysAgo(12) } });

  await prisma.lOI.create({
    data: {
      propertyId: propC.id,
      tenantId: tenantC1.id,
      proposedRateNNN: 1.35,
      leaseTerm: 60,
      status: "SUBMITTED",
      termsSummary: "5-year NNN, no TI allowance, 3% annual escalations, 4-month rent abatement",
      brokerResponse: "Counter in progress — holding at $1.42 NNN with 2 months abatement.",
      receivedAt: daysAgo(4),
    },
  });

  for (let i = 0; i < 3; i++) {
    await prisma.marketingMetric.create({
      data: {
        propertyId: propC.id,
        date: daysAgo(i * 7),
        listingViews: [210, 265, 298][i],
        omDownloads: [6, 9, 12][i],
        emailBlastsSent: [1, 1, 0][i],
        brochureDownloads: [9, 14, 18][i],
        tours: [1, 2, 3][i],
        daysOnMarket: 21 - i * 7,
      },
    });
  }

  await prisma.sourceSignal.createMany({
    data: [
      { propertyId: propC.id, sourceType: "GMAIL", rawSnippet: "Vega Freight LOI response: Carlos says $1.35 NNN is firm from their side, but they're flexible on abatement. They'll go to 2 months free rent if we hold their rate.", capturedAt: daysAgo(2) },
      { propertyId: propC.id, sourceType: "GRANOLA", rawSnippet: "[Call notes — Pacific Cold Chain] Sarah Kim confirmed they have board approval for Otay Mesa. Budget is $1.40 NNN or better. Timeline: want to be in by December 1. Refrigeration build-out cost is ~$400k — asking landlord to co-fund.", capturedAt: daysAgo(5) },
      { propertyId: propC.id, sourceType: "MANUAL", rawSnippet: "Broker outreach call — competitor listing at 2310 Airway Ave asking $1.38 NNN, now negotiating. Two other tenants (40k SF and 30k SF) asking. Could be a good comp argument for us if we can move quickly.", capturedAt: daysAgo(3) },
    ],
  });

  await prisma.weeklyUpdate.create({
    data: {
      propertyId: propC.id,
      weekOf: daysAgo(7),
      status: "PUBLISHED",
      publishedAt: daysAgo(6),
      aiDraftBody: "Three weeks into the listing and Otay Mesa Logistics Hub is generating strong market interest. We've completed three tours this week with qualified logistics and distribution operators. Vega Freight Solutions — a well-capitalized cross-border logistics company — submitted a Letter of Intent at $1.35/SF/NNN with a 5-year term and 4-month abatement. We countered at $1.42 NNN with 2 months free rent. Pacific Cold Chain toured Thursday and verbally confirmed they have board approval and a December 1 target. Marketing metrics are strong for week three: 298 views, 12 OM downloads, and 3 tours completed.",
      finalBody: "David — good news on Airway Ave. We have our first LOI from Vega Freight Solutions at $1.35/SF NNN for 5 years — we countered at $1.42 NNN with 2 months free rent. A second prospect (Pacific Cold Chain) toured Thursday and confirmed board approval; they're on a December 1 timeline. We have one additional logistics operator showing early interest. The market is moving quickly in Otay Mesa — a competitor listing two blocks away is deep in negotiation. I'll have counter status from Vega by mid-week. More to come.",
    },
  });

  // ── Property D: SALE, In Escrow ───────────────────────────────────────────
  const propD = await prisma.property.create({
    data: {
      name: "National City Industrial",
      addressLine: "1830 Tidelands Ave, National City, CA 91950",
      submarket: "National City",
      transactionType: "SALE",
      buildingSF: 31_200,
      lotSF: 52_000,
      clearHeightFt: 22,
      dockDoors: 4,
      gradeLevelDoors: 2,
      officeSF: 2_400,
      yearBuilt: 1989,
      askingPrice: 8_900_000,
      status: "IN_ESCROW",
      listedDate: daysAgo(105),
      primaryContactId: sellerA.id,
      heroImageUrl: "https://images.unsplash.com/photo-1565793979706-5a02b53aa58c?w=1200&q=80",
      brokerNotes: "In escrow with Mission Bay Industrial at $8.65M. COE target Nov 8. Environmental contingency cleared. Physical inspection punch list being negotiated.",
    },
  });

  const buyerD = await prisma.buyer.create({ data: { propertyId: propD.id, name: "James Holloway", firm: "Mission Bay Industrial LLC", type: "PRIVATE_INVESTOR", stage: "REVIEWING_DD", lastActivityAt: daysAgo(1), notes: "All-cash buyer, experienced operator. In escrow at $8.65M." } });

  await prisma.offer.create({
    data: {
      propertyId: propD.id,
      buyerId: buyerD.id,
      amount: 8_650_000,
      pricePerSF: 277.24,
      status: "ACCEPTED",
      termsSummary: "All-cash, 30-day COE, 14-day DD period",
      contingencies: "Physical inspection (cleared), Phase I (cleared)",
      closeOfEscrowDays: 30,
      brokerResponse: "Accepted. In escrow. Target close November 8.",
      receivedAt: daysAgo(28),
    },
  });

  await prisma.dDRoomActivity.createMany({
    data: [
      { propertyId: propD.id, buyerId: buyerD.id, actorLabel: "Mission Bay Industrial LLC", action: "Downloaded Full OM Package", occurredAt: daysAgo(25) },
      { propertyId: propD.id, buyerId: buyerD.id, actorLabel: "Mission Bay Industrial LLC", action: "Downloaded T12 Financials", occurredAt: daysAgo(24) },
      { propertyId: propD.id, buyerId: buyerD.id, actorLabel: "Mission Bay Industrial LLC", action: "Viewed Environmental Reports", occurredAt: daysAgo(20) },
      { propertyId: propD.id, buyerId: null, actorLabel: "Buyer's Counsel", action: "Reviewed Title Report", occurredAt: daysAgo(14) },
      { propertyId: propD.id, buyerId: null, actorLabel: "Buyer's Inspector", action: "Completed Physical Inspection", occurredAt: daysAgo(10) },
    ],
  });

  await prisma.weeklyUpdate.create({
    data: {
      propertyId: propD.id,
      weekOf: daysAgo(7),
      status: "PUBLISHED",
      publishedAt: daysAgo(6),
      aiDraftBody: "National City is tracking cleanly toward close. Mission Bay Industrial's physical inspection was completed last Tuesday — the inspector flagged two dock levelers and the HVAC unit on the east bay as deferred maintenance items. We are negotiating a $38,000 seller credit to resolve the punch list without reopening the inspection period. Environmental Phase I cleared with no RECs noted. Title is clean. Target close of November 8 remains on track.",
      finalBody: "Robert — escrow is moving smoothly on Tidelands Ave. Physical inspection cleared last week with two minor punch list items (dock levelers + HVAC) — we're negotiating a $38,000 seller credit to close them out. Phase I environmental came back clean, no RECs. Title is clear. COE target of November 8 is still on track. I'll update you as soon as we have buyer sign-off on the credit.",
    },
  });

  // ── Requirements Board ─────────────────────────────────────────────────────
  await prisma.requirement.createMany({
    data: [
      { contactName: "Jeff Nakamura", company: "Nakamura Electronics", email: "jnakamura@nke.com", phone: "(619) 555-0411", minSF: 25000, maxSF: 40000, submarkets: "Miramar, Kearny Mesa", industry: "Electronics Manufacturing", timeline: "Q1 2025", budget: "$1.20–$1.40 NNN", type: "LEASE", stage: "ACTIVE", source: "Cold outreach", notes: "Owner-operator, 3 CNC machines. Needs 3-phase power, 200A min. Wants 5-year term.", lastContactAt: daysAgo(3) },
      { contactName: "Patricia Okonkwo", company: "TechAssembly Solutions", email: "pokonkwo@techasm.com", phone: "(858) 555-0522", minSF: 15000, maxSF: 22000, submarkets: "Kearny Mesa, Mission Valley", industry: "Contract Electronics", timeline: "Q4 2024", budget: "$1.30–$1.55 NNN", type: "LEASE", stage: "ACTIVE", source: "Referral from Steve Park", notes: "Defense contractor looking to expand. Needs clean room capability or retrofit potential.", lastContactAt: daysAgo(1) },
      { contactName: "Ramon Delgado", company: "Delgado Cold Storage", email: "rdelgado@dcsllc.com", phone: "(619) 555-0633", minSF: 30000, maxSF: 50000, submarkets: "Otay Mesa, Chula Vista", industry: "Refrigerated Logistics", timeline: "Q1 2025", budget: "$12M–$18M purchase or $1.40–$1.65 NNN", type: "EITHER", stage: "ACTIVE", source: "LinkedIn / direct inquiry", notes: "Expanding from two existing locations. Strong credit — Dun & Bradstreet 5A1. Can do all-cash purchase.", lastContactAt: daysAgo(6) },
      { contactName: "Amy Thornton", company: "Thornton Auto Group", email: "athornton@thorntonag.com", phone: "(760) 555-0744", minSF: 18000, maxSF: 28000, submarkets: "National City, Chula Vista", industry: "Automotive", timeline: "Q2 2025", budget: "$5M–$8M", type: "PURCHASE", stage: "ACTIVE", source: "Walk-in inquiry", notes: "Looking to consolidate two service centers. Need 14ft+ grade-level doors, no dock required.", lastContactAt: daysAgo(10) },
      { contactName: "Victor Huang", company: "Pacific Freight Partners", email: "vhuang@pfpinc.com", phone: "(858) 555-0855", minSF: 60000, maxSF: 90000, submarkets: "Otay Mesa", industry: "Cross-Border Logistics", timeline: "Q3 2024", budget: "$1.35–$1.50 NNN", type: "LEASE", stage: "MATCHED", source: "CoStar inquiry", notes: "Matched to Otay Mesa Logistics Hub — in LOI negotiation stage.", lastContactAt: daysAgo(2) },
      { contactName: "Luis Morales", company: "Morales Food Distribution", email: "lmorales@mfd.com", phone: "(619) 555-0966", minSF: 8000, maxSF: 14000, submarkets: "Chula Vista, National City, Otay Mesa", industry: "Food Distribution", timeline: "ASAP", budget: "$1.10–$1.30 NNN", type: "LEASE", stage: "DEAD", source: "CoStar inquiry", notes: "Went with a competing listing in Chula Vista. Mark dead.", lastContactAt: daysAgo(20) },
    ],
  });

  console.log("✅ Seed complete. Users:");
  console.log("  BROKER  → broker@williamsroth.com");
  console.log("  SELLER  → seller@example.com (Robert Chen — Miramar + National City)");
  console.log("  SELLER  → seller2@example.com (Maria Gonzalez — Kearny Mesa)");
  console.log("  SELLER  → seller3@example.com (David Park — Otay Mesa)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
