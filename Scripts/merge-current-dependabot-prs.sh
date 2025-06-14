#!/bin/bash

# Merge Current Dependabot PRs Script
# This script helps merge the currently open Dependabot PRs safely

set -e

echo "🤖 Merging Current Dependabot PRs"
echo "================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "   Visit: https://cli.github.com/"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Function to check CI status
check_ci_status() {
    local pr_number=$1
    echo "   Checking CI status for PR #$pr_number..."
    
    # Get check status
    local status=$(gh pr checks $pr_number --json state --jq '.[].state' 2>/dev/null || echo "UNKNOWN")
    
    if [[ "$status" == *"SUCCESS"* ]] && [[ "$status" != *"FAILURE"* ]]; then
        echo "   ✅ CI checks passed"
        return 0
    elif [[ "$status" == *"FAILURE"* ]]; then
        echo "   ❌ CI checks failed"
        return 1
    else
        echo "   ⏳ CI checks pending or unknown status"
        return 2
    fi
}

# Function to merge PR
merge_pr() {
    local pr_number=$1
    local title=$2
    
    echo "   🔄 Merging PR #$pr_number..."
    
    if gh pr merge $pr_number --squash --delete-branch; then
        echo "   ✅ Successfully merged PR #$pr_number"
        return 0
    else
        echo "   ❌ Failed to merge PR #$pr_number"
        return 1
    fi
}

# Get all open Dependabot PRs
echo "📋 Fetching open Dependabot PRs..."
dependabot_prs=$(gh pr list --author "dependabot[bot]" --json number,title,headRefName --jq '.[] | "\(.number)|\(.title)"')

if [[ -z "$dependabot_prs" ]]; then
    echo "✅ No open Dependabot PRs found."
    exit 0
fi

echo "Found the following Dependabot PRs:"
echo "$dependabot_prs" | while IFS='|' read -r number title; do
    echo "  - PR #$number: $title"
done
echo ""

# Process each PR
echo "🔄 Processing PRs..."
echo ""

# Define safe PRs (these are the ones we updated workflows for)
declare -A safe_prs
safe_prs[18]="docker/build-push-action v4→v6 (workflows updated)"
safe_prs[16]="actions/dependency-review-action v3→v4 (workflows updated)"
safe_prs[15]="docker/setup-buildx-action v2→v3 (workflows updated)"
safe_prs[14]="peter-evans/create-pull-request v5→v7 (workflows updated)"
safe_prs[13]="fdir patch update (safe)"

# Process each PR
echo "$dependabot_prs" | while IFS='|' read -r number title; do
    echo "📦 Processing PR #$number: $title"
    
    # Check if this is a safe PR
    if [[ -n "${safe_prs[$number]}" ]]; then
        echo "   ✅ Safe to merge: ${safe_prs[$number]}"
        
        # Check CI status
        if check_ci_status $number; then
            # Merge the PR
            if merge_pr $number "$title"; then
                echo "   🎉 PR #$number merged successfully"
            else
                echo "   ⚠️  Failed to merge PR #$number - please merge manually"
            fi
        else
            echo "   ⏳ Skipping PR #$number - CI not ready"
        fi
    else
        echo "   ⚠️  PR #$number requires manual review"
        echo "   📝 Please review this PR manually before merging"
    fi
    
    echo ""
done

echo "🏁 Processing complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check for any remaining PRs that need manual review"
echo "   2. Monitor the new auto-merge workflow for future PRs"
echo "   3. Review the Dependabot Resolution Guide: docs/DEPENDABOT-RESOLUTION-GUIDE.md"
echo ""
echo "🔧 To run the merge helper in the future:"
echo "   npm run dependabot:merge"
