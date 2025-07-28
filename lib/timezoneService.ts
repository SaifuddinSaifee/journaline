import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config', 'timezone-preference.json');

// Ensure config directory exists
if (!fs.existsSync(path.dirname(CONFIG_FILE))) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
}

// Initialize with default config if it doesn't exist
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ timezone: 'UTC' }, null, 2));
}

export interface TimezoneConfig {
  timezone: string;
}

export async function getTimezonePreference(): Promise<string> {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as TimezoneConfig;
    return config.timezone;
  } catch (error) {
    console.error('Error reading timezone preference:', error);
    return 'UTC';
  }
}

export async function saveTimezonePreference(timezone: string): Promise<void> {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ timezone }, null, 2));
  } catch (error) {
    console.error('Error saving timezone preference:', error);
    throw new Error('Failed to save timezone preference');
  }
} 