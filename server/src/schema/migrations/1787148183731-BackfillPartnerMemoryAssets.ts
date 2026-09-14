import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Restore partner-shared assets that 1787148183730 deleted from generated memories.
  // Only job-generated memories are touched: those always set showAt/hideAt and a
  // memoryAt of exactly UTC midnight, while manually created ones do neither.
  await sql`
    INSERT INTO memory_asset ("memoriesId", "assetId")
    SELECT memory.id, asset.id
    FROM memory
    INNER JOIN partner
      ON partner."sharedWithId" = memory."ownerId"
      AND partner."inTimeline" = true
    INNER JOIN asset
      ON asset."ownerId" = partner."sharedById"
      AND (asset."localDateTime" at time zone 'UTC')::date = (memory."memoryAt" at time zone 'UTC')::date
    WHERE memory.type = 'on_this_day'
      AND memory."deletedAt" IS NULL
      AND memory."showAt" IS NOT NULL
      AND memory."hideAt" IS NOT NULL
      AND memory."memoryAt" = date_trunc('day', memory."memoryAt" at time zone 'UTC') at time zone 'UTC'
      AND asset."deletedAt" IS NULL
      AND asset.visibility = 'timeline'
      AND EXISTS (
        SELECT 1 FROM asset_file
        WHERE asset_file."assetId" = asset.id AND asset_file.type = 'preview'
      )
    ON CONFLICT DO NOTHING
  `.execute(db);
}

export async function down(): Promise<void> {
  // Not implemented: the restored rows are indistinguishable from ones generation creates
}
