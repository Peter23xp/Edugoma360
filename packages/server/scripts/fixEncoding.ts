import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(process.cwd(), 'packages'));
let count = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/é/g, 'é')
        .replace(/è/g, 'è')
        .replace(/ê/g, 'ê')
        .replace(/ë/g, 'ë')
        .replace(/ç/g, 'ç')
        .replace(/à/g, 'à')
        .replace(/â/g, 'â')
        .replace(/î/g, 'î')
        .replace(/ï/g, 'ï')
        .replace(/ô/g, 'ô')
        .replace(/ö/g, 'ö')
        .replace(/ù/g, 'ù')
        .replace(/û/g, 'û')
        .replace(/ü/g, 'ü')
        .replace(/À/g, 'À')
        .replace(/Â/g, 'Â')
        .replace(/È/g, 'È')
        .replace(/É/g, 'É')
        .replace(/Ê/g, 'Ê')
        .replace(/Ë/g, 'Ë')
        .replace(/Î/g, 'Î')
        .replace(/Ô/g, 'Ô')
        .replace(/Ù/g, 'Ù')
        .replace(/Û/g, 'Û')
        .replace(/Ç/g, 'Ç')
        .replace(/œ/g, 'œ')
        .replace(/’/g, '’')
        .replace(/“/g, '“')
        .replace(/"\x9D/g, '”')
        .replace(/‰/g, '‰')
        .replace(/"\x93/g, '–')
        .replace(/°/g, '°')
        .replace(/…/g, '…');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed encoding in:', file);
        count++;
    }
}

console.log(`Total files fixed: ${count}`);
