import fs from 'fs';
import path from 'path';

const SUB_DIRECTORIES = [
  'brands/',
  'regular/',
  'solid/',
];

const BASE_PATH = './assets/fontawesome-svgs';
const OUTPUT_BASE_PATH = 'fontawesome-svgs';

const fileTemplate = 'module.exports = %s';

const buildIconList = () => {
  const availableSVGS = [];
  SUB_DIRECTORIES.forEach((s_dir) => {
    const s_path = path.join(BASE_PATH, s_dir);
    fs
      .readdirSync(s_path)
      .filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-4) === '.svg');
      })
      .forEach((file) => {
        availableSVGS.push(path.join(OUTPUT_BASE_PATH, s_dir, file));
      });
  });

  console.log('availableSVGS');
  console.log(availableSVGS);
  const new_file = fileTemplate.replace('%s', JSON.stringify(availableSVGS, null, 4));

  fs.writeFile(
    './src/iconlist.js',
    new_file,
    'utf8',
    (err) => {
      if (err) {
        console.log(err.message);
      }
      console.log("Saved!");
    }
  );
}

buildIconList();
