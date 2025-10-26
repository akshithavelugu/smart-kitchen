
$recipes = Get-Content "C:\Users\monika\OneDrive\Desktop\recipe_names.txt"
# Get all PNG files only, excluding the script
$files = Get-ChildItem -Filter *.png | Where-Object { $_.Extension -ne ".ps1" } | Sort-Object Name

$files = Get-ChildItem -Filter *.png | Sort-Object Name

if ($files.Count -ne $recipes.Count) {
    Write-Host "❌ Count mismatch!"
    Write-Host "Recipes in list: $($recipes.Count)"
    Write-Host "Screenshots found: $($files.Count)"
    Write-Host "Fix mismatch before renaming."
    exit
}

for ($i=0; $i -lt $files.Count; $i++) {
    $newName = ($recipes[$i].ToLower() -replace ' ', '-') + ".jpg"
    if (Test-Path $newName) {
        Write-Host "⚠️ Skipping $($files[$i].Name) → $newName (already exists)"
    } else {
        Rename-Item $files[$i].FullName -NewName $newName
        Write-Host "✅ Renamed $($files[$i].Name) → $newName"
    }
}

Write-Host "🎉 Done! All files renamed safely."
