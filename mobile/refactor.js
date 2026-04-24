const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    if (filePath.includes('ThemeContext.tsx') || filePath.includes('theme.ts') || filePath.includes('finance.ts')) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already refactored
    if (content.includes('useTheme(')) return;
    if (!content.includes('Colors.')) return;

    // We will keep `import { Colors }` from '.../theme' since `theme.ts` still exports `Colors` fallback.
    // BUT we will inject `const { colors: Colors } = useTheme();` locally, which SHADOWS the imported `Colors`! This is PERFECT JavaScript!
    // We just need to add the import for useTheme and ThemeColors.

    let depth = filePath.split(path.sep).length - path.resolve('./src').split(path.sep).length;
    let contextPath = depth === 1 ? '../contexts/ThemeContext' : '../../contexts/ThemeContext';
    let themePath = depth === 1 ? '../constants/theme' : '../../constants/theme';

    if (!content.includes('useTheme')) {
        content = `import { useTheme } from '${contextPath}';\nimport { ThemeColors } from '${themePath}';\n` + content;
    }

    if (content.includes('StyleSheet.create({')) {
        content = content.replace(/const styles = StyleSheet\.create\(\{/g, 'const getStyles = (Colors: ThemeColors) => StyleSheet.create({');
    }

    // Inject const { colors: Colors } = useTheme(); const styles = getStyles(Colors);
    let injected = false;

    content = content.replace(/(export function \w+\([^)]*\)\s*\{)/g, (match) => {
        injected = true;
        return match + '\n    const { colors: Colors } = useTheme();\n    const styles = getStyles(Colors);\n';
    });

    content = content.replace(/(export const \w+ = memo\(function \w+\([^)]*\)\s*\{)/g, (match) => {
        injected = true;
        return match + '\n    const { colors: Colors } = useTheme();\n    const styles = getStyles(Colors);\n';
    });

    content = content.replace(/(?<!export |const \w+ = memo\()function \w+\([^)]*\)\s*\{(?![\s\S]*useTheme)/g, (match) => {
        if (match.match(/function [A-Z]/)) {
            injected = true;
            return match + '\n    const { colors: Colors } = useTheme();\n    const styles = getStyles(Colors);\n';
        }
        return match;
    });

    if (injected) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Refactored: ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath);
        } else {
            processFile(dirPath);
        }
    });
}

walkDir(path.resolve('./src/components'));
walkDir(path.resolve('./src/screens'));
