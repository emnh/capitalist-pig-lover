$ = require('jquery');

$("body").append(`
    Hello from Express 2 !
    <input id="testinput"type="text"></input>
`);

$("#testinput").change(function() {
  $.post("./testinput", {
    value: $("#testinput").val()
  }, function(data) {
    $("body").append(data);
  });
});

$(function() {
  $.get("/docs", function(data) {
    $("body").prepend(data);
  });
});
