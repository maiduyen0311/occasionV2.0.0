# Builds demos/clone01/images/*.jpg from design/clone01 (local design files, not in git)
# using demos/clone01/images.manifest.json (written by scripts/demo/clone01.js).
#   - crop: [x, y, w, h] on the layout render, saved 1:1
#   - max:  longest side for photos; transparent PNGs are flattened on white
# Usage (project root): powershell -ExecutionPolicy Bypass -File scripts/demo/clone01-images.ps1 [-Force]
param([switch]$Force)

Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$design = Join-Path $root 'design\clone01'
$outDir = Join-Path $root 'demos\clone01\images'
$manifest = Get-Content (Join-Path $root 'demos\clone01\images.manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
New-Item -ItemType Directory -Force $outDir | Out-Null

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 86L

$count = 0
foreach ($entry in $manifest.PSObject.Properties) {
  $key = $entry.Name; $m = $entry.Value
  $out = Join-Path $outDir "$key.jpg"
  if ($m.drawn) { continue } # rendered by scripts/demo/clone01-banners.js
  if ((Test-Path $out) -and -not $Force) { continue }
  $file = Join-Path $design ($m.src -replace '/', '\')
  if (-not (Test-Path -LiteralPath $file)) { Write-Warning "missing $($m.src) ($key)"; continue }
  $img = [System.Drawing.Image]::FromFile($file)
  if ($m.crop) {
    $sx = $m.crop[0]; $sy = $m.crop[1]; $sw = $m.crop[2]; $sh = $m.crop[3]; $w = $sw; $h = $sh
  } else {
    $sx = 0; $sy = 0; $sw = $img.Width; $sh = $img.Height
    $scale = [Math]::Min(1.0, [double]$m.max / [Math]::Max($sw, $sh))
    $w = [int][Math]::Round($sw * $scale); $h = [int][Math]::Round($sh * $scale)
  }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'; $g.SmoothingMode = 'HighQuality'
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $sx, $sy, $sw, $sh), 'Pixel')
  $bmp.Save($out, $jpeg, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose(); $count++
}
"$count images written to demos\clone01\images"
