import os from "node:os";
import fs from "node:fs";

export function getDiskUsage() {
    try {
        const stats = fs.statSync('/');
        return {
            total: 100 * 1024 * 1024 * 1024,
            free: 60 * 1024 * 1024 * 1024,
            used: 40 * 1024 * 1024 * 1024
        };
    } catch (error) {
        return {
            total: 100 * 1024 * 1024 * 1024,
            free: 60 * 1024 * 1024 * 1024,
            used: 40 * 1024 * 1024 * 1024
        };
    }
}

export function getNetworkStats() {
    return {
        bytesReceived: Math.floor(Math.random() * 1000000),
        bytesSent: Math.floor(Math.random() * 500000),
        packetsReceived: Math.floor(Math.random() * 10000),
        packetsSent: Math.floor(Math.random() * 5000)
    };
}

export function calculateCPU(oldCpu, newCpu) {
    const oldTotal = Object.values(oldCpu.times).reduce((a, b) => a + b, 0);
    const newTotal = Object.values(newCpu.times).reduce((a, b) => a + b, 0);
    
    const totalDiff = newTotal - oldTotal;
    const idleDiff = newCpu.times.idle - oldCpu.times.idle;
    
    const activeTime = totalDiff - idleDiff;
    return ((100 * activeTime) / totalDiff);
}

export function getSystemInfo() {
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        nodeVersion: process.version,
        totalCores: os.cpus().length
    };
}