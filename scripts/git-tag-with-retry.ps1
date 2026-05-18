# Tag git with collision detection and HHMMSS suffix retry.
#
# Usage:
#   .\scripts\git-tag-with-retry.ps1 -BaseTag "v-2026-05-18-formula-fix" -Message "Formula fix"
#
# If $BaseTag already exists locally, retry once with -r{HHMMSS} suffix.
# Echoes the final tag name as the last stdout line so callers can capture it.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$BaseTag,
    [Parameter(Mandatory = $true)][string]$Message
)

$ErrorActionPreference = 'Stop'

$tag = $BaseTag
$existing = git tag -l $tag
if ($existing) {
    $suffix = Get-Date -Format 'HHmmss'
    $tag = "${BaseTag}-r${suffix}"
    Write-Host "Base tag '$BaseTag' exists; retrying with: $tag"
}

git tag -a $tag -m $Message
if ($LASTEXITCODE -ne 0) {
    throw "git tag -a failed for $tag (exit $LASTEXITCODE)"
}

Write-Host "Created tag: $tag"
$tag
