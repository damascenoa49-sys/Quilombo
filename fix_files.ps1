$municipiosJsonPath = "JSON/Municipios-MA.json"
$quilombosJsonPath = "JSON/Quilombos-MA.json"
$municipiosJsPath = "JSON/Municipios.js"
$quilombosJsPath = "JSON/Quilombos.js"

# Function to convert file
function Convert-JsonToJs {
    param (
        [string]$JsonPath,
        [string]$JsPath,
        [string]$VarName
    )
    
    Write-Host "Converting $JsonPath to $JsPath..."
    
    # Create the JS file with the variable declaration
    # avoiding BOM if possible, but UTF8 is standard for web
    $header = "var $VarName = "
    [System.IO.File]::WriteAllText($JsPath, $header, [System.Text.Encoding]::UTF8)
    
    # Read all text from JSON and append it
    # Reading all text is safe for 92MB on modern systems
    $jsonContent = [System.IO.File]::ReadAllText($JsonPath)
    [System.IO.File]::AppendAllText($JsPath, $jsonContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "Finished $JsPath"
}

try {
    Convert-JsonToJs -JsonPath $quilombosJsonPath -JsPath $quilombosJsPath -VarName "quilombosData"
    Convert-JsonToJs -JsonPath $municipiosJsonPath -JsPath $municipiosJsPath -VarName "municipiosData"
    Write-Host "Conversion completed successfully."
} catch {
    Write-Error "An error occurred: $_"
}
