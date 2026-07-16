import { introspectWorkflowInstance } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { getDB } from "../../src/db/dao";
import { usersTable } from "../../src/db/schema";

interface BackupData {
  id: string;
  users: Array<typeof usersTable.$inferSelect>;
}

describe("D1BackupWorkflow", () => {
  const db = getDB(env);

  it("backs up D1 records to local R2", async () => {
    const now = new Date().toISOString();
    const [user] = await db
      .insert(usersTable)
      .values({
        name: "Backup User",
        age: 30,
        email: "backup@example.com",
        createdAt: now,
        updatedAt: now
      })
      .returning();

    if (!user) {
      throw new Error("Failed to seed backup user");
    }

    const instanceId = crypto.randomUUID();

    await using instance = await introspectWorkflowInstance(
      env.D1_BACKUP_WF,
      instanceId
    );

    await env.D1_BACKUP_WF.create({
      id: instanceId
    });

    await expect(instance.waitForStatus("complete")).resolves.not.toThrow();

    const listing = await env.R2_BUCKET.list({
      prefix: "d1_dump/"
    });

    const backupObject = listing.objects.find((object) =>
      object.key.endsWith(`/${instanceId}.json`)
    );
    expect(backupObject).toBeDefined();

    const object = await env.R2_BUCKET.get(backupObject!.key);
    expect(object).not.toBeNull();

    const backup = (await object!.json()) as BackupData;

    expect(backup.id).toBe(instanceId);
    expect(backup.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: user.id,
          email: user.email
        })
      ])
    );
  });
});
