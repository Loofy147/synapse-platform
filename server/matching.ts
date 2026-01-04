/**
 * SYNAPSE MATCHING ALGORITHM
 * 
 * Advanced weighted scoring system that connects projects with the right people
 * based on skills, investment amounts, project stage, expertise, budgets, and interests.
 * 
 * Scoring Components:
 * - Skill Matching (40%): Technical fit based on user skills vs project requirements
 * - Investment Matching (25%): For investors, alignment with investment amount and stage
 * - Stage Matching (15%): Project stage alignment with user experience level
 * - Interest Matching (15%): User interests and project tags alignment
 * - Engagement Matching (5%): User activity and engagement history
 */

import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  users,
  projects,
  userSkills,
  projectTeamRequirements,
  skills,
  matchingHistory,
  userInterests,
  investments,
  applications,
} from "../drizzle/schema";
import type { User, Project } from "../drizzle/schema";

export interface MatchScore {
  userId: number;
  projectId: number;
  totalScore: number;
  skillScore: number;
  investmentScore: number;
  stageScore: number;
  interestScore: number;
  engagementScore: number;
  scoreDetails: Record<string, number>;
  matchType: "skill_based" | "investment_based" | "stage_based" | "interest_based";
  recommendation: string;
}

// ============================================================================
// SKILL-BASED MATCHING (40% weight)
// ============================================================================

async function calculateSkillScore(
  user: User,
  project: Project,
  db: Awaited<ReturnType<typeof getDb>>
): Promise<{ score: number; details: Record<string, number> }> {
  if (!db) return { score: 0, details: {} };

  try {
    // Get user's skills
    const userSkillsData = await db
      .select({
        skillId: userSkills.skillId,
        proficiency: userSkills.proficiency,
        yearsOfExperience: userSkills.yearsOfExperience,
      })
      .from(userSkills)
      .where(eq(userSkills.userId, user.id));

    if (userSkillsData.length === 0) {
      return { score: 0, details: {} };
    }

    // Get project team requirements
    const teamReqs = await db
      .select({
        skillId: projectTeamRequirements.skillId,
        minProficiency: projectTeamRequirements.minProficiency,
        minYearsExperience: projectTeamRequirements.minYearsExperience,
        filled: projectTeamRequirements.filled,
        count: projectTeamRequirements.count,
      })
      .from(projectTeamRequirements)
      .where(eq(projectTeamRequirements.projectId, project.id));

    if (teamReqs.length === 0) {
      return { score: 50, details: { noRequirements: 50 } }; // Neutral score if no specific requirements
    }

    let totalScore = 0;
    let matchedSkills = 0;
    const details: Record<string, number> = {};

    // Score each required skill
    for (const req of teamReqs) {
      const userSkill = userSkillsData.find((s) => s.skillId === req.skillId);

      if (userSkill) {
        let skillScore = 0;

        // Proficiency matching (0-60 points)
        const proficiencyLevels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        const userProf = proficiencyLevels[userSkill.proficiency as keyof typeof proficiencyLevels] || 0;
        const reqProf = proficiencyLevels[req.minProficiency as keyof typeof proficiencyLevels] || 0;

        if (userProf >= reqProf) {
          skillScore += 30 + (userProf - reqProf) * 10; // Bonus for exceeding requirements
        } else {
          skillScore += Math.max(0, 20 - (reqProf - userProf) * 10);
        }

        // Experience matching (0-40 points)
        if (userSkill.yearsOfExperience >= req.minYearsExperience) {
          skillScore += 30 + Math.min(10, (userSkill.yearsOfExperience - req.minYearsExperience) / 2);
        } else {
          skillScore += Math.max(0, 15 - (req.minYearsExperience - userSkill.yearsOfExperience) * 5);
        }

        totalScore += skillScore;
        matchedSkills++;
        details[`skill_${req.skillId}`] = skillScore;
      }
    }

    // Calculate average score
    const avgScore = matchedSkills > 0 ? totalScore / matchedSkills : 0;

    // Bonus for matching multiple skills
    const matchPercentage = (matchedSkills / teamReqs.length) * 100;
    const coverageBonus = matchPercentage > 70 ? 10 : matchPercentage > 40 ? 5 : 0;

    const finalScore = Math.min(100, avgScore + coverageBonus);
    details.coverage = matchPercentage;
    details.final = finalScore;

    return { score: finalScore, details };
  } catch (error) {
    console.error("Error calculating skill score:", error);
    return { score: 0, details: {} };
  }
}

// ============================================================================
// INVESTMENT MATCHING (25% weight)
// ============================================================================

async function calculateInvestmentScore(
  user: User,
  project: Project
): Promise<{ score: number; details: Record<string, number> }> {
  const details: Record<string, number> = {};

  // Only applies to investors
  if (user.userType !== "investor") {
    return { score: 0, details: { notInvestor: 0 } };
  }

  // Check if project is seeking investment
  if (!project.seekingInvestment) {
    return { score: 0, details: { notSeeking: 0 } };
  }

  let score = 50; // Base score for investors on seeking projects

  // Investment amount matching
  if (project.totalInvestmentNeeded) {
    const investmentNeeded = parseFloat(project.totalInvestmentNeeded.toString());
    const userInvestmentCapacity = parseFloat(user.earnings.toString()) * 2; // Assume 2x earnings capacity

    if (userInvestmentCapacity >= investmentNeeded) {
      score += 30; // Can fully fund
      details.fundingCapacity = 30;
    } else if (userInvestmentCapacity >= investmentNeeded * 0.5) {
      score += 20; // Can partially fund
      details.fundingCapacity = 20;
    } else if (userInvestmentCapacity >= investmentNeeded * 0.2) {
      score += 10; // Can contribute
      details.fundingCapacity = 10;
    }
  }

  // Stage preference matching
  const stagePreference = user.interests.includes(`stage_${project.stage}`) ? 10 : 0;
  score += stagePreference;
  details.stagePreference = stagePreference;

  // Investor experience bonus
  if (user.investments > 0) {
    const experienceBonus = Math.min(10, user.investments);
    score += experienceBonus;
    details.experience = experienceBonus;
  }

  details.final = Math.min(100, score);
  return { score: Math.min(100, score), details };
}

// ============================================================================
// STAGE MATCHING (15% weight)
// ============================================================================

function calculateStageScore(user: User, project: Project): { score: number; details: Record<string, number> } {
  const details: Record<string, number> = {};

  // Stage progression matching
  const stageHierarchy = { idea: 1, prototype: 2, running: 3, scaling: 4 };
  const userLevel = Math.ceil(user.level / 2); // Convert user level to stage experience
  const projectStageLevel = stageHierarchy[project.stage as keyof typeof stageHierarchy] || 1;

  let score = 50; // Base score

  // Perfect match
  if (userLevel === projectStageLevel) {
    score += 40;
    details.stageMatch = 40;
  }
  // One level difference (acceptable)
  else if (Math.abs(userLevel - projectStageLevel) === 1) {
    score += 25;
    details.stageMatch = 25;
  }
  // User is more experienced than project stage
  else if (userLevel > projectStageLevel) {
    score += 15;
    details.stageMatch = 15;
  }
  // User is less experienced
  else {
    score += Math.max(5, 20 - Math.abs(userLevel - projectStageLevel) * 5);
    details.stageMatch = Math.max(5, 20 - Math.abs(userLevel - projectStageLevel) * 5);
  }

  // Bonus for users with relevant experience
  if (user.collaborations > 0) {
    const collaborationBonus = Math.min(10, user.collaborations);
    score += collaborationBonus;
    details.collaborationBonus = collaborationBonus;
  }

  details.final = Math.min(100, score);
  return { score: Math.min(100, score), details };
}

// ============================================================================
// INTEREST MATCHING (15% weight)
// ============================================================================

function calculateInterestScore(user: User, project: Project): { score: number; details: Record<string, number> } {
  const details: Record<string, number> = {};

  let score = 30; // Base score

  // Tag matching
  const projectTags = project.tags || [];
  const userInterests = user.interests || [];

  if (projectTags.length > 0 && userInterests.length > 0) {
    const matchedTags = projectTags.filter((tag) => userInterests.includes(tag)).length;
    const tagScore = (matchedTags / Math.max(projectTags.length, userInterests.length)) * 50;
    score += tagScore;
    details.tagMatching = tagScore;
  }

  // User type alignment
  const userTypeBonus: Record<string, number> = {
    founder: project.openForCollaboration ? 15 : 0,
    freelancer: project.seekingTeam ? 15 : 0,
    investor: project.seekingInvestment ? 15 : 0,
    collaborator: project.openForCollaboration ? 15 : 0,
  };

  const bonus = userTypeBonus[user.userType] || 0;
  score += bonus;
  details.userTypeBonus = bonus;

  details.final = Math.min(100, score);
  return { score: Math.min(100, score), details };
}

// ============================================================================
// ENGAGEMENT MATCHING (5% weight)
// ============================================================================

function calculateEngagementScore(user: User): { score: number; details: Record<string, number> } {
  const details: Record<string, number> = {};

  let score = 50; // Base score

  // Activity bonus
  const totalActivity = user.projectsCreated + user.collaborations + user.investments;
  const activityBonus = Math.min(40, totalActivity * 5);
  score += activityBonus;
  details.activity = activityBonus;

  // Level bonus
  const levelBonus = Math.min(10, (user.level - 1) * 2);
  score += levelBonus;
  details.level = levelBonus;

  details.final = Math.min(100, score);
  return { score: Math.min(100, score), details };
}

// ============================================================================
// MAIN MATCHING FUNCTION
// ============================================================================

export async function calculateMatchScore(user: User, project: Project): Promise<MatchScore> {
  const db = await getDb();

  // Calculate individual scores
  const skillScore = await calculateSkillScore(user, project, db);
  const investmentScore = await calculateInvestmentScore(user, project);
  const stageScore = calculateStageScore(user, project);
  const interestScore = calculateInterestScore(user, project);
  const engagementScore = calculateEngagementScore(user);

  // Determine match type based on user type
  let matchType: "skill_based" | "investment_based" | "stage_based" | "interest_based" = "interest_based";
  if (user.userType === "freelancer") matchType = "skill_based";
  else if (user.userType === "investor") matchType = "investment_based";
  else if (user.userType === "founder" || user.userType === "collaborator") matchType = "stage_based";

  // Calculate weighted total score
  const weights = {
    skill: 0.4,
    investment: 0.25,
    stage: 0.15,
    interest: 0.15,
    engagement: 0.05,
  };

  const totalScore =
    skillScore.score * weights.skill +
    investmentScore.score * weights.investment +
    stageScore.score * weights.stage +
    interestScore.score * weights.interest +
    engagementScore.score * weights.engagement;

  // Combine all details
  const scoreDetails = {
    ...skillScore.details,
    ...investmentScore.details,
    ...stageScore.details,
    ...interestScore.details,
    ...engagementScore.details,
    skillScore: skillScore.score,
    investmentScore: investmentScore.score,
    stageScore: stageScore.score,
    interestScore: interestScore.score,
    engagementScore: engagementScore.score,
    totalScore: Math.round(totalScore),
  };

  // Generate recommendation
  let recommendation = "";
  if (totalScore >= 80) {
    recommendation = "Excellent match - highly recommended";
  } else if (totalScore >= 60) {
    recommendation = "Good match - consider this opportunity";
  } else if (totalScore >= 40) {
    recommendation = "Fair match - could be worth exploring";
  } else {
    recommendation = "Limited match - may require additional consideration";
  }

  return {
    userId: user.id,
    projectId: project.id,
    totalScore: Math.round(totalScore),
    skillScore: Math.round(skillScore.score),
    investmentScore: Math.round((await investmentScore).score),
    stageScore: Math.round(stageScore.score),
    interestScore: Math.round(interestScore.score),
    engagementScore: Math.round(engagementScore.score),
    scoreDetails,
    matchType,
    recommendation,
  };
}

// ============================================================================
// BATCH MATCHING FOR RECOMMENDATIONS
// ============================================================================

export async function findTopMatches(
  userId: number,
  limit: number = 10,
  minScore: number = 40
): Promise<MatchScore[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get the user
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length === 0) return [];

    const user = userResult[0];

    // Get active projects (excluding user's own)
    const activeProjects = await db
      .select()
      .from(projects)
      .where(and(eq(projects.status, "active"), eq(projects.seekingTeam, true)))
      .limit(100);

    // Calculate match scores for all projects
    const matches: MatchScore[] = [];
    for (const project of activeProjects) {
      if (project.ownerId === userId) continue; // Skip user's own projects

      const match = await calculateMatchScore(user, project);
      if (match.totalScore >= minScore) {
        matches.push(match);
      }
    }

    // Sort by score and return top matches
    return matches.sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);
  } catch (error) {
    console.error("Error finding top matches:", error);
    return [];
  }
}

// ============================================================================
// SAVE MATCHING HISTORY
// ============================================================================

export async function saveMatchingHistory(match: MatchScore, action: "viewed" | "applied" | "invested" | "dismissed" | "none" = "none"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(matchingHistory).values({
      userId: match.userId,
      projectId: match.projectId,
      matchType: match.matchType,
      score: match.totalScore,
      scoreDetails: match.scoreDetails,
      action,
      actionAt: action !== "none" ? new Date() : undefined,
    });
  } catch (error) {
    console.error("Error saving matching history:", error);
  }
}
