// Global Defs. Wanted by cloud9
/*global Handlebars*/
/*global YAML*/
/*global $*/
/*global deepmerge*/


window.onload = function () {
  const PUBLIC_DIR                  = "./public";
  const PARTIALS_DIR                = PUBLIC_DIR + "/partials";
  const DATA_DIR                    = PUBLIC_DIR + "/data";
  const CHARACTER_INFO_PARTIALS_DIR = PARTIALS_DIR + "/character-info";
  const SYSTEM_PARTIALS_DIR         = PARTIALS_DIR +"/system";

  //Grab the inline template
  var template = document.getElementById('template').innerHTML;

  Handlebars.registerHelper('ifArray', function (object, options) {
    if (Array.isArray(object)) {return options.fn(this)}
    return options.inverse(this)
  });

  Handlebars.registerHelper('ifString', function (object, options) {
    if (Object.prototype.toString.call(object) === "[object String]") {
      return options.fn(this)
    }
    return options.inverse(this)
  });

  Handlebars.registerHelper('ifObject', function (object, options) {
    if (Object.prototype.toString.call(object) === "[object Object]") {return options.fn(this)}
    return options.inverse(this)
  });

  Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
  });

  Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    var operator = options.hash.operator || "==";
    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }
    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
    var result = operators[operator](lvalue,rvalue);
    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
  });

  Handlebars.registerHelper('replace', function(value, options) {
    var previousValue = value.toString();
    var regex = options.hash.toReplace || " ";
    var replacement = options.hash.replacement || "-";
    return value.replace(regex, replacement);
  });

  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });

   var getPartial = (partialName, url) => {
      $.ajax({
          url: url,
          dataType: 'html',
          async: false,
          success: function(html) {
              Handlebars.registerPartial(partialName, html);
          }
      });        
    }

    var getCharacterInfoPartial = (partialName, file) => {
      getPartial(partialName, CHARACTER_INFO_PARTIALS_DIR + "/" + file);
    }

    var getSystemPartial = (partialName, file) => {
      getPartial(partialName, SYSTEM_PARTIALS_DIR + "/" + file);
    }

    var getRootPartial = (partialName, file) => {
      getPartial(partialName, PARTIALS_DIR + "/" + file);
    }

  /* Partials */

    /* Character Info Partials */
    getCharacterInfoPartial("characterPartial", "characterInfo_partial");
    getCharacterInfoPartial("typeListPartial", "characterInfo_TypeList_partial");
    getCharacterInfoPartial("advancementPartial", "characterInfo_advancement_partial");

    /* System Partials */
    getSystemPartial("systemPartial", "system_partial");
    getSystemPartial("systemActionPartial", "system_action_partial");
    getSystemPartial("systemActionTypesPartial", "system_action_types_partial");
    getSystemPartial("systemNotationsPartial", "system_notations_partial");
    getSystemPartial("systemDescriptionsPartial", "system_descriptions_partial");
    getSystemPartial("systemFeatsPartial", "system_feats_partial");
    getSystemPartial("descriptionsTextPartial", "descriptions_text_partial");

  var cacheBuster = "?" + Date.now()

  //Compile the template
  let compiled_template = Handlebars.compile(template);
  let characterData     = YAML.load( DATA_DIR + '/Characters.yaml' + cacheBuster);
  let systemData        = YAML.load( DATA_DIR + '/System.yaml' + cacheBuster);
  let actionData        = YAML.load( DATA_DIR + '/ComplexActions.yaml' + cacheBuster);
  let simpleActionData  = YAML.load( DATA_DIR + '/SimpleActions.yaml' + cacheBuster);
  let featData          = YAML.load( DATA_DIR + '/Feats.yaml' + cacheBuster);
  let weaponData        = YAML.load( DATA_DIR + '/Weapons.yaml' + cacheBuster);


  var data = deepmerge.all([characterData, systemData, actionData, simpleActionData, featData, weaponData]);
  //console.log(Handlebars.partials);
  console.log(data);
  //console.log(Handlebars.partials)

  //Render the data into the template
  var rendered = compiled_template(data);

  //Overwrite the contents of #target with the renderer HTML
  document.getElementById('target').innerHTML = rendered;
}
