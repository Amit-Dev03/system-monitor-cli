# System Monitor Pro - CLI Edition

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)

> A professional, modular command-line tool for real-time system monitoring, built with Node.js.

![System Monitor Pro Demo](https://github.com/user-attachments/assets/46be0c4d-8c07-4e8a-a884-0b3caff2611b)

---

## 🚀 Key Features

* 🖥️ **Real-time Monitoring:** Tracks live CPU (overall and per-core), memory, and disk usage statistics.
* 🚨 **Intelligent Alerting:** Triggers alerts based on configurable CPU, memory, and disk thresholds with severity levels.
* 📊 **Data Persistence:** Saves alert and performance history to JSON files for auditing and tracking.
* 📝 **Comprehensive Logging:** Maintains a timestamped `system-monitor.log` file for all major events and errors.
* ⚙️ **Modular Architecture:** Designed with a clean separation of concerns for services, display, and utilities.
* 🎨 **User-Friendly CLI:** Features a color-coded interface and multiple commands for easy interaction.

---

## 🏗️ Project Structure

The project uses a modular architecture to ensure code is scalable and easy to maintain.

* `src/cli`: Handles command-line argument parsing and command execution.
* `src/config`: Manages application configuration, including alert thresholds.
* `src/display`: Responsible for rendering all CLI output, including the main dashboard.
* `src/services`: Contains the core business logic for monitoring, alerting, and file I/O.
* `src/utils`: Provides helper functions for formatting data and system interactions.
* `index.js`: The main entry point for the application.

---

## 🛠️ Tech Stack

* **Core:** Node.js (ES Modules)
* **CLI UI:** `chalk` for color-coded output.
* **APIs:** Node.js `os` and `fs` modules for system interaction and file I/O.

---

## ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/[YOUR_REPOSITORY].git
    cd [YOUR_REPOSITORY]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

---

## ▶️ Usage

You can run the monitor and access different features using the following commands.

* **Start real-time monitoring:**
    ```bash
    node index.js
    ```

* **View other options:**
    ```bash
    # Show all available commands
    node index.js --help

    # View recent system alerts
    node index.js --alerts

    # View historical performance data
    node index.js --history

    # Display current configuration
    node index.js --config

    # Clear all logged alerts and history
    node index.js --clear
    ```

---

## 💡 Advanced Highlight: CPU Calculation

To ensure accuracy, CPU usage is not just read instantaneously. It's calculated by comparing system tick snapshots over an interval, providing a true measure of usage during that time.

<details>
<summary>Click to see the CPU calculation logic</summary>

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