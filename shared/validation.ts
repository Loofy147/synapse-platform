// This file will contain all the Zod schemas for input validation.
import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100, "Title must be at most 100 characters long.").trim(),
  description: z.string().max(5000, "Description must be at most 5000 characters long.").optional(),
  problem: z.string().min(10, "Problem statement must be at least 10 characters long.").max(5000, "Problem statement must be at most 5000 characters long."),
  solution: z.string().min(10, "Solution statement must be at least 10 characters long.").max(5000, "Solution statement must be at most 5000 characters long."),
  targetMarket: z.string().max(1000, "Target market description must be at most 1000 characters long.").optional(),
  stage: z.enum(["idea", "prototype", "running", "scaling"]),
  tags: z.array(z.string().max(50, "Each tag must be at most 50 characters long.")).max(10, "You can add up to 10 tags.").optional(),
});
