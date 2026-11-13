$dir = "C:\Users\USER\.gemini\antigravity\scratch\agranusa-kpi-tracker"
$p = [System.IO.File]::ReadAllText("$dir\Penugasan.html", [System.Text.Encoding]::UTF8)
$q = [System.IO.File]::ReadAllText("$dir\QualityControl.html", [System.Text.Encoding]::UTF8)
$k = [System.IO.File]::ReadAllText("$dir\KPI.html", [System.Text.Encoding]::UTF8)

$idx = [System.IO.File]::ReadAllText("$dir\index.html", [System.Text.Encoding]::UTF8)
$idx = $idx.Replace("<?!= include('Penugasan') ?>", $p)
$idx = $idx.Replace("<?!= include('QualityControl') ?>", $q)
$idx = $idx.Replace("<?!= include('KPI') ?>", $k)

[System.IO.File]::WriteAllText("$dir\index.html", $idx, [System.Text.Encoding]::UTF8)
Write-Host "Bundled index.html successfully."
