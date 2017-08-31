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

  var tempSave;

  //Grab the inline template
  var template = document.getElementById('template').innerHTML;

  /* FUNCTIONS */

  function addObjToArray(obj) {
    var isArray = (typeof obj === "object" && obj.length && obj.length > 0);
    var arr = [];
    if(isArray) {
      arr = arr.concat(obj);
    } else if(typeof obj === "string") {
      arr.push(obj);
    }
    return arr;
  }

  function mergeObjectasArray(obj, obj2, key, addObj) {
    var tempObj = $.extend(true, {}, obj); //parentObj
    var tempObj2 = $.extend(true, {}, obj2); // objJson
    var arr = [];
    if(addObj === true) {
      arr = arr.concat(addObjToArray(tempObj[key]));
    }
    if(tempObj2[key]) {
      arr = arr.concat(addObjToArray(tempObj2[key]));
    }
    return arr;
  }

  function arrayRemove(array, element) {
    return array.filter(e => e !== element);
  }

  function arrayAdd(array, element) {
    var has = array.filter(e => e === element);
    if( !has.length > 0 ) {
      array.push(element);
    }
    return array;
  }

  function jsonKeyValue(key, value) {
    return "{\"" + key + "\":\"" + value + "\"}";
  }

  function getJsonFrom(str) {
    var arr = str.replace(/\s*->\s*/g ,"->")
                 .replace("->", ":")
                 .replace(/\s*->\s*/g, " -> ")
                 .split(":");

    return JSON.parse(jsonKeyValue(arr[0], arr[1]));
  }

  function modifyJsonUsing(obj, obj2, key, addObj) {
    var tempObj = $.extend(true, {}, obj);
    var tempObj2 = $.extend(true, {}, obj2);
    if(tempObj[key]) {
      var arr = mergeObjectasArray(tempObj, tempObj2, key, addObj);
      var sign = tempObj[key][0];
      var str = tempObj[key].substring(1);

      if(sign === "-") {
        arr = arrayRemove(arr, str);
      } else if(sign === "+") {
        arr = arrayAdd(arr, str);
      }

      tempObj[key] = arr;

      if(sign === "x") {
        delete tempObj[key];
      }
      return tempObj;
    }
    return tempObj;
  }

  function getObjectFromJson(str) {
    var arr = str.replace("[", "").replace("]", "").replace(/"/g,"").split(",");
    var json = {};
    arr.forEach(function(element){
      var elementJson = getJsonFrom(element);
      elementJson = modifyJsonUsing(elementJson, json, 'Special', false);
      elementJson = modifyJsonUsing(elementJson, json, 'Oppose', false);
      elementJson = modifyJsonUsing(elementJson, json, 'Penalty', false);
      elementJson = modifyJsonUsing(elementJson, json, 'Protects', false);

      if(elementJson.Penalty) {

      }

      json = $.extend(true, json, elementJson);
      
    });
    return json;
  }

  const isObject = (obj) => {
    return obj && (typeof obj === "object");
  };

  const isArray = (obj) => {
    return obj && $.isArray(obj);
  };

  function addCardArrayText(clazz, tag, text) {
    var html = "<div class=\""+ clazz +"-Equipment-item-" + tag + "\"><span><b>" + tag +": </b></span><ul>";
    for(var element in text) {
        html+="<li>" + text[element] + "</li>";
    }
    return html + "</ul>" + "</div>";
  }

  function addCardObjectText(clazz, tag, text) {
    var html = "<div class=\""+ clazz +"-Equipment-item-" + tag + "\"><span><b>" + tag +": </b></span><ul>";
    for(var key in text) {
      html+="<li><b>" + key + ": </b>";
      if(tag === "Quality" && isArray(text[key])) {
        var innerArray = text[key];
        html += "<ul>"
        for( var key2 in innerArray) {
          html+= "<li>" + innerArray[key2] +"</li>";
        }
        html += "</ul></li>";
      } else {
       html += text[key] + "</li>";
      }
    }
    return html + "</ul>" + "</div>";
  }

  function addCardLineText(clazz, tag, text) {
    return "<div class=\""+ clazz +"-Equipment-item-" + tag + "\"><span><b>" + tag +": </b></span>" + text + "</div>";
  }

  function unpackageJson(tag, json) {
    var html = "";
    for(var key in json) {
      if(isArray(json[key])) {
        html += (json[key].length > 1) 
          ? addCardArrayText(tag, key, json[key]) 
          : addCardLineText(tag, key, json[key][0]);
      } else if(isObject(json[key])) {
        html += (Object.keys(json[key]).length > 1)
          ? addCardObjectText(tag, key, json[key])
          : addCardLineText(tag, key, json[key][Object.keys(json[key])[0]]);
      } else {
        html += addCardLineText(tag, key, json[key]);
      }
    }
    return html;
  }

  function modifyJsonUsingParent(obj, obj2, key, addObj) {
    var tempObj = $.extend(true, {}, obj); // parentObj
    var tempObj2 = $.extend(true, {}, obj2); //objJson
    var arr = [];
    if(tempObj[key]) {
      arr = mergeObjectasArray(tempObj, tempObj2, key, addObj);
      if(tempObj2[key] === "None") {
        arr = arrayRemove(arr, "None");
      }
      tempObj[key] = arr;
      delete tempObj2[key];
      return tempObj;
    }
    return tempObj;
  }

  function getJsonObject(parentObj, objJson) {
    var json = $.extend(false, {}, parentObj, objJson);
    var modificationsQuality = JSON.parse("{\"Quality\":" + JSON.stringify(json.Modifications.Quality) + "}");
    
    json = $.extend(false, json, modificationsQuality);
    if(!json.Default ) {
      if(objJson.Difficulty) {
        json.Difficulty = parentObj.Difficulty + parseInt(json.Difficulty);
      }
      if(objJson.Reduction) {
        json.Reduction = parentObj.Reduction + parseInt(json.Reduction);
      }
    }

    delete json.Modifications;
    delete json.Default;

    return json;
  }
  /* FUNCTIONS END*/

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
    return value.split(regex).join(replacement);
  });

  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });

  Handlebars.registerHelper('tempSave', function(key, context) {
    tempSave = {
      [key] : context
    };
  });

  Handlebars.registerHelper('getValue', function(tempSaveKey, objKey) {
    var parentObj = $.extend(true, {}, tempSave[tempSaveKey]);
    if(objKey === "null") {return unpackageJson(tempSaveKey, parentObj);}
    var obj = parentObj.Modifications.Types[objKey];
    var objJson = getObjectFromJson(JSON.stringify(obj));

    objJson = modifyJsonUsingParent(objJson, parentObj, 'Special', true);
    objJson = modifyJsonUsingParent(objJson, parentObj, 'Oppose', true);
    objJson = modifyJsonUsingParent(objJson, parentObj, 'Protects', true);
    objJson = modifyJsonUsingParent(objJson, parentObj, 'Penalty', true);
    var json = getJsonObject(parentObj, objJson);
    var html = unpackageJson(objKey, json);

    return html;
  });

   var getPartial = (partialName, url) => {
      $.ajax({
          url: url + ".partial",
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

    /* Root Partials*/
    getRootPartial("tableOfContentsPartial", "table_of_contents");

    /* Character Info Partials */
    getCharacterInfoPartial("characterPartial", "characterInfo");
    getCharacterInfoPartial("typeListPartial", "characterInfo_TypeList");
    getCharacterInfoPartial("advancementPartial", "characterInfo_advancement");

    /* System Partials */
    getSystemPartial("systemPartial", "system");
    getSystemPartial("systemActionPartial", "system_action");
    getSystemPartial("systemActionSimplePartial", "system_action_simple");
    getSystemPartial("systemActionComplexPartial", "system_action_complex");
    getSystemPartial("systemActionTypesPartial", "system_action_types");
    getSystemPartial("systemNotationsPartial", "system_notations");
    getSystemPartial("systemDescriptionsPartial", "system_descriptions");
    getSystemPartial("systemFeatsPartial", "system_feats");
    getSystemPartial("descriptionsTextPartial", "descriptions_text");
    getSystemPartial("systemEquipmentPartial", "system_equipment");
    getSystemPartial("actionResolutionPartial", "system_action_resolution");
    getSystemPartial("timeResolutionPartial", "system_time_resolution");
    getSystemPartial("combatPartial", "system_combat");
    getSystemPartial("systemEquipmentDescPartial", "system_equipment_description");

  var cacheBuster = "?" + Date.now()

  //Compile the template
  let compiled_template = Handlebars.compile(template);
  let characterData     = YAML.load( DATA_DIR + '/Characters.yaml' + cacheBuster);
  let systemData        = YAML.load( DATA_DIR + '/System.yaml' + cacheBuster);
  let actionData        = YAML.load( DATA_DIR + '/ComplexActions.yaml' + cacheBuster);
  let simpleActionData  = YAML.load( DATA_DIR + '/SimpleActions.yaml' + cacheBuster);
  let featData          = YAML.load( DATA_DIR + '/Feats.yaml' + cacheBuster);
  let weaponData        = YAML.load( DATA_DIR + '/Weapons.yaml' + cacheBuster);
  let armorData         = YAML.load( DATA_DIR + '/Armor.yaml' + cacheBuster);

  var data = deepmerge.all([characterData, systemData, actionData, simpleActionData, featData, weaponData, armorData]);
  //console.log(Handlebars.partials);
  console.log("data", data);
  //var json = getObjectFromJson(JSON.stringify(data.System.Equipment.Weapons.Descriptions.Sword.Modifications.Type.Dagger));
  //console.log("data trans", json);

  //unpackageJson(json);

  //console.log(Handlebars.partials)

  //Render the data into the template
  var rendered = compiled_template(data);

  //Overwrite the contents of #target with the renderer HTML
  document.getElementById('target').innerHTML = rendered;
}
