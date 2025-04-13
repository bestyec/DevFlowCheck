// Main orchestrator script

// Placeholder for future logic
console.log("Orchestrator started.");

// TODO: Implement main workflow loop

import { runTaskMasterCommand, parseNextOutput, parseShowOutput } from './taskMasterUtils.js';
import fs from 'fs/promises'; // Added for reading complexity report

class Orchestrator {
    constructor() {
        this.currentTaskId = null; // Basic state management
        // Disable test failure simulation flag
        // this.simulateTestFailureForTask9 = true; 
        console.log("Orchestrator initialized.");
    }

    /**
     * Fetches the next available task from Task Master.
     * @returns {Promise<{taskId: string, taskTitle: string} | null>}
     */
    async getNextTask(silent = false) {
        if (!silent) console.log("\n--- Fetching next task ---");
        const nextTaskResult = await runTaskMasterCommand('next');
        if (!nextTaskResult.success) {
            console.error("Failed to get next task.");
            return null;
        }
        const { taskId, taskTitle } = parseNextOutput(nextTaskResult.output);
        if (!taskId && !silent) {
            console.log("No available tasks found or failed to parse.");
        }
        if (taskId && !silent) console.log(`Next task identified: ID=${taskId}, Title=${taskTitle}`);
        return { taskId, taskTitle };
    }

    /**
     * Fetches details for a specific task.
     * @param {string} taskId
     * @returns {Promise<{details: string | null, testStrategy: string | null, title: string | null}>}
     */
    async getTaskDetails(taskId) {
        console.log(`\n--- Fetching task details for ${taskId} ---`);
        const showTaskResult = await runTaskMasterCommand('show', [`--id=${taskId}`]);
        if (!showTaskResult.success) {
            console.error(`Failed to get details for task ${taskId}.`);
            return { details: null, testStrategy: null, title: null };
        }
        const parsedDetails = parseShowOutput(showTaskResult.output);
        if (!parsedDetails.details || !parsedDetails.testStrategy) {
             console.warn(`Could not parse all details or test strategy for task ${taskId}`);
        }
        return parsedDetails;
    }

    /**
     * Generates a prompt for Cursor AI.
     * @param {object} taskDetails
     * @param {string} taskId
     * @returns {string}
     */
    generateCodePrompt({ details, testStrategy, title }, taskId = 'N/A') {
        console.log("\n--- Generating AI Prompt ---");
        let testingRequirements = 'Please ensure the changes are well-tested...';
        if (testStrategy && testStrategy.trim() !== '') {
            testingRequirements = `Please adhere to the following testing strategy:\n${testStrategy}`;
        } else {
            testingRequirements = 'No specific test strategy provided...';
        }
        const prompt = `
Task ID: ${taskId}
Task Title: ${title || 'N/A'}

**Goal:**
${details || 'No specific details provided...'}

**Context:**
// TODO: Add context...

**Testing & Verification Requirements:**
${testingRequirements}

**Instructions:**
// ... (Instructions)
`;
        console.log("Generated Prompt (snippet):\n", prompt.substring(0, 250) + "...");
        return prompt;
    }

    /**
     * Runs the configured linter.
     * @returns {Promise<{success: boolean, output: string, exit_code: number | null}>}
     */
    async runLinter() {
        // Simplified linter check
        this.log("Running linter...");
        this.log("Simulating linter execution (assuming pass)..." );
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        return { success: true, output: "Simulated linter success." };
    }

    /**
     * Runs the configured tests.
     * @returns {Promise<{success: boolean, output: string, exit_code: number | null}>}
     */
    async runTests() {
        this.log("Running tests...");
        // Disable test failure simulation for Task 9
        /*
        if (this.currentTaskId === '9' && this.simulateTestFailureForTask9) {
             this.log("SIMULATING TEST FAILURE for Task 9 (first attempt)");
             this.simulateTestFailureForTask9 = false; // Reset flag so it passes next time
             return { success: false, output: "Simulated test failure output for Task 9." };
        }
        */

        // Run actual tests via task master command
        this.log("Running actual tests via Task Master...");
        const testResult = await runTaskMasterCommand('test', []);
        this.log(`Test command finished. Success: ${testResult.success}`);
        return { success: testResult.success, output: testResult.output };
    }

    /**
     * Stages and commits changes.
     * @param {string} taskId
     * @param {string} taskTitle
     * @returns {Promise<boolean>}
     */
    async commitChanges(taskId, taskTitle) {
        console.log(`\n--- Committing changes for Task ${taskId} ---`);
        const commitMessage = `feat: Complete task ${taskId} - ${taskTitle}`;
        console.log(`Commit message: "${commitMessage}"`);
        try {
            // Simulate calling the git add tool
            this.log("SIMULATING: Call mcp_git_git_add({ files: ['.'], repo_path: '.' })");
            // const addResult = await default_api.mcp_git_git_add({ files: ['.'], repo_path: '.' });
            // Assume success for simulation
            const addSuccess = true; // await this.simulateToolCall('mcp_git_git_add');
            if (!addSuccess) {
                 console.error("Git add failed (simulation).");
                 return false;
            }
            console.log("Git add successful (simulation).");

            // Simulate calling the git commit tool
            this.log(`SIMULATING: Call mcp_git_git_commit({ message: \"${commitMessage}\", repo_path: '.' })`);
            // const commitResult = await default_api.mcp_git_git_commit({ message: commitMessage, repo_path: '.' });
            // Assume success for simulation
            const commitSuccess = true; // await this.simulateToolCall('mcp_git_git_commit');
            if (!commitSuccess) {
                console.error("Git commit failed (simulation).");
                return false;
            }
            console.log("Git commit successful (simulation).");
            return true;
        } catch (error) {
            console.error("An error occurred during commitChanges simulation:", error);
            return false;
        }
    }

    /**
     * Marks a task as completed.
     * @param {string} taskId
     * @returns {Promise<boolean>}
     */
    async setTaskCompleted(taskId) {
        console.log(`\n--- Marking task ${taskId} as done ---`);
        const result = await runTaskMasterCommand('set-status', [`--id=${taskId}`, '--status=done']);
        if (!result.success) console.error(`Failed to set status for task ${taskId}.`);
        return result.success;
    }

    // Add a simple logging helper
    log(message) {
        const prefix = this.currentTaskId ? `[Task ${this.currentTaskId}]` : '[Orchestrator]';
        console.log(`${prefix} ${message}`);
    }

    /**
     * Runs the main orchestrator loop for one iteration.
     */
    async run() {
        this.log("\n--- Starting new loop iteration ---");
        // Do not reset currentTaskId here, set it after fetching
        // Do not reset simulation flag here, let runTests handle it.

        try {
            const nextTaskInfo = await this.getNextTask();
            if (!nextTaskInfo || !nextTaskInfo.taskId) { // Check taskId too
                this.log("No more tasks or failed to fetch. Stopping.");
                return false; // Signal to stop the loop
            }
            this.currentTaskId = nextTaskInfo.taskId; // Set current task ID *here*
            const { taskTitle } = nextTaskInfo;
            this.log(`Processing Task: ${taskTitle}`);

            const taskDetails = await this.getTaskDetails(this.currentTaskId);
            if (!taskDetails || !taskDetails.details) {
                 console.error(`[Task ${this.currentTaskId}] Failed to get sufficient details... Skipping.`);
                 this.currentTaskId = null; // Clear task ID on failure
                 return false; // Signal to stop the loop
            }
            const fullTaskDetails = { ...taskDetails, title: taskTitle };
            this.log(`Fetched details.`);

            // --- Task 10.1: Integrate Complexity Analysis Call ---
            this.log("Running complexity analysis...");
            const analysisResult = await runTaskMasterCommand('analyze-complexity', [`--id=${this.currentTaskId}`, '--research']); // Added --research flag as per task description
            if (!analysisResult.success) {
                // Log warning but potentially continue? Or stop? Task 10.4 might clarify.
                // For now, let's log a warning and continue, assuming analysis failure isn't critical block
                this.log(`Warning: Complexity analysis failed for task ${this.currentTaskId}. Proceeding without expansion check.`);
                // TODO: Revisit error handling in Task 10.4
            } else {
                this.log("Complexity analysis completed.");
                // Log analysis output snippet for debugging (optional)
                // this.log(`Analysis Output (snippet): ${analysisResult.output.substring(0, 200)}...`);
            }
            // --- End Task 10.1 ---

            // TODO: Implement Task 10.2: Parse Output (using analysisResult.output)
            // --- Task 10.2: Parse Complexity Analysis Output ---
            let needsExpansion = false;
            let expansionDetails = null; // To store details if needed for Task 10.3 prompt
            const COMPLEXITY_THRESHOLD = 8; // Restore original threshold

            if (analysisResult.success) {
                try {
                    // Assuming analyze-complexity writes to the default file
                    const reportPath = 'scripts/task-complexity-report.json';
                    // We need a way to read files in Node.js. Let's use the 'fs' module.
                    const reportContent = await fs.readFile(reportPath, 'utf-8');
                    const reportData = JSON.parse(reportContent);

                    if (reportData && reportData.complexityAnalysis) {
                        const taskAnalysis = reportData.complexityAnalysis.find(
                            (task) => task.taskId.toString() === this.currentTaskId.toString()
                        );

                        if (taskAnalysis) {
                             this.log(`Task ${this.currentTaskId} complexity score: ${taskAnalysis.complexityScore}`);
                             if (taskAnalysis.complexityScore >= COMPLEXITY_THRESHOLD) {
                                 needsExpansion = true;
                                 expansionDetails = taskAnalysis; // Store for potential use in expand prompt
                                 this.log(`Task ${this.currentTaskId} identified as complex (score >= ${COMPLEXITY_THRESHOLD}). Flagging for expansion.`);
                             } else {
                                 this.log(`Task ${this.currentTaskId} complexity score is below threshold. No expansion needed.`);
                             }
                        } else {
                             this.log(`Warning: Could not find complexity analysis data for task ${this.currentTaskId} in the report.`);
                        }
                    } else {
                         this.log("Warning: Complexity report format is invalid or missing 'complexityAnalysis' array.");
                    }
                } catch (error) {
                    this.log(`Error reading or parsing complexity report: ${error.message}. Proceeding without expansion.`);
                    // Consider more robust error handling in Task 10.4
                }
            } else {
                 this.log("Skipping complexity parsing due to failed analysis step.");
            }
            // --- End Task 10.2 ---

            // TODO: Implement Task 10.3: Conditional Expansion Call (using needsExpansion flag)
            // --- Task 10.3: Implement Conditional Task Expansion Call ---
            let expansionAttempted = false;
            let expansionSucceeded = false;

            if (needsExpansion) {
                this.log(`Task ${this.currentTaskId} requires expansion. Calling 'task-master expand'...`);
                expansionAttempted = true;
                // Construct arguments for expand command
                const expandArgs = [`--id=${this.currentTaskId}`];
                if (expansionDetails && expansionDetails.expansionPrompt) {
                    // Pass the recommended prompt from the complexity report
                    expandArgs.push(`--prompt="${expansionDetails.expansionPrompt}"`);
                     this.log(`Using expansion prompt from report: "${expansionDetails.expansionPrompt}"`);
                }
                 // Add --research flag consistent with analysis? Task description implies it.
                 expandArgs.push('--research'); // Let's assume we want research-backed expansion too

                const expandResult = await runTaskMasterCommand('expand', expandArgs);

                if (expandResult.success) {
                    this.log(`Task ${this.currentTaskId} expanded successfully.`);
                    expansionSucceeded = true;
                    // Task 10.4 will handle restarting the loop or fetching the next (sub)task
                } else {
                    this.log(`Error: Failed to expand task ${this.currentTaskId}. Output: ${expandResult.output}`);
                     expansionSucceeded = false;
                    // Task 10.4 will need to decide how to handle expansion failure (stop or continue with original task?)
                }
            }
            // --- End Task 10.3 ---

            // --- Task 10.4: Adjust Orchestrator Workflow and Error Handling ---
            // TODO: Implement this next based on expansionAttempted and expansionSucceeded

            if (!expansionAttempted) {
                 this.log("Proceeding with original task (no expansion attempted/needed).");
                 
                 // --- START: Original Task Processing Block ---
                 const aiPrompt = this.generateCodePrompt(fullTaskDetails, this.currentTaskId);
                 this.log(`Generated AI Prompt.`);
                 console.log("\n--- Simulating AI Code Generation ---");
                 this.log(`(Would send prompt to AI now)`);
     
                 this.log("Running Quality Assurance...");
                 const linterResult = await this.runLinter();
                 if (!linterResult.success) {
                     this.log("Linter failed. Stopping task processing.");
                     this.currentTaskId = null; // Clear task ID on failure
                     return false; // Signal to stop the loop
                 }
                 
                 const testResult = await this.runTests();
                 if (!testResult.success) {
                     // --- Task 9.1: Detect Test Failure and Gather Context ---
                     this.log("Tests failed. Attempting automated fix...");
                     const context = {
                         taskId: this.currentTaskId,
                         taskTitle: taskTitle,
                         taskDetails: fullTaskDetails,
                         failedTestOutput: testResult.output
                     };
                     this.log(`Gathered context for task ${this.currentTaskId}: ${JSON.stringify(context, null, 2)}`);
     
                     const fixPrompt = this.generateTestFixPrompt(context);
                     this.log(`Generated prompt for fix: ${fixPrompt.substring(0, 100)}...`); 
     
                     this.log("Simulating AI interaction to get test fix...");
                     const suggestedFix = "// Placeholder: AI suggested code fix based on prompt";
                     this.log(`Received suggested fix (placeholder): ${suggestedFix}`);
     
                     this.log("Simulating application of the fix...");
     
                     this.log("Re-running tests after applying simulated fix...");
                     const reRunResult = await this.runTests(); 
                     this.log(`Test re-run result: ${reRunResult.success ? 'Passed' : 'Failed'}`);
                     // --- End Task 9.3 ---
     
                     // --- Task 9.4: Handle Test Re-run Outcome ---
                     if (reRunResult.success) {
                         this.log("Automated test fix successful! Tests passed after simulated fix.");
                     } else {
                         this.log("Automated test fix failed. Tests still failing after simulated fix.");
                         this.log("Stopping task processing due to persistent test failure.");
                         this.currentTaskId = null; 
                         return false; // Signal to stop the loop
                     }
                     // --- End Task 9.4 ---
                 }
                 
                 this.log("QA Passed.");
     
                 this.log("Attempting Git Commit...");
                 const commitSuccess = await this.commitChanges(this.currentTaskId, taskTitle);
                 if (!commitSuccess) {
                     this.log("Git commit failed. Stopping task processing.");
                     this.currentTaskId = null; 
                     return false; // Signal to stop the loop
                 }
                 this.log("Git operations completed successfully.");
     
                 const statusUpdated = await this.setTaskCompleted(this.currentTaskId);
                 if (!statusUpdated) {
                     this.log(`Failed to mark task as done.`);
                 }
                 this.log("Task marked as done.");
                 // --- END: Original Task Processing Block ---

                 // Original task completed successfully without expansion
                 this.log("End of one loop iteration (original task completed).");
                 this.currentTaskId = null; // Clear after successful completion
                 return true; // Signal to continue the loop

            } else if (expansionSucceeded) {
                 this.log("Task expanded successfully. Restarting loop...");
                 // Instead of returning, we want to start the next loop iteration immediately.
                 // Clear the current ID and call run again asynchronously.
                 this.currentTaskId = null;
                 setTimeout(() => this.run(), 0); // Schedule the next run asynchronously
                 return true; // Let current loop know it should technically continue

            } else { // Expansion attempted but failed
                 this.log("Error: Task expansion failed. Stopping processing.");
                 // Keep the existing behavior: stop and clear ID.
                 this.currentTaskId = null; // Clear ID as we are stopping
                 return false; // Signal to stop the loop due to critical failure
            }
            // --- End Task 10.4 ---

            // Note: The logic for clearing currentTaskId after successful completion
            // is now handled within the specific branches above.

        } catch (error) {
            console.error(`[Task ${this.currentTaskId || 'N/A'}] An error occurred:`, error);
            this.currentTaskId = null; // Clear task ID on error
             // Consider adding restart logic here if needed
            return false; // Stop the loop on unhandled errors
        }
        // Should not be reached if logic is correct, but default to continue
        // return true; // Let's remove this as all paths should return explicitly
    }

    generateTestFixPrompt(context) {
        this.log("Generating prompt for automated test fix...");
        const { taskId, taskTitle, taskDetails, failedTestOutput } = context;

        // Restore the actual prompt generation logic
        const prompt = `
Task ID: ${taskId}
Task Title: ${taskTitle}
Task Details:
${taskDetails.details || 'No details provided.'}

Test Strategy:
${taskDetails.testStrategy || 'No test strategy provided.'}

The following tests failed:
\`\`\`
${failedTestOutput}
\`\`\`

Based on the task requirements and the failed test output, please provide the necessary code modifications to fix the tests. Focus only on the code changes required. Assume relevant files are available for editing.
`;
        this.log("Generated test fix prompt.");
        // console.log("--- Test Fix Prompt ---");
        // console.log(prompt);
        // console.log("--- End Test Fix Prompt ---");
        
        return prompt; // Ensure return statement is still present
    }
}

// Instantiate the orchestrator
const orchestrator = new Orchestrator();

// Function to run the orchestrator loop and schedule the next run
async function runLoop() {
    try {
        const shouldContinue = await orchestrator.run(); // Run one iteration and get status
        if (!shouldContinue) {
             console.log("[Main] Orchestrator run signaled stop. Exiting loop.");
             return; // Exit the loop
        }
        // If run() returned true, schedule the next iteration
        console.log("[Main] Orchestrator run completed. Scheduling next run...");
        setTimeout(runLoop, 1000); // Schedule next iteration after 1 second delay
    } catch (mainLoopError) {
        console.error("[Main] Uncaught error in orchestrator run:", mainLoopError);
        console.log("[Main] Stopping due to unhandled error.");
        // Optionally add a longer delay retry here if needed
    }
}

// Start the first iteration
runLoop();
