const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/data/protocolData.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/videoDesktop:\s*'[^']*',/g, "videoDesktop: '',");
content = content.replace(/videoMobile:\s*'[^']*',/g, "videoMobile: '',");

content = content.replace(
  /stepNumber:\s*'FASE 01'([\s\S]*?)videoDesktop:\s*'',/m,
  "stepNumber: 'FASE 01'$1videoDesktop: '/media/protocol/video desktop 3/--1.webm',"
);

fs.writeFileSync(file, content);
