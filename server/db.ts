import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateSet: Record<string, unknown> = {};

    // Build update set with provided values
    if (user.name !== undefined) {
      updateSet.name = user.name;
    }
    if (user.email !== undefined) {
      updateSet.email = user.email || "";
    }
    if (user.userType !== undefined) {
      updateSet.userType = user.userType;
    }
    if (user.lastSignedIn !== undefined) {
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      updateSet.role = user.role;
    }

    // Prepare insert values
    const insertValues: any = {
      openId: user.openId,
      email: user.email || "",
      userType: user.userType || "founder",
    };

    // Add optional fields if provided
    if (user.name !== undefined) insertValues.name = user.name;
    if (user.role !== undefined) insertValues.role = user.role;
    if (user.bio !== undefined) insertValues.bio = user.bio;
    if (user.avatar !== undefined) insertValues.avatar = user.avatar;
    if (user.location !== undefined) insertValues.location = user.location;
    if (user.website !== undefined) insertValues.website = user.website;
    if (user.level !== undefined) insertValues.level = user.level;
    if (user.score !== undefined) insertValues.score = user.score;
    if (user.badges !== undefined) insertValues.badges = user.badges;
    if (user.projectsCreated !== undefined) insertValues.projectsCreated = user.projectsCreated;
    if (user.collaborations !== undefined) insertValues.collaborations = user.collaborations;
    if (user.investments !== undefined) insertValues.investments = user.investments;
    if (user.earnings !== undefined) insertValues.earnings = user.earnings;
    if (user.interests !== undefined) insertValues.interests = user.interests;
    if (user.lastSignedIn !== undefined) insertValues.lastSignedIn = user.lastSignedIn;

    // Set admin role for owner
    if (user.openId === ENV.ownerOpenId) {
      insertValues.role = 'admin';
      updateSet.role = 'admin';
    }

    // Ensure lastSignedIn is set
    if (!insertValues.lastSignedIn) {
      insertValues.lastSignedIn = new Date();
      updateSet.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(insertValues).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
