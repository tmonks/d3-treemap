// margins and dimensions
const w = 1300;
const h = 900;
const graphMargin = { top: 100, right: 50, bottom: 25, left: 50 };
const legendHeight = 100;
const legendColumns = 6;
const legendMargin = { top: 0, right: 50, bottom: 50, left: 50 };
const graphWidth = w - graphMargin.left - graphMargin.right;
const graphHeight = h - graphMargin.top - graphMargin.bottom - legendHeight - legendMargin.top - legendMargin.bottom;
const legendWidth = w - legendMargin.left - legendMargin.right;

// tooltip (hidden by default)
const tooltip = d3.select(".canvas").append("div").attr("id", "tooltip").style("opacity", 0);

// main svg
const svg = d3.select(".canvas").append("svg").attr("width", w).attr("height", h);

// graph area
const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${graphMargin.left}, ${graphMargin.top})`); // move it by margin sizes

// legend area
const legend = svg
  .append("g")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .attr("id", "legend")
  .attr("transform", `translate(${legendMargin.left}, ${h - legendHeight - legendMargin.bottom})`);

// title
svg
  .append("text")
  .attr("id", "title")
  .attr("x", w / 2)
  .attr("y", 45)
  .text("Video Game Sales");

// description
svg
  .append("text")
  .attr("id", "description")
  .attr("x", w / 2)
  .attr("y", 75)
  .html("Top 100 Most Sold Video Games by Platform");

// categorical color scale
const categoryColors = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#A675A1",
  "#42d4f4",
  "#f032e6",
  "#5FDD9D",
  "#B2675E",
  "#469990",
  "#dcbeff",
  "#9A6324",
  "#fffac8",
  "#CA2E55",
  "#aaffc3",
  "#ACE894",
  "#ffd8b1",
  "#000075",
  "#a9a9a9",
];
let color = d3.scaleOrdinal(categoryColors);

d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json").then((data) => {
  let root = d3.hierarchy(data).sum((d) => d.value);

  console.log(root);
  d3.treemap().size([graphWidth, graphHeight]).padding(0)(root);
  console.log(root);

  // add groups to contain the rect, clip path, and text elements
  let tileGroups = graph
    .selectAll("g")
    .data(
      root.leaves().map((x, i) => {
        // add a unique id attribute for the clip paths
        return { id: i + "-" + x.parent.data.name, ...x };
      })
    )
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

  // add colored tiles for each leaf
  tileGroups
    .append("rect")
    .attr("id", (d) => d.id) // set an id so it can be referenced by the clip path
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("stroke", "black")
    .style("fill", (d) => color(d.parent.data.name))
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.parent.data.name)
    .attr("data-value", (d) => d.data.value)
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(100).style("opacity", 0.9); // show the tooltip
      tooltip
        .html(`${d.parent.data.name}<br />${d.data.name}<br />${d.data.value}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
      tooltip.attr("data-value", d.data.value);
    })
    .on("mouseout", (d) => {
      tooltip.transition().duration(100).style("opacity", 0); // hide the tooltip
    });

  // add clip paths using the corresponding rect dimensions
  tileGroups
    .append("clipPath")
    .attr("id", (d) => "clip-" + d.id)
    .append("use")
    .attr("xlink:href", (d) => "#" + d.id);

  // add text to tiles
  tileGroups
    .append("text")
    .attr("clip-path", (d) => `url(#clip-${d.id})`)
    .selectAll("tspan")
    // split on capital letters, so titles can be broken up into lines
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 2)
    .attr("y", (d, i) => 12 + i * 12)
    .text((d) => d)
    .attr("font-size", "0.8em");

  // legend cell dimensions
  let legendCellWidth = legendWidth / legendColumns;
  let legendCellHeight = legendHeight / Math.ceil(root.children.length / legendColumns);

  // legend colored squares
  legend
    .selectAll("rect")
    .data(root.children)
    .enter()
    .append("rect")
    .attr("x", (d, i) => (i % legendColumns) * legendCellWidth)
    .attr("y", (d, i) => Math.floor(i / legendColumns) * legendCellHeight)
    .attr("width", legendCellHeight - 2)
    .attr("height", legendCellHeight - 2)
    .attr("fill", (d, i) => color(d.data.name))
    .attr("class", "legend-item");

  // legend labels
  legend
    .selectAll("text")
    .data(root.children)
    .enter()
    .append("text")
    .attr("x", (d, i) => (i % legendColumns) * legendCellWidth + legendCellHeight + 5)
    .attr("y", (d, i) => Math.floor(i / legendColumns) * legendCellHeight + legendCellHeight - 12)
    .text((d) => d.data.name);
});