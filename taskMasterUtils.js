// Utility functions for interacting with the Task Master CLI

// Reset counter for the new test run
let nextCommandCallCount = 0;

/**
 * Runs a Task Master command using Cursor's run_terminal_cmd.
 * 
 * @param {string} command The task-master command to run (e.g., 'list', 'next').
 * @param {string[]} args Optional arguments for the command.
 * @returns {Promise<{success: boolean, output: string}>} An object indicating success and containing the raw terminal output or error message.
 */
async function runTaskMasterCommand(command, args = []) {
    const fullCommand = `task-master ${command} ${args.join(' ')}`;
    console.log(`Executing: ${fullCommand}`);
    try {
        // NOTE: This assumes run_terminal_cmd is available in the execution context.
        // The actual API call might differ based on the orchestrator's environment.
        // We are *simulating* the expected structure of the interaction here.
        // In a real implementation, the orchestrator would call the tool.
        // For now, we will represent the *intent* to call the tool.

        // Placeholder for the actual API call simulation
        // const result = await default_api.run_terminal_cmd({ command: fullCommand, is_background: false }); 
        
        // Simulating a successful run for now - replace with actual call logic
        // In a real test, we'd inject varying outputs here.
        let simulatedOutput = `Simulated successful output for: ${fullCommand}`;

        // --- UPDATED SIMULATION ---        
        if (command === 'next') {
            nextCommandCallCount++;
            let nextTaskId = '7'; // Default to Task 7 first
            let nextTaskTitle = 'Implement Task Completion Status Update';

            if (nextCommandCallCount === 2) { // Second call should give Task 9
                nextTaskId = '9';
                nextTaskTitle = 'Implement Automated Test Fixing Logic';
            } else if (nextCommandCallCount === 3) { // Third call should give Task 10
                nextTaskId = '10';
                nextTaskTitle = 'Implement Complexity Analysis and Automated Expansion';
            } else if (nextCommandCallCount > 3) { // After Task 10, simulate no more tasks
                 simulatedOutput = `No tasks available.`; 
                 // Early return to avoid formatting the 'Next Task' box for no task
                 console.log("Simulation: Command successful (No tasks left).");
                 return { success: true, output: simulatedOutput }; 
            }

            // Format the output correctly only if a task is found
            simulatedOutput = `
PS C:\wamp64\www\DevFlowCheck> task-master next
...
╭──────────────────────────────────────────────────────────────────────────╮
│ Next Task: #${nextTaskId} - ${nextTaskTitle}                    │
╰──────────────────────────────────────────────────────────────────────────╯
...
            `;
        } else if (command === 'show') {
             const taskIdArg = args.find(arg => arg.startsWith('--id='));
             const requestedTaskId = taskIdArg ? taskIdArg.split('=')[1] : 'unknown';
             // Reconstruct a structure similar to the actual output that parseShowOutput expects
             simulatedOutput = `
╭─────────────────────────────────────────────────────╮
│ Subtask: #${requestedTaskId} - Simulated Title for ${requestedTaskId} │ 
╰─────────────────────────────────────────────────────╯
┌───────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ID:           │ ${requestedTaskId}                                                                        │
│ Title:        │ Simulated Title for ${requestedTaskId}                                     │ 
└───────────────┴───────────────────────────────────────────────────────────────────────────┘

╭─────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Implementation Details:                                                                             │
│                                                                                                     │
│ Simulated details for task ${requestedTaskId}. Ensure this is parsed correctly.                     │
│                                                                                                     │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Test Strategy:                                                                                      │
│                                                                                                     │
│ Simulated test strategy for task ${requestedTaskId}. Check for correct parsing.                     │
│                                                                                                     │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────╯
            `;
        } else if (command === 'analyze-complexity') {
             // analyze-complexity writes to a file, the command output isn't directly parsed by orchestrator.
             // Just simulate command success.
             simulatedOutput = `Simulated success for analyze-complexity. Report file should be updated (not simulated here).`;
             // We should probably *actually write* a simulated report file here for Task 10.2 to read.
             // TODO: Enhance simulation to write a dummy report file.
             
        } else if (command === 'expand') {
             simulatedOutput = `Simulated successful expansion for args: ${args.join(' ')}`;
             // TODO: Enhance simulation to actually add subtasks to tasks.json?
        } else if (command === 'set-status') {
             simulatedOutput = `Simulated successful status update for args: ${args.join(' ')}`;
             // TODO: Enhance simulation to actually update tasks.json?
        } else if (command === 'test') {
            // Let runTests in orchestrator handle specific simulation for Task 9
            // Default simulation here assumes pass
            simulatedOutput = `Simulated test command success.`; 
        }
        // --- END OF UPDATED SIMULATION ---

        const simulatedResult = { 
            exit_code: 0, 
            output: simulatedOutput 
        }; 
        console.log("Simulation: Command finished.");


        if (simulatedResult.exit_code !== 0) {
            console.error(`Command failed with exit code ${simulatedResult.exit_code}: ${fullCommand}`);
            console.error(simulatedResult.output);
            return { success: false, output: `Exit Code ${simulatedResult.exit_code}: ${simulatedResult.output}` };
        }
        
        console.log("Simulation: Command successful.");
        return { success: true, output: simulatedResult.output };

    } catch (error) {
        console.error(`Error executing command "${fullCommand}":`, error);
        return { success: false, output: error.message || 'Unknown error during command execution.' };
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