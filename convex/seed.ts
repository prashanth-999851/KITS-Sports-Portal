import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAll = mutation({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingSports = await ctx.db.query("sports").first();
    if (existingSports && !args.force) {
      return "Database is already seeded. To force re-seed, run: npx convex run seed:seedForce";
    }

    if (existingSports && args.force) {
      const tables = ["sports", "coreValues", "executiveMembers", "events", "matches", "achievements", "gallery", "registrations", "documents", "notifications", "rules", "users", "settings"] as const;
      for (const table of tables) {
        const items = await ctx.db.query(table).collect();
        for (const item of items) {
          await ctx.db.delete(item._id);
        }
      }
    }

    // ========== SPORTS ==========
    const sportsData = [
      {
        name: "Cricket",
        category: "Outdoor",
        description: "The official KKR & KSR Cricket Team competes at Inter-Collegiate, University, and State level tournaments with state-of-the-art turf pitch facilities.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "M. Bharath Kumar (IT - IV Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Football",
        category: "Outdoor",
        description: "High-intensity football squad featuring FIFA-standard grass pitch, dedicated strength & conditioning trainers, and tactical workshops.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "G. Ravi Kiran (IT - IV Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Volleyball",
        category: "Outdoor",
        description: "Dynamic volleyball team operating floodlit court complexes. Celebrated for agility, precise spikes, and disciplined defense.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "Sk. Jameer Bhasha (ECE - IV Year)",
        womenCaptain: "M. Yamini (ECE - III Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Basketball",
        category: "Outdoor / Indoor",
        description: "Fast-paced basketball unit practicing on synthetic acrylic floodlit courts. Known for fast breaks and perimeter defense.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "N. Prasanth Chowdary (IT - IV Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Athletics",
        category: "Track & Field",
        description: "Comprehensive athletics program covering 100m to 10,000m, relay events, long jump, high jump, shot put, and javelin throw.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Ball Badminton",
        category: "Outdoor",
        description: "Traditional and fast-paced Ball Badminton squad competing in inter-collegiate and university tournaments with dedicated outdoor court facilities.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "R. Jan Kenadi (ECE - IV Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Chess",
        category: "Indoor / Mind Sport",
        description: "Mind sport hub dedicated to strategic excellence, grandmaster workshops, rating tournaments, and online inter-college leagues.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Kabaddi",
        category: "Outdoor",
        description: "Traditional and high-octane Kabaddi team training on professional mat courts under specialized raider and defender coaches.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "K. Vasudevarao (EEE - IV Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Kho-Kho",
        category: "Outdoor",
        description: "Agile, speed-focused Kho-Kho squad celebrated for quick turns, endurance, and synchronized team movements.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "Sk. Kalesha (ECE - IV Year)",
        womenCaptain: "B. Kavya Sri (CSM - III Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Throwball",
        category: "Outdoor",
        description: "Power-packed throwball team known for flawless coordination, powerful serves, and rapid return catches.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        womenCaptain: "K. Sravani (CSD - IV Year)",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Netball",
        category: "Outdoor",
        description: "Fast-paced and strategic Netball squad practicing court agility, precise passing, shooting accuracy, and disciplined team defense.",
        coordinator: "K. Venkata Rao",
        assistantCoordinator: "M. Surya Prakash Rao",
        menCaptain: "N. Sai Janardhan",
        venue: "KKR and KSR Sports Ground",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      },
    ];
    for (const sport of sportsData) {
      await ctx.db.insert("sports", sport);
    }

    // ========== CORE VALUES ==========
    const coreValuesData = [
      { title: "Teamwork", icon: "Users", color: "from-blue-600 to-indigo-600", description: "Synergy over individualism. We achieve success by collaborating, supporting teammates, and celebrating collective victory.", displayOrder: 1 },
      { title: "Discipline", icon: "ShieldCheck", color: "from-amber-500 to-yellow-600", description: "Commitment to rigorous training, punctuality, self-control, and respect for coaches, referees, and opponents.", displayOrder: 2 },
      { title: "Sportsmanship", icon: "Award", color: "from-emerald-500 to-teal-600", description: "Gracious in victory, honorable in defeat. We uphold integrity, fair play, and ethical conduct above winning.", displayOrder: 3 },
      { title: "Leadership", icon: "Crown", color: "from-purple-600 to-indigo-700", description: "Empowering athletes to take initiative, inspire peers, lead by example, and mentor junior sportspersons.", displayOrder: 4 },
      { title: "Excellence", icon: "Trophy", color: "from-yellow-500 to-amber-600", description: "Relentless pursuit of athletic perfection, setting benchmarks, breaking records, and continuous improvement.", displayOrder: 5 },
      { title: "Inclusiveness", icon: "HeartHandshake", color: "from-rose-500 to-pink-600", description: "Equal opportunities for all students regardless of gender, department, or skill level in a supportive environment.", displayOrder: 6 },
      { title: "Fitness & Well-being", icon: "Activity", color: "from-cyan-500 to-blue-600", description: "Promoting physical health, mental resilience, stress management, and healthy living across the entire campus.", displayOrder: 7 },
      { title: "Integrity", icon: "CheckCircle2", color: "from-blue-700 to-slate-800", description: "Unwavering commitment to honesty, transparency, anti-doping standards, and absolute respect for club rules.", displayOrder: 8 },
    ];
    for (const cv of coreValuesData) {
      await ctx.db.insert("coreValues", cv);
    }

    // ========== EXECUTIVE BODY ==========
    const executiveData = [
      { name: "M. Bharath Kumar", position: "President", department: "Information Technology(IT - IV Yr)", email: "bharathkumarmaddikunta@gmail.com", phone: "+91 91827 55664", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", displayOrder: 1 },
      { name: "K. Vasudevarao", position: "Vice President", department: "Electrical and Electronical Engineering(EEE - IV Yr)", email: "vasudevaraokolupuri23@gmail.com", phone: "+91 93909 53342", photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80", displayOrder: 2 },
      { name: "Sk. Jameer Bhasha", position: "General Secretary", department: "Electronical and Communicational Engineering (ECE - IV Yr)", email: "jameerbhasha66@gmail.com", phone: "+91 79897 96426", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", displayOrder: 3 },
      { name: "P. Anusha", position: "Joint Secretary", department: "Electrical & Electronics Engg (EEE - III Yr)", photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", displayOrder: 4 },
      { name: "B. Karthik", position: "Treasurer", department: "Civil Engineering (Civil - IV Yr)", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", displayOrder: 5 },
      { name: "V. Sai Kumar", position: "Chief Sports Coordinator", department: "Computer Science Engineering (CSE - IV Yr)", photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80", displayOrder: 6 },
    ];
    for (const exec of executiveData) {
      await ctx.db.insert("executiveMembers", exec);
    }

    // ========== EVENTS ==========
    const eventsData = [
      { title: "Annual Sports Meet 2026 - 'KRIDA PRATIBHA'", category: "Upcoming", sport: "Multi-Sport Mega Event", date: "March 15 - March 18, 2026", venue: "Main Athletic Stadium & Indoor Complex", status: "Registrations Open", description: "The grand annual sports festival featuring 11 sports disciplines, 50+ track and field events, march past, cultural sports gala, and cash awards worth ₹2,50,000.", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
      { title: "State Inter-College Cricket Premier League (KPL)", category: "Ongoing", sport: "Cricket", date: "August 08 - August 14, 2026", venue: "KKR & KSR Turf Oval Ground", status: "Semi Finals Today", description: "16 Top engineering college cricket teams battle for the coveted KPL Trophy. Day & Night matches broadcast live on campus screens.", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
      { title: "Inter-Department Basketball Championship", category: "Ongoing", sport: "Basketball", date: "August 09 - August 12, 2026", venue: "Synthetic Basketball Arena", status: "Group Stage Day 2", description: "CSE Warriors vs ECE Titans. High-intensity rivalry for departmental sports supremacy.", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
      { title: "All India Inter-University Chess Tournament 2025", category: "Past", sport: "Chess", date: "December 10 - December 14, 2025", venue: "AC Indoor Auditorium", status: "Completed (KKR & KSR Winner)", description: "Hosted 45 University teams across India. KKR & KSR Mind Champions bagged 1st Rank overall.", imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
    ];
    for (const evt of eventsData) {
      await ctx.db.insert("events", evt);
    }

    // ========== MATCHES / FIXTURES ==========
    const matchesData = [
      { tournament: "State Inter-College Cricket Premier League (Semi Final 1)", team1: "KKR & KSR Strikers", team2: "VR Siddhartha Kings", score1: "184/5 (20.0 overs)", score2: "152/9 (18.4 overs)", result: "KKR & KSR won by 32 runs", date: "Today, 02:30 PM", status: "LIVE" },
      { tournament: "Inter-Department Football Tournament (Final)", team1: "CSE Department FC", team2: "Mechanical Engineers FC", score1: "3", score2: "2", result: "CSE won 3-2 after Extra Time", date: "Yesterday", status: "FINAL" },
      { tournament: "State Volleyball Championship (Match 8)", team1: "KKR & KSR Spikers", team2: "GVP Visakhapatnam", score1: "25 - 22, 25 - 20", score2: "Set 1 & Set 2", result: "KKR & KSR won 2-0 sets", date: "10 Aug 2026", status: "FINAL" },
    ];
    for (const match of matchesData) {
      await ctx.db.insert("matches", match);
    }

    // ========== ACHIEVEMENTS ==========
    const achievementsData = [
      { title: "Best Athlete of the Year 2025-26", recipient: "V. Akash (Mechanical Dept - IV Yr)", category: "Individual Excellence", achievement: "Set new state college record in 100m sprint (10.64 sec) & 200m (21.80 sec).", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80", year: "2025-26", medalType: "Gold" },
      { title: "Emerging Player Award 2025", recipient: "S. Keerthi (ECE - II Yr)", category: "Table Tennis", achievement: "Undefeated rookie season in University singles and doubles matches.", imageUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=600&q=80", year: "2025", medalType: "Gold" },
      { title: "Best Team Award 2025", recipient: "KKR & KSR Cricket Team", category: "Team Performance", achievement: "Won 4 major inter-collegiate tournaments in a single academic year.", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80", year: "2025", medalType: "Trophy" },
      { title: "Sportsmanship & Fair Play Trophy", recipient: "KKR & KSR Women's Basketball Team", category: "Ethics & Integrity", achievement: "Recognized by University Sports Board for exemplary court behavior and integrity.", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80", year: "2025", medalType: "Trophy" },
    ];
    for (const ach of achievementsData) {
      await ctx.db.insert("achievements", ach);
    }

    // ========== GALLERY ==========
    const galleryData = [
      { title: "Annual Sports Meet Opening Ceremony", category: "Sports Day", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80", caption: "Grand Olympic style torch lighting by Chief Guest and Directors.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Cricket Championship Final Victory Celebration", category: "Inter-College Competitions", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80", caption: "Team lifting the JNTU Kakinada Overall Championship Trophy.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Early Morning Athletics Conditioning", category: "Training Sessions", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1000&q=80", caption: "Sprint drills and agility training under head coach supervision.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "State Level Kabaddi Tournament Action", category: "Tournaments", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80", caption: "Crucial super tackle execution during the finals match.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Felicitation of National Level Medallists", category: "Award Ceremonies", imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1000&q=80", caption: "Honoring athletes with cash rewards and institute laurels.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Indoor Badminton Doubles Finals", category: "Tournaments", imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80", caption: "Thrilling match point rally in front of packed stadium stands.", mediaType: "Image", createdAt: new Date().toISOString() },
    ];
    for (const item of galleryData) {
      await ctx.db.insert("gallery", item);
    }

    // ========== REGISTRATIONS (Sample) ==========
    const registrationsData = [
      { trackingId: "KKR-2026-8942", studentName: "M. Sai Charan", rollNumber: "23KK1A0589", department: "CSE", year: "3rd Year", email: "saicharan.23@kkrksr.ac.in", phone: "9876541230", preferredSports: ["Cricket", "Badminton"], status: "Approved", appliedDate: "2026-08-01", remarks: "Passed physical fitness test. Assigned to Cricket Squad B." },
      { trackingId: "KKR-2026-8943", studentName: "P. Meghana", rollNumber: "24KK1A0412", department: "ECE", year: "2nd Year", email: "meghana.p@kkrksr.ac.in", phone: "9876541231", preferredSports: ["Volleyball", "Athletics"], status: "Pending", appliedDate: "2026-08-05", remarks: "Trial scheduled for Aug 12." },
      { trackingId: "KKR-2026-8944", studentName: "T. Varun Teja", rollNumber: "22KK1A0304", department: "Mechanical", year: "4th Year", email: "varun.mech@kkrksr.ac.in", phone: "9876541232", preferredSports: ["Football", "Kabaddi"], status: "Approved", appliedDate: "2026-08-02", remarks: "Selected for Football Main Eleven." },
    ];
    for (const reg of registrationsData) {
      await ctx.db.insert("registrations", reg);
    }

    // ========== DOCUMENTS ==========
    const documentsData = [
      { title: "Sports Club Student Membership Registration Form 2026", fileSize: "1.2 MB", fileType: "PDF Document", category: "Forms", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
      { title: "Official Sports On-Duty (OD) Attendance Request Form", fileSize: "450 KB", fileType: "PDF Document", category: "Academic OD", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
      { title: "Outstation Inter-University Tournament Travel Clearance Form", fileSize: "620 KB", fileType: "PDF Document", category: "Travel", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
      { title: "KKR & KSR Sports Constitution & Rulebook (Complete PDF)", fileSize: "3.4 MB", fileType: "PDF Document", category: "Rulebook", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
    ];
    for (const doc of documentsData) {
      await ctx.db.insert("documents", doc);
    }

    // ========== NOTIFICATIONS ==========
    const notificationsData = [
      { title: "Annual Sports Meet 2026", message: "Annual Sports Meet 2026 'KRIDA PRATIBHA' Registration is officially open!", type: "Announcement", isActive: true, createdAt: new Date().toISOString() },
      { title: "Live Cricket Match", message: "Inter-College Cricket Semi-Finals live match in progress on Turf Oval Ground.", type: "Match Update", isActive: true, createdAt: new Date().toISOString() },
      { title: "Chess Victory", message: "KKR & KSR Mind Champions bagged 1st rank in All India University Chess League.", type: "Announcement", isActive: true, createdAt: new Date().toISOString() },
    ];
    for (const notif of notificationsData) {
      await ctx.db.insert("notifications", notif);
    }

    // ========== RULES / CONSTITUTION ==========
    const rulesData = [
      { chapter: "Chapter 1", title: "Membership & Eligibility", displayOrder: 1, content: "1.1 All bonafide students of KKR & KSR Institute of Technology & Sciences enrolled in B.Tech, M.Tech, MCA, or MBA programs are eligible for Sports Club membership.\n1.2 Members must maintain a minimum academic attendance of 75% and zero disciplinary records to represent college teams.\n1.3 Membership renewal is mandatory at the beginning of each academic year with a physical fitness certificate." },
      { chapter: "Chapter 2", title: "Code of Conduct & Ethics", displayOrder: 2, content: "2.1 Respect for opponents, match referees, coaches, and facility staff is non-negotiable.\n2.2 Abusive language, unsportsmanlike behavior, or violence will lead to immediate cancellation of membership and suspension from academic classes.\n2.3 Complete adherence to Fair Play principles and anti-doping policies." },
      { chapter: "Chapter 3", title: "Player Selection Procedure", displayOrder: 3, content: "3.1 Team selection trials will be conducted openly by the Physical Education Department and appointed coaches.\n3.2 Selection criteria include physical fitness scores, sport-specific skill evaluation, match performance, and team discipline.\n3.3 The decision of the Selection Committee is final." },
      { chapter: "Chapter 4", title: "Captains' Responsibilities", displayOrder: 4, content: "4.1 Team Captains must coordinate daily attendance, equipment return, team punctuality, and line-ups.\n4.2 Captains act as primary liaisons between team players, faculty coordinators, and Physical Director.\n4.3 Submit post-match reports within 24 hours of completion." },
      { chapter: "Chapter 5", title: "Training Guidelines & Attendance", displayOrder: 5, content: "5.1 Practice sessions are mandatory for selected college team squad members.\n5.2 Players missing 3 consecutive practice sessions without prior written approval will be replaced by reserve players.\n5.3 Attendance OD (On Duty) letters for missed classes will be granted strictly based on sports attendance register signed by the Physical Director." },
      { chapter: "Chapter 6", title: "Equipment Management", displayOrder: 6, content: "6.1 Sports equipment must be checked out using student ID cards from the Sports Store Room.\n6.2 Any loss or willful damage to sports gear will be billed directly to the student's account.\n6.3 All equipment must be cleaned and returned immediately after practice." },
      { chapter: "Chapter 7", title: "Facilities Usage Rules", displayOrder: 7, content: "7.1 Proper sports uniforms, non-marking shoes for indoor wooden courts, and football cleats for grounds are mandatory.\n7.2 External guests or non-registered individuals are strictly prohibited without written permission from the Physical Director.\n7.3 Floodlights turn off at 08:30 PM sharp." },
      { chapter: "Chapter 8", title: "Safety & First-Aid Protocol", displayOrder: 8, content: "8.1 A certified sports physiotherapist and emergency medical kit are stationed at the Athletic Complex during practice hours.\n8.2 All sports injuries must be reported immediately to the Physical Director. Emergency college ambulance is on 24/7 standby." },
      { chapter: "Chapter 9", title: "Strict Anti-Ragging Policy", displayOrder: 9, content: "9.1 Zero tolerance policy against ragging or senior dominance within sports teams.\n9.2 Any attempt to harass junior players will result in police FIR as per UGC Anti-Ragging regulations and immediate permanent expulsion." },
      { chapter: "Chapter 10", title: "Equality, Inclusion & Gender Equity", displayOrder: 10, content: "10.1 Equal access to ground time, equipment, coaching staff, and budget for both Men's and Women's sports teams.\n10.2 Special encouragement and incentives for female student participation in inter-collegiate meets." },
      { chapter: "Chapter 11", title: "Grievance Redressal System", displayOrder: 11, content: "11.1 Students facing issues regarding selection, coaching, or facilities can submit formal written complaints to the Faculty Sports Committee.\n11.2 Complaints will be investigated and resolved within 7 working days." },
      { chapter: "Chapter 12", title: "Travel & Outstation Guidelines", displayOrder: 12, content: "12.1 Outstation travel for inter-university tournaments is accompanied by designated faculty escorts and physical directors.\n12.2 Travel allowances, institute DA/TA, and official jersey kits are provided by the institute." },
      { chapter: "Chapter 13", title: "Social Media & Public Relations", displayOrder: 13, content: "13.1 Official match photos and statements must be routed through the Sports Club Media Team.\n13.2 Posting derogatory remarks about opponents or match officials on personal social media handles is strictly prohibited." },
    ];
    for (const rule of rulesData) {
      await ctx.db.insert("rules", rule);
    }

    // ========== ADMIN USERS ==========
    const usersData = [
      { name: "Dr. M. Bharath Kumar", email: "admin@kitsports.ac.in", passwordHash: "Admin@123456", role: "Super Admin", isActive: true, createdAt: "2026-01-01" },
      { name: "K. Venkata Rao", email: "physicaldirector@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Faculty Coordinator", isActive: true, createdAt: "2026-01-05" },
      { name: "M. Surya Prakash Rao", email: "sportscoordinator@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Sports Coordinator", isActive: true, createdAt: "2026-01-10" },
      { name: "G. Ravi Kiran", email: "events@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Event Manager", isActive: true, createdAt: "2026-01-15" },
      { name: "Sk. Jameer Bhasha", email: "captain@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Sports Captain", isActive: true, createdAt: "2026-01-20" },
    ];
    for (const user of usersData) {
      await ctx.db.insert("users", user);
    }

    // ========== SETTINGS ==========
    const settingsData = [
      { key: "instituteName", value: "KKR & KSR Institute of Technology & Sciences" },
      { key: "campusAddress", value: "Vinjanampadu, Vaddeswaram Post, Guntur - 522017, AP" },
      { key: "contactEmail", value: "sports@kkrksr.ac.in" },
      { key: "contactPhone", value: "+91 91827 55664" },
      { key: "enableNotifications", value: "true" },
      { key: "darkThemeDefault", value: "false" },
      { key: "tally_gold", value: "48" },
      { key: "tally_silver", value: "32" },
      { key: "tally_bronze", value: "21" },
      { key: "tally_trophies", value: "15" },
    ];
    return "Database seeded successfully with all initial data!";
  },
});

export const seedForce = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["sports", "coreValues", "executiveMembers", "events", "matches", "achievements", "gallery", "registrations", "documents", "notifications", "rules", "users", "settings"] as const;
    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }

    // ========== SPORTS ==========
    const sportsData = [
      { name: "Cricket", category: "Outdoor", description: "The official KKR & KSR Cricket Team competes at Inter-Collegiate, University, and State level tournaments with state-of-the-art turf pitch facilities.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "M. Bharath Kumar (IT - IV Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80" },
      { name: "Football", category: "Outdoor", description: "High-intensity football squad featuring FIFA-standard grass pitch, dedicated strength & conditioning trainers, and tactical workshops.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "G. Ravi Kiran (IT - IV Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80" },
      { name: "Volleyball", category: "Outdoor", description: "Dynamic volleyball team operating floodlit court complexes. Celebrated for agility, precise spikes, and disciplined defense.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "Sk. Jameer Bhasha (ECE - IV Year)", womenCaptain: "M. Yamini (ECE - III Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80" },
      { name: "Basketball", category: "Outdoor / Indoor", description: "Fast-paced basketball unit practicing on synthetic acrylic floodlit courts. Known for fast breaks and perimeter defense.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "N. Prasanth Chowdary (IT - IV Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80" },
      { name: "Athletics", category: "Track & Field", description: "Comprehensive athletics program covering 100m to 10,000m, relay events, long jump, high jump, shot put, and javelin throw.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80" },
      { name: "Ball Badminton", category: "Outdoor", description: "Traditional and fast-paced Ball Badminton squad competing in inter-collegiate and university tournaments with dedicated outdoor court facilities.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "R. Jan Kenadi (ECE - IV Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80" },
      { name: "Chess", category: "Indoor / Mind Sport", description: "Mind sport hub dedicated to strategic excellence, grandmaster workshops, rating tournaments, and online inter-college leagues.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80" },
      { name: "Kabaddi", category: "Outdoor", description: "Traditional and high-octane Kabaddi team training on professional mat courts under specialized raider and defender coaches.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "K. Vasudevarao (EEE - IV Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80" },
      { name: "Kho-Kho", category: "Outdoor", description: "Agile, speed-focused Kho-Kho squad celebrated for quick turns, endurance, and synchronized team movements.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "Sk. Kalesha (ECE - IV Year)", womenCaptain: "B. Kavya Sri (CSM - III Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80" },
      { name: "Throwball", category: "Outdoor", description: "Power-packed throwball team known for flawless coordination, powerful serves, and rapid return catches.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", womenCaptain: "K. Sravani (CSD - IV Year)", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80" },
      { name: "Netball", category: "Outdoor", description: "Fast-paced and strategic Netball squad practicing court agility, precise passing, shooting accuracy, and disciplined team defense.", coordinator: "K. Venkata Rao", assistantCoordinator: "M. Surya Prakash Rao", menCaptain: "N. Sai Janardhan", venue: "KKR and KSR Sports Ground", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80" },
    ];
    for (const sport of sportsData) {
      await ctx.db.insert("sports", sport);
    }

    // ========== CORE VALUES ==========
    const coreValuesData = [
      { title: "Teamwork", icon: "Users", color: "from-blue-600 to-indigo-600", description: "Synergy over individualism. We achieve success by collaborating, supporting teammates, and celebrating collective victory.", displayOrder: 1 },
      { title: "Discipline", icon: "ShieldCheck", color: "from-amber-500 to-yellow-600", description: "Commitment to rigorous training, punctuality, self-control, and respect for coaches, referees, and opponents.", displayOrder: 2 },
      { title: "Sportsmanship", icon: "Award", color: "from-emerald-500 to-teal-600", description: "Gracious in victory, honorable in defeat. We uphold integrity, fair play, and ethical conduct above winning.", displayOrder: 3 },
      { title: "Leadership", icon: "Crown", color: "from-purple-600 to-indigo-700", description: "Empowering athletes to take initiative, inspire peers, lead by example, and mentor junior sportspersons.", displayOrder: 4 },
      { title: "Excellence", icon: "Trophy", color: "from-yellow-500 to-amber-600", description: "Relentless pursuit of athletic perfection, setting benchmarks, breaking records, and continuous improvement.", displayOrder: 5 },
      { title: "Inclusiveness", icon: "HeartHandshake", color: "from-rose-500 to-pink-600", description: "Equal opportunities for all students regardless of gender, department, or skill level in a supportive environment.", displayOrder: 6 },
      { title: "Fitness & Well-being", icon: "Activity", color: "from-cyan-500 to-blue-600", description: "Promoting physical health, mental resilience, stress management, and healthy living across the entire campus.", displayOrder: 7 },
      { title: "Integrity", icon: "CheckCircle2", color: "from-blue-700 to-slate-800", description: "Unwavering commitment to honesty, transparency, anti-doping standards, and absolute respect for club rules.", displayOrder: 8 },
    ];
    for (const cv of coreValuesData) {
      await ctx.db.insert("coreValues", cv);
    }

    // ========== EXECUTIVE BODY ==========
    const executiveData = [
      { name: "M. Bharath Kumar", position: "President", department: "Information Technology(IT - IV Yr)", email: "bharathkumarmaddikunta@gmail.com", phone: "+91 91827 55664", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", displayOrder: 1 },
      { name: "K. Vasudevarao", position: "Vice President", department: "Electrical and Electronical Engineering(EEE - IV Yr)", email: "vasudevaraokolupuri23@gmail.com", phone: "+91 93909 53342", photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80", displayOrder: 2 },
      { name: "Sk. Jameer Bhasha", position: "General Secretary", department: "Electronical and Communicational Engineering (ECE - IV Yr)", email: "jameerbhasha66@gmail.com", phone: "+91 79897 96426", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", displayOrder: 3 },
      { name: "P. Anusha", position: "Joint Secretary", department: "Electrical & Electronics Engg (EEE - III Yr)", photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", displayOrder: 4 },
      { name: "B. Karthik", position: "Treasurer", department: "Civil Engineering (Civil - IV Yr)", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", displayOrder: 5 },
      { name: "V. Sai Kumar", position: "Chief Sports Coordinator", department: "Computer Science Engineering (CSE - IV Yr)", photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80", displayOrder: 6 },
    ];
    for (const exec of executiveData) {
      await ctx.db.insert("executiveMembers", exec);
    }

    // ========== EVENTS ==========
    const eventsData = [
      { title: "Annual Sports Meet 2026 - 'KRIDA PRATIBHA'", category: "Upcoming", sport: "Multi-Sport Mega Event", date: "March 15 - March 18, 2026", venue: "Main Athletic Stadium & Indoor Complex", status: "Registrations Open", description: "The grand annual sports festival featuring 11 sports disciplines, 50+ track and field events, march past, cultural sports gala, and cash awards worth ₹2,50,000.", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
      { title: "State Inter-College Cricket Premier League (KPL)", category: "Ongoing", sport: "Cricket", date: "August 08 - August 14, 2026", venue: "KKR & KSR Turf Oval Ground", status: "Semi Finals Today", description: "16 Top engineering college cricket teams battle for the coveted KPL Trophy. Day & Night matches broadcast live on campus screens.", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
      { title: "Inter-Department Basketball Championship", category: "Ongoing", sport: "Basketball", date: "August 09 - August 12, 2026", venue: "Synthetic Basketball Arena", status: "Group Stage Day 2", description: "CSE Warriors vs ECE Titans. High-intensity rivalry for departmental sports supremacy.", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
      { title: "All India Inter-University Chess Tournament 2025", category: "Past", sport: "Chess", date: "December 10 - December 14, 2025", venue: "AC Indoor Auditorium", status: "Completed (KKR & KSR Winner)", description: "Hosted 45 University teams across India. KKR & KSR Mind Champions bagged 1st Rank overall.", imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80", isPublished: true, createdAt: new Date().toISOString() },
    ];
    for (const evt of eventsData) {
      await ctx.db.insert("events", evt);
    }

    // ========== ACHIEVEMENTS ==========
    const achievementsData = [
      { title: "Best Athlete of the Year 2025-26", recipient: "V. Akash (Mechanical Dept - IV Yr)", category: "Individual Excellence", achievement: "Set new state college record in 100m sprint (10.64 sec) & 200m (21.80 sec).", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80", year: "2025-26", medalType: "Gold" },
      { title: "Emerging Player Award 2025", recipient: "S. Keerthi (ECE - II Yr)", category: "Table Tennis", achievement: "Undefeated rookie season in University singles and doubles matches.", imageUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=600&q=80", year: "2025", medalType: "Gold" },
      { title: "Best Team Award 2025", recipient: "KKR & KSR Cricket Team", category: "Team Performance", achievement: "Won 4 major inter-collegiate tournaments in a single academic year.", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80", year: "2025", medalType: "Trophy" },
      { title: "Sportsmanship & Fair Play Trophy", recipient: "KKR & KSR Women's Basketball Team", category: "Ethics & Integrity", achievement: "Recognized by University Sports Board for exemplary court behavior and integrity.", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80", year: "2025", medalType: "Trophy" },
    ];
    for (const ach of achievementsData) {
      await ctx.db.insert("achievements", ach);
    }

    // ========== GALLERY ==========
    const galleryData = [
      { title: "Annual Sports Meet Opening Ceremony", category: "Sports Day", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80", caption: "Grand Olympic style torch lighting by Chief Guest and Directors.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Cricket Championship Final Victory Celebration", category: "Inter-College Competitions", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80", caption: "Team lifting the JNTU Kakinada Overall Championship Trophy.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Early Morning Athletics Conditioning", category: "Training Sessions", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1000&q=80", caption: "Sprint drills and agility training under head coach supervision.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "State Level Kabaddi Tournament Action", category: "Tournaments", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80", caption: "Crucial super tackle execution during the finals match.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Felicitation of National Level Medallists", category: "Award Ceremonies", imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1000&q=80", caption: "Honoring athletes with cash rewards and institute laurels.", mediaType: "Image", createdAt: new Date().toISOString() },
      { title: "Indoor Badminton Doubles Finals", category: "Tournaments", imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80", caption: "Thrilling match point rally in front of packed stadium stands.", mediaType: "Image", createdAt: new Date().toISOString() },
    ];
    for (const item of galleryData) {
      await ctx.db.insert("gallery", item);
    }

    // ========== DOCUMENTS ==========
    const documentsData = [
      { title: "Sports Club Student Membership Registration Form 2026", fileSize: "1.2 MB", fileType: "PDF Document", category: "Forms", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
      { title: "Official Sports On-Duty (OD) Attendance Request Form", fileSize: "450 KB", fileType: "PDF Document", category: "Academic OD", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
      { title: "Outstation Inter-University Tournament Travel Clearance Form", fileSize: "620 KB", fileType: "PDF Document", category: "Travel", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
      { title: "KKR & KSR Sports Constitution & Rulebook (Complete PDF)", fileSize: "3.4 MB", fileType: "PDF Document", category: "Rulebook", downloadCount: 0, version: "1.0", createdAt: new Date().toISOString() },
    ];
    for (const doc of documentsData) {
      await ctx.db.insert("documents", doc);
    }

    // ========== NOTIFICATIONS ==========
    const notificationsData = [
      { title: "Annual Sports Meet 2026", message: "Annual Sports Meet 2026 'KRIDA PRATIBHA' Registration is officially open!", type: "Announcement", isActive: true, createdAt: new Date().toISOString() },
      { title: "Live Cricket Match", message: "Inter-College Cricket Semi-Finals live match in progress on Turf Oval Ground.", type: "Match Update", isActive: true, createdAt: new Date().toISOString() },
      { title: "Chess Victory", message: "KKR & KSR Mind Champions bagged 1st rank in All India University Chess League.", type: "Announcement", isActive: true, createdAt: new Date().toISOString() },
    ];
    for (const notif of notificationsData) {
      await ctx.db.insert("notifications", notif);
    }

    // ========== RULES / CONSTITUTION ==========
    const rulesData = [
      { chapter: "Chapter 1", title: "Membership & Eligibility", displayOrder: 1, content: "1.1 All bonafide students of KKR & KSR Institute of Technology & Sciences enrolled in B.Tech, M.Tech, MCA, or MBA programs are eligible for Sports Club membership.\n1.2 Members must maintain a minimum academic attendance of 75% and zero disciplinary records to represent college teams.\n1.3 Membership renewal is mandatory at the beginning of each academic year with a physical fitness certificate." },
      { chapter: "Chapter 2", title: "Code of Conduct & Ethics", displayOrder: 2, content: "2.1 Respect for opponents, match referees, coaches, and facility staff is non-negotiable.\n2.2 Abusive language, unsportsmanlike behavior, or violence will lead to immediate cancellation of membership and suspension from academic classes.\n2.3 Complete adherence to Fair Play principles and anti-doping policies." },
      { chapter: "Chapter 3", title: "Player Selection Procedure", displayOrder: 3, content: "3.1 Team selection trials will be conducted openly by the Physical Education Department and appointed coaches.\n3.2 Selection criteria include physical fitness scores, sport-specific skill evaluation, match performance, and team discipline.\n3.3 The decision of the Selection Committee is final." },
      { chapter: "Chapter 4", title: "Captains' Responsibilities", displayOrder: 4, content: "4.1 Team Captains must coordinate daily attendance, equipment return, team punctuality, and line-ups.\n4.2 Captains act as primary liaisons between team players, faculty coordinators, and Physical Director.\n4.3 Submit post-match reports within 24 hours of completion." },
      { chapter: "Chapter 5", title: "Training Guidelines & Attendance", displayOrder: 5, content: "5.1 Practice sessions are mandatory for selected college team squad members.\n5.2 Players missing 3 consecutive practice sessions without prior written approval will be replaced by reserve players.\n5.3 Attendance OD (On Duty) letters for missed classes will be granted strictly based on sports attendance register signed by the Physical Director." },
      { chapter: "Chapter 6", title: "Equipment Management", displayOrder: 6, content: "6.1 Sports equipment must be checked out using student ID cards from the Sports Store Room.\n6.2 Any loss or willful damage to sports gear will be billed directly to the student's account.\n6.3 All equipment must be cleaned and returned immediately after practice." },
      { chapter: "Chapter 7", title: "Facilities Usage Rules", displayOrder: 7, content: "7.1 Proper sports uniforms, non-marking shoes for indoor wooden courts, and football cleats for grounds are mandatory.\n7.2 External guests or non-registered individuals are strictly prohibited without written permission from the Physical Director.\n7.3 Floodlights turn off at 08:30 PM sharp." },
      { chapter: "Chapter 8", title: "Safety & First-Aid Protocol", displayOrder: 8, content: "8.1 A certified sports physiotherapist and emergency medical kit are stationed at the Athletic Complex during practice hours.\n8.2 All sports injuries must be reported immediately to the Physical Director. Emergency college ambulance is on 24/7 standby." },
      { chapter: "Chapter 9", title: "Strict Anti-Ragging Policy", displayOrder: 9, content: "9.1 Zero tolerance policy against ragging or senior dominance within sports teams.\n9.2 Any attempt to harass junior players will result in police FIR as per UGC Anti-Ragging regulations and immediate permanent expulsion." },
      { chapter: "Chapter 10", title: "Equality, Inclusion & Gender Equity", displayOrder: 10, content: "10.1 Equal access to ground time, equipment, coaching staff, and budget for both Men's and Women's sports teams.\n10.2 Special encouragement and incentives for female student participation in inter-collegiate meets." },
      { chapter: "Chapter 11", title: "Grievance Redressal System", displayOrder: 11, content: "11.1 Students facing issues regarding selection, coaching, or facilities can submit formal written complaints to the Faculty Sports Committee.\n11.2 Complaints will be investigated and resolved within 7 working days." },
      { chapter: "Chapter 12", title: "Travel & Outstation Guidelines", displayOrder: 12, content: "12.1 Outstation travel for inter-university tournaments is accompanied by designated faculty escorts and physical directors.\n12.2 Travel allowances, institute DA/TA, and official jersey kits are provided by the institute." },
      { chapter: "Chapter 13", title: "Social Media & Public Relations", displayOrder: 13, content: "13.1 Official match photos and statements must be routed through the Sports Club Media Team.\n13.2 Posting derogatory remarks about opponents or match officials on personal social media handles is strictly prohibited." },
    ];
    for (const rule of rulesData) {
      await ctx.db.insert("rules", rule);
    }

    // ========== ADMIN USERS ==========
    const usersData = [
      { name: "Dr. M. Bharath Kumar", email: "admin@kitsports.ac.in", passwordHash: "Admin@123456", role: "Super Admin", isActive: true, createdAt: "2026-01-01" },
      { name: "K. Venkata Rao", email: "physicaldirector@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Faculty Coordinator", isActive: true, createdAt: "2026-01-05" },
      { name: "M. Surya Prakash Rao", email: "sportscoordinator@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Sports Coordinator", isActive: true, createdAt: "2026-01-10" },
      { name: "G. Ravi Kiran", email: "events@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Event Manager", isActive: true, createdAt: "2026-01-15" },
      { name: "Sk. Jameer Bhasha", email: "captain@kkrksr.ac.in", passwordHash: "Admin@123456", role: "Sports Captain", isActive: true, createdAt: "2026-01-20" },
    ];
    for (const user of usersData) {
      await ctx.db.insert("users", user);
    }

    // ========== SETTINGS ==========
    const settingsData = [
      { key: "instituteName", value: "KKR & KSR Institute of Technology & Sciences" },
      { key: "campusAddress", value: "Vinjanampadu, Vaddeswaram Post, Guntur - 522017, AP" },
      { key: "contactEmail", value: "sports@kkrksr.ac.in" },
      { key: "contactPhone", value: "+91 91827 55664" },
      { key: "enableNotifications", value: "true" },
      { key: "darkThemeDefault", value: "false" },
      { key: "tally_gold", value: "48" },
      { key: "tally_silver", value: "32" },
      { key: "tally_bronze", value: "21" },
      { key: "tally_trophies", value: "15" },
    ];
    // ========== JNTUK PLAYERS ==========
    const jntukPlayersData = [
      {
        studentName: "K. Teja Swaroop",
        rollNumber: "22211A0512",
        department: "CSE",
        sport: "Cricket",
        academicYear: "2025-2026",
        tournamentName: "South Zone Inter-University Cricket Tournament",
        venueHost: "SRM University, Chennai",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
        achievementDetails: "Team Vice Captain • Scored 142 Runs in Quarter Finals",
        createdAt: "2026-01-15",
      },
      {
        studentName: "M. Harini",
        rollNumber: "23211A1245",
        department: "IT",
        sport: "Volleyball",
        academicYear: "2025-2026",
        tournamentName: "South Zone Inter-University Volleyball Meet",
        venueHost: "KSRM College of Engineering, Kadapa",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
        achievementDetails: "Represented JNTUK Varsity Team • Outstanding Setter",
        createdAt: "2026-01-20",
      },
      {
        studentName: "P. Rajesh Kumar",
        rollNumber: "21211A0489",
        department: "ECE",
        sport: "Basketball",
        academicYear: "2024-2025",
        tournamentName: "All-India Inter-University Basketball Championship",
        venueHost: "Jain University, Bengaluru",
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600",
        achievementDetails: "Selected for JNTUK Central Basketball Squad",
        createdAt: "2025-02-10",
      },
      {
        studentName: "G. Sravani",
        rollNumber: "22211A0210",
        department: "EEE",
        sport: "Athletics",
        academicYear: "2024-2025",
        tournamentName: "JNTUK Central Athletics Meet",
        venueHost: "JNTU Kakinada Main Stadium",
        photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
        achievementDetails: "Gold Medalist (400m Sprint & 4x100m Relay)",
        createdAt: "2025-03-05",
      },
      {
        studentName: "Sk. Abdul Rehman",
        rollNumber: "23211A6605",
        department: "CSM",
        sport: "Chess",
        academicYear: "2023-2024",
        tournamentName: "South Zone Inter-University Chess Tournament",
        venueHost: "Gandhigram Rural Institute, Dindigul",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
        achievementDetails: "Board 1 Player for JNTUK • FIDE Rated 1845",
        createdAt: "2024-01-18",
      }
    ];
    for (const player of jntukPlayersData) {
      await ctx.db.insert("jntukPlayers", player);
    }

    return "Database re-seeded successfully!";
  },
});

