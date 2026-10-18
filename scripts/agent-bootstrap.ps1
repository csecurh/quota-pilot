# Agent-assisted Windows bootstrap. Non-admin PowerShell, no system Node/npm/Git.
param([switch]$DryRun)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$tag = 'v0.6.0-rc.1'
$bundle = 'quota-pilot-win32-x64'
$digest = '47dcd61f75c56cbc92585f5dc41e1a27cd4fe11d8ebd8e456fcac949653ee9d3'
if (-not [Environment]::Is64BitOperatingSystem -or [Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString() -ne 'X64') { throw 'Windows x64 required' }
if ($DryRun) { Write-Output "PLAN $tag $bundle $digest"; exit 0 }
$homeDir = [Environment]::GetFolderPath('UserProfile')
$privateRoot = Join-Path $homeDir '.quotapilot'
$base = Join-Path $privateRoot 'agent-installs'
foreach ($part in @($privateRoot, $base)) {
  if (Test-Path -LiteralPath $part) {
    $item=Get-Item -LiteralPath $part -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Unsafe parent destination' }
  }
}
New-Item -ItemType Directory -Path $base -Force | Out-Null
$dest = Join-Path $base "$tag-$bundle"
if (Test-Path -LiteralPath $dest) {
  $item=Get-Item -LiteralPath $dest -Force
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Unsafe destination' }
  if (-not (Test-Path -LiteralPath (Join-Path $dest 'PORTABLE-BUILD.json')) -or -not (Test-Path -LiteralPath (Join-Path $dest 'runtime\node.exe'))) { throw 'Existing install needs inspection' }
  Write-Output "ALREADY_INSTALLED $dest"
  exit 0
}
$scratch=Join-Path $base ([Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $scratch | Out-Null
try {
  $asset=Join-Path $scratch "$bundle.zip"
  $url="https://github.com/csecurh/quota-pilot/releases/download/$tag/$bundle.zip"
  Invoke-WebRequest -Uri $url -OutFile $asset -MaximumRedirection 5 -TimeoutSec 180 -UseBasicParsing
  $size=(Get-Item -LiteralPath $asset).Length
  if($size -lt 1000000 -or $size -gt 95000000) { throw 'Unexpected archive size' }
  if((Get-FileHash -LiteralPath $asset -Algorithm SHA256).Hash.ToLowerInvariant() -ne $digest) { throw 'Digest mismatch' }
  Expand-Archive -LiteralPath $asset -DestinationPath $scratch
  $extracted=Join-Path $scratch $bundle
  if(-not (Test-Path -LiteralPath (Join-Path $extracted 'runtime\node.exe')) -or -not (Test-Path -LiteralPath (Join-Path $extracted 'plugin.json'))) { throw 'Incomplete bundle' }
  $links=Get-ChildItem -LiteralPath $extracted -Recurse -Force | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 }
  if($links) { throw 'Unexpected reparse point in bundle' }
  & (Join-Path $extracted 'runtime\node.exe') --version | Out-Null
  if($LASTEXITCODE -ne 0) { throw 'Runtime failed to start' }
  Move-Item -LiteralPath $extracted -Destination $dest
  Write-Output "INSTALLED $dest"
} finally {
  if(Test-Path -LiteralPath $scratch) { Remove-Item -LiteralPath $scratch -Recurse -Force }
}
