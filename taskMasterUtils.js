// Utility functions for interacting with the Task Master CLI

import { execSync } from 'child_process';

/**
 * Runs a Task Master command using Node's child_process.
 * 
 * @param {string} command The task-master command to run (e.g., 'list', 'next').
 * @param {string[]} args Optional arguments for the command.
 * @returns {Promise<{success: boolean, output: string}>} An object indicating success and containing the raw terminal output or error message.
 */
async function runTaskMasterCommand(command, args = []) {
    // Revert to executing the local dev script which handles command parsing
    const fullCommand = `node scripts/dev.js ${command} ${args.join(' ')}`;
    console.log(`Executing: ${fullCommand}`);
    try {
        // Execute the command synchronously and capture stdout
        const outputBuffer = execSync(fullCommand, { encoding: 'utf-8', stdio: 'pipe' }); // Capture stdout, inherit stderr
        const output = outputBuffer.toString().trim();
        console.log(`Command successful. Output (first 200 chars): ${output.substring(0,200)}...`);
        return { success: true, output: output };

    } catch (error) {
        // Log the full error details, including stderr if available
        console.error(`Error executing command "${fullCommand}":`);
        console.error(`  Status Code: ${error.status}`);
        // Stderr might be null or empty, provide fallback message
        const stderrOutput = error.stderr ? error.stderr.toString().trim() : 'No stderr output.'; 
        console.error(`  Stderr: ${stderrOutput}`);
        // Stdout might also contain useful info even on error
        const stdoutOutput = error.stdout ? error.stdout.toString().trim() : 'No stdout output on error.';
        console.error(`  Stdout: ${stdoutOutput}`);
        console.error(`  Error Message: ${error.message}`);
        
        // Return a combined error message
        return { 
            success: false, 
            output: `Exit Code ${error.status}: ${stderrOutput || error.message}` 
        };
    }
}

/**
 * Parses the output of `task-master next` to find the next task ID and title.
 * @param {string} output The raw terminal output from runTaskMasterCommand.
 * @returns {{taskId: string | null, taskTitle: string | null}} The extracted task ID and title, or nulls if not found.
 */
function parseNextOutput(output) {
    const match = output.match(/Next Task: #([\d.]+) - (.*?)(?:\\n|│)/);
    if (match && match[1] && match[2]) {
        return { taskId: match[1].trim(), taskTitle: match[2].trim() };
    }
    console.error("Could not parse task ID and Title from 'next' output.");
    return { taskId: null, taskTitle: null };
}

/**
 * Parses the output of `task-master show --id=<id>` to extract details.
 * @param {string} output The raw terminal output from runTaskMasterCommand.
 * @returns {{details: string | null, testStrategy: string | null, title: string | null}} Extracted information.
 */
function parseShowOutput(output) {
    // Improved regex for title to handle surrounding characters and spacing
    const titleMatch = output.match(/Title:\s*│\s*(.*?)\s*│/);
    const detailsMatch = output.match(/Implementation Details:[\s\S]*?│\n│\s*(.*?)\s*│\n[\s│]*╰/m);
    const testStrategyMatch = output.match(/Test Strategy:[\s\S]*?│\n│\s*(.*?)\s*│\n[\s│]*╰/m);
    
    const details = detailsMatch ? detailsMatch[1].trim().replace(/\r\n/g, '\n').replace(/^│\s*/gm, '') : null;
    const testStrategy = testStrategyMatch ? testStrategyMatch[1].trim().replace(/\r\n/g, '\n').replace(/^│\s*/gm, '') : null;
    const title = titleMatch ? titleMatch[1].trim() : null;

    if (!title || !details || !testStrategy) {
         console.warn("Could not parse all fields from 'show' output.");
    }

    return { details, testStrategy, title };
}

// Use ES Module export syntax
export {
    runTaskMasterCommand,
    parseNextOutput,
    parseShowOutput,
}; 