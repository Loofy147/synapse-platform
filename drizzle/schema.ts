import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  index,
  unique,
  boolean,
  json,
  smallint,
} from "drizzle-orm/mysql-core";

/**
 * SYNAPSE PLATFORM - OPTIMIZED DATABASE SCHEMA
 * 
 * Design principles:
 * - All timestamps stored as UTC milliseconds for consistency
 * - Indexed columns for fast filtering and matching
 * - Denormalized data for matching algorithm performance
 * - Role-based access control via user.role field
 * - Financial data stored as decimal for precision
 */

// ============================================================================
// CORE USER MANAGEMENT
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().default(""),
    name: text("name"),
    
    // Role-based access control
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    
    // User type (founder, freelancer, investor, collaborator)
    userType: mysqlEnum("userType", ["founder", "freelancer", "investor", "collaborator"])
      .default("founder")
      .notNull(),
    
    // Profile information
    bio: text("bio"),
    avatar: varchar("avatar", { length: 512 }),
    location: varchar("location", { length: 255 }),
    website: varchar("website", { length: 512 }),
    
    // Gamification
    level: int("level").default(1).notNull(),
    score: int("score").default(0).notNull(),
    badges: json("badges").$type<string[]>().default([]).notNull(),
    
    // Statistics
    projectsCreated: int("projectsCreated").default(0).notNull(),
    collaborations: int("collaborations").default(0).notNull(),
    investments: int("investments").default(0).notNull(),
    earnings: decimal("earnings", { precision: 15, scale: 2 }).default("0.00").notNull(),
    
    // Preferences
    interests: json("interests").$type<string[]>().default([]).notNull(),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    userTypeIdx: index("userType_idx").on(table.userType),
    roleIdx: index("role_idx").on(table.role),
    levelIdx: index("level_idx").on(table.level),
    scoreIdx: index("score_idx").on(table.score),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = {
  id?: number;
  openId: string;
  email?: string;
  userType?: 'founder' | 'freelancer' | 'investor' | 'collaborator';
  name?: string | null;
  role?: 'user' | 'admin';
  bio?: string | null;
  avatar?: string | null;
  location?: string | null;
  website?: string | null;
  level?: number;
  score?: number;
  badges?: string[];
  projectsCreated?: number;
  collaborations?: number;
  investments?: number;
  earnings?: string;
  interests?: string[];
  lastSignedIn?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

// ============================================================================
// SKILLS & EXPERTISE
// ============================================================================

export const skills = mysqlTable(
  "skills",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    category: varchar("category", { length: 50 }).notNull(), // dev, design, marketing, sales, finance, legal, operations, product
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
  })
);

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

export const userSkills = mysqlTable(
  "userSkills",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    skillId: int("skillId").notNull(),
    proficiency: mysqlEnum("proficiency", ["beginner", "intermediate", "advanced", "expert"])
      .default("intermediate")
      .notNull(),
    yearsOfExperience: int("yearsOfExperience").default(0).notNull(),
    hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userSkills_userId_idx").on(table.userId),
    skillIdIdx: index("userSkills_skillId_idx").on(table.skillId),
    userSkillUnique: unique("userSkills_unique").on(table.userId, table.skillId),
  })
);

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = typeof userSkills.$inferInsert;

// ============================================================================
// PROJECTS & IDEAS
// ============================================================================

export const projects = mysqlTable(
  "projects",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull(),
    ownerName: varchar("ownerName", { length: 255 }).notNull(),
    
    // Project metadata
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    problem: text("problem"),
    solution: text("solution"),
    targetMarket: text("targetMarket"),
    
    // Project stage and status
    stage: mysqlEnum("stage", ["idea", "prototype", "running", "scaling"])
      .default("idea")
      .notNull(),
    status: mysqlEnum("status", ["draft", "active", "paused", "completed", "archived"])
      .default("active")
      .notNull(),
    
    // Validation data
    validated: boolean("validated").default(false).notNull(),
    validationScore: smallint("validationScore"), // 0-100
    marketPotential: smallint("marketPotential"), // 0-100
    feasibility: smallint("feasibility"), // 0-100
    competition: smallint("competition"), // 0-100
    
    // Financial data
    monthlyBurn: decimal("monthlyBurn", { precision: 15, scale: 2 }),
    totalInvestmentNeeded: decimal("totalInvestmentNeeded", { precision: 15, scale: 2 }),
    runway: int("runway"), // in months
    breakEvenMonth: int("breakEvenMonth"),
    revenueYear1: decimal("revenueYear1", { precision: 15, scale: 2 }),
    revenueYear2: decimal("revenueYear2", { precision: 15, scale: 2 }),
    revenueYear3: decimal("revenueYear3", { precision: 15, scale: 2 }),
    
    // Seeking flags for matching
    seekingInvestment: boolean("seekingInvestment").default(false).notNull(),
    seekingTeam: boolean("seekingTeam").default(false).notNull(),
    openForCollaboration: boolean("openForCollaboration").default(false).notNull(),
    
    // Analytics
    views: int("views").default(0).notNull(),
    interests: int("interests").default(0).notNull(),
    
    // Metadata
    tags: json("tags").$type<string[]>().default([]).notNull(),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("projects_ownerId_idx").on(table.ownerId),
    stageIdx: index("projects_stage_idx").on(table.stage),
    statusIdx: index("projects_status_idx").on(table.status),
    seekingInvestmentIdx: index("projects_seekingInvestment_idx").on(table.seekingInvestment),
    seekingTeamIdx: index("projects_seekingTeam_idx").on(table.seekingTeam),
    validatedIdx: index("projects_validated_idx").on(table.validated),
    createdAtIdx: index("projects_createdAt_idx").on(table.createdAt),
  })
);

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================================================
// PROJECT TEAM REQUIREMENTS
// ============================================================================

export const projectTeamRequirements = mysqlTable(
  "projectTeamRequirements",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    skillId: int("skillId").notNull(),
    
    // Role details
    role: varchar("role", { length: 100 }).notNull(), // e.g., "Senior Developer", "UI Designer"
    count: int("count").default(1).notNull(),
    
    // Cost estimation
    hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }).notNull(),
    estimatedHours: int("estimatedHours").notNull(),
    totalCost: decimal("totalCost", { precision: 15, scale: 2 }).notNull(),
    
    // Requirements
    minProficiency: mysqlEnum("minProficiency", ["beginner", "intermediate", "advanced", "expert"])
      .default("intermediate")
      .notNull(),
    minYearsExperience: int("minYearsExperience").default(0).notNull(),
    description: text("description"),
    
    // Status
    filled: int("filled").default(0).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("teamReq_projectId_idx").on(table.projectId),
    skillIdIdx: index("teamReq_skillId_idx").on(table.skillId),
  })
);

export type ProjectTeamRequirement = typeof projectTeamRequirements.$inferSelect;
export type InsertProjectTeamRequirement = typeof projectTeamRequirements.$inferInsert;

// ============================================================================
// APPLICATIONS & TEAM JOINING
// ============================================================================

export const applications = mysqlTable(
  "applications",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    userId: int("userId").notNull(),
    
    // Application details
    applicationType: mysqlEnum("applicationType", ["team_member", "co_founder", "advisor"])
      .default("team_member")
      .notNull(),
    
    // For team member applications
    teamRequirementId: int("teamRequirementId"),
    
    // Application content
    coverLetter: text("coverLetter"),
    proposedRole: varchar("proposedRole", { length: 100 }),
    proposedHourlyRate: decimal("proposedHourlyRate", { precision: 10, scale: 2 }),
    
    // Status and matching
    status: mysqlEnum("status", ["pending", "accepted", "rejected", "withdrawn"])
      .default("pending")
      .notNull(),
    matchScore: smallint("matchScore"), // 0-100, calculated by matching algorithm
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    respondedAt: timestamp("respondedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("applications_projectId_idx").on(table.projectId),
    userIdIdx: index("applications_userId_idx").on(table.userId),
    statusIdx: index("applications_status_idx").on(table.status),
    createdAtIdx: index("applications_createdAt_idx").on(table.createdAt),
  })
);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// ============================================================================
// INVESTMENTS
// ============================================================================

export const investments = mysqlTable(
  "investments",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    investorId: int("investorId").notNull(),
    
    // Investment details
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    equity: decimal("equity", { precision: 5, scale: 2 }), // percentage
    
    // Status
    status: mysqlEnum("status", ["interested", "negotiating", "committed", "completed", "declined"])
      .default("interested")
      .notNull(),
    
    // Investor notes
    notes: text("notes"),
    matchScore: smallint("matchScore"), // 0-100
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("investments_projectId_idx").on(table.projectId),
    investorIdIdx: index("investments_investorId_idx").on(table.investorId),
    statusIdx: index("investments_status_idx").on(table.status),
    createdAtIdx: index("investments_createdAt_idx").on(table.createdAt),
  })
);

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// ============================================================================
// USER INTERESTS & INTERACTIONS
// ============================================================================

export const userInterests = mysqlTable(
  "userInterests",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    projectId: int("projectId").notNull(),
    
    // Interaction type
    interestType: mysqlEnum("interestType", ["view", "like", "bookmark", "share"])
      .default("view")
      .notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userInterests_userId_idx").on(table.userId),
    projectIdIdx: index("userInterests_projectId_idx").on(table.projectId),
    userProjectUnique: unique("userInterests_unique").on(table.userId, table.projectId),
  })
);

export type UserInterest = typeof userInterests.$inferSelect;
export type InsertUserInterest = typeof userInterests.$inferInsert;

// ============================================================================
// MATCHING HISTORY & RECOMMENDATIONS
// ============================================================================

export const matchingHistory = mysqlTable(
  "matchingHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    projectId: int("projectId").notNull(),
    
    // Matching algorithm details
    matchType: mysqlEnum("matchType", ["skill_based", "investment_based", "stage_based", "interest_based"])
      .notNull(),
    score: smallint("score").notNull(), // 0-100
    
    // Scoring breakdown
    scoreDetails: json("scoreDetails").$type<Record<string, number>>().notNull(),
    
    // Action taken
    action: mysqlEnum("action", ["viewed", "applied", "invested", "dismissed", "none"])
      .default("none")
      .notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    actionAt: timestamp("actionAt"),
  },
  (table) => ({
    userIdIdx: index("matching_userId_idx").on(table.userId),
    projectIdIdx: index("matching_projectId_idx").on(table.projectId),
    scoreIdx: index("matching_score_idx").on(table.score),
  })
);

export type MatchingHistory = typeof matchingHistory.$inferSelect;
export type InsertMatchingHistory = typeof matchingHistory.$inferInsert;

// ============================================================================
// PROJECT ANALYTICS
// ============================================================================

export const projectAnalytics = mysqlTable(
  "projectAnalytics",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    
    // Daily metrics
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    views: int("views").default(0).notNull(),
    uniqueViewers: int("uniqueViewers").default(0).notNull(),
    likes: int("likes").default(0).notNull(),
    applications: int("applications").default(0).notNull(),
    investmentInquiries: int("investmentInquiries").default(0).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("analytics_projectId_idx").on(table.projectId),
    dateIdx: index("analytics_date_idx").on(table.date),
  })
);

export type ProjectAnalytic = typeof projectAnalytics.$inferSelect;
export type InsertProjectAnalytic = typeof projectAnalytics.$inferInsert;

// ============================================================================
// PROJECT MILESTONES
// ============================================================================

export const projectMilestones = mysqlTable(
  "projectMilestones",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    
    // Milestone details
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    
    // Timeline
    durationMonths: int("durationMonths").notNull(),
    estimatedCost: decimal("estimatedCost", { precision: 15, scale: 2 }).notNull(),
    
    // Status
    status: mysqlEnum("status", ["planned", "in_progress", "completed"])
      .default("planned")
      .notNull(),
    
    // Ordering
    order: int("order").notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("milestones_projectId_idx").on(table.projectId),
  })
);

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = typeof projectMilestones.$inferInsert;

// ============================================================================
// USER BADGES & ACHIEVEMENTS
// ============================================================================

export const badges = mysqlTable(
  "badges",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    category: varchar("category", { length: 50 }).notNull(), // founder, investor, collaborator, etc.
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export const userBadges = mysqlTable(
  "userBadges",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    badgeId: int("badgeId").notNull(),
    earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userBadges_userId_idx").on(table.userId),
    badgeIdIdx: index("userBadges_badgeId_idx").on(table.badgeId),
    userBadgeUnique: unique("userBadges_unique").on(table.userId, table.badgeId),
  })
);

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
