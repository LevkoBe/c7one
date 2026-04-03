import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid } from "../data/DataGrid";
import { Gallery, GalleryCard } from "../data/Gallery";
import { List, ListItem } from "../data/List";
import { Pagination, Table } from "../data/Table";
import type { ColumnDef, DataGridColumn } from "../data/Table";

// ─── Table ────────────────────────────────────────────────────────────────────

interface Person {
  name: string;
  role: string;
  score: number;
}

const PEOPLE: Person[] = [
  { name: "Alice", role: "Engineer", score: 90 },
  { name: "Bob", role: "Designer", score: 70 },
  { name: "Carol", role: "PM", score: 85 },
];

const COLS: ColumnDef<Person>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role", sortable: true },
  { key: "score", header: "Score", sortable: true, align: "right" },
];

describe("Table — rendering", () => {
  it("renders all column headers", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
  });

  it("renders all row data", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("renders empty state message when data is empty", () => {
    render(<Table data={[]} columns={COLS} emptyMessage="No records found" />);
    expect(screen.getByText("No records found")).toBeInTheDocument();
  });

  it("default empty message is 'No data'", () => {
    render(<Table data={[]} columns={COLS} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders pagination slot", () => {
    render(
      <Table
        data={PEOPLE}
        columns={COLS}
        paginationSlot={<span>Page controls</span>}
      />,
    );
    expect(screen.getByText("Page controls")).toBeInTheDocument();
  });

  it("calls onRowClick with the correct row when a row is clicked", () => {
    const onRowClick = vi.fn();
    render(<Table data={PEOPLE} columns={COLS} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(PEOPLE[0]);
  });

  it("uses custom render function for cell", () => {
    const cols: ColumnDef<Person>[] = [
      { key: "score", header: "Score", render: (v) => <b>⭐{String(v)}</b> },
    ];
    render(<Table data={[PEOPLE[0]]} columns={cols} />);
    expect(screen.getByText("⭐90")).toBeInTheDocument();
  });
});

describe("Table — sorting", () => {
  it("sortable column has no aria-sort by default", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader).not.toHaveAttribute("aria-sort");
  });

  it("clicking a sortable column sets aria-sort='ascending'", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    fireEvent.click(screen.getByText("Name").closest("th")!);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("clicking again sets aria-sort='descending'", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    const th = screen.getByText("Name").closest("th")!;
    fireEvent.click(th);
    fireEvent.click(th);
    expect(th).toHaveAttribute("aria-sort", "descending");
  });

  it("clicking a third time clears aria-sort", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    const th = screen.getByText("Name").closest("th")!;
    fireEvent.click(th);
    fireEvent.click(th);
    fireEvent.click(th);
    expect(th).not.toHaveAttribute("aria-sort");
  });

  it("ascending sort orders rows correctly", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    fireEvent.click(screen.getByText("Name").closest("th")!);
    const rows = screen.getAllByRole("row").slice(1); // skip header
    expect(rows[0]).toHaveTextContent("Alice");
    expect(rows[1]).toHaveTextContent("Bob");
    expect(rows[2]).toHaveTextContent("Carol");
  });

  it("descending sort reverses order", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    const th = screen.getByText("Name").closest("th")!;
    fireEvent.click(th);
    fireEvent.click(th);
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Carol");
    expect(rows[2]).toHaveTextContent("Alice");
  });

  it("numeric column sorts numerically", () => {
    render(<Table data={PEOPLE} columns={COLS} />);
    fireEvent.click(screen.getByText("Score").closest("th")!);
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("70"); // Bob lowest
    expect(rows[2]).toHaveTextContent("90"); // Alice highest
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationHarness({ pageCount }: { pageCount: number }) {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />;
}

describe("Pagination", () => {
  it("renders a button for each page", () => {
    render(<PaginationHarness pageCount={3} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("prev button is disabled on page 1", () => {
    render(<PaginationHarness pageCount={3} />);
    expect(screen.getByText("←").closest("button")).toBeDisabled();
  });

  it("next button is enabled on page 1 with >1 pages", () => {
    render(<PaginationHarness pageCount={3} />);
    expect(screen.getByText("→").closest("button")).not.toBeDisabled();
  });

  it("clicking page 2 navigates to page 2", () => {
    render(<PaginationHarness pageCount={3} />);
    fireEvent.click(screen.getByText("2"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("clicking next navigates forward", () => {
    render(<PaginationHarness pageCount={3} />);
    fireEvent.click(screen.getByText("→"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("next button is disabled on the last page", () => {
    render(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByText("→").closest("button")).toBeDisabled();
  });

  it("prev button is enabled on page 2", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByText("←").closest("button")).not.toBeDisabled();
  });

  it("displays page / pageCount summary", () => {
    render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });
});

// ─── List ─────────────────────────────────────────────────────────────────────

describe("List — rendering", () => {
  const items = ["Alpha", "Beta", "Gamma"];

  it("renders a <ul> with role='list'", () => {
    render(
      <List
        items={items}
        renderItem={(item) => <ListItem>{item}</ListItem>}
      />,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders all items", () => {
    render(
      <List
        items={items}
        renderItem={(item) => <ListItem>{item}</ListItem>}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("empty items: shows 'No items' by default", () => {
    render(<List items={[]} renderItem={() => null} />);
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("empty items: shows custom emptyMessage", () => {
    render(
      <List
        items={[]}
        renderItem={() => null}
        emptyMessage="Nothing here yet"
      />,
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("empty items: does NOT render a <ul>", () => {
    render(<List items={[]} renderItem={() => null} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("uses keyExtractor for stable keys (no crash)", () => {
    const items = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ];
    expect(() =>
      render(
        <List
          items={items}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <ListItem>{item.name}</ListItem>}
        />,
      ),
    ).not.toThrow();
  });
});

describe("List — dividers", () => {
  const items = ["A", "B", "C"];

  it("dividers=true (default): non-last items have border-b class", () => {
    const { container } = render(
      <List
        items={items}
        renderItem={(item) => <ListItem>{item}</ListItem>}
      />,
    );
    const listItems = container.querySelectorAll("li");
    // First two items (not last) should have border-b
    expect(listItems[0].className).toContain("border-b");
    expect(listItems[1].className).toContain("border-b");
  });

  it("dividers=true: last item does NOT have border-b class", () => {
    const { container } = render(
      <List
        items={items}
        renderItem={(item) => <ListItem>{item}</ListItem>}
      />,
    );
    const listItems = container.querySelectorAll("li");
    expect(listItems[2].className).not.toContain("border-b");
  });

  it("dividers=false: no items have border-b class", () => {
    const { container } = render(
      <List
        items={items}
        dividers={false}
        renderItem={(item) => <ListItem>{item}</ListItem>}
      />,
    );
    const listItems = container.querySelectorAll("li");
    listItems.forEach((li) =>
      expect(li.className).not.toContain("border-b"),
    );
  });
});

// ─── ListItem ─────────────────────────────────────────────────────────────────

describe("ListItem", () => {
  it("renders children", () => {
    render(<ListItem>Main text</ListItem>);
    expect(screen.getByText("Main text")).toBeInTheDocument();
  });

  it("renders leading slot", () => {
    render(<ListItem leading={<span>👤</span>}>Name</ListItem>);
    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  it("renders trailing slot", () => {
    render(<ListItem trailing={<span>→</span>}>Name</ListItem>);
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ListItem description="subtitle text">Name</ListItem>);
    expect(screen.getByText("subtitle text")).toBeInTheDocument();
  });

  it("no description element when description omitted", () => {
    render(<ListItem>Name</ListItem>);
    expect(screen.queryByText("subtitle text")).not.toBeInTheDocument();
  });

  it("onClick fires when clicked", () => {
    const onClick = vi.fn();
    render(<ListItem onClick={onClick}>Clickable</ListItem>);
    fireEvent.click(screen.getByText("Clickable"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("includes cursor-pointer class when onClick provided", () => {
    const { container } = render(
      <ListItem onClick={() => {}}>item</ListItem>,
    );
    expect(container.firstElementChild!.className).toContain("cursor-pointer");
  });

  it("does NOT include cursor-pointer when no onClick", () => {
    const { container } = render(<ListItem>item</ListItem>);
    expect(container.firstElementChild!.className).not.toContain(
      "cursor-pointer",
    );
  });
});

// ─── Gallery ──────────────────────────────────────────────────────────────────

const GALLERY_ITEMS = [
  { id: 1, label: "Red" },
  { id: 2, label: "Green" },
  { id: 3, label: "Blue" },
];

describe("Gallery — rendering", () => {
  it("renders all items", () => {
    render(
      <Gallery
        items={GALLERY_ITEMS}
        keyExtractor={(i) => i.id}
        renderItem={(item) => <span>{item.label}</span>}
      />,
    );
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("empty items: shows 'Nothing to show' by default", () => {
    render(<Gallery items={[]} renderItem={() => null} />);
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });

  it("empty items: shows custom emptyMessage", () => {
    render(
      <Gallery
        items={[]}
        renderItem={() => null}
        emptyMessage="Gallery is empty"
      />,
    );
    expect(screen.getByText("Gallery is empty")).toBeInTheDocument();
  });
});

describe("Gallery — cols classes", () => {
  const cases = [
    { cols: 2, cls: "grid-cols-1" },
    { cols: 3, cls: "grid-cols-1" },
    { cols: 4, cls: "grid-cols-2" },
    { cols: 5, cls: "grid-cols-2" },
    { cols: 6, cls: "grid-cols-2" },
  ] as const;

  for (const { cols, cls } of cases) {
    it(`cols=${cols} includes ${cls} on the grid container`, () => {
      const { container } = render(
        <Gallery
          items={GALLERY_ITEMS}
          cols={cols}
          renderItem={(i) => <span>{i.label}</span>}
        />,
      );
      expect(container.firstElementChild!.className).toContain(cls);
    });
  }
});

// ─── GalleryCard ──────────────────────────────────────────────────────────────

describe("GalleryCard", () => {
  it("renders label when label prop supplied", () => {
    render(<GalleryCard label="Sunset" />);
    expect(screen.getByText("Sunset")).toBeInTheDocument();
  });

  it("renders sublabel when sublabel prop supplied", () => {
    render(<GalleryCard label="Sunset" sublabel="Photography" />);
    expect(screen.getByText("Photography")).toBeInTheDocument();
  });

  it("no label element when neither label nor sublabel", () => {
    const { container } = render(<GalleryCard />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("overlay=false: label area uses bg-bg-elevated class", () => {
    const { container } = render(
      <GalleryCard label="Test" overlay={false} />,
    );
    // The label container should NOT have the gradient overlay class
    const labelContainer = container.querySelector(
      ".absolute.bottom-0",
    ) as HTMLElement;
    expect(labelContainer.className).not.toContain("from-black");
    expect(labelContainer.className).toContain("bg-bg-elevated");
  });

  it("overlay=true: label area uses gradient overlay class", () => {
    const { container } = render(
      <GalleryCard label="Test" overlay={true} />,
    );
    const labelContainer = container.querySelector(
      ".absolute.bottom-0",
    ) as HTMLElement;
    expect(labelContainer.className).toContain("from-black");
  });

  it("renders src image when src provided", () => {
    const { container } = render(
      <GalleryCard src="img.jpg" alt="photo" />,
    );
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<GalleryCard><span>child</span></GalleryCard>);
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});

// ─── DataGrid ────────────────────────────────────────────────────────────────

interface GridRow {
  id: number;
  name: string;
  score: number;
}

const GRID_DATA: GridRow[] = [
  { id: 1, name: "Alice", score: 90 },
  { id: 2, name: "Bob", score: 70 },
  { id: 3, name: "Carol", score: 85 },
];

const GRID_COLS: DataGridColumn<GridRow>[] = [
  { key: "id", header: "#", width: 50 },
  { key: "name", header: "Name", width: 150 },
  { key: "score", header: "Score", width: 80, align: "right" },
];

describe("DataGrid — rendering", () => {
  it("renders all column headers", () => {
    render(<DataGrid data={GRID_DATA} columns={GRID_COLS} />);
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
  });

  it("renders all visible row data", () => {
    render(<DataGrid data={GRID_DATA} columns={GRID_COLS} visibleRows={10} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("shows empty state message when data is empty", () => {
    render(
      <DataGrid
        data={[]}
        columns={GRID_COLS}
        emptyMessage="No rows available"
      />,
    );
    expect(screen.getByText("No rows available")).toBeInTheDocument();
  });

  it("default empty message is 'No data'", () => {
    render(<DataGrid data={[]} columns={GRID_COLS} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("shows row count in footer", () => {
    render(<DataGrid data={GRID_DATA} columns={GRID_COLS} />);
    expect(screen.getByText("3 rows")).toBeInTheDocument();
  });

  it("footer shows '1 row' (singular) for a single row", () => {
    render(<DataGrid data={[GRID_DATA[0]]} columns={GRID_COLS} />);
    expect(screen.getByText("1 row")).toBeInTheDocument();
  });

  it("calls onRowClick with correct row and index", () => {
    const onRowClick = vi.fn();
    render(
      <DataGrid
        data={GRID_DATA}
        columns={GRID_COLS}
        visibleRows={10}
        onRowClick={onRowClick}
      />,
    );
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(GRID_DATA[0], 0);
  });

  it("uses custom render for a cell", () => {
    const cols: DataGridColumn<GridRow>[] = [
      {
        key: "score",
        header: "Score",
        width: 80,
        render: (v) => <b>★{String(v)}</b>,
      },
    ];
    render(<DataGrid data={[GRID_DATA[0]]} columns={cols} visibleRows={5} />);
    expect(screen.getByText("★90")).toBeInTheDocument();
  });
});
