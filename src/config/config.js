import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
    refreshInterval: 4000,
    alertThresholds: {
        cpu: 80,
        memory: 80,
        disk: 90
    },
    logFile: path.join(__dirname, '../../system-monitor.log'),
    alertFile: path.join(__dirname, '../../alerts.json'),
    historyFile: path.join(__dirname, '../../history.json'),
    maxHistoryRecords: 100
};