# =========================
# Module: database_module.psm1
# =========================

# Global variable for MySQL connection
$global:MySqlConnection = $null

function Open-MySqlConnection {
    param (
        [string]$ConnectionString,
        [string]$MySqlDll = "C:\Program Files (x86)\MySQL\MySQL Connector NET 9.3\MySql.Data.dll"
    )
    if (-not (Test-Path $MySqlDll)) {
        throw "MySQL Connector DLL not found at path: $MySqlDll"
    }
    Add-Type -Path $MySqlDll
    $global:MySqlConnection = New-Object MySql.Data.MySqlClient.MySqlConnection($ConnectionString)
    $global:MySqlConnection.Open()
    Write-Host "✅ Connected to MySQL database!" -ForegroundColor Cyan
}

function Close-MySqlConnection {
    if ($global:MySqlConnection -ne $null) {
        $global:MySqlConnection.Close()
        Write-Host "🔒 Connection closed." -ForegroundColor Yellow
        $global:MySqlConnection = $null
    }
}

function Add-PCAsset {
    param (
        [string]$AssetTag
    )
    $cmd = $global:MySqlConnection.CreateCommand()
    $cmd.CommandText = "INSERT IGNORE INTO pc_asset (asset_tag) VALUES (@tag);"
    $cmd.Parameters.Add("@tag", [MySql.Data.MySqlClient.MySqlDbType]::VarChar).Value = $AssetTag
    try {
        $cmd.ExecuteNonQuery() | Out-Null
        Write-Host "✅ Inserted: $AssetTag" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to insert $AssetTag : $_" -ForegroundColor Red
    }
}

function Get-PCId {
    param (
        [string]$AssetTag
    )
    $cmd = $global:MySqlConnection.CreateCommand()
    $cmd.CommandText = "SELECT pc_id FROM pc_asset WHERE asset_tag = @tag;"
    $cmd.Parameters.Add("@tag", [MySql.Data.MySqlClient.MySqlDbType]::VarChar).Value = $AssetTag
    return $cmd.ExecuteScalar()
}

function Add-ComparisonResult {
    param (
        [int]$PCId,
        [datetime]$SnapshotBefore,
        [datetime]$SnapshotAfter,
        [string]$ComparedBy
    )
    $cmd = $global:MySqlConnection.CreateCommand()
    $cmd.CommandText = @"
        INSERT INTO comparison_result (pc_id, snapshot_before_time, snapshot_after_time, compared_by)
        VALUES (@pcid, @before, @after, @by);
"@
    $cmd.Parameters.AddWithValue("@pcid", $PCId)
    $cmd.Parameters.AddWithValue("@before", $SnapshotBefore)
    $cmd.Parameters.AddWithValue("@after", $SnapshotAfter)
    $cmd.Parameters.AddWithValue("@by", $ComparedBy)
    try {
        $cmd.ExecuteNonQuery() | Out-Null
        Write-Host "✅ Inserted comparison_result for PC ID $PCId" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to insert into comparison_result: $_" -ForegroundColor Red
    }
    # Return the new comparison_id
    $cmd2 = $global:MySqlConnection.CreateCommand()
    $cmd2.CommandText = "SELECT LAST_INSERT_ID();"
    return $cmd2.ExecuteScalar()
}

function Add-ComparisonComponent {
    param (
        [int]$ComparisonId,
        [string]$ComponentType,
        [string]$JsonFilePath
    )
    try {
        $jsonContent = Get-Content -Path $JsonFilePath -Raw
    } catch {
        Write-Host "❌ Failed to read JSON file: $_" -ForegroundColor Red
        return
    }
    $cmd = $global:MySqlConnection.CreateCommand()
    $cmd.CommandText = @"
        INSERT INTO comparison_component (comparison_id, component_type, diff_json)
        VALUES (@cmp_id, @ctype, @json);
"@
    $cmd.Parameters.AddWithValue("@cmp_id", $ComparisonId)
    $cmd.Parameters.AddWithValue("@ctype", $ComponentType)
    $cmd.Parameters.AddWithValue("@json", $jsonContent)
    try {
        $cmd.ExecuteNonQuery() | Out-Null
        Write-Host "✅ JSON diff for '$ComponentType' inserted into comparison_component." -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to insert component diff: $_" -ForegroundColor Red
    }
}

Export-ModuleMember -Function Open-MySqlConnection, Close-MySqlConnection, Add-PCAsset, Get-PCId, Add-ComparisonResult, Add-ComparisonComponent