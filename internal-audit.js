/**
 * H3X-fLups Internal Audit & Cleanup Tool
 * Comprehensive workspace auditing, reference checking, and cleanup
 * Date: 2025-06-01
 */

const fs = require('fs');
const path = require('path');

class H3XInternalAudit {
    constructor() {
        this.issues = {
            brokenReferences: [],
            obsoleteFiles: [],
            inconsistentNaming: [],
            deadCode: [],
            missingFiles: [],
            configurationIssues: [],
            duplicateContent: [],
            packageIssues: []
        };
        
        this.stats = {
            filesScanned: 0,
            issuesFound: 0,
            fixesApplied: 0
        };
        
        this.config = {
            rootDir: process.cwd(),
            excludeDirs: ['node_modules', '.git', 'archive', 'backup'],
            fileExtensions: ['.js', '.ts', '.json', '.yml', '.yaml', '.md', '.html', '.css'],
            packageJsonPath: './package.json'
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '🔍',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'fix': '🔧'
        }[type] || 'ℹ️';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async scanWorkspace() {
        this.log('Starting comprehensive workspace audit...', 'info');
        
        // 1. Check package.json for inconsistencies
        await this.auditPackageJson();
        
        // 2. Find broken file references
        await this.findBrokenReferences();
        
        // 3. Identify obsolete files
        await this.identifyObsoleteFiles();
        
        // 4. Check naming consistency
        await this.checkNamingConsistency();
        
        // 5. Find dead code
        await this.findDeadCode();
        
        // 6. Audit Docker configurations
        await this.auditDockerConfigs();
        
        // 7. Check for duplicate content
        await this.findDuplicateContent();
        
        this.generateReport();
    }

    async auditPackageJson() {
        this.log('Auditing package.json...', 'info');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync(this.config.packageJsonPath, 'utf8'));
            
            // Check for references to non-existent files
            const scripts = packageJson.scripts || {};
            for (const [scriptName, command] of Object.entries(scripts)) {
                // Check for file references in scripts
                const fileMatches = command.match(/node\s+([^\s]+\.js)/g);
                if (fileMatches) {
                    for (const match of fileMatches) {
                        const filePath = match.replace('node ', '');
                        if (!fs.existsSync(filePath)) {
                            this.issues.brokenReferences.push({
                                type: 'package_script',
                                script: scriptName,
                                missingFile: filePath,
                                command: command
                            });
                        }
                    }
                }
                
                // Check for outdated script patterns
                if (command.includes('Start-') || command.includes('start-lmstudio.js')) {
                    this.issues.obsoleteFiles.push({
                        type: 'outdated_script',
                        script: scriptName,
                        command: command,
                        reason: 'References archived/obsolete files'
                    });
                }
            }
            
        } catch (error) {
            this.issues.configurationIssues.push({
                type: 'package_json_error',
                error: error.message
            });
        }
    }

    async findBrokenReferences() {
        this.log('Scanning for broken file references...', 'info');
        
        const filesToScan = await this.getFilesToScan();
        
        for (const filePath of filesToScan) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                this.stats.filesScanned++;
                
                // Look for require/import statements
                const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
                const importMatches = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
                
                [...requireMatches, ...importMatches].forEach(match => {
                    const modulePath = this.extractModulePath(match);
                    if (modulePath && modulePath.startsWith('./') || modulePath.startsWith('../')) {
                        const resolvedPath = path.resolve(path.dirname(filePath), modulePath);
                        if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.js')) {
                            this.issues.brokenReferences.push({
                                type: 'import_reference',
                                file: filePath,
                                missingModule: modulePath,
                                line: this.findLineNumber(content, match)
                            });
                        }
                    }
                });
                
                // Look for file path references in comments and strings
                const pathMatches = content.match(/['"`][\w\-\.\/\\]+\.(js|ts|json|yml|yaml|md)['"`]/g) || [];
                pathMatches.forEach(match => {
                    const cleanPath = match.slice(1, -1);
                    if ((cleanPath.startsWith('./') || cleanPath.startsWith('../')) && 
                        !fs.existsSync(path.resolve(path.dirname(filePath), cleanPath))) {
                        this.issues.brokenReferences.push({
                            type: 'path_reference',
                            file: filePath,
                            missingPath: cleanPath,
                            line: this.findLineNumber(content, match)
                        });
                    }
                });
                
            } catch (error) {
                this.log(`Error scanning ${filePath}: ${error.message}`, 'error');
            }
        }
    }

    async identifyObsoleteFiles() {
        this.log('Identifying obsolete files and references...', 'info');
        
        // Known obsolete patterns
        const obsoletePatterns = [
            /Start-.*\.js$/,
            /test-.*-no-openai\.js$/,
            /sir-.*\.js$/,
            /\.env\.playground/,
            /teams/i,
            /azure/i,
            /m365/i
        ];
        
        const filesToCheck = await this.getFilesToScan();
        
        for (const filePath of filesToCheck) {
            // Check if file matches obsolete patterns
            obsoletePatterns.forEach(pattern => {
                if (pattern.test(path.basename(filePath))) {
                    this.issues.obsoleteFiles.push({
                        type: 'obsolete_file',
                        file: filePath,
                        pattern: pattern.toString()
                    });
                }
            });
            
            // Check file content for obsolete references
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                if (content.includes('Start-Lmstudio') || content.includes('start-lmstudio')) {
                    this.issues.obsoleteFiles.push({
                        type: 'obsolete_reference',
                        file: filePath,
                        issue: 'References obsolete LMStudio starter files'
                    });
                }
                
                if (content.includes('Teams') || content.includes('Azure') || content.includes('M365')) {
                    this.issues.obsoleteFiles.push({
                        type: 'obsolete_reference',
                        file: filePath,
                        issue: 'Contains removed Azure/Teams references'
                    });
                }
                
            } catch (error) {
                // Ignore binary files
            }
        }
    }

    async checkNamingConsistency() {
        this.log('Checking naming consistency...', 'info');
        
        const filesToCheck = await this.getFilesToScan();
        const namingIssues = new Set();
        
        filesToCheck.forEach(filePath => {
            const basename = path.basename(filePath);
            const dirname = path.dirname(filePath);
            
            // Check for inconsistent casing
            if (basename.includes('Start-') || basename.includes('Sir-')) {
                namingIssues.add({
                    file: filePath,
                    issue: 'PascalCase naming in archived context',
                    suggestion: 'Should use kebab-case or camelCase'
                });
            }
            
            // Check for duplicate naming patterns
            const similar = filesToCheck.filter(f => 
                f !== filePath && 
                path.basename(f).toLowerCase().replace(/[-_]/g, '') === 
                basename.toLowerCase().replace(/[-_]/g, '')
            );
            
            if (similar.length > 0) {
                namingIssues.add({
                    file: filePath,
                    issue: 'Similar naming to other files',
                    duplicates: similar
                });
            }
        });
        
        this.issues.inconsistentNaming = Array.from(namingIssues);
    }

    async findDeadCode() {
        this.log('Scanning for dead code...', 'info');
        
        // Look for TODO, FIXME, DEPRECATED comments
        const filesToScan = await this.getFilesToScan();
        
        for (const filePath of filesToScan) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                const todoMatches = content.match(/\/\/.*?(TODO|FIXME|DEPRECATED|XXX|HACK).*$/gmi) || [];
                todoMatches.forEach(match => {
                    this.issues.deadCode.push({
                        type: 'todo_comment',
                        file: filePath,
                        comment: match.trim(),
                        line: this.findLineNumber(content, match)
                    });
                });
                
                // Look for unused exports
                if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
                    const exportMatches = content.match(/module\.exports\s*=\s*\w+|exports\.\w+/g) || [];
                    // This would need cross-file analysis to be complete
                }
                
            } catch (error) {
                // Ignore binary files
            }
        }
    }

    async auditDockerConfigs() {
        this.log('Auditing Docker configurations...', 'info');
        
        const dockerFiles = [
            'docker-compose.yml',
            'docker-compose.dev.yml', 
            'docker-compose.prod.yml',
            'docker-compose.unified.yml',
            'Dockerfile',
            'Dockerfile.h3x',
            'Dockerfile.sir'
        ];
        
        dockerFiles.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for references to non-existent files
                    const contextMatches = content.match(/context:\s*['"](.*?)['"]/g) || [];
                    contextMatches.forEach(match => {
                        const contextPath = match.match(/['"](.*?)['"]/)[1];
                        if (!fs.existsSync(contextPath)) {
                            this.issues.configurationIssues.push({
                                type: 'docker_context',
                                file: file,
                                missingPath: contextPath
                            });
                        }
                    });
                    
                    // Check for references to obsolete scripts
                    if (content.includes('Start-') || content.includes('start-lmstudio')) {
                        this.issues.obsoleteFiles.push({
                            type: 'docker_obsolete_reference',
                            file: file,
                            issue: 'References obsolete startup scripts'
                        });
                    }
                    
                } catch (error) {
                    this.issues.configurationIssues.push({
                        type: 'docker_read_error',
                        file: file,
                        error: error.message
                    });
                }
            }
        });
    }

    async findDuplicateContent() {
        this.log('Checking for duplicate content...', 'info');
        
        // This is a simplified version - could be enhanced with content hashing
        const filesToScan = await this.getFilesToScan();
        const contentMap = new Map();
        
        for (const filePath of filesToScan) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const contentHash = this.simpleHash(content);
                
                if (contentMap.has(contentHash)) {
                    this.issues.duplicateContent.push({
                        type: 'duplicate_content',
                        files: [contentMap.get(contentHash), filePath],
                        hash: contentHash
                    });
                } else {
                    contentMap.set(contentHash, filePath);
                }
            } catch (error) {
                // Ignore binary files
            }
        }
    }

    async getFilesToScan() {
        const files = [];
        
        const scanDir = (dir) => {
            if (this.config.excludeDirs.some(exclude => dir.includes(exclude))) {
                return;
            }
            
            try {
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDir(fullPath);
                    } else if (this.config.fileExtensions.some(ext => item.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip inaccessible directories
            }
        };
        
        scanDir(this.config.rootDir);
        return files;
    }

    extractModulePath(importStatement) {
        const match = importStatement.match(/['"`]([^'"`]+)['"`]/);
        return match ? match[1] : null;
    }

    findLineNumber(content, searchText) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return -1;
    }

    simpleHash(content) {
        // Simple hash function for content comparison
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    generateReport() {
        this.log('Generating audit report...', 'info');
        
        const totalIssues = Object.values(this.issues).reduce((sum, arr) => sum + arr.length, 0);
        this.stats.issuesFound = totalIssues;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 H3X-fLups Internal Audit Report');
        console.log('='.repeat(60));
        
        console.log(`\n📈 Statistics:`);
        console.log(`   Files Scanned: ${this.stats.filesScanned}`);
        console.log(`   Issues Found: ${this.stats.issuesFound}`);
        console.log(`   Fixes Applied: ${this.stats.fixesApplied}`);
        
        // Report each category
        for (const [category, issues] of Object.entries(this.issues)) {
            if (issues.length > 0) {
                console.log(`\n${this.getCategoryIcon(category)} ${this.formatCategoryName(category)} (${issues.length}):`);
                
                issues.slice(0, 5).forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${this.formatIssue(issue)}`);
                });
                
                if (issues.length > 5) {
                    console.log(`   ... and ${issues.length - 5} more`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 Recommendations:');
        this.generateRecommendations();
        console.log('='.repeat(60));
        
        // Save detailed report
        this.saveDetailedReport();
    }

    getCategoryIcon(category) {
        const icons = {
            brokenReferences: '🔗',
            obsoleteFiles: '🗑️',
            inconsistentNaming: '📝',
            deadCode: '💀',
            missingFiles: '❓',
            configurationIssues: '⚙️',
            duplicateContent: '📄',
            packageIssues: '📦'
        };
        return icons[category] || '❓';
    }

    formatCategoryName(category) {
        return category.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
    }

    formatIssue(issue) {
        switch (issue.type) {
            case 'package_script':
                return `Script "${issue.script}" references missing file: ${issue.missingFile}`;
            case 'import_reference':
                return `${path.basename(issue.file)}:${issue.line} - Missing import: ${issue.missingModule}`;
            case 'obsolete_file':
                return `${path.basename(issue.file)} - Matches obsolete pattern`;
            case 'obsolete_reference':
                return `${path.basename(issue.file)} - ${issue.issue}`;
            default:
                return JSON.stringify(issue);
        }
    }

    generateRecommendations() {
        console.log('   1. Update package.json scripts to remove obsolete file references');
        console.log('   2. Move archived files to proper archive directory');
        console.log('   3. Update import statements to use current file structure');
        console.log('   4. Standardize naming conventions across the workspace');
        console.log('   5. Remove or update TODO/FIXME comments');
        console.log('   6. Consolidate Docker configurations');
        console.log('   7. Run automated fixes with: npm run audit:fix');
    }

    saveDetailedReport() {
        const reportPath = 'internal-audit-report.json';
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            issues: this.issues,
            recommendations: [
                'Update package.json scripts',
                'Archive obsolete files',
                'Fix broken references',
                'Standardize naming',
                'Clean up dead code',
                'Consolidate configurations'
            ]
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`Detailed report saved to: ${reportPath}`, 'success');
    }

    async applyAutomaticFixes() {
        this.log('Applying automatic fixes...', 'fix');
        
        // This would contain safe automatic fixes
        // For now, just log what would be fixed
        
        console.log('\n🔧 Automatic fixes that could be applied:');
        console.log('   - Remove broken script references from package.json');
        console.log('   - Update file paths in documentation');
        console.log('   - Standardize file naming');
        console.log('   - Clean up obsolete comments');
        
        this.log('Manual review recommended before applying fixes', 'warning');
    }
}

// Main execution
async function main() {
    const audit = new H3XInternalAudit();
    
    const args = process.argv.slice(2);
    if (args.includes('--fix')) {
        await audit.scanWorkspace();
        await audit.applyAutomaticFixes();
    } else {
        await audit.scanWorkspace();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = H3XInternalAudit;
