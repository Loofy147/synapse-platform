import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { calculateMatchScore, findTopMatches, saveMatchingHistory } from "./matching";
import { z } from "zod";
import {
  createProjectSchema,
  updateProjectSchema,
  configureProjectSchema,
} from "../shared/validation";
import { eq, and, or, gte, lte, desc, asc } from "drizzle-orm";
import {
  projects,
  projectTeamRequirements,
  applications,
  investments,
  userInterests,
  projectMilestones,
  projectAnalytics,
  users,
  skills,
  userSkills,
  userBadges,
  badges,
} from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // PROJECT PROCEDURES
  // ============================================================================
  projects: router({
    // Create a new project
    create: protectedProcedure
      .input(createProjectSchema)
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(projects).values({
          ownerId: ctx.user.id,
          ownerName: ctx.user.name || "Anonymous",
          title: input.title,
          description: input.description,
          problem: input.problem,
          solution: input.solution,
          targetMarket: input.targetMarket,
          stage: input.stage,
          status: "draft",
          tags: input.tags || [],
        });

        return { success: true };
      }),

    // Get project details
    getById: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const result = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        return result.length > 0 ? result[0] : null;
      }),

    // List projects with filtering
    list: publicProcedure
      .input(
        z.object({
          stage: z.enum(["idea", "prototype", "running", "scaling"]).optional(),
          status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
          seekingTeam: z.boolean().optional(),
          seekingInvestment: z.boolean().optional(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const conditions = [];
        if (input.stage) conditions.push(eq(projects.stage, input.stage));
        if (input.status) conditions.push(eq(projects.status, input.status));
        if (input.seekingTeam !== undefined) conditions.push(eq(projects.seekingTeam, input.seekingTeam));
        if (input.seekingInvestment !== undefined) conditions.push(eq(projects.seekingInvestment, input.seekingInvestment));

        const result = await db
          .select()
          .from(projects)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(projects.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return result;
      }),

    // Update project
    update: protectedProcedure
      .input(updateProjectSchema)
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify ownership
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (project.length === 0 || project[0].ownerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const updateData: Record<string, any> = {};
        if (input.title) updateData.title = input.title;
        if (input.description) updateData.description = input.description;
        if (input.status) updateData.status = input.status;
        if (input.seekingTeam !== undefined) updateData.seekingTeam = input.seekingTeam;
        if (input.seekingInvestment !== undefined) updateData.seekingInvestment = input.seekingInvestment;
        if (input.openForCollaboration !== undefined) updateData.openForCollaboration = input.openForCollaboration;

        await db.update(projects).set(updateData).where(eq(projects.id, input.projectId));

        return { success: true };
      }),

    // Validate project idea
    validate: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Generate validation scores (simplified for demo)
        const validationScore = Math.floor(Math.random() * 30) + 60;
        const marketPotential = Math.floor(Math.random() * 30) + 65;
        const feasibility = Math.floor(Math.random() * 30) + 70;
        const competition = Math.floor(Math.random() * 30) + 55;

        await db
          .update(projects)
          .set({
            validated: true,
            validationScore,
            marketPotential,
            feasibility,
            competition,
          })
          .where(eq(projects.id, input.projectId));

        return {
          success: true,
          validationScore,
          marketPotential,
          feasibility,
          competition,
        };
      }),

    // Configure project with financial and team data
    configure: protectedProcedure
      .input(configureProjectSchema)
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const totalInvestmentNeeded = input.monthlyBurn * input.runway;
        const breakEvenMonth = Math.floor(Math.random() * 6) + 12;

        await db
          .update(projects)
          .set({
            monthlyBurn: input.monthlyBurn.toString(),
            totalInvestmentNeeded: totalInvestmentNeeded.toString(),
            runway: input.runway,
            breakEvenMonth,
            revenueYear1: input.revenueYear1?.toString(),
            revenueYear2: input.revenueYear2?.toString(),
            revenueYear3: input.revenueYear3?.toString(),
            status: "active",
          })
          .where(eq(projects.id, input.projectId));

        return { success: true };
      }),

    // Get user's projects
    getUserProjects: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(projects)
        .where(eq(projects.ownerId, ctx.user.id))
        .orderBy(desc(projects.createdAt));
    }),
  }),

  // ============================================================================
  // MATCHING & RECOMMENDATIONS
  // ============================================================================
  matching: router({
    // Get recommended projects for user
    getRecommendations: protectedProcedure
      .input(z.object({ limit: z.number().default(10), minScore: z.number().default(40) }))
      .query(async ({ ctx, input }) => {
        return await findTopMatches(ctx.user.id, input.limit, input.minScore);
      }),

    // Calculate match score between user and project
    calculateScore: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;

        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (project.length === 0) return null;

        const match = await calculateMatchScore(ctx.user, project[0]);
        await saveMatchingHistory(match, "viewed");

        return match;
      }),
  }),

  // ============================================================================
  // APPLICATIONS
  // ============================================================================
  applications: router({
    // Submit application
    submit: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          applicationType: z.enum(["team_member", "co_founder", "advisor"]),
          teamRequirementId: z.number().optional(),
          coverLetter: z.string().optional(),
          proposedRole: z.string().optional(),
          proposedHourlyRate: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(applications).values({
          projectId: input.projectId,
          userId: ctx.user.id,
          applicationType: input.applicationType,
          teamRequirementId: input.teamRequirementId,
          coverLetter: input.coverLetter,
          proposedRole: input.proposedRole,
          proposedHourlyRate: input.proposedHourlyRate?.toString(),
          status: "pending",
        });

        return { success: true };
      }),

    // Get applications for project
    getProjectApplications: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        // Verify project ownership
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (project.length === 0 || project[0].ownerId !== ctx.user.id) {
          return [];
        }

        return await db
          .select()
          .from(applications)
          .where(eq(applications.projectId, input.projectId))
          .orderBy(desc(applications.createdAt));
      }),

    // Get user's applications
    getUserApplications: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(applications)
        .where(eq(applications.userId, ctx.user.id))
        .orderBy(desc(applications.createdAt));
    }),

    // Update application status
    updateStatus: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          status: z.enum(["pending", "accepted", "rejected", "withdrawn"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify authorization
        const app = await db
          .select()
          .from(applications)
          .where(eq(applications.id, input.applicationId))
          .limit(1);

        if (app.length === 0) throw new Error("Application not found");

        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, app[0].projectId))
          .limit(1);

        if (project.length === 0 || project[0].ownerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await db
          .update(applications)
          .set({ status: input.status, respondedAt: new Date() })
          .where(eq(applications.id, input.applicationId));

        return { success: true };
      }),
  }),

  // ============================================================================
  // INVESTMENTS
  // ============================================================================
  investments: router({
    // Record investment interest
    recordInterest: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          amount: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(investments).values({
          projectId: input.projectId,
          investorId: ctx.user.id,
          amount: input.amount.toString(),
          status: "interested",
          notes: input.notes,
        });

        return { success: true };
      }),

    // Get project investments
    getProjectInvestments: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        // Verify project ownership
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (project.length === 0 || project[0].ownerId !== ctx.user.id) {
          return [];
        }

        return await db
          .select()
          .from(investments)
          .where(eq(investments.projectId, input.projectId))
          .orderBy(desc(investments.createdAt));
      }),

    // Get user's investments
    getUserInvestments: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(investments)
        .where(eq(investments.investorId, ctx.user.id))
        .orderBy(desc(investments.createdAt));
    }),

    // Update investment status
    updateStatus: protectedProcedure
      .input(
        z.object({
          investmentId: z.number(),
          status: z.enum(["interested", "negotiating", "committed", "completed", "declined"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify authorization
        const inv = await db
          .select()
          .from(investments)
          .where(eq(investments.id, input.investmentId))
          .limit(1);

        if (inv.length === 0) throw new Error("Investment not found");

        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, inv[0].projectId))
          .limit(1);

        if (project.length === 0 || project[0].ownerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await db
          .update(investments)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(investments.id, input.investmentId));

        return { success: true };
      }),
  }),

  // ============================================================================
  // USER PROFILE
  // ============================================================================
  user: router({
    // Update user profile
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          location: z.string().optional(),
          website: z.string().optional(),
          userType: z.enum(["founder", "freelancer", "investor", "collaborator"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, any> = {};
        if (input.name) updateData.name = input.name;
        if (input.bio) updateData.bio = input.bio;
        if (input.location) updateData.location = input.location;
        if (input.website) updateData.website = input.website;
        if (input.userType) updateData.userType = input.userType;

        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

        return { success: true };
      }),

    // Get user profile
    getProfile: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

    // Add skill to user
    addSkill: protectedProcedure
      .input(
        z.object({
          skillId: z.number(),
          proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
          yearsOfExperience: z.number().optional(),
          hourlyRate: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(userSkills).values({
          userId: ctx.user.id,
          skillId: input.skillId,
          proficiency: input.proficiency,
          yearsOfExperience: input.yearsOfExperience || 0,
          hourlyRate: input.hourlyRate?.toString(),
        });

        return { success: true };
      }),

    // Get user skills
    getSkills: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(userSkills)
        .where(eq(userSkills.userId, input.userId));
    }),
  }),

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  analytics: router({
    // Track project view
    trackView: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        // Increment views
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (project.length > 0) {
          await db
            .update(projects)
            .set({ views: (project[0].views || 0) + 1 })
            .where(eq(projects.id, input.projectId));
        }

        return { success: true };
      }),

    // Get project analytics
    getProjectAnalytics: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;

        // Verify ownership
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (project.length === 0 || project[0].ownerId !== ctx.user.id) {
          return null;
        }

        const analytics = await db
          .select()
          .from(projectAnalytics)
          .where(eq(projectAnalytics.projectId, input.projectId))
          .orderBy(desc(projectAnalytics.date));

        return {
          project: project[0],
          dailyMetrics: analytics,
          totalViews: project[0].views,
          totalInterests: project[0].interests,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
