/**
 * DATABASE TRANSACTION HELPERS
 * 
 * Provides utilities for managing database transactions, ensuring atomic operations,
 * and proper error handling across related database operations.
 */

import { getDb } from "./db";
import { TRPCError } from "@trpc/server";

export interface TransactionContext {
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
}

/**
 * Execute a function within a database transaction
 * Automatically rolls back on error, commits on success
 */
export async function withTransaction<T>(
  callback: (context: TransactionContext) => Promise<T>
): Promise<T> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }

  try {
    // Start transaction
    await db.execute("START TRANSACTION");

    // Create context with rollback/commit methods
    const context: TransactionContext = {
      rollback: async () => {
        await db.execute("ROLLBACK");
      },
      commit: async () => {
        await db.execute("COMMIT");
      },
    };

    // Execute callback
    const result = await callback(context);

    // Commit transaction
    await db.execute("COMMIT");

    return result;
  } catch (error) {
    // Rollback on error
    try {
      await db.execute("ROLLBACK");
    } catch (rollbackError) {
      console.error("[Transaction] Rollback failed:", rollbackError);
    }

    // Re-throw original error
    if (error instanceof TRPCError) {
      throw error;
    }

    if (error instanceof Error) {
      console.error("[Transaction] Error:", error.message);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database operation failed",
        cause: error,
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unknown database error",
    });
  }
}

/**
 * Retry logic for transient database errors
 */
export async function withRetry<T>(
  callback: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callback();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable =
        lastError.message.includes("DEADLOCK") ||
        lastError.message.includes("LOCK WAIT TIMEOUT") ||
        lastError.message.includes("too many connections");

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

/**
 * Validate transaction preconditions
 */
export async function validateTransactionPreconditions(
  conditions: Array<{
    name: string;
    check: () => Promise<boolean>;
    errorMessage: string;
  }>
): Promise<void> {
  for (const condition of conditions) {
    const isValid = await condition.check();
    if (!isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: condition.errorMessage,
      });
    }
  }
}

/**
 * Handle common database errors
 */
export function handleDatabaseError(error: unknown): TRPCError {
  if (error instanceof TRPCError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Foreign key constraint violation
  if (errorMessage.includes("FOREIGN KEY constraint failed")) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: "Referenced resource not found",
    });
  }

  // Unique constraint violation
  if (errorMessage.includes("UNIQUE constraint failed")) {
    return new TRPCError({
      code: "CONFLICT",
      message: "This record already exists",
    });
  }

  // Duplicate key error
  if (errorMessage.includes("ER_DUP_ENTRY")) {
    return new TRPCError({
      code: "CONFLICT",
      message: "Duplicate entry",
    });
  }

  // Column not found
  if (errorMessage.includes("Unknown column")) {
    console.error("[Database] Schema error:", errorMessage);
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database schema error",
    });
  }

  // Deadlock
  if (errorMessage.includes("DEADLOCK")) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database is busy, please try again",
    });
  }

  // Default error
  console.error("[Database] Unexpected error:", errorMessage);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database operation failed",
  });
}

/**
 * Create a savepoint for nested transactions
 */
export async function withSavepoint<T>(
  name: string,
  callback: () => Promise<T>
): Promise<T> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }

  try {
    // Create savepoint
    await db.execute(`SAVEPOINT ${name}`);

    // Execute callback
    const result = await callback();

    // Release savepoint
    await db.execute(`RELEASE SAVEPOINT ${name}`);

    return result;
  } catch (error) {
    // Rollback to savepoint
    try {
      await db.execute(`ROLLBACK TO SAVEPOINT ${name}`);
    } catch (rollbackError) {
      console.error("[Savepoint] Rollback failed:", rollbackError);
    }

    throw error;
  }
}

/**
 * Batch insert with transaction
 */
export async function batchInsert<T>(
  items: T[],
  insertFn: (item: T) => Promise<void>,
  batchSize: number = 100
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    try {
      await withTransaction(async () => {
        for (const item of batch) {
          try {
            await insertFn(item);
            inserted++;
          } catch (error) {
            failed++;
            console.error("[Batch Insert] Item failed:", error);
          }
        }
      });
    } catch (error) {
      failed += batch.length;
      console.error("[Batch Insert] Batch failed:", error);
    }
  }

  return { inserted, failed };
}

/**
 * Atomic update with version check (optimistic locking)
 */
export async function atomicUpdate<T extends { id: number; version: number }>(
  updateFn: (item: T) => Promise<T>,
  item: T
): Promise<T> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }

  try {
    const updated = await updateFn(item);

    // Verify version hasn't changed
    if (updated.version !== item.version) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Resource was modified by another user",
      });
    }

    return updated;
  } catch (error) {
    throw handleDatabaseError(error);
  }
}
