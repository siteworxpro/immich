import { Kysely } from 'kysely';

export async function up(_db: Kysely<any>): Promise<void> {
  // No-op: memories intentionally include partner-shared assets, so cross-owner
  // memory_asset rows are valid here. See 1787148183731-BackfillPartnerMemoryAssets.
}

export async function down(): Promise<void> {
  // Not implemented: the deleted rows were cross-owner entries
}
