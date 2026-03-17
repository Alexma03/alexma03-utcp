# AGENTS.md

## Objetivo

Este repositorio es un monorepo de paquetes UTCP publicados bajo el scope `@alexma03`.

Este documento explica cómo trabajar en el monorepo, cómo cambiar versiones, cómo mantener sincronizadas las dependencias internas y cómo publicar paquetes de forma segura.

## Estructura del monorepo

- `packages/sdk`
- `packages/http`
- `packages/file`
- `packages/text`
- `packages/direct-call`
- `packages/dotenv-loader`
- `packages/cli`
- `packages/mcp`
- `packages/code-mode`
- `packages/code-mode-mcp`
- `scripts/`
- `.windsurf/workflows/`

## Reglas de trabajo

- Usa `pnpm` en el monorepo.
- Cada paquete publicable tiene su propio `package.json` dentro de `packages/*`.
- Si cambias la versión de un paquete interno, debes sincronizar las referencias internas del resto de paquetes.
- No publiques versiones que ya existan en npm.
- Antes de publicar, comprueba siempre el contenido del tarball con `pnpm pack --dry-run`.
- Si un paquete debe funcionar con `npx`, revisa también el campo `bin` y su entrypoint real.

## Scripts disponibles en la raíz

Los comandos principales definidos en el `package.json` raíz son:

```bash
pnpm build
pnpm test
pnpm build:core
pnpm build:plugins
pnpm build:products
pnpm sync-internal-deps
pnpm bump-package <package-name-o-directorio> <version>
pnpm publish-changed:dry-run
pnpm publish-changed
```

## Cómo cambiar la versión de un paquete

### Opción recomendada

Usa el script de bump del monorepo:

```bash
pnpm bump-package @alexma03/utcp-code-mode-mcp 1.2.3
```

O por nombre de carpeta:

```bash
pnpm bump-package code-mode-mcp 1.2.3
```

Este script:

- actualiza `version` en el paquete objetivo
- sincroniza automáticamente los rangos de dependencias internas del resto del monorepo

### Si cambiaste versiones a mano

Ejecuta después:

```bash
pnpm sync-internal-deps
```

Esto recorre todos los `package.json` de `packages/*` y actualiza referencias internas a `^version_actual`.

## Qué comprobar antes de publicar

### Checklist general

Antes de publicar cualquier paquete, revisa:

- `name`
- `version`
- `repository.url`
- `publishConfig.access`
- `files`
- `main`
- `module`
- `types`
- `bin` si aplica
- dependencias internas sin `workspace:*` en paquetes que vayan a publicarse a npm

### Build

Para un paquete concreto:

```bash
pnpm run build
```

Ejecuta el comando dentro del directorio del paquete.

### Tarball

Comprueba el contenido final que se subiría a npm:

```bash
pnpm pack --dry-run
```

Verifica que incluya:

- `dist`
- `README.md`
- `bin` si el paquete necesita ejecutarse con `npx`
- `package.json`

### Dependencias internas

Si el paquete depende de otros paquetes del monorepo y se va a consumir desde npm, asegúrate de que las referencias publicadas usen versiones reales como:

```json
"@alexma03/utcp-sdk": "^1.1.0"
```

No dejes `workspace:*` en dependencias o peerDependencies que formen parte del paquete publicado al registry.

## Cómo publicar un solo paquete

Sitúate en el directorio del paquete y ejecuta:

```bash
pnpm publish --access public --no-git-checks
```

Ejemplo:

```bash
pnpm publish --access public --no-git-checks
```

En:

```text
packages/code-mode-mcp
```

Si npm pide autenticación web, complétala en el navegador.

## Cómo publicar solo los paquetes que han cambiado

Usa primero el modo seco:

```bash
pnpm publish-changed:dry-run
```

Y luego publica:

```bash
pnpm publish-changed
```

Este script:

- consulta npm para cada paquete del monorepo
- detecta si la versión local ya existe en el registry
- publica solo las versiones que aún no están publicadas
- respeta el orden de dependencias internas

## Flujo recomendado de release

### Caso 1: cambias un solo paquete

```bash
pnpm bump-package code-mode-mcp 1.2.3
pnpm --filter @alexma03/utcp-code-mode-mcp run build
pnpm --filter @alexma03/utcp-code-mode-mcp pack --dry-run
pnpm publish-changed:dry-run
pnpm publish-changed
```

### Caso 2: cambias varios paquetes manualmente

```bash
pnpm sync-internal-deps
pnpm build
pnpm publish-changed:dry-run
pnpm publish-changed
```

## Publicación manual del monorepo

Si necesitas publicar manualmente paquete por paquete, usa `pnpm publish --access public --no-git-checks` en cada directorio, en este orden:

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

## MCP y `npx`

Para paquetes que deban usarse con `npx`, comprueba siempre:

- que el `bin` esté correctamente expuesto en `package.json`
- que el archivo binario exista en el tarball
- que el paquete pueda resolverse desde fuera del monorepo
- que sus dependencias publicadas no incluyan `workspace:*`

Ejemplo de configuración MCP para Windsurf:

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

## Errores comunes

### `You cannot publish over the previously published versions`

La versión ya existe en npm.

Solución:

- incrementa `version`
- ejecuta `pnpm sync-internal-deps` si afecta a dependencias internas
- vuelve a publicar

### `Unsupported URL Type "workspace:"`

Algún paquete publicado sigue exponiendo `workspace:*` en dependencias o peerDependencies.

Solución:

- actualiza las referencias internas a versiones reales
- vuelve a publicar las versiones corregidas

### Warnings de `repository.url was normalized`

Debes usar:

```json
"url": "git+https://github.com/Alexma03/alexma03-utcp.git"
```

### `bin ... was invalid and removed`

El `bin` no está quedando bien empaquetado para npm.

Comprueba:

- ruta del wrapper
- permisos del archivo si aplica
- inclusión del archivo en `files`
- resultado de `pnpm pack --dry-run`

## Workflows

Consulta también:

- `.windsurf/workflows/publish-utcp-packages.md`

Ese workflow resume el flujo práctico de publicación para este monorepo.
