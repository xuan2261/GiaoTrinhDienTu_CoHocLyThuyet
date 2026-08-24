param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputDir,
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$')][string]$ObservedAt,
  [ValidateRange(30, 3600)][int]$TimeoutSeconds = 900,
  [switch]$Worker,
  [string]$RunToken
)

$ErrorActionPreference = 'Stop'
$word = $null
$document = $null
$reopened = $null
$probeDocument = $null
$wordProcessId = 0
$currentStage = 'initializing'

function Get-Sha256([string]$Path) {
  $stream = [IO.File]::OpenRead($Path)
  $algorithm = [Security.Cryptography.SHA256]::Create()
  try {
    return ([BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()
  } finally {
    $algorithm.Dispose()
    $stream.Dispose()
  }
}

function Write-Evidence($Evidence, [string]$Path) {
  $Evidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $Path -Encoding utf8
}

function Quote-ProcessArgument([string]$Value) {
  return '"' + $Value.Replace('"', '\"') + '"'
}

function Get-NewWordProcesses([int[]]$ExistingPids) {
  return @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -eq 'WINWORD.EXE' -and
      $_.CommandLine -like '*/Automation -Embedding*' -and
      $ExistingPids -notcontains $_.ProcessId
    })
}

function Stop-NewWordProcesses([int[]]$ExistingPids) {
  $stopped = @()
  foreach ($process in (Get-NewWordProcesses $ExistingPids)) {
    $candidate = Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue
    if ($candidate -and $candidate.MainWindowHandle -eq 0) {
      try {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
        $stopped += [int]$process.ProcessId
      } catch {}
    }
  }
  return $stopped
}

$source = (Resolve-Path -LiteralPath $InputPath).Path
if ([IO.Path]::GetExtension($source).ToLowerInvariant() -ne '.docx') {
  throw 'Word roundtrip gate requires a DOCX input.'
}
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$outputRoot = (Resolve-Path -LiteralPath $OutputDir).Path
$stem = [IO.Path]::GetFileNameWithoutExtension($source)
if (-not $RunToken) { $RunToken = (($ObservedAt -replace '[^0-9]', '') + "-$PID") }
$runRoot = Join-Path (Join-Path $outputRoot 'runs') $RunToken
New-Item -ItemType Directory -Force -Path $runRoot | Out-Null
$outputDocx = Join-Path $runRoot "$stem-word-roundtrip.docx"
$outputPdf = Join-Path $runRoot "$stem-word-roundtrip.pdf"
$evidencePath = Join-Path $outputRoot 'word-roundtrip-evidence.json'
$progressPath = Join-Path $outputRoot 'word-roundtrip-progress.txt'
$workerStdout = Join-Path $runRoot 'worker-stdout.txt'
$workerStderr = Join-Path $runRoot 'worker-stderr.txt'

function Set-Progress([string]$Stage) {
  $script:currentStage = $Stage
  Set-Content -LiteralPath $progressPath -Value $Stage -Encoding ascii
}

$evidence = [ordered]@{
  schemaVersion = 1
  gateId = 'word-standalone-roundtrip'
  status = 'fail'
  observedAt = $ObservedAt
  runId = $RunToken
  source = [ordered]@{ path = $source; sha256 = Get-Sha256 $source }
  environment = [ordered]@{ windows = [Environment]::OSVersion.VersionString; wordVersion = $null; wordBuild = $null; wordProcessId = $null }
  operations = @('copy-source', 'open-copy', 'update-safe-fields', 'update-toc', 'repaginate', 'save', 'close', 'reopen', 'export-pdf', 'close')
  outputs = [ordered]@{}
  cleanup = [ordered]@{ killedProcessIds = @(); remainingNewAutomationProcessIds = @() }
  failedStage = $null
  error = $null
}

if (-not $Worker) {
  Write-Evidence $evidence $evidencePath
  Set-Progress 'starting-worker'
  $existingWordPids = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
  $arguments = @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', (Quote-ProcessArgument $PSCommandPath),
    '-InputPath', (Quote-ProcessArgument $source),
    '-OutputDir', (Quote-ProcessArgument $outputRoot),
    '-ObservedAt', $ObservedAt,
    '-TimeoutSeconds', [string]$TimeoutSeconds,
    '-Worker',
    '-RunToken', $RunToken
  )
  $workerProcess = Start-Process powershell -ArgumentList $arguments -NoNewWindow -PassThru -RedirectStandardOutput $workerStdout -RedirectStandardError $workerStderr
  $completed = $workerProcess.WaitForExit($TimeoutSeconds * 1000)
  if (-not $completed) {
    $killedWordPids = @(Stop-NewWordProcesses $existingWordPids)
    Stop-Process -Id $workerProcess.Id -Force -ErrorAction SilentlyContinue
    $failedStage = if (Test-Path -LiteralPath $progressPath) { (Get-Content -LiteralPath $progressPath -Raw).Trim() } else { 'unknown' }
    if (Test-Path -LiteralPath $evidencePath) { $evidence = Get-Content -LiteralPath $evidencePath -Raw | ConvertFrom-Json }
    $evidence.status = 'fail'
    $evidence.failedStage = $failedStage
    $evidence.error = "Word automation exceeded the ${TimeoutSeconds}-second worker timeout."
    $evidence.cleanup.killedProcessIds = @($killedWordPids)
    $evidence.cleanup.remainingNewAutomationProcessIds = @((Get-NewWordProcesses $existingWordPids) | ForEach-Object { [int]$_.ProcessId })
    Write-Evidence $evidence $evidencePath
    [Console]::Error.WriteLine("word standalone roundtrip: FAIL at ${failedStage}: $($evidence.error)")
    exit 1
  }
  $workerProcess.WaitForExit()
  $workerExitCode = $workerProcess.ExitCode
  $killedWordPids = @(Stop-NewWordProcesses $existingWordPids)
  if (Test-Path -LiteralPath $evidencePath) {
    $evidence = Get-Content -LiteralPath $evidencePath -Raw | ConvertFrom-Json
    $evidence.cleanup.killedProcessIds = @($killedWordPids)
    $evidence.cleanup.remainingNewAutomationProcessIds = @((Get-NewWordProcesses $existingWordPids) | ForEach-Object { [int]$_.ProcessId })
    Write-Evidence $evidence $evidencePath
  }
  if (Test-Path -LiteralPath $workerStdout) { [Console]::Out.Write((Get-Content -LiteralPath $workerStdout -Raw)) }
  if (Test-Path -LiteralPath $workerStderr) { [Console]::Error.Write((Get-Content -LiteralPath $workerStderr -Raw)) }
  exit $workerExitCode
}

if (-not ('WordGateNativeMethods' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class WordGateNativeMethods {
  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
'@
}

Write-Evidence $evidence $evidencePath
try {
  Set-Progress 'binding-word-process'
  $word = New-Object -ComObject Word.Application
  $probeDocument = $word.Documents.Add()
  $windowHandle = [IntPtr][int64]$probeDocument.ActiveWindow.Hwnd
  if ($windowHandle -eq [IntPtr]::Zero) { throw 'Unable to identify the isolated Word automation window.' }
  [void][WordGateNativeMethods]::GetWindowThreadProcessId($windowHandle, [ref]$wordProcessId)
  [void](Get-Process -Id $wordProcessId -ErrorAction Stop)
  $evidence.environment.wordProcessId = $wordProcessId
  $probeDocument.Close(0)
  $probeDocument = $null
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $word.AutomationSecurity = 3
  $word.Options.UpdateLinksAtOpen = $false
  $word.Options.PrintBackground = $false
  $word.Options.BackgroundSave = $false
  $evidence.environment.wordVersion = [string]$word.Version
  $evidence.environment.wordBuild = [string]$word.Build
  Write-Evidence $evidence $evidencePath

  Set-Progress 'copying-source'
  Copy-Item -LiteralPath $source -Destination $outputDocx -Force
  Set-Progress 'opening-copy'
  $document = $word.Documents.Open($outputDocx, $false, $false)
  Set-Progress 'updating-fields'
  foreach ($field in $document.Fields) {
    if ($field.Type -notin @(56, 67, 68)) { $field.Update() | Out-Null }
  }
  foreach ($toc in $document.TablesOfContents) { $toc.Update() }
  Set-Progress 'repaginating-source'
  $document.Repaginate()
  Set-Progress 'saving-copy'
  $document.Save()
  Set-Progress 'closing-source'
  $document.Close(0)
  $document = $null
  Set-Progress 'reopening-copy'
  $reopened = $word.Documents.Open($outputDocx, $false, $true)
  Set-Progress 'repaginating-copy'
  $reopened.Repaginate()
  Set-Progress 'exporting-pdf'
  $reopened.ExportAsFixedFormat($outputPdf, 17)
  Set-Progress 'closing-copy'
  $reopened.Close(0)
  $reopened = $null

  if (-not (Test-Path -LiteralPath $outputDocx -PathType Leaf) -or (Get-Item $outputDocx).Length -eq 0) { throw 'Roundtrip DOCX was not created.' }
  if (-not (Test-Path -LiteralPath $outputPdf -PathType Leaf) -or (Get-Item $outputPdf).Length -eq 0) { throw 'Rendered PDF was not created.' }
  $evidence.outputs = [ordered]@{
    docx = [ordered]@{ path = $outputDocx; sha256 = Get-Sha256 $outputDocx; sizeBytes = (Get-Item $outputDocx).Length }
    pdf = [ordered]@{ path = $outputPdf; sha256 = Get-Sha256 $outputPdf; sizeBytes = (Get-Item $outputPdf).Length }
  }
  $evidence.status = 'pass'
  Set-Progress 'pass'
  Write-Evidence $evidence $evidencePath
  Write-Output "word standalone roundtrip: PASS ($($evidence.environment.wordVersion)|$($evidence.environment.wordBuild))"
} catch {
  $evidence.failedStage = $currentStage
  $evidence.error = $_.Exception.Message
  Write-Evidence $evidence $evidencePath
  Write-Error "word standalone roundtrip: FAIL at $currentStage`: $($evidence.error)"
  exit 1
} finally {
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
