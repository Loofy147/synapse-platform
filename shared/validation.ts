/**
 * SYNAPSE VALIDATION SCHEMAS
 * Comprehensive Zod schemas for input validation across all tRPC procedures.
 */

import { z } from "zod";

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const StringSchema = z.string().trim();
export const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, "Invalid slug format");
export const EmailSchema = z.string().email("Invalid email address");
export const URLSchema = z.string().url("Invalid URL").optional();
export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional();

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

export const UserTypeSchema = z.enum(["founder", "freelancer", "investor", "collaborator"]);

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: URLSchema,
  userType: UserTypeSchema.optional(),
});

export const addSkillSchema = z.object({
  skillId: z.number().int().positive(),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  yearsOfExperience: z.number().int().min(0).max(100).optional(),
  hourlyRate: z.number().positive().max(10000).optional(),
});

// ============================================================================
// PROJECT VALIDATION SCHEMAS
// ============================================================================

export const ProjectStageSchema = z.enum(["idea", "prototype", "running", "scaling"]);
export const ProjectStatusSchema = z.enum(["draft", "active", "paused", "completed", "archived"]);

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long.")
    .max(100, "Title must be at most 100 characters long.")
    .trim(),
  description: z.string().max(5000, "Description must be at most 5000 characters long.").optional(),
  problem: z
    .string()
    .min(10, "Problem statement must be at least 10 characters long.")
    .max(5000, "Problem statement must be at most 5000 characters long."),
  solution: z
    .string()
    .min(10, "Solution statement must be at least 10 characters long.")
    .max(5000, "Solution statement must be at most 5000 characters long."),
  targetMarket: z.string().max(1000, "Target market description must be at most 1000 characters long.").optional(),
  stage: ProjectStageSchema,
  tags: z
    .array(z.string().max(50, "Each tag must be at most 50 characters long."))
    .max(10, "You can add up to 10 tags.")
    .optional(),
});

export const updateProjectSchema = z.object({
  projectId: z.number().int().positive(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long.")
    .max(100, "Title must be at most 100 characters long.")
    .trim()
    .optional(),
  description: z.string().max(5000, "Description must be at most 5000 characters long.").optional(),
  status: ProjectStatusSchema.optional(),
  seekingTeam: z.boolean().optional(),
  seekingInvestment: z.boolean().optional(),
  openForCollaboration: z.boolean().optional(),
});

export const configureProjectSchema = z.object({
  projectId: z.number().int().positive(),
  monthlyBurn: z
    .number()
    .positive("Monthly burn must be a positive number.")
    .max(1000000, "Monthly burn too high"),
  runway: z
    .number()
    .positive("Runway must be a positive number.")
    .int()
    .min(1, "Runway must be at least 1 month")
    .max(120, "Runway must be less than 120 months"),
  revenueYear1: z.number().nonnegative().max(100000000).optional(),
  revenueYear2: z.number().nonnegative().max(100000000).optional(),
  revenueYear3: z.number().nonnegative().max(100000000).optional(),
});

export const projectTeamRequirementSchema = z.object({
  projectId: z.number().int().positive(),
  skillId: z.number().int().positive(),
  minProficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  minYearsExperience: z.number().int().min(0).max(100),
  count: z.number().int().min(1).max(50),
});

// ============================================================================
// APPLICATION VALIDATION SCHEMAS
// ============================================================================

export const ApplicationTypeSchema = z.enum(["team_member", "co_founder", "advisor"]);

export const submitApplicationSchema = z.object({
  projectId: z.number().int().positive(),
  applicationType: ApplicationTypeSchema,
  teamRequirementId: z.number().int().positive().optional(),
  coverLetter: z.string().max(2000).optional(),
  proposedRole: z.string().max(100).optional(),
  proposedHourlyRate: z.number().positive().max(10000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  applicationId: z.number().int().positive(),
  status: z.enum(["pending", "accepted", "rejected", "withdrawn"]),
});

// ============================================================================
// INVESTMENT VALIDATION SCHEMAS
// ============================================================================

export const recordInvestmentSchema = z.object({
  projectId: z.number().int().positive(),
  amount: z
    .number()
    .positive("Investment amount must be positive")
    .max(100000000, "Investment amount too high"),
  notes: z.string().max(1000).optional(),
});

export const updateInvestmentStatusSchema = z.object({
  investmentId: z.number().int().positive(),
  status: z.enum(["interested", "negotiating", "committed", "completed", "declined"]),
});

// ============================================================================
// MARKETPLACE VALIDATION SCHEMAS
// ============================================================================

export const listProjectsSchema = z.object({
  stage: ProjectStageSchema.optional(),
  status: ProjectStatusSchema.optional(),
  seekingTeam: z.boolean().optional(),
  seekingInvestment: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const getProjectSchema = z.object({
  projectId: z.number().int().positive(),
});

// ============================================================================
// ANALYTICS VALIDATION SCHEMAS
// ============================================================================

export const trackViewSchema = z.object({
  projectId: z.number().int().positive(),
});

export const getAnalyticsSchema = z.object({
  projectId: z.number().int().positive(),
});

// ============================================================================
// MATCHING VALIDATION SCHEMAS
// ============================================================================

export const getRecommendationsSchema = z.object({
  limit: z.number().int().positive().max(50).default(10),
  minScore: z.number().min(0).max(100).default(40),
});

export const calculateScoreSchema = z.object({
  projectId: z.number().int().positive(),
});

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
}

/**
 * Sanitize HTML content (basic)
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, ""); // Remove javascript: protocol
}

/**
 * Validate and sanitize project description
 */
export function validateProjectDescription(description: string): string {
  const sanitized = sanitizeHTML(description);
  if (sanitized.length > 5000) {
    return sanitized.substring(0, 5000);
  }
  return sanitized;
}

/**
 * Validate and normalize email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Validate and normalize URL
 */
export function normalizeURL(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    throw new Error("Invalid URL");
  }
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

/**
 * Validate multiple items and collect errors
 */
export function validateBatch<T>(
  items: unknown[],
  schema: z.ZodSchema<T>
): { valid: T[]; errors: Array<{ index: number; error: string }> } {
  const valid: T[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      const errorMsg = result.error.issues[0]?.message || "Validation failed";
      errors.push({
        index,
        error: errorMsg,
      });
    }
  });

  return { valid, errors };
}
