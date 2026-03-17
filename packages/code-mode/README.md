# @alexma03/utcp-code-mode

Execute TypeScript code with direct access to UTCP tools using isolated-vm for secure sandboxed execution.

## Installation

```bash
npm install @alexma03/utcp-code-mode @alexma03/utcp-sdk @alexma03/utcp-direct-call isolated-vm
```

## Quick Start

```typescript
import { CodeModeUtcpClient } from '@alexma03/utcp-code-mode';
import { addFunctionToUtcpDirectCall } from '@alexma03/utcp-direct-call';

// Register a function that returns a UTCP manual
addFunctionToUtcpDirectCall('getWeatherManual', async () => ({
  utcp_version: '0.2.0',
  tools: [{
    name: 'get_current',
    description: 'Get current weather for a city',
    inputs: {
      type: 'object',
      properties: { city: { type: 'string' } },
      required: ['city']
    },
    tool_call_template: {
      call_template_type: 'direct-call',
      callable_name: 'getWeather'
    }
  }]
}));

// Register the actual tool implementation
addFunctionToUtcpDirectCall('getWeather', async (city: string) => ({
  city,
  temperature: 22,
  condition: 'sunny'
}));

// Create client and register manual
const client = await CodeModeUtcpClient.create();
await client.registerManual({
  name: 'weather',
  call_template_type: 'direct-call',
  callable_name: 'getWeatherManual'
});

// Execute code with tool access
const { result, logs } = await client.callToolChain(`
  const data = weather.get_current({ city: 'London' });
  console.log('Weather:', data);
  return data;
`);

console.log(result);
// { city: 'London', temperature: 22, condition: 'sunny' }
```

## API

### `CodeModeUtcpClient.create(root_dir?, config?)`

Creates a new client instance.

```typescript
const client = await CodeModeUtcpClient.create(
  process.cwd(),  // optional: root directory
  null            // optional: UtcpClientConfig
);
```

### `client.callToolChain(code, timeout?, memoryLimit?)`

Executes TypeScript code with tool access.

```typescript
const result = await client.callToolChain(
  code,
  30000,
  128
);
```

**Returns:**
```typescript
{
  result: any;      // return value from code
  logs: string[];   // captured console.log/error/warn output
}
```

If execution fails, `callToolChain` throws `CodeModeExecutionError` and includes captured `logs`.

### `client.getAllToolsTypeScriptInterfaces()`

Returns TypeScript interface definitions for all registered tools.

```typescript
const interfaces = await client.getAllToolsTypeScriptInterfaces();
console.log(interfaces);
// "interface Weather_get_current_Input { city: string; } ..."
```

### `CodeModeUtcpClient.AGENT_PROMPT_TEMPLATE`

Static prompt template for AI agents explaining how to use code-mode.

```typescript
const systemPrompt = CodeModeUtcpClient.AGENT_PROMPT_TEMPLATE;
```

## Tool Access Patterns

Tools are accessed using their namespace:

```typescript
// Namespaced tools (from manuals)
manual_name.tool_name({ param: value })

// Examples
weather.get_current({ city: 'Tokyo' })
procurement.search_parts({ mpn: 'ABC123' })
```

## Runtime Context

Inside `callToolChain`, you have access to:

| Variable | Description |
|----------|-------------|
| `__interfaces` | String with all TypeScript interface definitions |
| `__getToolInterface(name)` | Get interface for specific tool |
| `__availableTools` | Array of available tool access patterns |
| `console.log/error/warn` | Captured and returned in `logs` |
| Standard JS globals | `JSON`, `Math`, `Date`, `Array`, etc. |

## Example: Chaining Tools

```typescript
const result = await client.callToolChain(`
  // Get parts from supplier
  const parts = procurement.search_parts({ mpn: 'LM358' });
  
  // Get pricing for each part
  const pricing = parts.map(part => 
    procurement.get_pricing({ part_id: part.id })
  );
  
  // Return combined result
  return { parts, pricing };
`);
```

## Using File Templates

For loading tools from UTCP manual files:

```typescript
import { CodeModeUtcpClient } from '@alexma03/utcp-code-mode';
import '@alexma03/utcp-file';

const client = await CodeModeUtcpClient.create();

// Register from a UTCP manual file
await client.registerManual({
  name: 'myapi',
  call_template_type: 'file',
  file_path: './my-api-manual.utcp.json'
});

// Use tools defined in the manual
const result = await client.callToolChain(`
  return myapi.some_tool({ param: 'value' });
`);
```

## Security

Code execution uses [isolated-vm](https://github.com/laverdet/isolated-vm) for sandboxing:

- Isolated V8 context (no access to Node.js APIs)
- Memory limits enforced
- Execution timeouts
- No file system or network access from sandbox

## License

MPL-2.0
