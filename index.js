#!/usr/bin/env node

import chalk from "chalk";
import { CONFIG } from "./src/config/config.js";
import { MonitorService } from "./src/services/monitorService.js";
import { Dashboard } from "./src/display/dashboard.js";
import { CLICommands } from "./src/cli/commands.js";
import { FileService } from "./src/services/fileService.js";
import { formatUptime } from "./src/utils/formatters.js"; 

// Handle CLI commands
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    CLICommands.showHelp();
    process.exit(0);
}

if (process.argv.includes('--alerts')) {
    CLICommands.showAlerts();
    process.exit(0);
}

if (process.argv.includes('--history')) {
    CLICommands.showHistory();
    process.exit(0);
}

if (process.argv.includes('--config')) {
    CLICommands.showConfig();
    process.exit(0);
}

if (process.argv.includes('--clear')) {
    CLICommands.clearData();
    process.exit(0);
}

// Initialize monitoring service
const monitorService = new MonitorService();
let startTime = Date.now();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n📊 SYSTEM MONITOR SHUTTING DOWN...'));

    monitorService.shutdown();

    console.log(chalk.green('\n✅ MONITORING SESSION SUMMARY'));
    console.log(chalk.yellow(`Runtime: ${formatUptime((Date.now() - startTime) / 1000)}`));
    console.log(chalk.yellow(`Total Alerts: ${monitorService.getTotalAlerts()}`));
    console.log(chalk.yellow(`History Records: ${monitorService.getHistory().length}`));
    console.log(chalk.yellow(`Files saved: system-monitor.log, alerts.json, history.json`));

    console.log(chalk.green('\n👋 Thanks for using System Monitor Pro!'));
    console.log(chalk.gray('All data saved successfully.\n'));

    process.exit(0);
});

// Main monitoring loop
async function startMonitoring() {
    console.log(chalk.green('🚀 Starting System Monitor Pro...'));
    console.log(chalk.yellow('Loading configuration and initializing...'));

    FileService.logToFile('System Monitor Pro started');

    const monitor = async () => {
        try {
            // Replacing console.clear() with this more aggressive method
            process.stdout.write('\x1bc'); 
            const systemData = await monitorService.collectSystemData();
            Dashboard.display(systemData, monitorService);
        } catch (error) {
            console.error('Monitoring error:', error);
        }
    };

    // Initial run
    await monitor();

    // Set up interval
    setInterval(monitor, CONFIG.refreshInterval);
}

startMonitoring();