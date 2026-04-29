const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function main() {
  const svgPath = path.resolve(__dirname, '../client/public/favicon.svg');
  const publicDir = path.resolve(__dirname, '../client/public');
  const svg = fs.readFileSync(svgPath);

  const favicon32 = path.join(publicDir, 'favicon-32x32.png');
  const favicon16 = path.join(publicDir, 'favicon-16x16.png');
  const appleTouch = path.join(publicDir, 'apple-touch-icon.png');
  const faviconIco = path.join(publicDir, 'favicon.ico');

  await sharp(svg).resize(32, 32).png().toFile(favicon32);
  await sharp(svg).resize(16, 16).png().toFile(favicon16);
  await sharp(svg).resize(180, 180).png().toFile(appleTouch);

  const icoBuffer = await toIco([fs.readFileSync(favicon16), fs.readFileSync(favicon32)]);
  fs.writeFileSync(faviconIco, icoBuffer);

  console.log('Favicons generated');
}

main().catch((error) => {
  console.error('Failed to generate favicons:', error);
  process.exit(1);
});
