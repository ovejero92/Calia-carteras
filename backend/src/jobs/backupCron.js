import cron from "node-cron";
import { runBackupToStorage } from "../services/backup.service.js";

export function startBackupCron() {
    const expr = process.env.BACKUP_CRON_EXPRESSION?.trim();
    if (!expr) {
        console.log("[backup] Sin BACKUP_CRON_EXPRESSION — cron de Storage desactivado");
        return;
    }
    if (!cron.validate(expr)) {
        console.warn("[backup] CRON inválido:", expr);
        return;
    }
    cron.schedule(expr, async () => {
        try {
            const r = await runBackupToStorage();
            console.log("[backup] OK:", r.files?.join(", "));
        } catch (e) {
            console.error("[backup] Error:", e.message);
        }
    });
    console.log("[backup] Programado:", expr);
}
