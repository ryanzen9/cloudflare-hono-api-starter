import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep
} from "cloudflare:workers";
import { getDB } from "../db/dao";
import { todoAttachmentsTable, todosTable, usersTable } from "../db/schema";

export class D1BackupWorkflow extends WorkflowEntrypoint<Env> {
  async run(_event: WorkflowEvent<unknown>, step: WorkflowStep) {
    await step.do(`Starting backup for ${_event.instanceId}`, async () => {
      const backupData: Record<string, unknown> = {};
      const db = await getDB(this.env);
      const users = await db.select().from(usersTable).all();
      const todos = await db.select().from(todosTable).all();
      const todoAttachments = await db
        .select()
        .from(todoAttachmentsTable)
        .all();
      backupData.id = _event.instanceId;
      backupData.users = users;
      backupData.todos = todos;
      backupData.todoAttachments = todoAttachments;
      backupData.timestamp = new Date().toISOString();

      const dumpData = JSON.stringify(backupData, null, 2);
      // Finally, stream the file directly to R2
      await this.env.R2_BUCKET.put(
        `d1_dump/${new Date().toISOString()}/${backupData.id}.json`,
        dumpData,
        {
          httpMetadata: {
            contentType: "application/json"
          }
        }
      );
    });
  }
}
