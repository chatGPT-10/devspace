import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const toolResults = sqliteTable(
  "tool_results",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id"),
    workspaceRoot: text("workspace_root"),
    tool: text("tool").notNull(),
    path: text("path"),
    label: text("label"),
    createdAt: text("created_at").notNull(),
    summaryJson: text("summary_json").notNull(),
    payloadJson: text("payload_json").notNull(),
  },
  (table) => [
    index("tool_results_workspace_idx").on(table.workspaceId, table.createdAt),
    index("tool_results_root_idx").on(table.workspaceRoot, table.createdAt),
    index("tool_results_tool_idx").on(table.tool, table.createdAt),
  ],
);

export type ToolResultRow = typeof toolResults.$inferSelect;
export type NewToolResultRow = typeof toolResults.$inferInsert;
