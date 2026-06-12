const { topologicalSort } = require('./TopoSort');

function hasCycle(nodes, edges) {
  return topologicalSort(nodes, edges).length !== nodes.length;
}

module.exports = { hasCycle };
