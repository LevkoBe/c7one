import { describe, it, expect } from "vitest";
import {
  initTree,
  splitLeafInTree,
  closeLeafInTree,
  updateLeafInTree,
  moveDividerInTree,
} from "../WindowContext";
import type {
  GroupNode,
  LeafNode,
  LayoutNodeDecl,
  PanelTreeNode,
} from "../WindowContext";

// ─── id generator helper ──────────────────────────────────────────────────────

function makeIdGen(prefix = "p") {
  let n = 0;
  return () => `${prefix}${++n}`;
}

// ─── initTree ─────────────────────────────────────────────────────────────────

describe("initTree — leaf declaration", () => {
  it("produces a LeafNode with a stable id", () => {
    const decl: LayoutNodeDecl = { type: "leaf", windowId: "editor" };
    const node = initTree(decl, makeIdGen());
    expect(node.type).toBe("leaf");
    expect((node as LeafNode).windowId).toBe("editor");
    expect((node as LeafNode).id).toBe("p1");
  });

  it("preserves isDefault and collapsed flags", () => {
    const decl: LayoutNodeDecl = {
      type: "leaf",
      windowId: "main",
      isDefault: true,
      collapsed: true,
    };
    const node = initTree(decl, makeIdGen()) as LeafNode;
    expect(node.isDefault).toBe(true);
    expect(node.collapsed).toBe(true);
  });

  it("windowId may be null", () => {
    const node = initTree({ type: "leaf", windowId: null }, makeIdGen()) as LeafNode;
    expect(node.windowId).toBeNull();
  });
});

describe("initTree — group with equal split", () => {
  it("two children → dividerPositions = [50]", () => {
    const decl: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      children: [
        { type: "leaf", windowId: "a" },
        { type: "leaf", windowId: "b" },
      ],
    };
    const node = initTree(decl, makeIdGen()) as GroupNode;
    expect(node.type).toBe("group");
    expect(node.dividerPositions).toEqual([50]);
  });

  it("three children → dividerPositions = [33.33…, 66.66…]", () => {
    const decl: LayoutNodeDecl = {
      type: "group",
      direction: "vertical",
      children: [
        { type: "leaf", windowId: "a" },
        { type: "leaf", windowId: "b" },
        { type: "leaf", windowId: "c" },
      ],
    };
    const node = initTree(decl, makeIdGen()) as GroupNode;
    expect(node.dividerPositions).toHaveLength(2);
    expect(node.dividerPositions[0]).toBeCloseTo(100 / 3, 5);
    expect(node.dividerPositions[1]).toBeCloseTo(200 / 3, 5);
  });
});

describe("initTree — group with explicit sizes", () => {
  it("sizes=[78, 22] → dividerPositions = [78]", () => {
    const decl: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      sizes: [78, 22],
      children: [
        { type: "leaf", windowId: "gallery" },
        { type: "leaf", windowId: "settings" },
      ],
    };
    const node = initTree(decl, makeIdGen()) as GroupNode;
    expect(node.dividerPositions).toEqual([78]);
  });

  it("sizes=[30, 40, 30] → dividerPositions = [30, 70]", () => {
    const decl: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      sizes: [30, 40, 30],
      children: [
        { type: "leaf", windowId: "a" },
        { type: "leaf", windowId: "b" },
        { type: "leaf", windowId: "c" },
      ],
    };
    const node = initTree(decl, makeIdGen()) as GroupNode;
    expect(node.dividerPositions).toEqual([30, 70]);
  });

  it("mismatched sizes length falls back to equal split", () => {
    const decl: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      sizes: [60], // wrong length for 2 children
      children: [
        { type: "leaf", windowId: "a" },
        { type: "leaf", windowId: "b" },
      ],
    };
    const node = initTree(decl, makeIdGen()) as GroupNode;
    expect(node.dividerPositions).toEqual([50]);
  });
});

describe("initTree — ids", () => {
  it("assigns unique incrementing ids to all nodes", () => {
    const decl: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      children: [
        { type: "leaf", windowId: "a" },
        { type: "leaf", windowId: "b" },
      ],
    };
    const node = initTree(decl, makeIdGen()) as GroupNode;
    const leafA = node.children[0] as LeafNode;
    const leafB = node.children[1] as LeafNode;
    // Leaves get ids before their parent (depth-first)
    expect(new Set([leafA.id, leafB.id, node.id]).size).toBe(3);
  });
});

// ─── splitLeafInTree ──────────────────────────────────────────────────────────

function leafTree(windowId = "a"): LeafNode {
  return { type: "leaf", id: "root", windowId };
}

describe("splitLeafInTree — root is the target leaf", () => {
  it("wraps root leaf in a new group (position=after)", () => {
    const root = leafTree("a");
    const result = splitLeafInTree(root, "root", "horizontal", "after", makeIdGen());
    expect(result.type).toBe("group");
    const g = result as GroupNode;
    expect(g.direction).toBe("horizontal");
    expect(g.dividerPositions).toEqual([50]);
    expect(g.children).toHaveLength(2);
    expect((g.children[0] as LeafNode).id).toBe("root");
    expect((g.children[1] as LeafNode).windowId).toBeNull();
  });

  it("position=before puts the new leaf first", () => {
    const root = leafTree("a");
    const result = splitLeafInTree(root, "root", "vertical", "before", makeIdGen()) as GroupNode;
    expect((result.children[0] as LeafNode).windowId).toBeNull();
    expect((result.children[1] as LeafNode).id).toBe("root");
  });
});

describe("splitLeafInTree — leaf in a same-direction parent group", () => {
  function twoChildGroup(): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "horizontal",
      dividerPositions: [50],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
      ],
    };
  }

  it("splits same-direction leaf: sibling added in parent group", () => {
    const root = twoChildGroup();
    const result = splitLeafInTree(root, "L1", "horizontal", "after", makeIdGen()) as GroupNode;
    expect(result.type).toBe("group");
    expect(result.children).toHaveLength(3);
    expect(result.dividerPositions).toHaveLength(2);
  });

  it("new divider is the midpoint of the original leaf's slot", () => {
    const root = twoChildGroup(); // L1 occupies [0, 50]
    const result = splitLeafInTree(root, "L1", "horizontal", "after", makeIdGen()) as GroupNode;
    // midpoint of [0, 50] = 25
    expect(result.dividerPositions[0]).toBe(25);
    expect(result.dividerPositions[1]).toBe(50);
  });

  it("position=before inserts new leaf before target", () => {
    const root = twoChildGroup();
    const result = splitLeafInTree(root, "L1", "horizontal", "before", makeIdGen()) as GroupNode;
    // children: [newLeaf, L1, L2]
    expect((result.children[1] as LeafNode).id).toBe("L1");
    expect((result.children[0] as LeafNode).windowId).toBeNull();
  });

  it("position=after inserts new leaf after target", () => {
    const root = twoChildGroup();
    const result = splitLeafInTree(root, "L1", "horizontal", "after", makeIdGen()) as GroupNode;
    // children: [L1, newLeaf, L2]
    expect((result.children[0] as LeafNode).id).toBe("L1");
    expect((result.children[1] as LeafNode).windowId).toBeNull();
  });

  it("new leaf always has windowId=null", () => {
    const root = twoChildGroup();
    const result = splitLeafInTree(root, "L2", "horizontal", "after", makeIdGen()) as GroupNode;
    const newLeaf = result.children.find((c) => (c as LeafNode).id !== "L1" && (c as LeafNode).id !== "L2") as LeafNode;
    expect(newLeaf.windowId).toBeNull();
  });
});

describe("splitLeafInTree — leaf in a different-direction parent group", () => {
  function hGroup(): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "horizontal",
      dividerPositions: [50],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
      ],
    };
  }

  it("vertical split on horizontal-group child wraps the leaf in a new vertical group", () => {
    const root = hGroup();
    const result = splitLeafInTree(root, "L1", "vertical", "after", makeIdGen()) as GroupNode;
    // L1's slot is now a vertical group
    expect(result.children[0].type).toBe("group");
    expect((result.children[0] as GroupNode).direction).toBe("vertical");
    expect(result.children).toHaveLength(2); // outer group still has 2 children
  });

  it("the parent group's divider count is unchanged after wrapping", () => {
    const root = hGroup();
    const result = splitLeafInTree(root, "L1", "vertical", "after", makeIdGen()) as GroupNode;
    expect(result.dividerPositions).toHaveLength(1);
    expect(result.dividerPositions[0]).toBe(50);
  });

  it("the wrapping group has 2 children and dividerPositions=[50]", () => {
    const root = hGroup();
    const result = splitLeafInTree(root, "L1", "vertical", "before", makeIdGen()) as GroupNode;
    const wrapper = result.children[0] as GroupNode;
    expect(wrapper.children).toHaveLength(2);
    expect(wrapper.dividerPositions).toEqual([50]);
  });

  it("non-target leaves are unaffected", () => {
    const root = hGroup();
    const result = splitLeafInTree(root, "L1", "vertical", "after", makeIdGen()) as GroupNode;
    expect((result.children[1] as LeafNode).id).toBe("L2");
    expect((result.children[1] as LeafNode).windowId).toBe("b");
  });
});

describe("splitLeafInTree — non-existent leaf id returns root unchanged", () => {
  it("returns the same object reference when id not found", () => {
    const root = leafTree("a");
    const result = splitLeafInTree(root, "no-such-id", "horizontal", "after", makeIdGen());
    expect(result).toBe(root);
  });
});

// ─── closeLeafInTree ──────────────────────────────────────────────────────────

describe("closeLeafInTree — 2-child group collapses to sibling", () => {
  function twoGroup(): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "horizontal",
      dividerPositions: [50],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
      ],
    };
  }

  it("closing first child returns second child as new root", () => {
    const result = closeLeafInTree(twoGroup(), "L1");
    expect(result.type).toBe("leaf");
    expect((result as LeafNode).id).toBe("L2");
  });

  it("closing second child returns first child as new root", () => {
    const result = closeLeafInTree(twoGroup(), "L2");
    expect(result.type).toBe("leaf");
    expect((result as LeafNode).id).toBe("L1");
  });

  it("surviving sibling retains its windowId", () => {
    const result = closeLeafInTree(twoGroup(), "L1") as LeafNode;
    expect(result.windowId).toBe("b");
  });
});

describe("closeLeafInTree — 3-child group removes child and one divider", () => {
  function threeGroup(): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "horizontal",
      dividerPositions: [25, 75],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
        { type: "leaf", id: "L3", windowId: "c" },
      ],
    };
  }

  it("closing first child yields 2-child group with 1 divider", () => {
    const result = closeLeafInTree(threeGroup(), "L1") as GroupNode;
    expect(result.type).toBe("group");
    expect(result.children).toHaveLength(2);
    expect(result.dividerPositions).toHaveLength(1);
  });

  it("closing middle child yields 2-child group", () => {
    const result = closeLeafInTree(threeGroup(), "L2") as GroupNode;
    expect(result.children).toHaveLength(2);
    expect((result.children[0] as LeafNode).id).toBe("L1");
    expect((result.children[1] as LeafNode).id).toBe("L3");
  });

  it("closing last child yields 2-child group", () => {
    const result = closeLeafInTree(threeGroup(), "L3") as GroupNode;
    expect(result.children).toHaveLength(2);
    expect((result.children[0] as LeafNode).id).toBe("L1");
    expect((result.children[1] as LeafNode).id).toBe("L2");
  });

  it("divider is removed from the correct position when closing first child", () => {
    const result = closeLeafInTree(threeGroup(), "L1") as GroupNode;
    // divider[0] (at 25) is absorbed; divider[1] (at 75) should remain
    expect(result.dividerPositions).toEqual([75]);
  });

  it("divider is removed from the correct position when closing last child", () => {
    const result = closeLeafInTree(threeGroup(), "L3") as GroupNode;
    // divider[1] (at 75) is absorbed; divider[0] (at 25) should remain
    expect(result.dividerPositions).toEqual([25]);
  });
});

describe("closeLeafInTree — non-existent id returns root unchanged", () => {
  it("returns the same reference when id not found", () => {
    const root: PanelTreeNode = { type: "leaf", id: "L1", windowId: "a" };
    const result = closeLeafInTree(root, "no-such-id");
    expect(result).toBe(root);
  });
});

// ─── updateLeafInTree ─────────────────────────────────────────────────────────

describe("updateLeafInTree", () => {
  function twoGroup(): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "vertical",
      dividerPositions: [50],
      children: [
        { type: "leaf", id: "L1", windowId: "a", collapsed: false },
        { type: "leaf", id: "L2", windowId: "b", collapsed: false },
      ],
    };
  }

  it("sets collapsed=true on the target leaf", () => {
    const result = updateLeafInTree(twoGroup(), "L1", { collapsed: true }) as GroupNode;
    expect((result.children[0] as LeafNode).collapsed).toBe(true);
  });

  it("does not touch the non-target sibling", () => {
    const result = updateLeafInTree(twoGroup(), "L1", { collapsed: true }) as GroupNode;
    expect((result.children[1] as LeafNode).collapsed).toBe(false);
  });

  it("sets windowId on the target leaf", () => {
    const result = updateLeafInTree(twoGroup(), "L2", { windowId: "terminal" }) as GroupNode;
    expect((result.children[1] as LeafNode).windowId).toBe("terminal");
  });

  it("returns same reference for each unchanged sibling", () => {
    const root = twoGroup();
    const result = updateLeafInTree(root, "L1", { collapsed: true }) as GroupNode;
    // L2 reference should be identical (structural sharing)
    expect(result.children[1]).toBe(root.children[1]);
  });

  it("returns same root reference when id not found", () => {
    const root = twoGroup();
    const result = updateLeafInTree(root, "no-id", { collapsed: true });
    expect(result).toBe(root);
  });
});

// ─── moveDividerInTree ────────────────────────────────────────────────────────

describe("moveDividerInTree — basic movement", () => {
  function twoGroup(positions = [50]): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "horizontal",
      dividerPositions: positions,
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
      ],
    };
  }

  it("moves the divider to the specified position", () => {
    const result = moveDividerInTree(twoGroup(), "g1", 0, 70) as GroupNode;
    expect(result.dividerPositions[0]).toBe(70);
  });

  it("clamps to minSize (3) from the left edge", () => {
    const result = moveDividerInTree(twoGroup(), "g1", 0, 0) as GroupNode;
    expect(result.dividerPositions[0]).toBe(3);
  });

  it("clamps to 100 - minSize (97) from the right edge", () => {
    const result = moveDividerInTree(twoGroup(), "g1", 0, 100) as GroupNode;
    expect(result.dividerPositions[0]).toBe(97);
  });

  it("returns same reference when group id not found", () => {
    const root = twoGroup();
    const result = moveDividerInTree(root, "no-group", 0, 70);
    expect(result).toBe(root);
  });
});

describe("moveDividerInTree — 3-child group: only the targeted divider moves", () => {
  function threeGroup(): GroupNode {
    return {
      type: "group",
      id: "g1",
      direction: "horizontal",
      dividerPositions: [25, 75],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
        { type: "leaf", id: "L3", windowId: "c" },
      ],
    };
  }

  it("moving divider[0] does not change divider[1]", () => {
    const result = moveDividerInTree(threeGroup(), "g1", 0, 40) as GroupNode;
    expect(result.dividerPositions[0]).toBe(40);
    expect(result.dividerPositions[1]).toBe(75);
  });

  it("moving divider[1] does not change divider[0]", () => {
    const result = moveDividerInTree(threeGroup(), "g1", 1, 60) as GroupNode;
    expect(result.dividerPositions[0]).toBe(25);
    expect(result.dividerPositions[1]).toBe(60);
  });

  it("divider[0] is clamped to not exceed divider[1] minus minSize", () => {
    // divider[1] = 75, so divider[0] max = 75 - 3 = 72
    const result = moveDividerInTree(threeGroup(), "g1", 0, 80) as GroupNode;
    expect(result.dividerPositions[0]).toBe(72);
    expect(result.dividerPositions[1]).toBe(75); // unchanged
  });

  it("divider[1] is clamped to not go below divider[0] plus minSize", () => {
    // divider[0] = 25, so divider[1] min = 25 + 3 = 28
    const result = moveDividerInTree(threeGroup(), "g1", 1, 10) as GroupNode;
    expect(result.dividerPositions[0]).toBe(25); // unchanged
    expect(result.dividerPositions[1]).toBe(28);
  });
});

describe("moveDividerInTree — nested groups: only the named group is updated", () => {
  it("moving a divider in outer group does not mutate the inner group", () => {
    const inner: GroupNode = {
      type: "group",
      id: "inner",
      direction: "vertical",
      dividerPositions: [40],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
      ],
    };
    const outer: GroupNode = {
      type: "group",
      id: "outer",
      direction: "horizontal",
      dividerPositions: [50],
      children: [inner, { type: "leaf", id: "L3", windowId: "c" }],
    };

    const result = moveDividerInTree(outer, "outer", 0, 60) as GroupNode;
    expect(result.dividerPositions[0]).toBe(60);
    // inner group is structurally shared (same reference)
    expect(result.children[0]).toBe(inner);
    expect((result.children[0] as GroupNode).dividerPositions[0]).toBe(40);
  });

  it("moving a divider in the inner group does not mutate the outer group", () => {
    const inner: GroupNode = {
      type: "group",
      id: "inner",
      direction: "vertical",
      dividerPositions: [40],
      children: [
        { type: "leaf", id: "L1", windowId: "a" },
        { type: "leaf", id: "L2", windowId: "b" },
      ],
    };
    const outer: GroupNode = {
      type: "group",
      id: "outer",
      direction: "horizontal",
      dividerPositions: [50],
      children: [inner, { type: "leaf", id: "L3", windowId: "c" }],
    };

    const result = moveDividerInTree(outer, "inner", 0, 70) as GroupNode;
    expect(result.dividerPositions[0]).toBe(50); // outer unchanged
    expect((result.children[0] as GroupNode).dividerPositions[0]).toBe(70);
  });
});
