const fs = require('fs');
const path = require('path');

const mediaDir = './media';

// Verificar que existe la carpeta media
if (!fs.existsSync(mediaDir)) {
    console.error('❌ No existe la carpeta media/');
    process.exit(1);
}

const folders = fs.readdirSync(mediaDir);

folders.forEach(folder => {
    const folderPath = path.join(mediaDir, folder);
    
    if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath)
            .filter(file => file !== 'index.json' && !file.startsWith('.'));
        
        const indexData = { files };
        const indexPath = path.join(folderPath, 'index.json');
        
        fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
        
        console.log(`✓ ${folder}/ → ${files.length} archivos`);
    }
});

console.log('\n¡Todos los index.json generados! 🎉');