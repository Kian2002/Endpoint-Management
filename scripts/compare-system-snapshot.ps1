# Directory containing the snapshots
$Directory = "C:\Scripts\info"
$Folders = Get-ChildItem $Directory -Directory

if ($Folders.Count -lt 2) {
    Write-Host "Error: There must be at least two folders in $Directory for comparison." -ForegroundColor Red
    exit
}

#$Fold = $Folders | Get-Member | Out-String
# Write-Host "FOlder object is  $Fold"


$folder1 = $Folders[0].FullName
$folder2 = $Folders[1].FullName
$PC1 = $Folders[0].Name
$PC2 = $Folders[1].Name

Write-Host "Comparing system snapshots: $PC1 vs $PC2" -ForegroundColor Cyan


# Get all files from both folders
$files1 = Get-ChildItem $folder1 -File
$files2 = Get-ChildItem $folder2 -File


####### Functions Section ##########
function Compare-Softwares {
    param (
        [string]$File1Path,
        [string]$File2Path
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
                
                Compare-Softwares -File1Path $file1.FullName -File2Path $file2.FullName

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