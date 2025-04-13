# DevFlowCheck Task Orchestrator

## Getting Started (Running DevFlowCheck)

Follow these steps to set up and run the **DevFlowCheck** project itself:

1.  **Clone the Repository:**
    *   Open your terminal or command prompt.
    *   Navigate to the directory where you want to place the project (e.g., `cd C:/wamp64/www`).
    *   Clone the repository from GitHub:
        ```bash
        git clone https://github.com/bestyec/DevFlowCheck.git
        ```
    *   This will create a `DevFlowCheck` directory.

2.  **Install Dependencies:**
    *   Navigate into the newly created project directory:
        ```bash
        cd DevFlowCheck
        ```
    *   Run the command to install necessary libraries:
        ```bash
        npm install
        ```
        *(This installs project-specific libraries, but **not** the `task-master` CLI tool itself. The following steps use `npm run` commands which utilize the project's internal scripts.)*

3.  **Configure Environment:**
    *   Copy the example environment file:
        ```bash
        # On Windows (Command Prompt/PowerShell)
        copy .env.example .env
        # On Linux/macOS/Git Bash
        # cp .env.example .env 
        ```
    *   **Crucial:** Edit the new `.env` file with a text editor and add your actual API keys, especially `GEMINI_API_KEY`. Other API keys might be needed depending on configured features.

4.  **Define Requirements & Create PRD:**
    *   **Discuss:** Clearly define the project's goals, features, and scope that *DevFlowCheck itself* should work on. Think about the initial set of tasks.
    *   **Document:** Create a Product Requirements Document (PRD) file (e.g., `prd.txt`) detailing these requirements. Structure it clearly (e.g., using headings for features, bullet points for details) to help the parsing step.

5.  **Generate Tasks from PRD:**
    *   Use the built-in scripts (via `npm run`) to process your PRD and create the task structure:
        *   Parse the PRD to create `tasks.json`:
            ```bash
            npm run parse-prd -- --input=path/to/your/prd.txt
            ```
            *(Replace `path/to/your/prd.txt` with the actual path to your PRD file)*
        *   Generate individual task files (`tasks/*.md`) from `tasks.json`:
            ```bash
            npm run generate
            ```

6.  **Run the Orchestrator:**
    *   Once the tasks are generated, start the automated workflow:
        ```bash
        node orchestrator.js
        ```
    *   The orchestrator will now take over, processing the tasks defined in `tasks.json`.

---

## Using as a Template for a New Project

If you want to use this repository's structure and tools as a starting point for a **completely new project** (e.g., named `MyNewApp`), follow these steps *instead* of the ones above:

1.  **Clone with New Name:** Clone the repository directly into a folder with your new project's name:
    ```bash
    git clone https://github.com/bestyec/DevFlowCheck.git MyNewApp
    cd MyNewApp
    ```
2.  **Remove Original Git History:** Detach it from the `DevFlowCheck` history:
    ```bash
    # Use this command for PowerShell:
    Remove-Item -Recurse -Force .git
    # Or this for Bash/Linux/Mac:
    # rm -rf .git
    ```
3.  **Initialize New Git Repository:** Start fresh tracking for your new project:
    ```bash
    git init
    ```
4.  **Install Dependencies:**
    ```bash
    npm install
    ```
5.  **Update Project Name:** Edit the `package.json` file and change the `"name"` field from `"devflowcheck"` (or `"nestflex"`) to `"mynewapp"` (or your actual project name).
6.  **Start Your Project:** Now you can define requirements (PRD) and generate tasks specifically for `MyNewApp` using the `npm run parse-prd` and `npm run generate` commands within the `MyNewApp` folder, then run `node orchestrator.js` when ready.

---

*(Existing README content follows here)*

This project combines the `task-master` CLI tool for AI-assisted task management with a Node.js orchestrator (`orchestrator.js`) designed to automate the development workflow. The orchestrator fetches tasks, analyzes complexity, expands complex tasks, simulates AI code generation, performs quality assurance (linting, testing), attempts automated test fixing, and commits changes via Git.

## Core Components

1.  **Task Master (`task-master` CLI):**
    *   Parses Product Requirements Documents (PRDs) into structured tasks (`tasks.json`).
    *   Generates individual task files.
    *   Manages task status, dependencies, and priorities.
    *   Analyzes task complexity and recommends expansion.
    *   Provides commands for listing, showing, expanding, and updating tasks.
    *   (See original Task Master documentation below for full CLI details).
2.  **Orchestrator (`orchestrator.js`):**
    *   Runs a continuous loop to process available tasks from `task-master`.
    *   Fetches the next available task using `task-master next`.
    *   Retrieves task details using `task-master show`.
    *   **Complexity Analysis & Expansion:** Runs `task-master analyze-complexity` and automatically calls `task-master expand` for tasks exceeding a complexity threshold.
    *   **AI Prompt Generation:** Creates prompts for AI code generation based on task details (simulation currently).
    *   **Quality Assurance (QA):** Runs linters and tests (simulation/basic execution currently).
    *   **Automated Test Fixing:** If tests fail, attempts to generate a fix prompt and re-run tests (simulation currently).
    *   **Git Integration:** Stages and commits changes upon successful QA using standardized messages (simulation currently).
    *   **Task Completion:** Updates task status to 'done' using `task-master set-status`.

## Setup

### Requirements

*   Node.js (v18+ recommended for ES Modules support)
*   NPM
*   `task-master-ai` package (install globally or locally)
    ```bash
    # Install globally (recommended for CLI access)
    npm install -g task-master-ai 
    # OR install locally
    # npm install task-master-ai
    ```
*   Git (for version control)

### Configuration

1.  **Initialize Project:** If starting fresh or you don't have `tasks.json`, run `task-master init` or `task-master parse-prd <your-prd.txt>`.
2.  **Environment Variables:** Create a `.env` file in the project root for API keys and configuration (see Task Master section below for details like `GEMINI_API_KEY`).
3.  **Dependencies:** Run `npm install` if you have a `package.json` or need local dependencies. Ensure `"type": "module"` is set in your `package.json` for ES Module support.

## Usage

### Running the Orchestrator

To start the automated workflow, run the orchestrator script:

```bash
node orchestrator.js 
```

The orchestrator will:
*   Fetch the next available task.
*   Analyze its complexity and potentially expand it.
*   (If not expanded) Simulate AI prompt generation, QA, test fixing, Git commit, and status update.
*   Loop to fetch the next task.

Monitor the console output to observe the workflow.

### Using Task Master CLI

You can interact with the task list directly using the `task-master` CLI:

```bash
# List all tasks and their status
task-master list

# Show details of a specific task
task-master show <task_id> 
# Example: task-master show 9

# Show the next task recommended by the tool
task-master next

# Manually set task status
task-master set-status --id <task_id> --status <pending|done|deferred|...>
# Example: task-master set-status --id 9 --status pending

# Generate/regenerate individual task files in tasks/
task-master generate

# Analyze complexity (generates scripts/task-complexity-report.json)
task-master analyze-complexity --research

# Manually expand a task
task-master expand --id <task_id> --research 
```

---

## Original Task Master Documentation Reference

*(This section summarizes key details from the original `task-master-ai` documentation. Refer to the original source for complete information.)*

### Requirements (from original README)

- Node.js 14.0.0 or higher
- Google Generative AI API key (gemini API)
- (Optional) Perplexity API Key for research features

### Configuration (.env variables)

- `GEMINI_API_KEY`: **Required** Google Generative AI API key.
- `MODEL`: Generative model (default: `gemini-1.5-flash`).
- `MAX_TOKENS`: Max output tokens (default: `8192`).
- `TEMPERATURE`: Controls randomness (default: `0.5`).
- `PERPLEXITY_API_KEY`: Optional Perplexity API key.
- `PERPLEXITY_MODEL`: Perplexity model (default: `llama-3-sonar-large-32k-online`).
- `DEBUG`: Enable debug logging (default: `false`).
- `LOG_LEVEL`: Console log level (default: `info`).
- ... (Refer to original docs for others like `DEFAULT_PRIORITY`, `PROJECT_NAME`)

### Task Structure Fields

- `id`: Unique identifier
- `title`: Task title
- `description`: Task summary
- `status`: Current state (`pending`, `done`, etc.)
- `dependencies`: Array of prerequisite task IDs
- `priority`: Importance (`high`, `medium`, `low`)
- `details`: Implementation instructions
- `testStrategy`: Verification approach
- `subtasks`: Array of subtask objects

---

الخيارات الآن مفتوحة:
البدء في التنفيذ الحقيقي: استبدال أجزاء المحاكاة (مثل استدعاءات AI، أوامر Git، أوامر Task Master الفعلية بدلاً من runTaskMasterCommand) باستدعاءات حقيقية.
إضافة ميزات جديدة: هل هناك مهام أخرى أو وظائف تود إضافتها إلى الـ Orchestrator؟
تحسينات: تحسين بناء الـ prompts، أو معالجة الأخطاء، أو إضافة المزيد من التسجيلات، أو تحسين واجهة المستخدم إذا كان ذلك مناسبًا.
التوقف هنا: يمكن اعتبار هذا الإصدار الحالي بمثابة نموذج أولي مكتمل للمفهوم.
ما هي وجهتك التالية المفضلة؟

# NestFlex Project (Placeholder Name)

## Getting Started / كيفية البدء

This project leverages an automated workflow. Follow these steps to get started:
يستخدم هذا المشروع سير عمل مؤتمت. اتبع هذه الخطوات للبدء:

1.  **Install Dependencies / تثبيت الاعتماديات:**
    *   Navigate to the project directory (`nestflex`). / انتقل إلى مجلد المشروع (`nestflex`).
    *   Run the command: / قم بتشغيل الأمر:
        ```bash
        npm install
        ```

2.  **Define Requirements / تحديد المتطلبات:**
    *   Discuss and clearly define the project's goals, features, and scope. / ناقش وحدد بوضوح أهداف المشروع وميزاته ونطاقه.
    *   Create a Product Requirements Document (PRD) file (e.g., `prd.txt`) detailing these requirements. Structure it clearly (e.g., using headings for features). / قم بإنشاء ملف مستند متطلبات المنتج (PRD) (على سبيل المثال، `prd.txt`) يفصل هذه المتطلبات. قم بتنظيمه بوضوح (على سبيل المثال، باستخدام العناوين للميزات).

3.  **Generate Tasks / إنشاء المهام:**
    *   Use the Task Master tool (via npm scripts) to process your PRD and create the task structure: / استخدم أداة Task Master (عبر سكربتات npm) لمعالجة PRD الخاص بك وإنشاء هيكل المهام:
        *   Parse the PRD to create `tasks.json`: / قم بتحليل PRD لإنشاء `tasks.json`:
            ```bash
            npm run parse-prd -- --input=path/to/your/prd.txt
            ```
            *(Replace `path/to/your/prd.txt` with the actual path to your PRD file / استبدل `path/to/your/prd.txt` بالمسار الفعلي لملف PRD الخاص بك)*
        *   Generate individual task files (`tasks/*.md`) from `tasks.json`: / قم بإنشاء ملفات المهام الفردية (`tasks/*.md`) من `tasks.json`:
            ```bash
            npm run generate
            ```

4.  **Run the Orchestrator / تشغيل المنظم:**
    *   Once the tasks are generated, start the automated workflow: / بمجرد إنشاء المهام، ابدأ سير العمل المؤتمت:
        ```bash
        node orchestrator.js
        ```
    *   The orchestrator will now take over, processing the tasks defined in `tasks.json`. / سيتولى المنظم الآن المهمة، ويعالج المهام المحددة في `tasks.json`.

---

*(Existing README content might follow here / قد يتبع محتوى README الحالي هنا)*