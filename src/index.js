$ = require('jquery');
d3 = require('d3');
c3 = require('c3');

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
          "<input type='button' data-tag='" + m[choiceA] + "' id='" + id +
          "' style='display: inline-block; padding: 10px; border: 1px solid black;' value='" + m[choiceA] +
          " (" + choice1 + ")" +
          //"'>" + "<span class='sub' id='" + m[choiceA] + "'" + "</span>" + "</input>" +
          "'></input>" +
          "<div style='display: inline-block; position: absolute; top: 15px;' id='chart1" + i + "'></div>" +
          " or " +
          "<input type='button' data-tag='" + m[choiceB] + "' id='" + id +
          "' style='display: inline-block; padding: 10px; border: 1px solid black;' value='" + m[choiceB] +
          " (" + choice2 + ")" +
          //"'>" + "<span class='sub' id='" + m[choiceB] + "'" + "</span>" + "</input>" +
          "'></input>" +
          "<div style='display: inline-block; position: absolute; top: 15px;' id='chart2" + i + "'></div>" +
          "?" +
          "</div>" +
          "</div>";
        $("#messages")
          .append("<li " + listStyle + ">" + block + "</li>")
        if (t > 0) {
          const genChart = function(choiceNum) {
            const colors = {};
            colors[m[choiceA]] = choiceNum == 1 ? '#0000FF' : '#FFFFFF';
            colors[m[choiceB]] = choiceNum == 1 ? '#FFFFFF' : '#0000FF';
            c3.generate({
              bindto: "#chart" + choiceNum + "" + i,
              size: {
                width: 40,
                height: 40
              },
              data: {
                  columns: [
                      [m[choiceA], c1c],
                      [m[choiceB], c2c],
                  ],
                  colors: colors,
                  type: 'pie',
              },
              legend: {
                show: false
              },
              pie: {
                label: {
                  format: function(value, ratio, id) {
                    return '';
                  }
                }
              }
            });
          };
          genChart(1);
          genChart(2);
          $("#chart1" + i + " .c3-chart-arc path").css("stroke", '#000000');
          $("#chart2" + i + " .c3-chart-arc path").css("stroke", '#000000');
        }
      } else {
        $("#messages").append("<li " + listStyle + ">" + dp[i].msg + "</li>")
      }
    }
    $("#messages")
      .find("input")
      .click(function(evt) {
        $.post("postclick", {
          msgid: evt.target.id,
          tag: evt.target.dataset.tag
        }, function(data) {
          getMsgs();
          //console.log("response", data);
        });
      });
  });
}

$("body").append(`
    <h1>Introduction</h1>
    <p>
    This is a chat forum where you are more likely to see messages from people who make the same choices as you in response to other chat messages.
    The main idea is that channels or topics are emergent based on a fluid decision stream rather than fixed.
    </p>
    <h1>Channel Messages for user "<span id='username'></span>"</h1>
    <h1>Most Recent Unfiltered Messages</h1>
    <ul id="messages">
    </ul>
    <h1>Input</h1>
    <p>
      <p>Type a question in the form "A or B? " or "This is a context sentence. A or B?" or free text.</p>
      <input id="testinput"type="text"></input>
    </p>
`);

$.get("/username", function(data) {
  $("#username").html(data);
});

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
