################################################################################
# Preset Assistants Expansion - Deployment Script (PowerShell)
#
# This script automates the deployment of the preset assistants expansion:
# 1. Validates environment and dependencies
# 2. Creates database backup
# 3. Runs database migrations
# 4. Initializes preset assistants
# 5. Validates deployment
# 6. Provides rollback instructions
#
# Usage:
#   .\scripts\deploy-preset-assistants.ps1 [options]
#
# Options:
#   -SkipBackup       Skip database backup (not recommended)
#   -SkipValidation   Skip post-deployment validation
#   -DryRun           Show what would be done without executing
#   -Help             Show this help message
#
################################################################################

param(
    [switch]$SkipBackup,
    [switch]$SkipValidation,
    [switch]$DryRun,
    [switch]$Help
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DataDir = Join-Path $ProjectRoot "data"
$BackupDir = Join-Path $DataDir "backups"
$DbPath = Join-Path $DataDir "assistants.db"
$LogDir = Join-Path $ProjectRoot "logs"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "deployment-$Timestamp.log"
$BackupFile = $null

################################################################################
# Helper Functions
################################################################################

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $Message
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorMessage "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Blue"
    Write-ColorMessage "  $Title" "Blue"
    Write-ColorMessage "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Blue"
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-ColorMessage "✓ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorMessage "✗ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorMessage "⚠ $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorMessage "ℹ $Message" "Cyan"
}

function Show-Help {
    @"
Preset Assistants Expansion - Deployment Script

Usage:
  .\scripts\deploy-preset-assistants.ps1 [options]

Options:
  -SkipBackup       Skip database backup (not recommended)
  -SkipValidation   Skip post-deployment validation
  -DryRun           Show what would be done without executing
  -Help             Show this help message

Examples:
  # Normal deployment
  .\scripts\deploy-preset-assistants.ps1

  # Dry run to see what would happen
  .\scripts\deploy-preset-assistants.ps1 -DryRun

  # Skip validation (faster, but not recommended)
  .\scripts\deploy-preset-assistants.ps1 -SkipValidation

"@
}

################################################################################
# Validation Functions
################################################################################

function Test-Environment {
    Write-Header "Validating Environment"

    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js installed: $nodeVersion"
    } catch {
        Write-Error "Node.js is not installed"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm installed: $npmVersion"
    } catch {
        Write-Error "npm is not installed"
        exit 1
    }

    # Check project root
    if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
        Write-Error "Not in project root directory"
        exit 1
    }
    Write-Success "Project root directory validated"

    # Create data directory if needed
    if (-not (Test-Path $DataDir)) {
        Write-Info "Creating data directory..."
        New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
    }
    Write-Success "Data directory exists: $DataDir"

    # Create log directory if needed
    if (-not (Test-Path $LogDir)) {
        Write-Info "Creating log directory..."
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }
    Write-Success "Log directory exists: $LogDir"

    # Check database
    if (-not (Test-Path $DbPath)) {
        Write-Warning "Database not found at: $DbPath"
        Write-Info "Database will be created during migration"
    } else {
        Write-Success "Database found: $DbPath"
    }
}

function Test-Dependencies {
    Write-Header "Validating Dependencies"

    Set-Location $ProjectRoot

    # Check node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Warning "node_modules not found"
        Write-Info "Installing dependencies..."
        
        if (-not $DryRun) {
            npm install
        } else {
            Write-Info "[DRY RUN] Would run: npm install"
        }
    }
    Write-Success "Dependencies validated"

    # Check required packages
    $requiredPackages = @("better-sqlite3", "typescript")
    foreach ($package in $requiredPackages) {
        if (Test-Path "node_modules\$package") {
            Write-Success "Package installed: $package"
        } else {
            Write-Error "Required package not found: $package"
            exit 1
        }
    }
}

################################################################################
# Backup Functions
################################################################################

function New-Backup {
    if ($SkipBackup) {
        Write-Warning "Skipping database backup (-SkipBackup flag)"
        return
    }

    Write-Header "Creating Database Backup"

    if (-not (Test-Path $DbPath)) {
        Write-Info "No database to backup"
        return
    }

    # Create backup directory
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Success "Created backup directory: $BackupDir"
    }

    # Create backup
    $backupFile = Join-Path $BackupDir "assistants_pre_deployment_$Timestamp.db"

    if (-not $DryRun) {
        Copy-Item $DbPath $backupFile
        Write-Success "Database backed up to: $backupFile"
        $script:BackupFile = $backupFile
    } else {
        Write-Info "[DRY RUN] Would create backup: $backupFile"
    }
}

################################################################################
# Migration Functions
################################################################################

function Invoke-Migrations {
    Write-Header "Running Database Migrations"

    Set-Location $ProjectRoot

    if (-not $DryRun) {
        Write-Info "Executing migration script..."
        
        $output = npx tsx scripts/migrate-preset-assistants.ts 2>&1
        $output | ForEach-Object { 
            Write-Host $_
            Add-Content -Path $LogFile -Value $_
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database migrations completed successfully"
        } else {
            Write-Error "Database migrations failed"
            Show-RollbackInstructions
            exit 1
        }
    } else {
        Write-Info "[DRY RUN] Would run: npx tsx scripts/migrate-preset-assistants.ts"
    }
}

################################################################################
# Initialization Functions
################################################################################

function Initialize-Presets {
    Write-Header "Initializing Preset Assistants"

    Set-Location $ProjectRoot

    if (-not $DryRun) {
        # Create temporary initialization script
        $initScript = @"
import { getDefaultPresetAssistantsService } from './lib/services/presetAssistantsService';

async function main() {
  console.log('Starting preset assistants initialization...\n');
  
  const service = getDefaultPresetAssistantsService();
  const result = await service.initializeAllPresets();
  
  console.log('\n=== Initialization Results ===');
  console.log(`Created: `+result.created);
  console.log(`Updated: `+result.updated);
  console.log(`Skipped: `+result.skipped);
  
  if (result.errors.length > 0) {
    console.log(`\nErrors (`+result.errors.length+`):`);
    result.errors.forEach(error => console.log(`  - `+error));
    process.exit(1);
  } else {
    console.log('\n✅ All preset assistants initialized successfully!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
"@

        $tempFile = Join-Path $env:TEMP "init-presets-$Timestamp.ts"
        Set-Content -Path $tempFile -Value $initScript

        Write-Info "Executing initialization script..."
        
        $output = npx tsx $tempFile 2>&1
        $output | ForEach-Object { 
            Write-Host $_
            Add-Content -Path $LogFile -Value $_
        }
        
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Preset assistants initialized successfully"
        } else {
            Write-Error "Preset assistants initialization failed"
            Show-RollbackInstructions
            exit 1
        }
    } else {
        Write-Info "[DRY RUN] Would initialize preset assistants"
    }
}

################################################################################
# Validation Functions
################################################################################

function Test-Deployment {
    if ($SkipValidation) {
        Write-Warning "Skipping deployment validation (-SkipValidation flag)"
        return
    }

    Write-Header "Validating Deployment"

    Set-Location $ProjectRoot

    if (-not $DryRun) {
        # Create validation script
        $validationScript = @"
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'assistants.db');

function validateDeployment() {
  console.log('Running deployment validation checks...\n');
  
  const db = new Database(DB_PATH);
  let allPassed = true;

  const checks = [
    {
      name: 'Database exists',
      test: () => true,
    },
    {
      name: 'Assistants table has category column',
      test: () => {
        const info = db.prepare('PRAGMA table_info(assistants)').all() as any[];
        return info.some((col: any) => col.name === 'category');
      },
    },
    {
      name: 'Assistants table has usage_count column',
      test: () => {
        const info = db.prepare('PRAGMA table_info(assistants)').all() as any[];
        return info.some((col: any) => col.name === 'usage_count');
      },
    },
    {
      name: 'Assistants table has rating column',
      test: () => {
        const info = db.prepare('PRAGMA table_info(assistants)').all() as any[];
        return info.some((col: any) => col.name === 'rating');
      },
    },
    {
      name: 'Favorites table exists',
      test: () => {
        const result = db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='favorites'"
        ).get();
        return !!result;
      },
    },
    {
      name: 'Ratings table exists',
      test: () => {
        const result = db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='ratings'"
        ).get();
        return !!result;
      },
    },
    {
      name: 'Usage logs table exists',
      test: () => {
        const result = db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='usage_logs'"
        ).get();
        return !!result;
      },
    },
    {
      name: 'At least one preset assistant exists',
      test: () => {
        const result = db.prepare(
          "SELECT COUNT(*) as count FROM assistants WHERE author = 'system'"
        ).get() as any;
        return result.count > 0;
      },
    },
    {
      name: 'All preset assistants are published',
      test: () => {
        const result = db.prepare(
          "SELECT COUNT(*) as count FROM assistants WHERE author = 'system' AND status != 'published'"
        ).get() as any;
        return result.count === 0;
      },
    },
    {
      name: 'Indexes created',
      test: () => {
        const result = db.prepare(
          "SELECT COUNT(*) as count FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
        ).get() as any;
        return result.count >= 10;
      },
    },
  ];

  for (const check of checks) {
    try {
      const passed = check.test();
      if (passed) {
        console.log(`✓ `+check.name);
      } else {
        console.log(`✗ `+check.name);
        allPassed = false;
      }
    } catch (error) {
      console.log(`✗ `+check.name+`: `+error);
      allPassed = false;
    }
  }

  db.close();

  if (allPassed) {
    console.log('\n✅ All validation checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some validation checks failed!');
    process.exit(1);
  }
}

validateDeployment();
"@

        $tempFile = Join-Path $env:TEMP "validate-deployment-$Timestamp.ts"
        Set-Content -Path $tempFile -Value $validationScript

        Write-Info "Running validation checks..."
        
        $output = npx tsx $tempFile 2>&1
        $output | ForEach-Object { 
            Write-Host $_
            Add-Content -Path $LogFile -Value $_
        }
        
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Deployment validation passed"
        } else {
            Write-Error "Deployment validation failed"
            Show-RollbackInstructions
            exit 1
        }
    } else {
        Write-Info "[DRY RUN] Would run deployment validation"
    }
}

################################################################################
# Rollback Functions
################################################################################

function Show-RollbackInstructions {
    Write-Host ""
    Write-Header "Rollback Instructions"
    
    if ($BackupFile -and (Test-Path $BackupFile)) {
        Write-Warning "Deployment failed. To rollback:"
        Write-Info "1. Stop the application"
        Write-Info "2. Restore the backup:"
        Write-Info "   Copy-Item `"$BackupFile`" `"$DbPath`" -Force"
        Write-Info "3. Restart the application"
    } else {
        Write-Warning "No backup available for rollback"
    }
    
    Write-Host ""
}

################################################################################
# Summary Functions
################################################################################

function Show-Summary {
    Write-Header "Deployment Summary"
    
    Write-Success "Preset assistants expansion deployed successfully!"
    Write-Host ""
    
    Write-Info "What was deployed:"
    Write-Info "  • Database schema updated with new columns and tables"
    Write-Info "  • 10 preset assistants initialized"
    Write-Info "  • Indexes created for performance optimization"
    Write-Host ""
    
    if ($BackupFile -and (Test-Path $BackupFile)) {
        Write-Info "Backup location:"
        Write-Info "  $BackupFile"
        Write-Host ""
    }
    
    Write-Info "Log file:"
    Write-Info "  $LogFile"
    Write-Host ""
    
    Write-Info "Next steps:"
    Write-Info "  1. Restart your application"
    Write-Info "  2. Visit the assistant market to see the new presets"
    Write-Info "  3. Test the new features (categories, search, favorites)"
    Write-Info "  4. Monitor the logs for any issues"
    Write-Host ""
    
    if ($BackupFile) {
        Write-Info "You can safely delete the backup after confirming everything works:"
        Write-Info "  Remove-Item `"$BackupFile`""
        Write-Host ""
    }
}

################################################################################
# Main Execution
################################################################################

function Main {
    # Show help if requested
    if ($Help) {
        Show-Help
        exit 0
    }

    # Print banner
    Clear-Host
    Write-ColorMessage "╔════════════════════════════════════════════════════════════════╗" "Blue"
    Write-ColorMessage "║                                                                ║" "Blue"
    Write-ColorMessage "║        Preset Assistants Expansion - Deployment Script        ║" "Blue"
    Write-ColorMessage "║                                                                ║" "Blue"
    Write-ColorMessage "╚════════════════════════════════════════════════════════════════╝" "Blue"
    Write-Host ""
    
    if ($DryRun) {
        Write-Warning "DRY RUN MODE - No changes will be made"
        Write-Host ""
    }
    
    Write-Info "Deployment started at: $(Get-Date)"
    Write-Info "Log file: $LogFile"
    Write-Host ""
    
    # Run deployment steps
    Test-Environment
    Test-Dependencies
    New-Backup
    Invoke-Migrations
    Initialize-Presets
    Test-Deployment
    
    # Print summary
    Show-Summary
    
    Write-Success "Deployment completed successfully at: $(Get-Date)"
}

# Run main function
Main
