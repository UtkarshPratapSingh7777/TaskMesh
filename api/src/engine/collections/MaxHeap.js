class MaxHeap {
  constructor(compare) {
    this.compare = compare;
    this.items = [];
  }

  size() {
    return this.items.length;
  }

  peek() {
    return this.items[0] || null;
  }

  insert(item) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
    return item;
  }

  extract() {
    if (this.items.length === 0) {
      return null;
    }
    if (this.items.length === 1) {
      return this.items.pop();
    }
    const root = this.items[0];
    this.items[0] = this.items.pop();
    this.bubbleDown(0);
    return root;
  }

  remove(predicate) {
    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      if (!predicate(this.items[index])) {
        continue;
      }
      const last = this.items.pop();
      if (index < this.items.length) {
        this.items[index] = last;
        this.bubbleDown(index);
        this.bubbleUp(index);
      }
    }
  }

  toArray() {
    return [...this.items];
  }

  bubbleUp(index) {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.items[current], this.items[parent]) <= 0) {
        break;
      }
      this.swap(current, parent);
      current = parent;
    }
  }

  bubbleDown(index) {
    let current = index;
    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let best = current;

      if (left < this.items.length && this.compare(this.items[left], this.items[best]) > 0) {
        best = left;
      }
      if (right < this.items.length && this.compare(this.items[right], this.items[best]) > 0) {
        best = right;
      }
      if (best === current) {
        break;
      }
      this.swap(current, best);
      current = best;
    }
  }

  swap(a, b) {
    const temp = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = temp;
  }
}

module.exports = { MaxHeap };
