const agentQuotas = require('../data/agents.json');

function distributeCalls(callLog, dncList) {
  const assignments = {};
  const filteredCalls = callLog.filter(c => !dncList.includes(c.number));

  Object.keys(agentQuotas).forEach(agent => {
    assignments[agent] = [];
  });

  let index = 0;
  filteredCalls.forEach(call => {
    const agent = Object.keys(agentQuotas)[index % Object.keys(agentQuotas).length];
    if (assignments[agent].length < agentQuotas[agent]) {
      assignments[agent].push(call);
    }
    index++;
  });

  return assignments;
}

module.exports = { distributeCalls };
