function topologicalSort(nodes, edges) {
  const ids = nodes.map((node) => node.id);
  const adjacency = new Map(ids.map((id) => [id, []]));
  const indegree = new Map(ids.map((id) => [id, 0]));

  for (const edge of edges) {
    adjacency.get(edge.from).push(edge.to);
    indegree.set(edge.to, indegree.get(edge.to) + 1);
  }

  const queue = ids.filter((id) => indegree.get(id) === 0);
  const order = [];

  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);

    for (const child of adjacency.get(id)) {
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) {
        queue.push(child);
      }
    }
  }

  return order;
}

module.exports = { topologicalSort };
