# Full-bleed Shevon lettermark. Do not crop the overlay photo.
# Measure outputs by file size only — do not Read the PNGs into chat.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\public\icons"
$sizes = @(16, 32, 48, 192, 256, 512)
$bg = [System.Drawing.Color]::FromArgb(255, 18, 18, 18)
$fg = [System.Drawing.Color]::FromArgb(255, 196, 214, 140)

function Write-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear($bg)

  $fontSize = [Math]::Max(8, [int][Math]::Round($size * 0.78))
  $font = New-Object System.Drawing.Font "Segoe UI", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $brush = New-Object System.Drawing.SolidBrush $fg
  $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
  $g.DrawString("S", $font, $brush, $rect, $sf)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $brush.Dispose()
  $sf.Dispose()
  $font.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

foreach ($size in $sizes) {
  $name = if ($size -eq 512) { "icon.png" } else { "icon-$size.png" }
  $path = Join-Path $outDir $name
  Write-Icon $size $path
  $len = (Get-Item $path).Length
  Write-Output ("{0} {1} bytes" -f $name, $len)
}
