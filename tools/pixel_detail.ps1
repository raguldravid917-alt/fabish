Add-Type -AssemblyName System.Drawing

function Get-TextColors($path, $yStart, $yEnd) {
    $img = New-Object System.Drawing.Bitmap($path)
    $colorCounts = @{}
    # Scan the vertical range for dark pixels that represent text or icons
    for ($y = $yStart; $y -le $yEnd; $y++) {
        for ($x = 0; $x -lt $img.Width; $x++) {
            $c = $img.GetPixel($x, $y)
            # Text is usually dark, or green in the case of "Home". Let's check for non-background colors.
            # Background in Announcement bar is #F5F5F5, background in Header is #F9F9EB.
            # Let's count any color that differs from the background by a threshold.
            $isAnn = $yEnd -lt 119
            $bgR = if ($isAnn) { 0xF5 } else { 0xF9 }
            $bgG = if ($isAnn) { 0xF5 } else { 0xF9 }
            $bgB = if ($isAnn) { 0xF5 } else { 0xEB }
            
            $diff = [Math]::Abs($c.R - $bgR) + [Math]::Abs($c.G - $bgG) + [Math]::Abs($c.B - $bgB)
            if ($diff -gt 30) {
                $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
                $colorCounts[$hex] = $colorCounts[$hex] + 1
            }
        }
    }
    $sorted = $colorCounts.GetEnumerator() | Sort-Object Value -Descending
    Write-Host ("Unique colors in range y=" + $yStart + " to y=" + $yEnd + ":")
    $sorted | Select-Object -First 15 | ForEach-Object { Write-Host "  $($_.Key): $($_.Value) pixels" }
    $img.Dispose()
}

Write-Host "=== Image 2 (Target Reference): Announcement Bar Text (y=92 to 117) ==="
Get-TextColors "C:\Users\ragul\.gemini\antigravity-ide\brain\a1700d2f-03ee-4d00-a31a-017b637c1221\media__1781960170070.png" 95 115

Write-Host "`n=== Image 2 (Target Reference): Header Navigation / Icons (y=119 to 171) ==="
Get-TextColors "C:\Users\ragul\.gemini\antigravity-ide\brain\a1700d2f-03ee-4d00-a31a-017b637c1221\media__1781960170070.png" 130 160
