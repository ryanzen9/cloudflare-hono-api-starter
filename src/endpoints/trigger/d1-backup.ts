import { AppContext } from "../../types";
import { ApiRes } from "../rest";

// ERROR: Workflow "D1_Backup_WorkerFlow" has "schedules" configured, but scheduled Workflows require a paid Workers plan.
// 可以使用 Cron Trigger 替代
export const D1BackUpTrigger = async (c: AppContext) => {
  const instanceId = crypto.randomUUID();
  try {
    await c.env.D1_BACKUP_WF.create({
      id: instanceId
    });

    return c.json(
      ApiRes.success({
        instanceId,
        created: true,
        createdAt: new Date().toISOString()
      }),
      201
    );
  } catch (err) {
    console.error("Error triggering D1 backup workflow:", err);
    const instance = await c.env.D1_BACKUP_WF.get(instanceId);
    return c.json(
      ApiRes.error(`Status: ${instance?.status ?? "unknown"}, Error: ${err}`),
      500
    );
  }
};
