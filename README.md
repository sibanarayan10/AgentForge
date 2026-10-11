# AgentForge (claude-cli)

An autonomous, agentic command-line interface (CLI) built with **TypeScript** that automates software development workflows. The system features a resilient, iterative agent loop capable of interpreting natural-language instructions, executing local system tools, and recovering from runtime errors autonomously.

---

## 🏗️ Core Architecture & System Flow

AgentForge utilizes a decoupled, event-driven architecture designed to orchestrate state between Large Language Model (LLM) providers and the host operating system environment. 

### Under-the-Hood Execution Cycle

```
[ User Input / Natural Language Prompt ]
                   │
                   ▼
       ┌───────────────────────┐
  ────►│  Agent Execution Loop │◄──────────────────────┐
 │     └───────────────────────┘                       │
 │                 │                                   │
 │                 ▼                                   │
 │     ┌───────────────────────┐                       │
 │     │ LLM Orchestrator Layer│                       │
 │     │  (Anthropic / OpenAI) │                       │
 │     └───────────────────────┘                       │
 │                 │                                   │
 │                 ▼ (Determines Next Action)          │
 │     ┌───────────────────────┐                       │
 │     │  Tool Invocation Link │                       │
 │     │ (Bash / Read / Write) │                       │
 │     └───────────────────────┘                       │
 │                 │                                   │
 │                 ▼                                   │
 │     ┌───────────────────────┐                       │
 │     │   System Execution    │                       │
 │     │  (Local Filesystem)   │                       │
 │     └───────────────────────┘                       │
 │                 │                                   │
 └─────────────────┴─────────── [ Returns Log/Result ]─┘
                   │
                   ▼ (Turn Limit Exceeded OR Goal Achieved)
         [ Final Terminal Output ]
```

1. **Instruction Ingestion:** The CLI accepts structural and functional development prompts directly from the user.
2. **Contextual Evaluation & Reasoning:** The abstraction engine packages the command history alongside directory context and sends it to the configured LLM provider.
3. **Turn-Based Decision Matrix:** The model decides whether to finalize the response or execute a platform tool (e.g., executing a command or reading a file) to gather data or mutate project state.
4. **Fault-Tolerant Execution:** The agent loop runs the requested tool locally, catches runtime exceptions safely, constructs an execution trace payload, and injects it straight back into the conversation context window.
5. **Circuit Breaking:** To prevent runaway computations and token-burn loops, the engine enforces strict turn limits, breaking out of the loop safely if a goal isn't met within a predefined ceiling.

---

## 🚀 Key Features

* **Provider Agnosticism:** Completely decoupled integration layer leveraging both the **Anthropic SDK** and **OpenAI SDK** compatibility frameworks. Allows dynamic runtime model swaps while keeping the conversation context active.
* **Autonomous Filesystem Operations:** Natively automates system shell processes, package provisioning, compilation sequences, and codebase edits via a secure `bash` tool interface.
* **Adaptive Code Analysis:** Scans codebases using integrated reading utilities to evaluate dependencies, isolate performance bugs, and refactor architecture automatically.

---

## 💻 Getting Started

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/claude-cli.git
   cd claude-cli
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure your environment variables:**
   Create a `.env` file in the root workspace directory:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Compile TypeScript into production JS binaries:**
   ```bash
   npm run build
   ```

---

## 🛠️ Usage

### Prompt Examples

Once inside the interactive runtime loop, you can prompt the agent to perform compound, multi-step engineering tasks:

* **Filesystem Automation:**
  ```text
  npm run execute "Create a new Express.js server inside a directory named 'server', configure CORS, and write a basic health check endpoint."
  ```
* **Automated Codebase Refactoring:**
  ```text
  npm run execute "Inspect src/main.ts, analyze its error boundaries, and refactor any uncaught exceptions to use our custom logger."
  ```

---

## 📁 Repository Blueprint

```text
claude-cli-main/
├── bin/
│   └── index.js          # Main CLI entry point binary
├── src/
│   ├── agent/
│   │   └── loop.ts       # Core iterative agent-loop execution framework
│   ├── provider/
│   │   ├── anthropic.ts  # Anthropic SDK native integration
│   │   ├── index.ts      # Core model provider factory abstraction
│   │   └── openAiCompact.ts # OpenAI API compatibility layer mapping
│   ├── tools/
│   │   ├── bash.ts       # Shell execution tool & subprocess automation
│   │   ├── index.ts      # Tool registry and signature schemas
│   │   └── read.ts       # Filesystem read and evaluation engine
│   ├── main.ts           # System initialization bootstrapping
│   └── type.ts           # Universal TypeScript interface definitions
├── tsconfig.json         # TypeScript compiler configurations
└── package.json          # Node project dependencies, scripts, and package metadata
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
