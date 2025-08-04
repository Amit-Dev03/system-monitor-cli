import fs from "node:fs";
import { CONFIG } from "../config/config.js";
import { getCurrentTimestamp } from "../utils/formatters.js";

export class FileService {
    static loadJSON(filePath, defaultValue = []) {
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error.message);
        }
        return defaultValue;
    }

    static saveJSON(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error saving ${filePath}:`, error.message);
        }
    }

    static logToFile(message) {
        try {
            const timestamp = getCurrentTimestamp();
            const logEntry = `[${timestamp}] ${message}\n`;
            fs.appendFileSync(CONFIG.logFile, logEntry);
        } catch (error) {
            console.error('Error writing to log file:', error.message);
        }
    }

    static clearAllData() {
        try {
            if (fs.existsSync(CONFIG.logFile)) fs.unlinkSync(CONFIG.logFile);
            if (fs.existsSync(CONFIG.alertFile)) fs.unlinkSync(CONFIG.alertFile);
            if (fs.existsSync(CONFIG.historyFile)) fs.unlinkSync(CONFIG.historyFile);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error.message);
            return false;
        }
    }
}