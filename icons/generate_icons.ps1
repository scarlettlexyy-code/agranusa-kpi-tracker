Add-Type -AssemblyName System.Drawing

function Create-AppIcon([int]$size, [string]$path, [bool]$isMaskable) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 19, 27, 46))
    if ($isMaskable) {
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    } else {
        $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
        $radius = [int]($size * 0.22)
        $pathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
        $pathObj.AddArc(0, 0, $radius*2, $radius*2, 180, 90)
        $pathObj.AddArc($size - $radius*2, 0, $radius*2, $radius*2, 270, 90)
        $pathObj.AddArc($size - $radius*2, $size - $radius*2, $radius*2, $radius*2, 0, 90)
        $pathObj.AddArc(0, $size - $radius*2, $radius*2, $radius*2, 90, 90)
        $pathObj.CloseFigure()
        $g.FillPath($bgBrush, $pathObj)

        # Border
        $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 254, 182, 60), [float]($size * 0.015))
        $g.DrawPath($goldPen, $pathObj)
        $goldPen.Dispose()
        $pathObj.Dispose()
    }

    # Gold color for icon
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 182, 60))

    # Scale icon features
    $padding = if ($isMaskable) { $size * 0.22 } else { $size * 0.16 }
    $drawW = $size - ($padding * 2)
    $drawH = $size - ($padding * 2)

    # Roof Triangle
    $roofP1 = New-Object System.Drawing.PointF ($size / 2), ($padding + $drawH * 0.08)
    $roofP2 = New-Object System.Drawing.PointF ($padding + $drawW * 0.05), ($padding + $drawH * 0.42)
    $roofP3 = New-Object System.Drawing.PointF ($size - $padding - $drawW * 0.05), ($padding + $drawH * 0.42)
    $roofPoints = [System.Drawing.PointF[]]@($roofP1, $roofP2, $roofP3)
    $g.FillPolygon($goldBrush, $roofPoints)

    # Roof Overhang Beam
    $beamY = $padding + $drawH * 0.42
    $g.FillRectangle($goldBrush, [float]($padding), [float]$beamY, [float]($drawW), [float]($drawH * 0.06))

    # Columns
    $colY = $beamY + ($drawH * 0.06) + ($drawH * 0.04)
    $colH = $drawH * 0.32
    $colW = $drawW * 0.09

    $g.FillRectangle($goldBrush, [float]($padding + $drawW * 0.12), [float]$colY, [float]$colW, [float]$colH)
    $g.FillRectangle($goldBrush, [float]($padding + $drawW * 0.32), [float]$colY, [float]$colW, [float]$colH)
    $g.FillRectangle($goldBrush, [float]($padding + $drawW * 0.59), [float]$colY, [float]$colW, [float]$colH)
    $g.FillRectangle($goldBrush, [float]($padding + $drawW * 0.79), [float]$colY, [float]$colW, [float]$colH)

    # Base Pedestal
    $baseY = $colY + $colH + ($drawH * 0.02)
    $g.FillRectangle($goldBrush, [float]($padding + $drawW * 0.05), [float]$baseY, [float]($drawW * 0.9), [float]($drawH * 0.08))

    # Star / Crown
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 221, 176))
    $starX = [float]($size / 2 - $drawW * 0.04)
    $starY = [float]($padding - $drawH * 0.02)
    $starSize = [float]($drawW * 0.08)
    $g.FillEllipse($starBrush, $starX, $starY, $starSize, $starSize)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bgBrush.Dispose()
    $goldBrush.Dispose()
    $starBrush.Dispose()
    $bmp.Dispose()
}

$dir = "C:\Users\USER\.gemini\antigravity\scratch\agranusa-kpi-tracker\icons"
Create-AppIcon 192 "$dir\icon-192.png" $false
Create-AppIcon 512 "$dir\icon-512.png" $false
Create-AppIcon 512 "$dir\icon-maskable.png" $true
Write-Host "Icons generated successfully."
