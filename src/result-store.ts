import { randomUUID } from "node:crypto";

export interface DiffStats {
  additions: number;
  removals: number;
}

export type StoredToolName =
  | "open_workspace"
  | "read_file"
  | "write_file"
  | "edit_file"
  | "grep_files"
  | "find_files"
  | "list_directory"
  | "run_shell";

type StoredContent =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

export interface StoredToolResult {
  id: string;
  workspaceId?: string;
  tool: StoredToolName;
  path?: string;
  label?: string;
  createdAt: string;
  summary: Record<string, unknown>;
  payload: {
    content?: StoredContent[];
    diff?: string;
    patch?: string;
  };
}

export class ResultStore {
  private readonly results = new Map<string, StoredToolResult>();

  constructor(private readonly ttlMs = 30 * 60 * 1000) {}

  put(input: Omit<StoredToolResult, "id" | "createdAt">): StoredToolResult {
    this.prune();

    const result: StoredToolResult = {
      ...input,
      id: `res_${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };

    this.results.set(result.id, result);
    return result;
  }

  get(resultId: string, workspaceId?: string): StoredToolResult {
    this.prune();

    const result = this.results.get(resultId);
    if (!result || (workspaceId && result.workspaceId !== workspaceId)) {
      throw new Error(`Unknown tool result: ${resultId}`);
    }

    return result;
  }

  private prune(): void {
    const expiresBefore = Date.now() - this.ttlMs;
    for (const [id, result] of this.results) {
      if (Date.parse(result.createdAt) < expiresBefore) {
        this.results.delete(id);
      }
    }
  }
}

export function countDiffStats(diff: string | undefined): DiffStats {
  if (!diff) return { additions: 0, removals: 0 };

  let additions = 0;
  let removals = 0;

  for (const line of diff.split("\n")) {
    if (line.startsWith("+") && !line.startsWith("+++")) additions++;
    if (line.startsWith("-") && !line.startsWith("---")) removals++;
  }

  return { additions, removals };
}
