/**
 * MongoDB Transaction Utility
 * 
 * Provides a wrapper for MongoDB transactions with automatic
 * error handling and rollback support.
 * 
 * Usage:
 * ```ts
 * const result = await withTransaction(async (session) => {
 *   await collection1.insertOne(doc1, { session });
 *   await collection2.updateOne(filter, update, { session });
 *   return result;
 * });
 * ```
 */

import { ClientSession } from 'mongodb';
import { connectToDatabase } from '../db/mongodb';

/**
 * Execute a function within a MongoDB transaction
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>
): Promise<T> {
  const { client } = await connectToDatabase();
  const session = client.startSession();

  try {
    let result: T;

    await session.withTransaction(async () => {
      result = await fn(session);
    });

    return result!;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}
