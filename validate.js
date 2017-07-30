var page = require('webpage').create();
var success = true

page.open('https://pegwymonie.github.io/System_2.0.html', function (status) {
  if (status !== "success") {success = false;}
  console.log("Final Status: " + (success ? "Success" : "Failed"));
  phantom.exit();
});

page.onResourceReceived = function (response) {
  if (response.status !== 200) {
    success = false
    console.log("Failed to get resource: " + response.url)
  }
};
