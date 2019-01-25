$ = require('jquery');

function orClick(evt) {
  console.log("Hello");
  console.log(evt);
  console.log(evt.target);
}

function getMsgs() {
  $.get("/msgs", function(data) {
    const dp = JSON.parse(data);
    console.log(dp);
    //console.log(dp);
    $("#messages").empty();
    const listStyle = "style='padding-bottom: 2em;'";
    for (let i = 0; i < dp.length; i++) {
      const id = dp[i]._id;
      const ts = dp[i].timestamp;
      const date = new Date(ts);
      const user = dp[i].user;
      const msg = dp[i].msg;
      const choices = dp[i].tags;
      const m = msg.match(/([^\.]+\.)? ?([^\s]+) or ([^\s]+)\?/);
      if (m !== null) {
        const context = 1;
        const choiceA = 2;
        const choiceB = 3;
        var c1c = 0;
        if (choices !== undefined && choices[m[choiceA]] !== undefined) {
          c1c = parseInt(choices[m[choiceA]]);
        }
        var c2c = 0;
        if (choices !== undefined && choices[m[choiceB]] !== undefined) {
          c2c = parseInt(choices[m[choiceB]]);
        }
        const t = c1c + c2c;
        const choice1 = t > 0 ? "" + Math.round(c1c * 100 / t) + "%" : "";
        const choice2 = t > 0 ? "" + Math.round(c2c * 100 / t) + "%" : "";
        const block =
          "<div>" +
          date.toLocaleString() + " " + user + " > " +
          "<div>" +
          (m[context] !== undefined ? "<span>" + m[context] + "</span> " : "") +
          "<input type='button' id='" + id +
          "' style='display: inline-block; padding: 10px; border: 1px solid black;' value='" + m[choiceA] +
          " (" + choice1 + ")" +
          "'></input>" +
          " or " +
          "<input type='button' id='" + id +
          "' style='display: inline-block; padding: 10px; border: 1px solid black;' value='" + m[choiceB] +
          " (" + choice2 + ")" +
          "'></input>" +
          "?" +
          "</div>" +
          "</div>";
        $("#messages")
          .append("<li " + listStyle + ">" + block + "</li>")
      } else {
        $("#messages").append("<li " + listStyle + ">" + dp[i].msg + "</li>")
      }
    }
    $("#messages")
      .find("input")
      .click(function(evt) {
        $.post("postclick", {
          msgid: evt.target.id,
          tag: $(evt.target).val()
        }, function(data) {
          getMsgs();
          //console.log("response", data);
        });
      });
  });
}

$("body").append(`
    <h1>Messages</h1>
    <ul id="messages">
    </ul>
    <h1>Input</h1>
    <p>
      <p>Type a question in the form "A or B?" or free text.</p>
      <input id="testinput"type="text"></input>
    </p>
`);

$("#testinput").on('keypress', function(e) {
  if (e.which == 13) {
    $.post("./postmsg", {
      value: $("#testinput").val()
    }, function(data) {
      //$("body").append(data);
      getMsgs();
      $("#testinput").val("");
    });
  }
});

$(function() {
  getMsgs();
});
