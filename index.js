#!/usr/bin/env node

import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    refreshInterval: 2000,
    alertThresholds: {
        cpu: 80,
        memory: 80,
        disk: 90
    },
    logFile: path.join(__dirname, 'system-monitor.log'),
    alertFile: path.join(__dirname, 'alerts.json'),
    historyFile: path.join(__dirname, 'history.json'),
    maxHistoryRecords: 100
};

// Global variables
let alerts = loadAlerts();
let history = loadHistory();
let startTime = Date.now();
let totalAlerts = 0;

// Utility functions
function getCurrentTimestamp() {
    return new Date().toISOString();
}

function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function getDiskUsage() {
    try {
        const stats = fs.statSync('/');
        // This is a simplified version - on Windows/Mac you might need different approach
        return {
            total: 100 * 1024 * 1024 * 1024, // Mock 100GB
            free: 60 * 1024 * 1024 * 1024,   // Mock 60GB free
            used: 40 * 1024 * 1024 * 1024    // Mock 40GB used
        };
    } catch (error) {
        return {
            total: 100 * 1024 * 1024 * 1024,
            free: 60 * 1024 * 1024 * 1024,
            used: 40 * 1024 * 1024 * 1024
        };
    }
}

function getNetworkStats() {
    // Simulated network stats - in real implementation you'd read from /proc/net/dev on Linux
    return {
        bytesReceived: Math.floor(Math.random() * 1000000),
        bytesSent: Math.floor(Math.random() * 500000),
        packetsReceived: Math.floor(Math.random() * 10000),
        packetsSent: Math.floor(Math.random() * 5000)
    };
}

function calculateCPU(oldCpu, newCpu) {
    const oldTotal = Object.values(oldCpu.times).reduce((a, b) => a + b, 0);
    const newTotal = Object.values(newCpu.times).reduce((a, b) => a + b, 0);
    
    const totalDiff = newTotal - oldTotal;
    const idleDiff = newCpu.times.idle - oldCpu.times.idle;
    
    const activeTime = totalDiff - idleDiff;
    return ((100 * activeTime) / totalDiff);
}

// File operations
function loadAlerts() {
    try {
        if (fs.existsSync(CONFIG.alertFile)) {
            const data = fs.readFileSync(CONFIG.alertFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading alerts:', error.message);
    }
    return [];
}

function saveAlerts() {
    try {
        fs.writeFileSync(CONFIG.alertFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
        console.error('Error saving alerts:', error.message);
    }
}

function loadHistory() {
    try {
        if (fs.existsSync(CONFIG.historyFile)) {
            const data = fs.readFileSync(CONFIG.historyFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading history:', error.message);
    }
    return [];
}

function saveHistory() {
    try {
        // Keep only last 100 records
        if (history.length > CONFIG.maxHistoryRecords) {
            history = history.slice(-CONFIG.maxHistoryRecords);
        }
        fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving history:', error.message);
    }
}

function logToFile(message) {
    try {
        const timestamp = getCurrentTimestamp();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(CONFIG.logFile, logEntry);
    } catch (error) {
        console.error('Error writing to log file:', error.message);
    }
}

// Alert system
function checkThresholds(systemData) {
    const { cpuUsage, memoryUsage, diskUsage } = systemData;
    const avgCpuUsage = cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) / cpuUsage.length;
    
    // CPU Alert
    if (avgCpuUsage > CONFIG.alertThresholds.cpu) {
        createAlert('CPU', `High CPU usage: ${avgCpuUsage.toFixed(1)}%`, 'HIGH');
    }
    
    // Memory Alert
    if (memoryUsage.percentage > CONFIG.alertThresholds.memory) {
        createAlert('MEMORY', `High memory usage: ${memoryUsage.percentage.toFixed(1)}%`, 'HIGH');
    }
    
    // Disk Alert
    if (diskUsage.percentage > CONFIG.alertThresholds.disk) {
        createAlert('DISK', `High disk usage: ${diskUsage.percentage.toFixed(1)}%`, 'CRITICAL');
    }
}

function createAlert(type, message, severity) {
    const alert = {
        id: Date.now(),
        timestamp: getCurrentTimestamp(),
        type: type,
        message: message,
        severity: severity,
        resolved: false
    };
    
    alerts.unshift(alert);
    totalAlerts++;
    
    // Keep only last 50 alerts
    if (alerts.length > 50) {
        alerts = alerts.slice(0, 50);
    }
    
    saveAlerts();
    logToFile(`ALERT [${severity}] ${type}: ${message}`);
}

// Main monitoring function
function monitor() {
    const oldCpus = os.cpus();
    
    setTimeout(() => {
        const newCpus = os.cpus();
        
        // CPU Usage
        const cpuUsage = newCpus.map((cpu, i) => ({
            core: i,
            model: cpu.model.substring(0, 30) + '...',
            speed: cpu.speed,
            usage: calculateCPU(oldCpus[i], newCpus[i])
        }));
        
        // Memory Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = {
            used: usedMem,
            total: totalMem,
            free: freeMem,
            percentage: (usedMem / totalMem) * 100
        };
        
        // Disk Usage
        const diskStats = getDiskUsage();
        const diskUsage = {
            used: diskStats.used,
            total: diskStats.total,
            free: diskStats.free,
            percentage: (diskStats.used / diskStats.total) * 100
        };
        
        // Network Stats
        const networkStats = getNetworkStats();
        
        // System Load
        const loadAvg = os.loadavg();
        
        // System Info
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            uptime: os.uptime(),
            nodeVersion: process.version,
            totalCores: os.cpus().length
        };
        
        const systemData = {
            timestamp: getCurrentTimestamp(),
            cpuUsage,
            memoryUsage,
            diskUsage,
            networkStats,
            loadAvg,
            systemInfo
        };
        
        // Save to history
        history.push({
            timestamp: systemData.timestamp,
            avgCpu: cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) / cpuUsage.length,
            memoryPercentage: memoryUsage.percentage,
            diskPercentage: diskUsage.percentage,
            load1: loadAvg[0]
        });
        
        if (history.length % 10 === 0) { // Save every 10 records
            saveHistory();
        }
        
        // Check for alerts
        checkThresholds(systemData);
        
        // Display data
        displaySystemData(systemData);
        
    }, 1000);
}

function displaySystemData(data) {
    console.clear();
    
    // Header
    console.log(chalk.bgMagenta.bold('  🖥️  SYSTEM MONITOR PRO - CLI VERSION  🖥️  '));
    console.log(chalk.gray('═'.repeat(60)));
    
    // System Info
    console.log(chalk.cyan.bold('\n📊 SYSTEM INFORMATION'));
    console.log(chalk.yellow(`Hostname: ${data.systemInfo.hostname}`));
    console.log(chalk.yellow(`Platform: ${data.systemInfo.platform} (${data.systemInfo.arch})`));
    console.log(chalk.yellow(`Uptime: ${formatUptime(data.systemInfo.uptime)}`));
    console.log(chalk.yellow(`Node.js: ${data.systemInfo.nodeVersion}`));
    console.log(chalk.yellow(`Cores: ${data.systemInfo.totalCores}`));
    console.log(chalk.yellow(`Monitor Runtime: ${formatUptime((Date.now() - startTime) / 1000)}`));
    
    // CPU Usage
    console.log(chalk.cyan.bold('\n💻 CPU USAGE BY CORE'));
    const cpuTableData = data.cpuUsage.map(cpu => ({
        'Core': cpu.core,
        'Usage': cpu.usage.toFixed(1) + '%',
        'Speed': cpu.speed + ' MHz',
        'Status': cpu.usage > CONFIG.alertThresholds.cpu ? 
            chalk.red('HIGH') : cpu.usage > 60 ? chalk.yellow('MEDIUM') : chalk.green('NORMAL')
    }));
    console.table(cpuTableData);
    
    // Average CPU
    const avgCpu = data.cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) / data.cpuUsage.length;
    console.log(chalk.bold(`Average CPU Usage: ${avgCpu > CONFIG.alertThresholds.cpu ? 
        chalk.redBright(avgCpu.toFixed(1) + '%') : 
        avgCpu > 60 ? chalk.yellow(avgCpu.toFixed(1) + '%') : 
        chalk.green(avgCpu.toFixed(1) + '%')}`));
    
    // Memory Usage
    console.log(chalk.cyan.bold('\n🧠 MEMORY USAGE'));
    const memoryStats = `${formatBytes(data.memoryUsage.used)} / ${formatBytes(data.memoryUsage.total)} (${data.memoryUsage.percentage.toFixed(1)}%)`;
    console.log(chalk.bold(`Memory Used: ${data.memoryUsage.percentage > CONFIG.alertThresholds.memory ? 
        chalk.redBright(memoryStats) : 
        data.memoryUsage.percentage > 60 ? chalk.yellow(memoryStats) : 
        chalk.green(memoryStats)}`));
    console.log(chalk.gray(`Free Memory: ${formatBytes(data.memoryUsage.free)}`));
    
    // Disk Usage
    console.log(chalk.cyan.bold('\n💾 DISK USAGE'));
    const diskStats = `${formatBytes(data.diskUsage.used)} / ${formatBytes(data.diskUsage.total)} (${data.diskUsage.percentage.toFixed(1)}%)`;
    console.log(chalk.bold(`Disk Used: ${data.diskUsage.percentage > CONFIG.alertThresholds.disk ? 
        chalk.redBright(diskStats) : 
        data.diskUsage.percentage > 70 ? chalk.yellow(diskStats) : 
        chalk.green(diskStats)}`));
    
    // System Load
    console.log(chalk.cyan.bold('\n⚡ SYSTEM LOAD'));
    console.log(chalk.yellow(`1 min: ${data.loadAvg[0].toFixed(2)}`));
    console.log(chalk.yellow(`5 min: ${data.loadAvg[1].toFixed(2)}`));
    console.log(chalk.yellow(`15 min: ${data.loadAvg[2].toFixed(2)}`));
    
    // Network Stats (Simulated)
    console.log(chalk.cyan.bold('\n🌐 NETWORK STATS (Simulated)'));
    console.log(chalk.yellow(`Bytes Received: ${formatBytes(data.networkStats.bytesReceived)}`));
    console.log(chalk.yellow(`Bytes Sent: ${formatBytes(data.networkStats.bytesSent)}`));
    console.log(chalk.yellow(`Packets Received: ${data.networkStats.packetsReceived.toLocaleString()}`));
    console.log(chalk.yellow(`Packets Sent: ${data.networkStats.packetsSent.toLocaleString()}`));
    
    // Recent Alerts
    if (alerts.length > 0) {
        console.log(chalk.red.bold('\n🚨 RECENT ALERTS'));
        const recentAlerts = alerts.slice(0, 3);
        recentAlerts.forEach(alert => {
            const timeAgo = Math.floor((Date.now() - alert.id) / 1000);
            const severityColor = alert.severity === 'CRITICAL' ? chalk.red : 
                                 alert.severity === 'HIGH' ? chalk.yellow : chalk.blue;
            console.log(severityColor(`[${alert.severity}] ${alert.message} (${timeAgo}s ago)`));
        });
        
        if (alerts.length > 3) {
            console.log(chalk.gray(`... and ${alerts.length - 3} more alerts`));
        }
    }
    
    // Statistics
    console.log(chalk.cyan.bold('\n📈 SESSION STATISTICS'));
    console.log(chalk.yellow(`Total Alerts Generated: ${totalAlerts}`));
    console.log(chalk.yellow(`Active Alerts: ${alerts.filter(a => !a.resolved).length}`));
    console.log(chalk.yellow(`History Records: ${history.length}`));
    console.log(chalk.yellow(`Log File: ${CONFIG.logFile}`));
    
    // Footer
    console.log(chalk.gray('\n═'.repeat(60)));
    console.log(chalk.gray(`Last Updated: ${data.timestamp}`));
    console.log(chalk.gray('Press Ctrl+C to stop monitoring'));
    console.log(chalk.gray('Files: system-monitor.log, alerts.json, history.json'));
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n📊 SYSTEM MONITOR SHUTTING DOWN...'));
    
    // Save final data
    saveHistory();
    saveAlerts();
    
    // Show summary
    console.log(chalk.green('\n✅ MONITORING SESSION SUMMARY'));
    console.log(chalk.yellow(`Runtime: ${formatUptime((Date.now() - startTime) / 1000)}`));
    console.log(chalk.yellow(`Total Alerts: ${totalAlerts}`));
    console.log(chalk.yellow(`History Records: ${history.length}`));
    console.log(chalk.yellow(`Files saved: system-monitor.log, alerts.json, history.json`));
    
    console.log(chalk.green('\n👋 Thanks for using System Monitor Pro!'));
    console.log(chalk.gray('All data saved successfully.\n'));
    
    process.exit(0);
});

// CLI Commands
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(chalk.cyan.bold('SYSTEM MONITOR PRO - CLI'));
    console.log(chalk.yellow('\nUsage: node index.js [options]'));
    console.log(chalk.yellow('\nOptions:'));
    console.log(chalk.green('  --help, -h     Show this help message'));
    console.log(chalk.green('  --alerts       Show recent alerts'));
    console.log(chalk.green('  --history      Show monitoring history'));
    console.log(chalk.green('  --config       Show current configuration'));
    console.log(chalk.green('  --clear        Clear all saved data'));
    process.exit(0);
}

if (process.argv.includes('--alerts')) {
    console.log(chalk.cyan.bold('RECENT ALERTS'));
    if (alerts.length === 0) {
        console.log(chalk.green('No alerts found.'));
    } else {
        alerts.slice(0, 10).forEach((alert, index) => {
            const severityColor = alert.severity === 'CRITICAL' ? chalk.red : 
                                 alert.severity === 'HIGH' ? chalk.yellow : chalk.blue;
            console.log(`${index + 1}. ${severityColor(`[${alert.severity}]`)} ${alert.message}`);
            console.log(chalk.gray(`   Time: ${alert.timestamp}`));
        });
    }
    process.exit(0);
}

if (process.argv.includes('--history')) {
    console.log(chalk.cyan.bold('MONITORING HISTORY (Last 10 records)'));
    if (history.length === 0) {
        console.log(chalk.green('No history found.'));
    } else {
        const recentHistory = history.slice(-10);
        console.table(recentHistory.map(h => ({
            Time: new Date(h.timestamp).toLocaleTimeString(),
            'CPU %': h.avgCpu.toFixed(1),
            'Memory %': h.memoryPercentage.toFixed(1),
            'Disk %': h.diskPercentage.toFixed(1),
            'Load': h.load1.toFixed(2)
        })));
    }
    process.exit(0);
}

if (process.argv.includes('--config')) {
    console.log(chalk.cyan.bold('CURRENT CONFIGURATION'));
    console.log(chalk.yellow('Alert Thresholds:'));
    console.log(`  CPU: ${CONFIG.alertThresholds.cpu}%`);
    console.log(`  Memory: ${CONFIG.alertThresholds.memory}%`);
    console.log(`  Disk: ${CONFIG.alertThresholds.disk}%`);
    console.log(chalk.yellow('\nFiles:'));
    console.log(`  Log: ${CONFIG.logFile}`);
    console.log(`  Alerts: ${CONFIG.alertFile}`);
    console.log(`  History: ${CONFIG.historyFile}`);
    console.log(chalk.yellow('\nRefresh Interval:'), `${CONFIG.refreshInterval}ms`);
    process.exit(0);
}

if (process.argv.includes('--clear')) {
    try {
        if (fs.existsSync(CONFIG.logFile)) fs.unlinkSync(CONFIG.logFile);
        if (fs.existsSync(CONFIG.alertFile)) fs.unlinkSync(CONFIG.alertFile);
        if (fs.existsSync(CONFIG.historyFile)) fs.unlinkSync(CONFIG.historyFile);
        console.log(chalk.green('✅ All saved data cleared successfully!'));
    } catch (error) {
        console.log(chalk.red('❌ Error clearing data:', error.message));
    }
    process.exit(0);
}

// Start monitoring
console.log(chalk.green('🚀 Starting System Monitor Pro...'));
console.log(chalk.yellow('Loading configuration and initializing...'));

// Log startup
logToFile('System Monitor Pro started');

// Start the monitoring loop
setInterval(monitor, CONFIG.refreshInterval);