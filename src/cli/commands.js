import chalk from "chalk";
import { CONFIG } from "../config/config.js";
import { FileService } from "../services/fileService.js";

export class CLICommands {
    static showHelp() {
        console.log(chalk.cyan.bold('SYSTEM MONITOR PRO - CLI'));
        console.log(chalk.yellow('\nUsage: node index.js [options]'));
        console.log(chalk.yellow('\nOptions:'));
        console.log(chalk.green('  --help, -h     Show this help message'));
        console.log(chalk.green('  --alerts       Show recent alerts'));
        console.log(chalk.green('  --history      Show monitoring history'));
        console.log(chalk.green('  --config       Show current configuration'));
        console.log(chalk.green('  --clear        Clear all saved data'));
    }

    static showAlerts() {
        const alerts = FileService.loadJSON(CONFIG.alertFile, []);
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
    }

    static showHistory() {
        const history = FileService.loadJSON(CONFIG.historyFile, []);
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
    }

    static showConfig() {
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
    }

    static clearData() {
        if (FileService.clearAllData()) {
            console.log(chalk.green('✅ All saved data cleared successfully!'));
        } else {
            console.log(chalk.red('❌ Error clearing data'));
        }
    }
}