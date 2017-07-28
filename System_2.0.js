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

  //Compile the template
  var compiled_template = Handlebars.compile(template);
  var data = YAML.load('./System_2.0.yml');
  console.log(data);

  //Render the data into the template
  var rendered = compiled_template(data);

  //Overwrite the contents of #target with the renderer HTML
  document.getElementById('target').innerHTML = rendered;
}
