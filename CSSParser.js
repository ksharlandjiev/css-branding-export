const css = require("css");
const fs = require('fs')

require.extensions['.css'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const defaultBrandingTags = ["line-height", "max-width", "max-height", "min-height", "min-width", "overflow", "font-family", "font-size", "font-weight", "background", "background-image", "background-position", "background-size", "background-repeat", "border-collapse", "color", "word-wrap", "border-color", "display", "list-style", "border", "border-top", "border-left", "border-bottom", "border-right", "content","box-shadow", "text-align", "text-shadow", "transition", "border-radius", "text-decoration", "outline", "filter", "opacity"];


module.exports = class CSSParser { 
    constructor( file = "" ) {
      if (!file || !fs.existsSync(file)){
        throw new Error( 'Unable to find file '+file)
      }
      this.cssFile = file;            
      this.tags = defaultBrandingTags;
      this.brandRules = [];
      this.structRules = [];

  }
  constructCssObject(rules) {
    return {
      type: 'stylesheet',
      stylesheet: {
        source: undefined,
        rules: rules
      }
    }
  }

  parseAndSave() {
    var raw = require(this.cssFile);
    try {
      const structure = css.parse(raw);  
      
      this.parse(structure);
      this.tryAndSave('./branding.css', css.stringify( this.constructCssObject(this.brandRules )));
      this.tryAndSave('./structure.css', css.stringify( this.constructCssObject(this.structRules )));
      
      
    } catch (error) {
      throw new Error("Failed to parse and save file: "+ error)
    }        
  }

  tryAndSave(filename, content) {
    try {
      fs.writeFileSync(filename, content, { encoding : 'utf8'});  
      console.log(filename + 'file generated succesfully.');      
    } catch (error) {
      throw new Error("Failed to generate "+filename+" file: "+ error)
    }
  }

  parse(cssObj) {
    const rules = cssObj.stylesheet.rules || [];

    for (var key in rules) {
      var rule = rules[key];
      this.process(rule);          
      // if (rule && rule.type && rule.type === 'rule' && rule.declarations) {      
      //   if (rule.declarations.length>0) {
          
      //   }        
      // }
    }
    
  }

  process (rule) {
    
    if (!rule || !rule.declarations || Object.keys(rule.declarations).length === 0) { 
      return;
    }
    //deeply clone object the old fasion way so we don't relay on node 11 and above.
    const brandRule = JSON.parse(JSON.stringify(rule))
    brandRule.declarations = [];  // empty declarations - we want only brand declarations here.
    
    for (var key in rule.declarations) {          
      const declaration = rule.declarations[key];
      if ( declaration && declaration.property && this.tags.indexOf(declaration.property.trim())>-1) {
        brandRule.declarations.push(declaration);   
        rule.declarations.splice(key, 1);
      }
    }
    
    (brandRule.declarations.length>0) && this.brandRules.push(brandRule);    
    if (rule.declarations && rule.declarations.length>0) {
      this.structRules.push(rule)
    } 
  }

  /**
   * Add new brand css tag
   * @param {string} tag 
   */
  addBrandTag(tag) {
    this.tags.push(tag);
  }

  static printHelp() {
    console.log("Usage: node index.js <css_file_to_parse>");
  }
}
