const CSSParser = require("./CSSParser");

if (!process.argv || process.argv.length < 3 ) {  
  CSSParser.printHelp();
  return;
}


css = new CSSParser(process.argv[2]);
css.parseAndSave();


