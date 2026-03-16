# @alexma03/utcp-code-mode-mcp

MCP server for UTCP Code Mode. It exposes MCP tools that let an MCP client discover UTCP tools, inspect their TypeScript interfaces, register manuals dynamically, and execute TypeScript code with direct tool access.

This project is a fork of `universal-tool-calling-protocol`:
https://github.com/universal-tool-calling-protocol

## Installation

You can run it directly with `npx`:

```bash
npx -y @alexma03/utcp-code-mode-mcp
```

You can also install it locally:

```bash
npm install @alexma03/utcp-code-mode-mcp
```

## MCP Client Configuration

If you want to use the published package from an MCP client such as Windsurf, configure it like this:

```json
{
  "alexma03-utcp-code-mode": {
    "command": "npx",
    "args": [
      "-y",
      "@alexma03/utcp-code-mode-mcp"
    ],
    "env": {
      "UTCP_CONFIG_FILE": "/Users/alex03/.utcp_config.json"
    }
  }
}
```

The `UTCP_CONFIG_FILE` environment variable should point to the UTCP configuration file that defines manuals, loaders, repositories, and search strategy.

## Runtime Requirements

- Node `>=24.14.0 <25`
- On macOS arm64, Node 25+ is explicitly rejected
- `npx` must be available in the environment where the MCP client runs

## UTCP Configuration

The bridge loads UTCP configuration in this order:

1. `UTCP_CONFIG_FILE`
2. `.utcp_config.json` in the current working directory
3. `.utcp_config.json` next to the installed package

Example `.utcp_config.json`:

```json
{
  "load_variables_from": [
    {
      "variable_loader_type": "dotenv",
      "env_file_path": ".env"
    }
  ],
  "manual_call_templates": [
    {
      "name": "openlibrary",
      "call_template_type": "http",
      "http_method": "GET",
      "url": "https://openlibrary.org/static/openapi.json",
      "content_type": "application/json"
    }
  ],
  "post_processing": [
    {
      "tool_post_processor_type": "filter_dict",
      "only_include_keys": [
        "name",
        "description"
      ],
      "only_include_tools": [
        "openlibrary.*"
      ]
    }
  ],
  "tool_repository": {
    "tool_repository_type": "in_memory"
  },
  "tool_search_strategy": {
    "tool_search_strategy_type": "tag_and_description_word_match"
  }
}
```

## Exposed MCP Tools

This MCP server exposes these tools:

- `register_manual`
- `deregister_manual`
- `search_tools`
- `list_tools`
- `get_required_keys_for_tool`
- `tools_info`
- `call_tool_chain`

## What `call_tool_chain` Does

`call_tool_chain` executes TypeScript code with direct access to registered tools as hierarchical functions.

Example shape:

```typescript
return await some_manual.some_tool({
  query: "example"
});
```

You can combine multiple tool calls inside the same execution and return structured results.

## Tool Naming

UTCP tools are mapped into TypeScript-friendly access paths. A tool with a UTCP name like:

```text
my_manual.server.echo
```

is exposed in code-mode as a hierarchical TypeScript path derived from that name.

## Notes

- `stdout` is reserved for MCP stdio transport, so informational logs are redirected away from normal stdout behavior
- The package initializes core UTCP plugins and imports HTTP, text, MCP, CLI, dotenv-loader, and file integrations
- If the runtime is unsupported, the process exits with a clear error

## Development

Build:

```bash
npm run build
```

Start from source build output:

```bash
npm start
```

Dry-run package contents:

```bash
npm pack --dry-run
```
