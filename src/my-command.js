// documentation: https://developer.sketchapp.com/reference/api/
import sketch from 'sketch';

const iconList = require('./iconlist.js');


const getUserIconSearch = () => {
  return new Promise((resolve, reject) => {
    sketch.UI.getInputFromUser(
      'Search for an icon by icon name.',
      {
        initialValue: 'bell',
      },
      (err, value) => {
        if (err) {
          reject('Invalid user input');
        }
        resolve(value);
      }
    );
  });
}

const getChoicesFromList = search => {
  const regex = new RegExp(search)
  return iconList.filter(o => o.match(regex));
}

const buildChoiceMap = choices => {
  const map = {};
  choices.forEach((c) => {
    const dirs = c.split('/');
    const iconname = dirs[dirs.length -1].replace('.svg', '');
    map[iconname] = c;
  });
  return map;
}

const getSelectionFromChoices = (choices) => {
  return new Promise((resolve, reject) => {
    sketch.UI.getInputFromUser("The following options matched.", {
      type: sketch.UI.INPUT_TYPE.selection,
      possibleValues: choices,
    }, (err, value) => {
      if (err) {
        reject(err);
      }
      resolve(value);
    });
  });
}

const createIcon = (f_path, layerName, context) => {
  new Promise((resolve, reject) => {
    try {
      const r_url = context.plugin.urlForResourceNamed(f_path).path();
      const svgImporter = MSSVGImporter.svgImporter();
      const svgURL = NSURL.fileURLWithPath(r_url);
      svgImporter.prepareToImportFromURL(svgURL);
      const svgLayer = svgImporter.importAsLayer();
      svgLayer.setName(layerName);

      const layer = sketch.fromNative(svgLayer);
      const document = sketch.getSelectedDocument();
      document.selectedPage.layers.push(layer);
      document.centerOnLayer(layer);
      resolve();
    } catch (e) {
      reject(e.message);
    }
  });
}

export default function(context) {
  let choiceMap;
  let layerName;
  getUserIconSearch()
  .then((u_input) => {
    const choices = getChoicesFromList(u_input);
    if (choices.length === 1) {
      layerName = u_input;
      return Promise.resolve(choices[0]);
    } else if (choices.length > 1) {
      choiceMap = buildChoiceMap(choices);
      return getSelectionFromChoices(Object.keys(choiceMap));
    }
    return Promise.reject(`No icons available for ${u_input}`);
  })
  .then((sel) => {
    if (choiceMap) {
      layerName = sel;
      sketch.UI.message(choiceMap[sel]);
      return createIcon(choiceMap[sel], layerName, context);
    } else {
      sketch.UI.message(sel);
      return createIcon(sel, layerName, context);
    }
  })
  .then(() => {
    sketch.UI.message(`Added ${layerName}`);
  })
  .catch((e) => {
    sketch.UI.message(e.message);
  });
}

