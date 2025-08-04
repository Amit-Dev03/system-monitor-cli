# System Monitor Pro - CLI Edition

## 🚀 Quick Start (2 minutes)

```bash
# 1. Create project
mkdir system-monitor-cli && cd system-monitor-cli

# 2. Setup
npm init -y
npm install chalk

# 3. Create index.js file (copy the code above)

# 4. Run
node index.js
```

### Project Title:
**System Monitor Pro CLI - Advanced Node.js Monitoring Tool**

### Description:
*Professional CLI-based system monitoring application built with Node.js. Features real-time CPU/memory tracking, intelligent alerting system, data persistence, and comprehensive logging. Demonstrates advanced JavaScript concepts, file I/O operations, and system-level programming.*

### Key Features:
- 🖥️ **Real-time System Monitoring** - CPU, Memory, Disk, Network stats
- 🚨 **Smart Alert System** - Configurable thresholds with severity levels  
- 📊 **Data Persistence** - JSON-based storage for alerts and history
- 📝 **Comprehensive Logging** - Timestamped log files for audit trails
- 🎨 **Beautiful CLI Interface** - Color-coded output with chalk.js
- ⚙️ **Configuration Management** - Customizable alert thresholds
- 📈 **Historical Data** - Performance tracking over time
- 🔧 **Command Line Tools** - Multiple CLI commands for data access

## 🎯 Technical Highlights for Interviews:

### Core Technologies:
- **Node.js ES Modules** - Modern JavaScript with import/export
- **Operating System APIs** - Direct interaction with OS-level metrics
- **File System Operations** - JSON data persistence and log management
- **Process Management** - Graceful shutdown handling
- **CLI Development** - Professional command-line interface design

### Advanced Features Implemented:

1. **Real-time CPU Calculation Algorithm**
   ```javascript
   // Calculates actual CPU usage between two snapshots
   function calculateCPU(oldCpu, newCpu) {
       const oldTotal = Object.values(oldCpu.times).reduce((a, b) => a + b, 0);
       const newTotal = Object.values(newCpu.times).reduce((a, b) => a + b, 0);
       const totalDiff = newTotal - oldTotal;
       const idleDiff = newCpu.times.idle - oldCpu.times.idle;
       const activeTime = totalDiff - idleDiff;
       return ((100 * activeTime) / totalDiff);
   }
   ```

2. **Intelligent Alert System**
   - Configurable thresholds (CPU: 80%, Memory: 80%, Disk: 90%)
   - Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
   - Automatic alert deduplication
   - Persistent alert storage

3. **Data Management**
   - JSON-based data persistence
   - Automatic data rotation (keeps last 100 history records)
   - Timestamped logging system
   - Graceful error handling

4. **Professional CLI Interface**
   - Color-coded status indicators
   - Formatted tables for CPU core data
   - Progress bars and status messages
   - Multiple command options

### CLI Commands Available:
```bash
node index.js           # Start monitoring
node index.js --alerts  # View recent alerts
node index.js --history # View performance history
node index.js --config  # Show configuration
node index.js --clear   # Clear all data
node index.js --help    # Show help
```

## 📊 Project Metrics:

- **Real-time monitoring** with 2-second refresh intervals
- **Multi-core CPU tracking** with per-core usage calculation
- **Memory management** with detailed usage statistics
- **Alert system** with 4 severity levels
- **Data persistence** using JSON file storage
- **Comprehensive logging** with timestamped entries
- **CLI interface** with 6+ command options
- **Error handling** with graceful failure recovery
- **Performance optimization** with efficient data structures

## 🎯 This project includes:

• **Developed professional CLI monitoring tool** using Node.js ES modules with real-time CPU, memory, and disk usage tracking across multiple cores

• **Implemented intelligent alerting system** with configurable thresholds, severity classification, and persistent JSON-based storage for audit trails

• **Built comprehensive data management layer** with automatic rotation, timestamped logging, and graceful error handling for production reliability

• **Created advanced CPU usage calculation algorithm** using OS-level time snapshots to accurately measure system performance between intervals

• **Designed user-friendly CLI interface** with color-coded status indicators, formatted tables, and multiple command options for system administrators

• **Integrated file I/O operations** for persistent data storage, configuration management, and comprehensive system logging


## 🚀 Quick Setup Commands:

```bash
# Clone/create project
mkdir system-monitor-cli && cd system-monitor-cli

# Install dependencies
npm init -y && npm install chalk

# Create index.js (copy the code)
# Run the monitor
node index.js

# Test all features
node index.js --help
node index.js --config
node index.js --alerts
```

This project demonstrates **professional-level Node.js development** with system programming, data persistence, CLI design, and production-ready error handling. Perfect for showcasing technical skills in job applications! 🎯