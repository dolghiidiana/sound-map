$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$soundMapNode = Get-Command node -ErrorAction SilentlyContinue
if ($soundMapNode) { $soundMapNodePath = $soundMapNode.Source }
else { $soundMapNodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $soundMapNodePath)) { throw 'Node.js is needed to start the listening study.' }
$soundMapNpm = Join-Path $PSScriptRoot '.local\tooling\package\bin\npm-cli.js'
if (Test-Path -LiteralPath $soundMapNpm) { & $soundMapNodePath $soundMapNpm run dev }
else { npm.cmd run dev }
