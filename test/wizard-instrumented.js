module.exports = interactive;

var proxyquire = require('proxyquire');
var sinon = require('sinon');
var spy;
var wizard = proxyquire('../cli/commands/protect/wizard', {
  inquirer: {
    prompt: function (q, cb) {
      if (spy) {
        var res = q.reduce(function (acc, curr, i, all) {
          if (curr.when && !curr.when(acc)) {
            return acc;
          }
          var res = spy(curr, spy.callCount, i, all, acc);
          acc[curr.name] = res;
          return acc;
        }, {});

        return cb(res);
      }
      cb(q);
    },
  }
});

function respondWith(q, res) {
  if (res === undefined) {
    return null;
  }

  if (q.type === 'list') {
    return q.choices.map(function (choice) {
      if (choice.value.choice === res) {
        return choice;
      }
      return false;
    }).filter(Boolean).pop();
  }

  if (q.type === 'confirm') {
    return res;
  }

  // otherwise free text
  return res;
}

function getDefaultChoice(q) {
  var def = q.default;
  var choices = q.choices;
  return choices[def || 0];
}

function interactive(vulns, responses) {
  spy = sinon.spy(function (q, i) {
    var response = responses[i];

    if (response.indexOf('default:') === 0) {
      var def = getDefaultChoice(q);
      response = response.slice('default:'.length);
      if (def.value.choice !== response) {
        throw new Error('default did not match on ' + q.name + ', ' + def.value.choice + ' != ' + response);
      }
    }

    var res = respondWith(q, response);
    if (res === null) {
      throw new Error('missing prompt response to ' + q.name);
    }

    return res.value;
  });

  return wizard.interactive(vulns);
}