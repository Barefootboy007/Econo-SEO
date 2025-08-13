# MCP Servers Configuration Guide

## 🟢 Active Servers (Working Now)

These servers are currently active and working without any additional configuration:

### Remote Servers (HTTP Transport)
- **context7** - Documentation and context lookup (runs remotely via HTTP)

### Local Servers (Run via NPX)
- **sequential-thinking** - Structured problem-solving and multi-step reasoning
- **magic** - UI component generation from 21st.dev
- **playwright** - Browser automation and E2E testing
- **memory** - In-memory storage for temporary data
- **puppeteer** - Web scraping and browser automation
- **serena** - Powerful coding toolkit with semantic retrieval and editing capabilities
- **project-filesystem** - Access to project files
- **local-sqlite** - Local SQLite database for development

**Note**: All servers except Context7 run locally on your machine via npx. No external API calls or cloud services are used.

## 🔴 Inactive Servers (Need Configuration)

These servers are commented out in `_commented_servers_need_config` section. To activate them:
1. Add the required API keys/configuration
2. Move the server config from `_commented_servers_need_config` to `mcpServers`
3. Restart Claude Code

### PostgreSQL
- **Purpose**: Direct PostgreSQL database connection
- **Config Needed**: Connection string with credentials
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://myuser:mypass@localhost:5432/mydb`
```json
"postgres": {
  "command": "npx",
  "args": ["@modelcontextprotocol/server-postgres", "YOUR_CONNECTION_STRING_HERE"]
}
```

### Supabase (Project-specific)
- **Purpose**: Supabase database connection for SEO Optimizer
- **Config Needed**: Supabase connection string
- **Get it from**: Supabase Dashboard > Settings > Database
- **Format**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
```json
"supabase": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "POSTGRES_CONNECTION_STRING": "YOUR_SUPABASE_CONNECTION_STRING"
  }
}
```

### Search Engine APIs (Project-specific)
- **Purpose**: Search engine integration for SEO tools
- **Config Needed**:
  - `SERPAPI_KEY`: Get from https://serpapi.com/
  - `GOOGLE_API_KEY`: Get from Google Cloud Console
  - `GOOGLE_CSE_ID`: Custom Search Engine ID from Google
```json
"search-engine": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-fetch"],
  "env": {
    "SERPAPI_KEY": "YOUR_SERPAPI_KEY",
    "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY",
    "GOOGLE_CSE_ID": "YOUR_CSE_ID"
  }
}
```

### Redis Cache (Project-specific)
- **Purpose**: Background job queue and caching
- **Config Needed**: Redis server running
- **Default**: `redis://localhost:6379`
- **Docker**: `docker run -d -p 6379:6379 redis`
```json
"redis-cache": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-redis"],
  "env": {
    "REDIS_URL": "redis://localhost:6379"
  }
}
```

## 📝 How to Activate Servers

1. **Edit the appropriate .mcp.json file**:
   - Root level: `~/.mcp.json`
   - Project level: `./.mcp.json`

2. **Move server config from `_commented_servers_need_config` to `mcpServers`**

3. **Add required credentials/configuration**

4. **Restart Claude Code** for changes to take effect

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data when possible
- Consider using a `.env` file for local development
- Keep production credentials separate from development

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [MCP Server List](https://github.com/modelcontextprotocol/servers)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude/docs/mcp)