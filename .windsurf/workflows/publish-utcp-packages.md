---
description: publicar paquetes UTCP en npm
---
# Publicar paquetes UTCP en npm

Usa este workflow para publicar `@alexma03/utcp-code-mode-mcp` o todo el monorepo en npm usando los scripts del repo o `pnpm publish` directo por paquete.

## 1. Verifica versión y metadatos

Revisa el `package.json` del paquete que quieras publicar:
- `version`
- `repository.url`
- `publishConfig.access`
- `bin` si el paquete debe ejecutarse con `npx`

## 2. Si cambiaste una versión, sincroniza dependencias internas

Para cambiar la versión de un paquete y actualizar automáticamente las referencias internas del resto del monorepo:

```bash
pnpm bump-package <package-name-o-directorio> <version>
```

Ejemplos:

```bash
pnpm bump-package @alexma03/utcp-code-mode-mcp 1.2.3
pnpm bump-package code-mode-mcp 1.2.3
```

Si cambiaste versiones a mano en algún `package.json`, sincroniza después:

```bash
pnpm sync-internal-deps
```

## 3. Build local del paquete

Para un paquete concreto, ejecuta:

```bash
pnpm run build
```

En el directorio del paquete.

## 4. Verifica el tarball antes de publicar

Ejecuta:

```bash
pnpm pack --dry-run
```

Comprueba que incluya los archivos esperados como `dist` y `README.md`.

## 5. Publicar un solo paquete

Ejemplo para `code-mode-mcp`:

```bash
pnpm publish --access public --no-git-checks
```

Ejecutar en:

```text
packages/code-mode-mcp
```

Si npm pide autenticación web, complétala en el navegador.

## 6. Publicar solo los paquetes cambiados

El comando recomendado es:

```bash
pnpm publish-changed
```

Para ver qué publicaría sin subir nada:

```bash
pnpm publish-changed:dry-run
```

Este script:

- compara la versión local de cada paquete con npm
- publica solo las versiones que aún no existen en el registry
- respeta el orden de dependencias internas del monorepo

## 7. Publicar todo el monorepo manualmente

Publica los paquetes uno por uno con `pnpm publish --access public --no-git-checks` usando el directorio de cada paquete como `cwd`.

Orden recomendado:

1. `packages/sdk`
2. `packages/http`
3. `packages/file`
4. `packages/text`
5. `packages/direct-call`
6. `packages/dotenv-loader`
7. `packages/cli`
8. `packages/mcp`
9. `packages/code-mode`
10. `packages/code-mode-mcp`

## 8. Configuración MCP para usar el paquete publicado con npx

Ejemplo para Windsurf:

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

## 9. Si un publish falla

- Si falla por versión existente, incrementa `version`
- Si falla por `bin`, corrige `package.json` y vuelve a empaquetar
- Si falla por autenticación, repite el `pnpm publish` y completa el flujo web de npm
- Si falla con `changeset publish`, usa publicación manual paquete por paquete
