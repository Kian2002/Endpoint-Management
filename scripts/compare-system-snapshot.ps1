import-Module "C:\Scripts\Modules\config.ps1"
Import-Module "C:\Scripts\Modules\database_module.psm1"
# Open the connection using the secure string
Open-MySqlConnection -ConnectionString $Global:MySQLConnectionString

# Directory containing the snapshots
$Directory = "C:\Scripts\info"
$Folders = Get-ChildItem $Directory -Directory

if ($Folders.Count -lt 2) {
    Write-Host "Error: There must be at least two folders in $Directory for comparison." -ForegroundColor Red
    exit
}

#$Fold = $Folders | Get-Member | Out-String
# Write-Host "FOlder object is  $Fold"


$folder1 = $Folders[1].FullName
$folder2 = $Folders[0].FullName
$PC1 = $Folders[1].Name
$PC2 = $Folders[0].Name

## Open MySQL connection and store PC assets tag in pc_asset table
Add-PCAsset -AssetTag $PC2

## Also Retrrieve the pc_id for the PC2 asset tag and store it in a variable
$pc_id = Get-PCId -AssetTag $PC2



## Dynamically get timestamps from the snapshot folders
$snapshot_before = (Get-Item $folder2).LastWriteTime
$snapshot_after  = (Get-Item $folder1).LastWriteTime

Write-Host "Baseline snapshot time (before): $snapshot_before" -ForegroundColor Cyan
Write-Host "New snapshot time (after): $snapshot_after" -ForegroundColor Cyan

## Insert comparison result record
$comparison_id = Add-ComparisonResult -PCId $pc_id -SnapshotBefore $snapshot_before -SnapshotAfter $snapshot_after -ComparedBy "junaid"

Write-Host "✅ Comparison ID created: $comparison_id" -ForegroundColor Green



Write-Host "Comparing system snapshots: $PC1 vs $PC2" -ForegroundColor Cyan


# Get all files from both folders
$files1 = Get-ChildItem $folder1 -File
$files2 = Get-ChildItem $folder2 -File


####### Functions Section ##########
function Compare-Softwares {
    param (
        [string]$File1Path,
        [string]$File2Path, 
        [string]$PC2
    )

    Write-Host "Comparing $($file1.Name)" -ForegroundColor Cyan
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $file1.FullName) -DifferenceObject (Import-Clixml $file2.FullName) -Property DisplayName, DisplayVersion, Publisher -IncludeEqual -PassThru
    $File1Count = (Get-Content $file1.FullName).Count
    $File2Count = (Get-Content $file2.FullName).Count

    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    #Write-Host "$ResultTable"

    ## Extract all the names of NoteProperty objects so we can compare based on them
    $propertiesName = $Differences | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    #Write-Host "$($propertiesName[1])"

    # temp jsut print the the REsultTable to a file
    $ResultTable | Out-File "C:\Scripts\Output\sofwarwes.txt"

    Write-Host "PC2 is $PC2" -ForegroundColor Cyan

    # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    ## Temp to store the difference in a JSON file
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\softwares.json"

  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "software" -JsonFilePath "C:\Scripts\output\INTEL\softwares.json" | Out-Null
    
    #Close-MySqlConnection

#  ## ok so equals are fine but if we have different objects due to different versions of software installed, we need to compare them too to exaaclty show why these two objects are differen
#     foreach ($Difference in $Differences) {

#         # for Properties that are equal, we can skip them for now
#         if ($Difference.SideIndicator -eq "==") {
#             continue
#         }

#         # compare the baseline with new snapshot
#         elseif ($Difference.SideIndicator -eq "=>") {
#             $matchingObject = $Differences | Where-Object { $_.SideIndicator -eq "<=" -and $_.DisplayName -eq $Difference.DisplayName }
            
#             # if we have a matching object, we can compare the rest of NoteProperty values except for SideIndicator, and DisplayName
#             if ($matchingObject) {

#                 # Now we can compare the rest of the properties except for SideIndicator and DisplayName
#                 foreach ($property in $propertiesName) {
#                     if ($property -ne "SideIndicator" -and $property -ne "DisplayName") {
#                         $value1 = $Difference.PSObject.Properties[$property].Value
#                         $value2 = $matchingObject.PSObject.Properties[$property].Value

#                         if ($value1 -ne $value2) {
#                             Write-Host "$($Difference.DisplayName): Mismatch found for '$property': $value1 (<=) vs $value2 (=>)" -ForegroundColor Yellow
#                         }
#                     }
#                 }

#             } else {
#                 Write-Host "No matching object found for $($Difference.DisplayName) on the <= side." -ForegroundColor Red
#             }


#         }

#         # compare the new snapshot with baseline
#         elseif ($Difference.SideIndicator -eq "<=") {

#             $matchingObject = $Differences | Where-Object { $_.SideIndicator -eq "=>" -and $_.DisplayName -eq $Difference.DisplayName }
            
#             # if we have a matching object, we can compare the rest of NoteProperty values except for SideIndicator, and DisplayName
#             if ($matchingObject) {

#                 # Now we can compare the rest of the properties except for SideIndicator and DisplayName
#                 foreach ($property in $propertiesName) {
#                     if ($property -ne "SideIndicator" -and $property -ne "DisplayName") {
#                         $value1 = $Difference.PSObject.Properties[$property].Value
#                         $value2 = $matchingObject.PSObject.Properties[$property].Value
                        

#                         if ($value1 -ne $value2) {
#                             Write-Host "$($Difference.DisplayName): Mismatch found for '$property': Baseline = $value1 vs Snaphost: $value2" -ForegroundColor Yellow
#                         }
#                     }
#                 }

#             } else {
#                 Write-Host "No matching object found for $($Difference.DisplayName) on the => side." -ForegroundColor Red
#             }
         
#         }


#     } # End of foreach loop
   



}

# Function to compare services between two XML files
function Compare-Services {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing services: $File1Path vs $File2Path" -ForegroundColor Cyan
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $File1Path) -DifferenceObject (Import-Clixml $File2Path) -Property DisplayName, Status -IncludeEqual -PassThru
    $File1Count = (Get-Content $File1Path).Count
    $File2Count = (Get-Content $File2Path).Count

    $temp = $Differences | Format-Table -AutoSize | Out-String

     # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # temp jsut print the the REsultTable to a file
    $Differences | Out-File "$OutputFolder\Services.txt"
    ## To store the difference in a JSON file
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\Services.json"



  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "services" -JsonFilePath "C:\Scripts\output\INTEL\Services.json" | Out-Null

   

}

function Compare-Processes {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing processes: $File1Path vs $File2Path" -ForegroundColor Cyan

    $Differences = Compare-Object `
        -ReferenceObject (Import-Clixml $File1Path) `
        -DifferenceObject (Import-Clixml $File2Path) `
        -Property Name, Path `
        -IncludeEqual -PassThru

    # Create output folder
    $OutputFolder = "C:\Scripts\output\$PC2"

    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # Save as TXT
    $Differences | Out-File "$OutputFolder\Processes.txt"

    # Save as JSON
    $Differences | ConvertTo-Json -Depth 5 | Out-File "$OutputFolder\Processes.json"

    # Print preview (optional)
    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
   # Write-Host $ResultTable -ForegroundColor Cyan

    # Insert into database
    $comparison_id = $comparison_id[-1]
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "processes" -JsonFilePath "$OutputFolder\Processes.json" | Out-Null
}

function Compare-EnvironmentVariables {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing environment variables: $File1Path vs $File2Path" -ForegroundColor Cyan

    $Differences = Compare-Object `
        -ReferenceObject (Import-Clixml $File1Path) `
        -DifferenceObject (Import-Clixml $File2Path) `
        -Property Name, Value `
        -IncludeEqual -PassThru

    # Create output folder
    $OutputFolder = "C:\Scripts\output\$PC2"

    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # Save as TXT
    $Differences | Out-File "$OutputFolder\EnvironmentVariables.txt"

    # Save as JSON
    $Differences | ConvertTo-Json -Depth 5 | Out-File "$OutputFolder\EnvironmentVariables.json"

    # Print preview (optional)
    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    Write-Host $ResultTable -ForegroundColor Cyan

    # Insert into database
    $comparison_id = $comparison_id[-1]
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "environmentVariables" -JsonFilePath "$OutputFolder\EnvironmentVariables.json" | Out-Null
}



function Compare-printers {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing $($file1.Name)" -ForegroundColor Cyan
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $file1.FullName) -DifferenceObject (Import-Clixml $file2.FullName) -Property Name, PortName, PrinterStatus -IncludeEqual -PassThru
    $File1Count = (Get-Content $file1.FullName).Count
    $File2Count = (Get-Content $file2.FullName).Count

    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    #Write-Host "$ResultTable"

      # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # temp jsut print the the REsultTable to a file
    $Differences | Out-File "$OutputFolder\printers.txt"
    ## To store the difference in a JSON file
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\printers.json"



  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "printers" -JsonFilePath "C:\Scripts\output\INTEL\printers.json" | Out-Null

}


## Using it for userAccounts.xml
function Compare-Objects-Generic{
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2,
        [string]$ComponentType

    )

    Write-Host "Comparing $($file1.Name)" -ForegroundColor Cyan
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $file1.FullName) -DifferenceObject (Import-Clixml $file2.FullName) -IncludeEqual -PassThru

    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    #Write-Host "$ResultTable"

       # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"
    


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # temp jsut print the the REsultTable to a file
    $Differences | Out-File "$OutputFolder\$ComponentType.txt"
    ## To store the difference in a JSON file
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\$ComponentType.json"

    #Write-Host "$Differences " -ForegroundColor Cyan




  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "$ComponentType" -JsonFilePath "C:\Scripts\output\INTEL\$ComponentType.json" | Out-Null


}

## Using it for Windows update
function Compare-WindowsUpdates {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing $($file1.Name)" -ForegroundColor Cyan
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $file1.FullName) -DifferenceObject (Import-Clixml $file2.FullName) -IncludeEqual -PassThru

    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    #Write-Host "$ResultTable"

       # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # temp jsut print the the REsultTable to a file
    $Differences | Out-File "$OutputFolder\updates.txt"
    ## To store the difference in a JSON file
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\updates.json"



  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "updates" -JsonFilePath "C:\Scripts\output\INTEL\updates.json" | Out-Null


}

# Function to compare network drives

function Compare-networkDrive {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing $($file1.Name)" -ForegroundColor Cyan
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $file1.FullName) -DifferenceObject (Import-Clixml $file2.FullName) -Property Name, DisplayRoot -IncludeEqual -PassThru
    $File1Count = (Get-Content $file1.FullName).Count
    $File2Count = (Get-Content $file2.FullName).Count

    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    #Write-Host "$ResultTable"

       # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # temp jsut print the the REsultTable to a file
    $Differences | Out-File "$OutputFolder\networkDrives.txt"
    ## To store the difference in a JSON file
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\networkDrives.json"



  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "networkDrives" -JsonFilePath "C:\Scripts\output\INTEL\networkDrives.json" | Out-Null
}

function Compare-SystemInfo {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2,
        [string]$ComponentType

    )

    Write-Host "Comparing $($file1.Name)" -ForegroundColor Cyan

    $comp1 = Import-Clixml $file1.FullName
    $comp2 = Import-Clixml $file2.FullName

    # Convert properties to lists
    $comp1Props = $comp1.PSObject.Properties | Select-Object Name, Value
    $comp2Props = $comp2.PSObject.Properties | Select-Object Name, Value
    
    
    $Differences = Compare-Object -ReferenceObject $comp1Props -DifferenceObject $comp2Props -Property Name, Value -IncludeEqual -PassThru


    $ResultTable = $Differences | Format-Table -AutoSize | Out-String
    #Write-Host "$ResultTable"

       # make a folder named $PC1 and store the differences in a file 
    $OutputFolder = "C:\Scripts\output\$PC2"
    


    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # temp jsut print the the REsultTable to a file
    $Differences | Out-File "$OutputFolder\$ComponentType.txt"
    ## To store the difference in a JSON file
    $Differences | ConvertTo-Json -Depth 5 | Out-File "$OutputFolder\$ComponentType.json"

    #Write-Host "$Differences " -ForegroundColor Cyan



  # If $comparison_id is an array, get the last element as this last element is the  comparison_id we need to use for the comparison_component tabl
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "$ComponentType" -JsonFilePath "C:\Scripts\output\INTEL\$ComponentType.json" | Out-Null

}

# Compare the network configuration files
function Compare-NetworkConfig {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2,
        [string]$ComponentType
    )

    Write-Host "Comparing network configuration ($ComponentType)..." -ForegroundColor Cyan

    # Import Clixml snapshots
    $net1 = Import-Clixml $File1Path
    $net2 = Import-Clixml $File2Path

    # No need to convert to properties — already flattened custom objects
    $Differences = Compare-Object -ReferenceObject $net1 -DifferenceObject $net2 `
        -Property InterfaceAlias, IPv4Address, IPv6Address, IPv4Gateway, IPv6Gateway, DNSServers `
        -IncludeEqual -PassThru

    # Create formatted table string
    $ResultTable = $Differences | Format-Table -AutoSize | Out-String

    # Output folder
    $OutputFolder = "C:\Scripts\output\$PC2"

    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # Save as TXT
    $Differences | Out-File "$OutputFolder\$ComponentType.txt"

    # Save as JSON
    $Differences | ConvertTo-Json -Depth 5 | Out-File "$OutputFolder\$ComponentType.json"

    # Print preview
   # Write-Host $ResultTable -ForegroundColor Cyan

    # Example DB insertion (if needed)
    $comparison_id = $comparison_id[-1]
    #Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "$ComponentType" -JsonFilePath "$OutputFolder\$ComponentType.json" | Out-Null
}

function Compare-StartupPrograms {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing startup programs: $File1Path vs $File2Path" -ForegroundColor Cyan

    # Import both XML files
    $Differences = Compare-Object -ReferenceObject (Import-Clixml $File1Path) `
                                  -DifferenceObject (Import-Clixml $File2Path) `
                                  -Property Name, Command -IncludeEqual -PassThru

    # Create formatted table output
    $ResultTable = $Differences | Format-Table -AutoSize | Out-String

    # Create output folder if not exists
    $OutputFolder = "C:\Scripts\output\$PC2"
    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # Save to TXT
    $Differences | Out-File "$OutputFolder\startupPrograms.txt"
    # Save to JSON
    $Differences | ConvertTo-Json | Out-File "$OutputFolder\startupPrograms.json"

    # Get latest comparison_id if needed for DB insert
    $comparison_id = $comparison_id[-1]
    # Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    # Insert record in comparison_component table
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "startupPrograms" -JsonFilePath "$OutputFolder\startupPrograms.json" | Out-Null

    Write-Host "✅ Startup programs comparison completed and stored." -ForegroundColor Green
}

function Compare-Drivers {
    param (
        [string]$File1Path,
        [string]$File2Path,
        [string]$PC2
    )

    Write-Host "Comparing drivers: $File1Path vs $File2Path" -ForegroundColor Cyan

    $Differences = Compare-Object `
        -ReferenceObject (Import-Clixml $File1Path) `
        -DifferenceObject (Import-Clixml $File2Path) `
        -Property Name, Manufacturer, DriverVersion, DriverDate `
        -IncludeEqual -PassThru

    $OutputFolder = "C:\Scripts\output\$PC2"

    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder | Out-Null
    }

    Write-Host "Storing differences in $OutputFolder" -ForegroundColor Cyan

    # Save formatted table (optional)
    $Differences | Format-Table -AutoSize | Out-File "$OutputFolder\drivers.txt"

    # Save JSON file for DB or web frontend
    $Differences | ConvertTo-Json -Depth 5 | Out-File "$OutputFolder\drivers.json"

    # If $comparison_id is an array, get the last element
    $comparison_id = $comparison_id[-1]
    Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    # Insert into DB
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "drivers" -JsonFilePath "$OutputFolder\drivers.json" | Out-Null

}










## Now we have the files, we can compare them one by one using Compare-Object. 
    foreach ($file1 in $files1) {

       # find a file in dir2 that has the same name as file2
       $file2 = $files2 | Where-Object { $_.Name -eq $file1.Name }

        # if we have a file with the same name in dir2, we can compare them
        if ($file2) {
           
            #########SOFTWARE LIST##########
            
            # see if we have a file called softwareList.xml  
            if ($file1.Name -eq "softwareList.xml") {
                
                Compare-Softwares -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2

            }

            #########SERVICES##########
            elseif ($file1.Name -eq "services.xml") {

                Compare-Services -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            
            } # End of services functiion

            elseif ($file1.Name -eq "process.xml") {

                Compare-Processes -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            
            }
            elseif ($file1.Name -eq "environmentVariables.xml") {

                Compare-EnvironmentVariables -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            
            }


            elseif ($file1.Name -eq "printers.xml") {
                
                # we just need to compare the Name and PortName

                Compare-printers -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2


            }

            elseif ($file1.Name -eq "networkDrive.xml") {
                # we need to compare Name, DisplayRoot, 
                #Compare-networkDrive -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2


            }

            # We will treat these as strings as they are of system.string typename
            ############ NEED TO MOVE USERACCOUNTS TO COMPARE_OBJECT FUNCTION ############
            elseif ($file1.Name -eq "systeminfo.xml") {
               Compare-SystemInfo -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2 -ComponentType "systeminfo"


            }
            elseif ($file1.Name -eq "ipconfig.xml") {
               Compare-NetworkConfig -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2 -ComponentType "ipConfig"


            }


            elseif ($file1.Name -eq "userAccounts.xml") {
               Compare-Objects-Generic -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2 -ComponentType "accounts"
            }

            elseif ($file1.Name -eq "windowsUpdates.xml") {
                # we need to compare Description, HotFixID, InstalledOn
                Compare-WindowsUpdates -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            }

            elseif ($file1.Name -eq "networkDrive.xml") {
                # we need to compare Description, HotFixID, InstalledOn
            Compare-networkDrive -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            }

            elseif ($file1.Name -eq "startupPrograms.xml") {
                Compare-StartupPrograms -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            }

            elseif ($file1.Name -eq "drivers.xml") {
                Compare-Drivers -File1Path $file1.FullName -File2Path $file2.FullName -PC2 $PC2
            }



            

            else {
                Write-Host "Skipping $($file1.Name)" -ForegroundColor Yellow
            }
            
        }
        else {
            Write-Host "File not found in $PC2 $($file1.Name)" -ForegroundColor Yellow
        }


    }

Close-MySqlConnection
# Write-Host "Differences found: $($Differences.Count)" -ForegroundColor Cyan