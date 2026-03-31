const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
};

const regexFooter = /className="(.*?)flex\s+justify-end\s+gap-3(.*?)"/g;

walk('packages/client/src/components', (filePath) => {
  if (filePath.endsWith('.tsx') && filePath.includes('Modal')) {
    let code = fs.readFileSync(filePath, 'utf8');
    let original = code;

    code = code.replace(regexFooter, (match, p1, p2) => {
      if (p1.includes('sm:flex-row') || p2.includes('sm:flex-row')) return match;
      return `className="${p1}flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4${p2}"`;
    });

    code = code.replace(/className="([^"]+?px-\d+\s+py-\d+[^"]*?)"/g, (match, btnClass) => {
      if (!btnClass.includes('w-full') && btnClass.includes('transition') && !btnClass.includes('fixed') && !btnClass.includes('absolute')) {
          return `className="${btnClass} w-full sm:w-auto"`;
      }
      return match;
    });

    if (code !== original) {
      fs.writeFileSync(filePath, code);
      console.log('Fixed layout in: ' + filePath);
    }
  }
});

walk('packages/client/src/pages', (filePath) => {
    if (filePath.endsWith('.tsx')) {
      let code = fs.readFileSync(filePath, 'utf8');
      let original = code;
  
      code = code.replace(regexFooter, (match, p1, p2) => {
        if (p1.includes('sm:flex-row') || p2.includes('sm:flex-row')) return match;
        return `className="${p1}flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4${p2}"`;
      });
  
      code = code.replace(/className="([^"]+?px-\d+\s+py-\d+[^"]*?)"/g, (match, btnClass) => {
        if (!btnClass.includes('w-full') && btnClass.includes('transition') && !btnClass.includes('fixed') && !btnClass.includes('absolute')) {
            return `className="${btnClass} w-full sm:w-auto"`;
        }
        return match;
      });
  
      if (code !== original) {
        fs.writeFileSync(filePath, code);
        console.log('Fixed layout in: ' + filePath);
      }
    }
  });
