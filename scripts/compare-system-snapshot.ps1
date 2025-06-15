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

# Insert a comparison result record for the PC2 asset tag with the snapshot times and compared by user
# Note: The snapshot times are hardcoded for now, you can change them as needed
$comparison_id = Add-ComparisonResult -PCId $pc_id -SnapshotBefore (Get-Date "2025-06-10 09:00:00") -SnapshotAfter (Get-Date "2025-06-14 14:30:00") -ComparedBy "junaid"

Write-Host "Comparison ID: $comparison_id" -ForegroundColor Green

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
    Write-Host "comparison_id: $comparison_id (type: $($comparison_id.GetType().Name))"

    ## Now we need to insert a new record in the comparison_component table with the comparison_id, component_type, and json_path
    Add-ComparisonComponent -ComparisonId $comparison_id -ComponentType "software" -JsonFilePath "C:\Scripts\output\INTEL\softwares.json"
    
    Close-MySqlConnection

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

              #  Compare-Services -File1Path $file1.FullName -File2Path $file2.FullName
            
            } # End of services functiion


            elseif ($file1.Name -eq "printers.xml") {
                
                # we just need to compare the Name and PortName

                #Compare-printers -File1Path $file1.FullName -File2Path $file2.FullName


            }

            elseif ($file1.Name -eq "networkDrive.xml") {
                # we need to compare Name, DisplayRoot, 
               # Compare-networkDrive -File1Path $file1.FullName -File2Path $file2.FullName


            }

            # We will treat these as strings as they are of system.string typename
            ############ NEED TO MOVE USERACCOUNTS TO COMPARE_OBJECT FUNCTION ############
            elseif ($file1.Name -eq "systeminfo.xml") {
             #  Compare-FilesLineByLine -File1Path $file1.FullName -File2Path $file2.FullName


            }

            elseif ($file1.Name -eq "userAccounts.xml") {
               #Compare-Objects-Generic -File1Path $file1.FullName -File2Path $file2.FullName
            }

            elseif ($file1.Name -eq "windowsUpdates.xml") {
                # we need to compare Description, HotFixID, InstalledOn
               # Compare-Objects-Generic -File1Path $file1.FullName -File2Path $file2.FullName
            }



            

            else {
                Write-Host "Skipping $($file1.Name)" -ForegroundColor Yellow
            }
            
        }
        else {
            Write-Host "File not found in $PC2 $($file1.Name)" -ForegroundColor Yellow
        }
    }

    
# Write-Host "Differences found: $($Differences.Count)" -ForegroundColor Cyan