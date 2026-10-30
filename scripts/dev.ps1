# Запуск на этой машине без глобальной установки Node.js.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$runtime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node'
$runtimeNode = Join-Path $runtime 'bin/node.exe'
if (Test-Path -LiteralPath $runtimeNode) {
  $env:PATH = (Join-Path $runtime 'bin') + ';' + $env:PATH
  $env:SIBIRIUS_SANDBOX = '1'
  & $runtimeNode 'node_modules/vite/bin/vite.js' --configLoader native --host 127.0.0.1
} else {
  npm run dev
}
