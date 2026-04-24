const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

fs.readdirSync(screensDir).forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;

    const filePath = path.join(screensDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    let changed = false;

    // Fix imports for contexts and constants
    if (content.includes("from '../../contexts/ThemeContext'")) {
        content = content.replace(/from '\.\.\/\.\.\/contexts\/ThemeContext'/g, "from '../contexts/ThemeContext'");
        changed = true;
    }
    if (content.includes("from '../../constants/theme'")) {
        content = content.replace(/from '\.\.\/\.\.\/constants\/theme'/g, "from '../constants/theme'");
        changed = true;
    }

    // Some components might have had `import { ThemeColors } from '../../constants/theme';`
    const lines = content.split('\n');
    const newLines = lines.map(line => {
        if (line.includes("from '../../constants/theme'") || line.includes("from '../../contexts/ThemeContext'")) {
            changed = true;
            return line.replace(/\.\.\/\.\.\//g, '../');
        }
        return line;
    });

    if (changed) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
        console.log('Fixed', file);
    }
});
