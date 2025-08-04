import os from "node:os";
import { CONFIG } from "../config/config.js";
import { FileService } from "./fileService.js";
import { AlertService } from "./alertService.js";
import { getDiskUsage, getNetworkStats, calculateCPU, getSystemInfo } from "../utils/system.js";
import { getCurrentTimestamp } from "../utils/formatters.js";

export class MonitorService {
    constructor() {
        this.history = FileService.loadJSON(CONFIG.historyFile, []);
        this.alertService = new AlertService();
        this.startTime = Date.now();
    }

    async collectSystemData() {
        return new Promise((resolve) => {
            const oldCpus = os.cpus();
            
            setTimeout(() => {
                const newCpus = os.cpus();
                
                const cpuUsage = newCpus.map((cpu, i) => ({
                    core: i,
                    model: cpu.model.substring(0, 30) + '...',
                    speed: cpu.speed,
                    usage: calculateCPU(oldCpus[i], newCpus[i])
                }));
                
                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                const memoryUsage = {
                    used: usedMem,
                    total: totalMem,
                    free: freeMem,
                    percentage: (usedMem / totalMem) * 100
                };
                
                const diskStats = getDiskUsage();
                const diskUsage = {
                    used: diskStats.used,
                    total: diskStats.total,
                    free: diskStats.free,
                    percentage: (diskStats.used / diskStats.total) * 100
                };
                
                const networkStats = getNetworkStats();
                const loadAvg = os.loadavg();
                const systemInfo = getSystemInfo();
                
                const systemData = {
                    timestamp: getCurrentTimestamp(),
                    cpuUsage,
                    memoryUsage,
                    diskUsage,
                    networkStats,
                    loadAvg,
                    systemInfo
                };
                
                this.saveToHistory(systemData);
                this.alertService.checkThresholds(systemData);
                
                resolve(systemData);
            }, 1000);
        });
    }

    saveToHistory(systemData) {
        this.history.push({
            timestamp: systemData.timestamp,
            avgCpu: systemData.cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) / systemData.cpuUsage.length,
            memoryPercentage: systemData.memoryUsage.percentage,
            diskPercentage: systemData.diskUsage.percentage,
            load1: systemData.loadAvg[0]
        });
        
        if (this.history.length % 10 === 0) {
            this.saveHistory();
        }
    }

    saveHistory() {
        if (this.history.length > CONFIG.maxHistoryRecords) {
            this.history = this.history.slice(-CONFIG.maxHistoryRecords);
        }
        FileService.saveJSON(CONFIG.historyFile, this.history);
    }

    getHistory() {
        return this.history;
    }

    getAlerts() {
        return this.alertService.getAlerts();
    }

    getTotalAlerts() {
        return this.alertService.getTotalAlerts();
    }

    getStartTime() {
        return this.startTime;
    }

    shutdown() {
        this.saveHistory();
        this.alertService.saveAlerts();
    }
}