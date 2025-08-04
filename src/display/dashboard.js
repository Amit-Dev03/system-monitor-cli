import chalk from "chalk";
import { CONFIG } from "../config/config.js";
import { formatBytes, formatUptime } from "../../src/utils/formatters.js"; // Corrected path from previous conversations

const SEVERITY_COLORS = {
  CRITICAL: chalk.magenta,
  HIGH: chalk.red,
  MEDIUM: chalk.yellow,
  INFO: chalk.blue,
};

export class Dashboard {
  // Main display function remains the same, acting as a director
  static display(systemData, monitorService) {
    process.stdout.write("\x1bc"); // More effective clear screen

    const width = process.stdout.columns || 80;

    console.log(
      chalk.bgMagenta.bold(
        " 🖥️  SYSTEM MONITOR PRO - CLI VERSION "
          .padStart((width + 35) / 2, " ")
          .padEnd(width, " ")
      )
    );
    console.log(chalk.gray("═".repeat(width)));

    this.displaySystemInfo(systemData, monitorService);
    this.displayCPUUsage(systemData);

    // Use the new reusable metric display function
    this._displayMetric(
      "🧠 MEMORY USAGE",
      systemData.memoryUsage,
      CONFIG.alertThresholds.memory
    );
    this._displayMetric(
      "💾 DISK USAGE",
      systemData.diskUsage,
      CONFIG.alertThresholds.disk
    );

    this.displaySystemLoad(systemData);
    this.displayNetworkStats(systemData);
    this.displayAlerts(monitorService.getAlerts());
    this.displayStatistics(monitorService);
    this.displayFooter(systemData, width);
  }

  // --- Private Helper Methods ---

  /**
   * Returns a chalk color based on a value and thresholds.
   * @private
   */
  static _getUsageColor(percentage, highThreshold) {
    if (percentage > highThreshold) return chalk.redBright;
    if (percentage > 60) return chalk.yellow;
    return chalk.green;
  }

  /**
   * A generic function to display a usage statistic (like Memory or Disk).
   * @private
   */
  static _displayMetric(title, data, threshold) {
    console.log(chalk.cyan.bold(`\n${title}`));
    const color = this._getUsageColor(data.percentage, threshold);
    const stats = `${formatBytes(data.used)} / ${formatBytes(
      data.total
    )} (${data.percentage.toFixed(1)}%)`;
    console.log(chalk.bold(`Used: ${color(stats)}`));
    if (data.free) {
      console.log(chalk.gray(`Free: ${formatBytes(data.free)}`));
    }
  }

  // --- Original Display Methods (Now Simplified) ---

  static displaySystemInfo(data, monitorService) {
    console.log(chalk.cyan.bold("\n📊 SYSTEM INFORMATION"));
    console.log(`Hostname: ${chalk.yellow(data.systemInfo.hostname)}`);
    console.log(
      `Platform: ${chalk.yellow(
        `${data.systemInfo.platform} (${data.systemInfo.arch})`
      )}`
    );
    console.log(
      `Uptime: ${chalk.yellow(formatUptime(data.systemInfo.uptime))}`
    );
    console.log(`Node.js: ${chalk.yellow(data.systemInfo.nodeVersion)}`);
    console.log(
      `Monitor Runtime: ${chalk.yellow(
        formatUptime((Date.now() - monitorService.getStartTime()) / 1000)
      )}`
    );
  }

  static displayCPUUsage(data) {
    console.log(chalk.cyan.bold("\n💻 CPU USAGE BY CORE"));
    const cpuTableData = data.cpuUsage.map((cpu) => ({
      Core: cpu.core,
      Usage: this._getUsageColor(
        cpu.usage,
        CONFIG.alertThresholds.cpu
      )(cpu.usage.toFixed(1) + "%"),
      Speed: cpu.speed + " MHz",
    }));
    console.table(cpuTableData);

    const avgCpu =
      data.cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) /
      data.cpuUsage.length;
    const color = this._getUsageColor(avgCpu, CONFIG.alertThresholds.cpu);
    console.log(
      chalk.bold(`Average CPU Usage: ${color(avgCpu.toFixed(1) + "%")}`)
    );
  }

  // Memory and Disk display methods are now handled by _displayMetric
  // static displayMemoryUsage(data) { ... } // REMOVED
  // static displayDiskUsage(data) { ... } // REMOVED

  static displaySystemLoad(data) {
    console.log(chalk.cyan.bold("\n⚡ SYSTEM LOAD"));
    console.log(`1 min: ${chalk.yellow(data.loadAvg[0].toFixed(2))}`);
    console.log(`5 min: ${chalk.yellow(data.loadAvg[1].toFixed(2))}`);
    console.log(`15 min: ${chalk.yellow(data.loadAvg[2].toFixed(2))}`);
  }

  static displayNetworkStats(data) {
    console.log(chalk.cyan.bold("\n🌐 NETWORK STATS (Simulated)"));
    console.log(
      `Bytes Received: ${chalk.yellow(
        formatBytes(data.networkStats.bytesReceived)
      )}`
    );
    console.log(
      `Bytes Sent: ${chalk.yellow(formatBytes(data.networkStats.bytesSent))}`
    );
  }

  static displayAlerts(alerts) {
    if (alerts.length > 0) {
      console.log(chalk.red.bold("\n🚨 RECENT ALERTS"));
      alerts.slice(0, 3).forEach((alert) => {
        const timeAgo = Math.floor((Date.now() - alert.id) / 1000);
        const severityColor = SEVERITY_COLORS[alert.severity] || chalk.gray;
        console.log(
          severityColor(
            `[${alert.severity}] ${alert.message} (${timeAgo}s ago)`
          )
        );
      });
      if (alerts.length > 3) {
        console.log(chalk.gray(`... and ${alerts.length - 3} more alerts`));
      }
    }
  }

  static displayStatistics(monitorService) {
    console.log(chalk.cyan.bold("\n📈 SESSION STATISTICS"));
    console.log(
      `Total Alerts Generated: ${chalk.yellow(monitorService.getTotalAlerts())}`
    );
    console.log(
      `Active Alerts: ${chalk.yellow(monitorService.getAlerts().length)}`
    );
    console.log(
      `History Records: ${chalk.yellow(monitorService.getHistory().length)}`
    );
  }

  static displayFooter(data, width) {
    console.log(chalk.gray("\n" + "═".repeat(width)));
    console.log(chalk.gray(`Last Updated: ${data.timestamp}`));
    console.log(chalk.gray("Press Ctrl+C to stop monitoring"));
  }
}
