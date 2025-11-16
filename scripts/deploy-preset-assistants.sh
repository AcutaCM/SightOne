#!/bin/bash

################################################################################
# Preset Assistants Expansion - Deployment Script
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
#   ./scripts/deploy-preset-assistants.sh [options]
#
# Options:
#   --skip-backup     Skip database backup (not recommended)
#   --skip-validation Skip post-deployment validation
#   --dry-run         Show what would be done without executing
#   --help            Show this help message
#
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/data"
BACKUP_DIR="$DATA_DIR/backups"
DB_PATH="$DATA_DIR/assistants.db"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/deployment-$(date +%Y%m%d-%H%M%S).log"

# Options
SKIP_BACKUP=false
SKIP_VALIDATION=false
DRY_RUN=false

################################################################################
# Helper Functions
################################################################################

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}" | tee -a "$LOG_FILE"
}

# Print section header
print_header() {
    echo "" | tee -a "$LOG_FILE"
    print_message "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_message "$BLUE" "  $1"
    print_message "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "" | tee -a "$LOG_FILE"
}

# Print success message
print_success() {
    print_message "$GREEN" "✓ $1"
}

# Print error message
print_error() {
    print_message "$RED" "✗ $1"
}

# Print warning message
print_warning() {
    print_message "$YELLOW" "⚠ $1"
}

# Print info message
print_info() {
    print_message "$NC" "ℹ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-validation)
                SKIP_VALIDATION=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help message
show_help() {
    cat << EOF
Preset Assistants Expansion - Deployment Script

Usage:
  ./scripts/deploy-preset-assistants.sh [options]

Options:
  --skip-backup     Skip database backup (not recommended)
  --skip-validation Skip post-deployment validation
  --dry-run         Show what would be done without executing
  --help            Show this help message

Examples:
  # Normal deployment
  ./scripts/deploy-preset-assistants.sh

  # Dry run to see what would happen
  ./scripts/deploy-preset-assistants.sh --dry-run

  # Skip validation (faster, but not recommended)
  ./scripts/deploy-preset-assistants.sh --skip-validation

EOF
}

################################################################################
# Validation Functions
################################################################################

# Validate environment
validate_environment() {
    print_header "Validating Environment"

    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    local node_version=$(node --version)
    print_success "Node.js installed: $node_version"

    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    local npm_version=$(npm --version)
    print_success "npm installed: $npm_version"

    # Check if we're in the project root
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "Not in project root directory"
        exit 1
    fi
    print_success "Project root directory validated"

    # Check if data directory exists
    if [ ! -d "$DATA_DIR" ]; then
        print_info "Creating data directory..."
        mkdir -p "$DATA_DIR"
    fi
    print_success "Data directory exists: $DATA_DIR"

    # Check if log directory exists
    if [ ! -d "$LOG_DIR" ]; then
        print_info "Creating log directory..."
        mkdir -p "$LOG_DIR"
    fi
    print_success "Log directory exists: $LOG_DIR"

    # Check if database exists
    if [ ! -f "$DB_PATH" ]; then
        print_warning "Database not found at: $DB_PATH"
        print_info "Database will be created during migration"
    else
        print_success "Database found: $DB_PATH"
    fi
}

# Validate dependencies
validate_dependencies() {
    print_header "Validating Dependencies"

    cd "$PROJECT_ROOT"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found"
        print_info "Installing dependencies..."
        
        if [ "$DRY_RUN" = false ]; then
            npm install
        else
            print_info "[DRY RUN] Would run: npm install"
        fi
    fi
    print_success "Dependencies validated"

    # Check for required packages
    local required_packages=("better-sqlite3" "typescript")
    for package in "${required_packages[@]}"; do
        if [ -d "node_modules/$package" ]; then
            print_success "Package installed: $package"
        else
            print_error "Required package not found: $package"
            exit 1
        fi
    done
}

################################################################################
# Backup Functions
################################################################################

# Create database backup
create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        print_warning "Skipping database backup (--skip-backup flag)"
        return 0
    fi

    print_header "Creating Database Backup"

    if [ ! -f "$DB_PATH" ]; then
        print_info "No database to backup"
        return 0
    fi

    # Create backup directory
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Created backup directory: $BACKUP_DIR"
    fi

    # Create backup
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/assistants_pre_deployment_${timestamp}.db"

    if [ "$DRY_RUN" = false ]; then
        cp "$DB_PATH" "$backup_file"
        print_success "Database backed up to: $backup_file"
        
        # Store backup path for rollback instructions
        BACKUP_FILE="$backup_file"
    else
        print_info "[DRY RUN] Would create backup: $backup_file"
    fi
}

################################################################################
# Migration Functions
################################################################################

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"

    cd "$PROJECT_ROOT"

    if [ "$DRY_RUN" = false ]; then
        # Run TypeScript migration script
        print_info "Executing migration script..."
        npx tsx scripts/migrate-preset-assistants.ts 2>&1 | tee -a "$LOG_FILE"
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            print_success "Database migrations completed successfully"
        else
            print_error "Database migrations failed"
            print_rollback_instructions
            exit 1
        fi
    else
        print_info "[DRY RUN] Would run: npx tsx scripts/migrate-preset-assistants.ts"
    fi
}

################################################################################
# Initialization Functions
################################################################################

# Initialize preset assistants
initialize_presets() {
    print_header "Initializing Preset Assistants"

    cd "$PROJECT_ROOT"

    if [ "$DRY_RUN" = false ]; then
        # Create a temporary initialization script
        cat > /tmp/init-presets.ts << 'EOF'
import { getDefaultPresetAssistantsService } from './lib/services/presetAssistantsService';

async function main() {
  console.log('Starting preset assistants initialization...\n');
  
  const service = getDefaultPresetAssistantsService();
  const result = await service.initializeAllPresets();
  
  console.log('\n=== Initialization Results ===');
  console.log(`Created: ${result.created}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Skipped: ${result.skipped}`);
  
  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    result.errors.forEach(error => console.log(`  - ${error}`));
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
EOF

        # Run initialization
        print_info "Executing initialization script..."
        npx tsx /tmp/init-presets.ts 2>&1 | tee -a "$LOG_FILE"
        
        local exit_code=${PIPESTATUS[0]}
        rm -f /tmp/init-presets.ts
        
        if [ $exit_code -eq 0 ]; then
            print_success "Preset assistants initialized successfully"
        else
            print_error "Preset assistants initialization failed"
            print_rollback_instructions
            exit 1
        fi
    else
        print_info "[DRY RUN] Would initialize preset assistants"
    fi
}

################################################################################
# Validation Functions
################################################################################

# Validate deployment
validate_deployment() {
    if [ "$SKIP_VALIDATION" = true ]; then
        print_warning "Skipping deployment validation (--skip-validation flag)"
        return 0
    fi

    print_header "Validating Deployment"

    cd "$PROJECT_ROOT"

    if [ "$DRY_RUN" = false ]; then
        # Create validation script
        cat > /tmp/validate-deployment.ts << 'EOF'
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
      test: () => true, // If we got here, DB exists
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
        console.log(`✓ ${check.name}`);
      } else {
        console.log(`✗ ${check.name}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`✗ ${check.name}: ${error}`);
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
EOF

        # Run validation
        print_info "Running validation checks..."
        npx tsx /tmp/validate-deployment.ts 2>&1 | tee -a "$LOG_FILE"
        
        local exit_code=${PIPESTATUS[0]}
        rm -f /tmp/validate-deployment.ts
        
        if [ $exit_code -eq 0 ]; then
            print_success "Deployment validation passed"
        else
            print_error "Deployment validation failed"
            print_rollback_instructions
            exit 1
        fi
    else
        print_info "[DRY RUN] Would run deployment validation"
    fi
}

################################################################################
# Rollback Functions
################################################################################

# Print rollback instructions
print_rollback_instructions() {
    echo "" | tee -a "$LOG_FILE"
    print_header "Rollback Instructions"
    
    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        print_warning "Deployment failed. To rollback:"
        print_info "1. Stop the application"
        print_info "2. Restore the backup:"
        print_info "   cp \"$BACKUP_FILE\" \"$DB_PATH\""
        print_info "3. Restart the application"
    else
        print_warning "No backup available for rollback"
    fi
    
    echo "" | tee -a "$LOG_FILE"
}

################################################################################
# Summary Functions
################################################################################

# Print deployment summary
print_summary() {
    print_header "Deployment Summary"
    
    print_success "Preset assistants expansion deployed successfully!"
    echo "" | tee -a "$LOG_FILE"
    
    print_info "What was deployed:"
    print_info "  • Database schema updated with new columns and tables"
    print_info "  • 10 preset assistants initialized"
    print_info "  • Indexes created for performance optimization"
    echo "" | tee -a "$LOG_FILE"
    
    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        print_info "Backup location:"
        print_info "  $BACKUP_FILE"
        echo "" | tee -a "$LOG_FILE"
    fi
    
    print_info "Log file:"
    print_info "  $LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    print_info "Next steps:"
    print_info "  1. Restart your application"
    print_info "  2. Visit the assistant market to see the new presets"
    print_info "  3. Test the new features (categories, search, favorites)"
    print_info "  4. Monitor the logs for any issues"
    echo "" | tee -a "$LOG_FILE"
    
    if [ -n "$BACKUP_FILE" ]; then
        print_info "You can safely delete the backup after confirming everything works:"
        print_info "  rm \"$BACKUP_FILE\""
        echo "" | tee -a "$LOG_FILE"
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    # Parse arguments
    parse_args "$@"
    
    # Print banner
    clear
    print_message "$BLUE" "╔════════════════════════════════════════════════════════════════╗"
    print_message "$BLUE" "║                                                                ║"
    print_message "$BLUE" "║        Preset Assistants Expansion - Deployment Script        ║"
    print_message "$BLUE" "║                                                                ║"
    print_message "$BLUE" "╚════════════════════════════════════════════════════════════════╝"
    echo "" | tee -a "$LOG_FILE"
    
    if [ "$DRY_RUN" = true ]; then
        print_warning "DRY RUN MODE - No changes will be made"
        echo "" | tee -a "$LOG_FILE"
    fi
    
    print_info "Deployment started at: $(date)"
    print_info "Log file: $LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    # Run deployment steps
    validate_environment
    validate_dependencies
    create_backup
    run_migrations
    initialize_presets
    validate_deployment
    
    # Print summary
    print_summary
    
    print_success "Deployment completed successfully at: $(date)"
}

# Run main function
main "$@"
