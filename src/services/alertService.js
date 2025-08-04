import { CONFIG } from "../config/config.js";
import { FileService } from "./fileService.js";
import { getCurrentTimestamp } from "../utils/formatters.js";

export class AlertService {
    constructor() {
        this.alerts = FileService.loadJSON(CONFIG.alertFile, []);
        this.totalAlerts = 0;
    }

    checkThresholds(systemData) {
        const { cpuUsage, memoryUsage, diskUsage } = systemData;
        const avgCpuUsage = cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) / cpuUsage.length;
        
        if (avgCpuUsage > CONFIG.alertThresholds.cpu) {
            this.createAlert('CPU', `High CPU usage: ${avgCpuUsage.toFixed(1)}%`, 'HIGH');
        }
        
        if (memoryUsage.percentage > CONFIG.alertThresholds.memory) {
            this.createAlert('MEMORY', `High memory usage: ${memoryUsage.percentage.toFixed(1)}%`, 'HIGH');
        }
        
        if (diskUsage.percentage > CONFIG.alertThresholds.disk) {
            this.createAlert('DISK', `High disk usage: ${diskUsage.percentage.toFixed(1)}%`, 'CRITICAL');
        }
    }

    createAlert(type, message, severity) {
        const alert = {
            id: Date.now(),
            timestamp: getCurrentTimestamp(),
            type: type,
            message: message,
            severity: severity,
            resolved: false
        };
        
        this.alerts.unshift(alert);
        this.totalAlerts++;
        
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(0, 50);
        }
        
        this.saveAlerts();
        FileService.logToFile(`ALERT [${severity}] ${type}: ${message}`);
    }

    saveAlerts() {
        FileService.saveJSON(CONFIG.alertFile, this.alerts);
    }

    getAlerts() {
        return this.alerts;
    }

    getTotalAlerts() {
        return this.totalAlerts;
    }
}