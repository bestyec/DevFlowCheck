#!/usr/bin/env node

import fs from 'fs-extra'; // Use fs-extra for easier file handling
import path from 'path'; // Needed for constructing paths

/**
 * dev.js
 * Task Master CLI - Rebuilding core logic
 * 
 * Implementing basic command functionality.
 */

// --- Configuration ---
const TASKS_FILE_PATH = path.join('tasks', 'tasks.json');
const TASKS_DIR = 'tasks';

// --- Helper Functions ---

async function readTasks() {
    try {
        const tasksData = await fs.readJson(TASKS_FILE_PATH);
        return tasksData.tasks || []; // Assuming tasks are under a 'tasks' key
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: Tasks file not found at ${TASKS_FILE_PATH}. Run parse-prd or create it manually.`);
        } else {
            console.error(`Error reading or parsing tasks file: ${error.message}`);
        }
        return null; // Indicate failure
    }
}

// --- Command Implementations ---

async function listTasks() {
    console.log('Listing tasks...');
    const tasks = await readTasks();
    if (tasks === null) return; // Error handled in readTasks

    if (tasks.length === 0) {
        console.log("No tasks found.");
        return;
    }

    console.log("\nID   | Status    | Title");
    console.log("-----|-----------|--------------------------------");
    tasks.forEach(task => {
        const status = task.status || 'pending';
        const title = task.title || 'Untitled Task';
        console.log(`${String(task.id).padEnd(4)} | ${status.padEnd(9)} | ${title}`);
    });
    console.log("\n");
}

// --- Main Execution Logic ---

async function main() {
    // Get command line arguments, excluding 'node' and the script path
    const args = process.argv.slice(2);
    const command = args[0]; // The main command (e.g., 'list', 'next')
    const commandArgs = args.slice(1); // Arguments for the command

    console.log(`[dev.js] Received command: ${command}`);
    console.log(`[dev.js] Arguments: ${commandArgs.join(' ')}`);

    let exitCode = 0;

    // Basic command dispatcher
    switch (command) {
        case 'list':
            await listTasks();
            break;
        case 'next':
            console.log('[dev.js] Handling "next" command...');
            // TODO: Implement actual next logic
            console.log("Next Task: #1 - Placeholder Task Title (Not Real)"); 
            break;
        case 'generate':
            console.log('[dev.js] Handling "generate" command...');
            // TODO: Implement actual generate logic
            break;
        case 'parse-prd':
            console.log('[dev.js] Handling "parse-prd" command...');
            // TODO: Implement actual parse-prd logic
            break;
        case 'show':
            console.log('[dev.js] Handling "show" command...');
            // TODO: Implement actual show logic
            const taskIdShow = commandArgs.find(arg => arg.startsWith('--id='))?.split('=')[1] || 'unknown';
            console.log(`Title:        │ Placeholder Title for ${taskIdShow} │`); 
            console.log(`\n╭─────────────────────────────────────────────────────────────────────────────────────────────────────╮`);
            console.log(`│ Implementation Details:                                                                             │`);
            console.log(`│                                                                                                     │`);
            console.log(`│ Placeholder details for task ${taskIdShow}.                                                         │`);
            console.log(`╰─────────────────────────────────────────────────────────────────────────────────────────────────────╯`);
            console.log(`\n╭─────────────────────────────────────────────────────────────────────────────────────────────────────╮`);
            console.log(`│ Test Strategy:                                                                                      │`);
            console.log(`│                                                                                                     │`);
            console.log(`│ Placeholder test strategy for task ${taskIdShow}.                                                     │`);
            console.log(`╰─────────────────────────────────────────────────────────────────────────────────────────────────────╯`);
            break;
        case 'analyze-complexity':
            console.log('[dev.js] Handling "analyze-complexity" command...');
            // TODO: Implement actual analyze-complexity logic
            console.log("Simulating complexity analysis completion (no report file written).");
            break;
        case 'expand':
            console.log('[dev.js] Handling "expand" command...');
            // TODO: Implement actual expand logic
            break;
        case 'set-status':
            console.log('[dev.js] Handling "set-status" command...');
            // TODO: Implement actual set-status logic
            break;
        case 'test':
            console.log('[dev.js] Handling "test" command... (Orchestrator usually uses npm run test)');
            break;
        default:
            console.log(`[dev.js] Unknown command: ${command}`);
            // TODO: Add help message or usage instructions
            exitCode = 1; // Exit with error for unknown commands
    }
    
    process.exit(exitCode);
}

main().catch(error => {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
}); 