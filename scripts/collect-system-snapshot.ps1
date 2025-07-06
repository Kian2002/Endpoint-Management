# Get PC Name
$pcName = $env:COMPUTERNAME

# Save system information to a folder named after the PC name to desired location. we are saving it to usb drive
$folderPath = "C:\Scripts\info\$pcName"

# Create the folder if it doesn't exist

if (-not (Test-Path -Path $folderPath)) {
    New-Item -Path $folderPath -ItemType Directory
}


# 4. Save the system information to systemInfo.xml
Get-ComputerInfo | Export-Clixml -Path "$folderPath\systemInfo.xml"

# 12. Save IP configuration (ipconfig /all) to ipConfig.xml
# Get and flatten network config
# 12. Save IP configuration (flattened) to ipConfig.xml
$flatNetConfig = Get-NetIPConfiguration | ForEach-Object {
    [PSCustomObject]@{
        InterfaceAlias = $_.InterfaceAlias
        InterfaceIndex = $_.InterfaceIndex
        InterfaceDesc  = $_.InterfaceDescription
        IPv4Address    = ($_.IPv4Address.IPAddress -join ",")
        IPv6Address    = ($_.IPv6Address.IPAddress -join ",")
        IPv4Gateway    = ($_.IPv4DefaultGateway.NextHop)
        IPv6Gateway    = ($_.IPv6DefaultGateway.NextHop)
        DNSServers     = ($_.DNSServer.ServerAddresses -join ",")
    }
}

$flatNetConfig | Export-Clixml -Path "$folderPath\ipConfig.xml"
Write-Host "✔️ Network configuration snapshot saved to $folderPath\ipConfig.xml" -ForegroundColor Green



# 1. Save the list of printers to printers.xml
Get-Printer | Select-Object Name, PrinterStatus, PortName | Export-Clixml -Path "$folderPath\printers.xml"

# 2. Save the list of network drives to networkDrive.xml
Get-PSDrive -PSProvider FileSystem | Export-Clixml -Path "$folderPath\networkDrive.xml"

# 3. Save the list of installed software to softwareList.xml
Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*, 
HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
Select-Object DisplayName, DisplayVersion, Publisher, InstallDate |
Where-Object DisplayName -ne $null |
Sort-Object DisplayName | Export-Clixml -Path "$folderPath\softwareList.xml"


# 5. Save disk space information to diskInfo.xml
Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Used -gt 0} | Select-Object Name, @{Name="Used (GB)";Expression={[math]::round($_.Used/1GB,2)}}, @{Name="Free (GB)";Expression={[math]::round($_.Free/1GB,2)}}, @{Name="Total (GB)";Expression={[math]::round($_.Used/1GB + $_.Free/1GB,2)}} | Export-Clixml -Path "$folderPath\diskInfo.xml"

# 6. Save Windows updates list to windowsUpdates.xml
Get-HotFix | Select-Object Description, HotFixID, InstalledOn | Export-Clixml -Path "$folderPath\windowsUpdates.xml"

# 7. Save environment variables to environmentVariables.xml
# Get environment variables, convert to custom object with Name and Value
$envVars = Get-ChildItem Env: | ForEach-Object {
    [PSCustomObject]@{
        Name  = $_.Key
        Value = $_.Value
    }
}

# Save to Clixml
$envVars | Export-Clixml -Path "$folderPath\environmentVariables.xml"


# 8. Save active network connections to networkConnections.xml
#netstat -an | Export-Clixml -Path "$folderPath\networkConnections.xml"

# 9. Save user accounts information to userAccounts.xml
Get-LocalUser | Select-Object Name, Enabled | Export-Clixml -Path "$folderPath\userAccounts.xml"

# 10. Save services list to services.xml
Get-Service | Select-Object Name, Status, DisplayName | Export-Clixml -Path "$folderPath\services.xml"

# 10. Save services list to services.xml
Get-Process | Select-Object Id,Name,StartTime,Path | Export-Clixml -Path "$folderPath\Process.xml"

# 11. Save startup programs to startupPrograms.xml
Get-CimInstance -ClassName Win32_StartupCommand | Select-Object Name, Command | Export-Clixml -Path "$folderPath\startupPrograms.xml"

## Collect PnP devices and drivers 
Write-Host "Collecting installed PnP drivers..." -ForegroundColor Cyan

# Get all PnP entities
$pnpEntities = Get-CimInstance Win32_PnPEntity

# Get all signed drivers
$signedDrivers = Get-CimInstance Win32_PnPSignedDriver

# Join them together
$combined = foreach ($pnp in $pnpEntities) {
    $matchingDriver = $signedDrivers | Where-Object { $_.DeviceID -eq $pnp.PNPDeviceID }
    if ($matchingDriver) {
        [PSCustomObject]@{
            Name          = $pnp.Name
            Manufacturer  = $pnp.Manufacturer
            DeviceID      = $pnp.PNPDeviceID
            DriverVersion = $matchingDriver.DriverVersion
            DriverDate    = $matchingDriver.DriverDate
        }
    }
}

# Save to clixml file in current folder
$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputPath = Join-Path -Path $CurrentDir -ChildPath "drivers.xml"

$combined | Export-Clixml -Path $OutputPath

Write-Host "✔️ Driver snapshot saved to $OutputPath" -ForegroundColor Green


