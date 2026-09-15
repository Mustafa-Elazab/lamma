import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(
  root,
  'src/assets/branding/app_icon_source_1024.png',
);

const androidDensities = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

for (const [density, size] of Object.entries(androidDensities)) {
  const outputDir = path.join(
    root,
    `android/app/src/main/res/mipmap-${density}`,
  );
  await mkdir(outputDir, { recursive: true });
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, 'ic_launcher.png'));

  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${
      size / 2
    }" r="${size / 2}" fill="white"/></svg>`,
  );
  const squareIcon = await sharp(source).resize(size, size).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: squareIcon, blend: 'over' },
      { input: circle, blend: 'dest-in' },
    ])
    .png()
    .toFile(path.join(outputDir, 'ic_launcher_round.png'));

  await sharp(source)
    .resize(size * 2.25, size * 2.25)
    .png()
    .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));
}

const iosIcons = [
  ['AppIcon-20.png', 20],
  ['AppIcon-20@2x.png', 40],
  ['AppIcon-20@3x.png', 60],
  ['AppIcon-29.png', 29],
  ['AppIcon-29@2x.png', 58],
  ['AppIcon-29@3x.png', 87],
  ['AppIcon-40.png', 40],
  ['AppIcon-40@2x.png', 80],
  ['AppIcon-40@3x.png', 120],
  ['AppIcon-60@2x.png', 120],
  ['AppIcon-60@3x.png', 180],
  ['AppIcon-76.png', 76],
  ['AppIcon-76@2x.png', 152],
  ['AppIcon-83.5@2x.png', 167],
  ['AppIcon-1024.png', 1024],
];
const iosOutput = path.join(
  root,
  'ios/Lamma/Images.xcassets/AppIcon.appiconset',
);
await mkdir(iosOutput, { recursive: true });
for (const [filename, size] of iosIcons) {
  await sharp(source)
    .resize(size, size)
    .flatten({ background: '#FFF8F4' })
    .png()
    .toFile(path.join(iosOutput, filename));
}

console.log('Generated Android and iOS launcher icons from', source);
