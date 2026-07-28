/**
 * Claude Code Statusline JSON Input Types
 *
 * Type definitions for the JSON data passed via stdin to statusline commands.
 *
 * Sources:
 * - https://code.claude.com/docs/en/statusline (official docs, confirmed 2026-07)
 * - https://github.com/Piebald-AI/claude-code-system-prompts (system prompt, ccVersion 2.1.47)
 * - https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
 *
 * Note: No official JSON Schema is published by Anthropic.
 * These types are derived from documentation and internal system prompts.
 * Fields may be added or changed across Claude Code versions.
 */
export interface StatusLineInput {
  /** Hook event identifier. Always "Status" for statusline. */
  hook_event_name: "Status";

  /** Unique session ID. */
  session_id: string;

  /**
   * UUID of the user prompt currently being processed. Present from after
   * the first input onward. Available since Claude Code v2.1.196.
   */
  prompt_id?: string;

  /**
   * Human-readable session name. Set via the --name flag or /rename;
   * otherwise may be an AI-generated title.
   */
  session_name?: string;

  /** Path to the conversation transcript file. */
  transcript_path: string;

  /** Current working directory. */
  cwd: string;

  /** Information about the active Claude model. */
  model: StatusLineModel;

  /** Effort level. Only present when the model supports the effort parameter. */
  effort?: StatusLineEffort;

  /** Extended thinking state. */
  thinking: StatusLineThinking;

  /** Whether fast mode is enabled. */
  fast_mode: boolean;

  /** Workspace directory information. */
  workspace: StatusLineWorkspace;

  /** Claude Code application version (e.g. "1.0.85"). */
  version: string;

  /** Output style configuration. */
  output_style: StatusLineOutputStyle;

  /** Context window usage statistics. */
  context_window: StatusLineContextWindow;

  /**
   * Whether the token count from the most recent API response exceeds 200k.
   * Fixed threshold regardless of the actual context window size.
   */
  exceeds_200k_tokens: boolean;

  /** Session cost and performance metrics. */
  cost: StatusLineCost;

  /**
   * Rate limit usage. Only present for Claude.ai subscribers (Pro/Max)
   * after the first API response in the session.
   */
  rate_limits?: StatusLineRateLimits;

  /** Vim mode state. Only present when vim mode is enabled. */
  vim?: StatusLineVim;

  /** Agent metadata. Only present when started with --agent flag. */
  agent?: StatusLineAgent;

  /** Open pull request info. Only present when an open PR is detected. */
  pr?: StatusLinePr;

  /** Git worktree info. Only present for --worktree sessions. */
  worktree?: StatusLineWorktree;
}

export interface StatusLineModel {
  /** Model identifier (e.g. "claude-opus-4-1", "claude-sonnet-4-5-20250929"). */
  id: string;

  /** Human-readable model name (e.g. "Opus", "Sonnet"). */
  display_name: string;
}

export interface StatusLineWorkspace {
  /** Current working directory path. */
  current_dir: string;

  /** Project root directory path. */
  project_dir: string;

  /** Directories added via /add-dir. Always present; empty array if none. */
  added_dirs: string[];

  /**
   * Git worktree name (e.g. "feature-xyz"). Only present inside a linked
   * `git worktree add` checkout; absent in the main working tree.
   */
  git_worktree?: string;

  /** Git repository info. Only present in a git repo with an origin remote. */
  repo?: StatusLineRepo;
}

export interface StatusLineRepo {
  /** Repository host (e.g. "github.com"). */
  host: string;

  /** Repository owner/organization name. */
  owner: string;

  /** Repository name. */
  name: string;
}

export interface StatusLineOutputStyle {
  /** Output style name (e.g. "default", "Explanatory", "Learning"). */
  name: string;
}

export interface StatusLineContextWindow {
  /**
   * Input tokens in the current context window. Prior to Claude Code
   * v2.1.132 this was cumulative across the session; since v2.1.132 it
   * reflects only the current context window.
   */
  total_input_tokens: number;

  /**
   * Output tokens from the most recent API response. Prior to Claude Code
   * v2.1.132 this was cumulative across the session; since v2.1.132 it
   * reflects only the latest response.
   */
  total_output_tokens: number;

  /** Context window size for current model (e.g. 200000). */
  context_window_size: number;

  /** Token usage from last API call. null if no messages have been sent yet. */
  current_usage: StatusLineTokenUsage | null;

  /** Pre-calculated percentage of context used (0-100). null if no messages yet. */
  used_percentage: number | null;

  /** Pre-calculated percentage of context remaining (0-100). null if no messages yet. */
  remaining_percentage: number | null;
}

export interface StatusLineTokenUsage {
  /** Input tokens for current context. */
  input_tokens: number;

  /** Output tokens generated. */
  output_tokens: number;

  /** Tokens written to prompt cache. */
  cache_creation_input_tokens: number;

  /** Tokens read from prompt cache. */
  cache_read_input_tokens: number;
}

export interface StatusLineCost {
  /**
   * Total session cost in USD. Reset by `/clear` since Claude Code
   * v2.1.211.
   */
  total_cost_usd: number;

  /** Total session duration in milliseconds. */
  total_duration_ms: number;

  /** Total API call duration in milliseconds. */
  total_api_duration_ms: number;

  /** Total lines of code added in session. */
  total_lines_added: number;

  /** Total lines of code removed in session. */
  total_lines_removed: number;
}

export interface StatusLineRateLimits {
  /** 5-hour rate limit window. May be independently absent. */
  five_hour?: StatusLineRateLimitWindow;

  /** 7-day rate limit window. May be independently absent. */
  seven_day?: StatusLineRateLimitWindow;
}

export interface StatusLineRateLimitWindow {
  /** Percentage of the rate limit consumed (0-100). */
  used_percentage: number;

  /** Unix epoch seconds when the rate limit window resets. */
  resets_at: number;
}

export interface StatusLineVim {
  /** Current vim editor mode. */
  mode: "NORMAL" | "INSERT" | "VISUAL" | "VISUAL LINE";
}

export interface StatusLineAgent {
  /** Agent name (e.g. "code-architect", "test-runner"). */
  name: string;

  /** Agent type identifier. */
  type?: string;
}

export interface StatusLineEffort {
  /** Effort level. */
  level: "low" | "medium" | "high" | "xhigh" | "max";
}

export interface StatusLineThinking {
  /** Whether extended thinking is enabled. */
  enabled: boolean;
}

export interface StatusLinePr {
  /** Pull request number. */
  number: number;

  /** Pull request URL. */
  url: string;

  /** Pull request review state. */
  review_state?: "approved" | "pending" | "changes_requested" | "draft";
}

export interface StatusLineWorktree {
  /** Worktree name. */
  name: string;

  /** Absolute path to the worktree directory. */
  path: string;

  /** Worktree branch name. Absent for hook-based worktrees. */
  branch?: string;

  /** Original working directory before entering the worktree. */
  original_cwd: string;

  /** Original branch before entering the worktree. Absent for hook-based worktrees. */
  original_branch?: string;
}

/**
 * Settings configuration for statusline in .claude/settings.json.
 */
export interface StatusLineSettings {
  type: "command";

  /** Shell command or script path to execute. */
  command: string;

  /** Horizontal padding. Set to 0 to let status line go to edge. */
  padding?: number;
}

/**
 * Claude Code Subagent Statusline JSON Input Types
 *
 * Type definitions for the JSON data passed via stdin to subagentStatusLine
 * commands. The command is invoked on every refresh tick while the agent
 * panel (subagent list below the prompt) is visible, once per task row.
 *
 * Sources:
 * - https://code.claude.com/docs/en/statusline.md (Subagent status lines section)
 *
 * Note: No official JSON Schema is published by Anthropic.
 * These types are derived from documentation only.
 * Fields may be added or changed across Claude Code versions.
 */
export interface SubagentStatusLineInput {
  /** Hook event identifier. */
  hook_event_name: string;

  /** Unique session ID. */
  session_id: string;

  /** Path to the conversation transcript file. */
  transcript_path: string;

  /** Current working directory. */
  cwd: string;

  /** Available horizontal width, in columns, for each rendered row. */
  columns: number;

  /** Currently running/visible subagent tasks. */
  tasks: SubagentTask[];
}

export interface SubagentTask {
  /** Unique task identifier. Used to key stdout override lines. */
  id: string;

  /** Subagent name. */
  name: string;

  /** Subagent type identifier. */
  type: string;

  /** Task status (e.g. "running"). */
  status: string;

  /** Task description as given at invocation. */
  description: string;

  /** Optional short label. */
  label?: string;

  /**
   * Task start time. Documentation does not specify the concrete
   * representation (epoch ms vs ISO string), so this is kept loose.
   */
  startTime?: number | string;

  /**
   * Resolved model ID (e.g. "claude-sonnet-5"). Omitted when the model
   * has not been resolved yet. Available since Claude Code v2.1.205.
   */
  model?: string;

  /**
   * Effort level: "low" | "medium" | "high" | "xhigh" | "max", or a
   * numeric token budget. Omitted when the task inherits the session's
   * effort value. Available since Claude Code v2.1.214.
   */
  effort?: string | number;

  /**
   * Context window size for the resolved model. Omitted under the same
   * conditions as `model`. Available since Claude Code v2.1.205.
   */
  contextWindowSize?: number;

  /** Cumulative token count consumed by the task. */
  tokenCount?: number;

  /**
   * Token usage samples over time. Documentation does not specify the
   * shape, so this is kept as unknown.
   */
  tokenSamples?: unknown;

  /** Task's working directory. */
  cwd?: string;
}

/**
 * Settings configuration for subagentStatusLine in .claude/settings.json.
 */
export interface SubagentStatusLineSettings {
  type: "command";

  /** Shell command or script path to execute. */
  command: string;
}
