# H3X Git Automation Tasks

This document explains how to use the VS Code tasks for Git operations.

## Available Tasks

### 1. Git: Commit Changes

This task helps you create well-formatted commits following the conventional commit format. 

To run:
- Press `Ctrl+Shift+P` and select "Tasks: Run Task"
- Select "Git: Commit Changes"

The task will:
- Show you the current git status
- Guide you through the commit creation process
- Format the commit message according to conventional commit standards

### 2. Git: Create PR

This task helps you create a detailed pull request.

To run:
- Press `Ctrl+Shift+P` and select "Tasks: Run Task"
- Select "Git: Create PR"

The task will:
- Check your current branch
- Ask if you want to push changes
- Let you specify PR title and description
- Create a PR file that you can use for GitHub

### 3. Git: Quick PR

This is a simplified version of the PR creation task for faster workflow.

To run:
- Press `Ctrl+Shift+P` and select "Tasks: Run Task"
- Select "Git: Quick PR"

### 4. Git: Interactive Mode

This task provides an interactive menu for all Git operations.

To run:
- Press `Ctrl+Shift+P` and select "Tasks: Run Task"
- Select "Git: Interactive Mode"

### 5. Git: Generate Changelog

This task generates a changelog based on Git commit history.

To run:
- Press `Ctrl+Shift+P` and select "Tasks: Run Task"
- Select "Git: Generate Changelog"

## Setting Up Keyboard Shortcuts

You can set up keyboard shortcuts for these tasks:

1. Open keyboard shortcuts (`Ctrl+K Ctrl+S`)
2. Search for "Tasks: Run Task"
3. Add a keybinding
4. In the "when" clause, use a condition like: `args.task == "Git: Commit Changes"`

Example key bindings:
- `Ctrl+Alt+C` for "Git: Commit Changes"
- `Ctrl+Alt+P` for "Git: Create PR"
- `Ctrl+Alt+I` for "Git: Interactive Mode"

## Conventional Commit Format

The Git automation uses the conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverting a previous commit

## Best Practices

1. **Keep commits focused**: Each commit should represent a single logical change.
2. **Write meaningful commit messages**: The commit message should clearly explain what the change does.
3. **Reference issues**: If the commit is related to an issue, reference it in the commit message.
4. **Create feature branches**: Always create a feature branch for new work.
5. **Review before commit**: Use the Git status output to review changes before committing.

## Troubleshooting

If you encounter issues:

1. Make sure you have Git installed and configured
2. Check that the `.git` folder exists in your project
3. Ensure your terminal has permission to run the scripts
4. Try running the commands manually from the terminal
