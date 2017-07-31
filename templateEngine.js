window.onload = function () {
  //Grab the inline template
  var template = document.getElementById('template').innerHTML;

  Handlebars.registerHelper('ifArray', function (object, options) {
    if (Array.isArray(object)) {return options.fn(this)}
    return options.inverse(this)
  });
  Handlebars.registerHelper('ifString', function (object, options) {
    if (Object.prototype.toString.call(object) === "[object String]") {return options.fn(this)}
    return options.inverse(this)
  });
  Handlebars.registerHelper('ifObject', function (object, options) {
    if (Object.prototype.toString.call(object) === "[object Object]") {return options.fn(this)}
    return options.inverse(this)
  });

  var cacheBuster = "?" + Date.now()

  //Compile the template
  let compiled_template = Handlebars.compile(template);
  let characterData = YAML.load('./data/Characters.yaml' + cacheBuster);
  let systemData = YAML.load('./data/System.yaml' + cacheBuster);
  let actionData = YAML.load('./data/ComplexActions.yaml' + cacheBuster);
  let simpleActionData = YAML.load('./data/SimpleActions.yaml' + cacheBuster);
  let featData = YAML.load('./data/Feats.yaml' + cacheBuster);


  console.log(systemData);
  console.log(actionData);
  var data = deepmerge.all([characterData, systemData, actionData, simpleActionData, featData]);
  console.log(data);

  //Render the data into the template
  var rendered = compiled_template(data);

  //Overwrite the contents of #target with the renderer HTML
  document.getElementById('target').innerHTML = rendered;
}
