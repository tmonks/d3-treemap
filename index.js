// margins and dimensions
const w = 1000;
const h = 800;
const graphMargin = { top: 100, right: 50, bottom: 50, left: 50 };
const legendHeight = 100;
const legendColumns = 6;
const legendMargin = { top: 0, right: 50, bottom: 50, left: 50 };
const graphWidth = w - graphMargin.left - graphMargin.right;
const graphHeight = h - graphMargin.top - graphMargin.bottom - legendHeight - legendMargin.top - legendMargin.bottom;
const legendWidth = w - legendMargin.left - legendMargin.right;

// tooltip, hidden by default
const tooltip = d3.select(".canvas").append("div").attr("id", "tooltip").style("opacity", 0);

// main svg
const svg = d3.select(".canvas").append("svg").attr("width", w).attr("height", h);

// graph area
const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("stroke", "blue")
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
let color = d3.scaleOrdinal(d3.schemeSet3);

d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json").then((data) => {
  console.log(data);
  let root = d3.hierarchy(data).sum((d) => d.value);

  d3.treemap().size([graphWidth, graphHeight]).padding(2)(root);

  console.log(root);

  graph
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
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

  let curColumn = 0;
  let curRow = 0;
  let colWidth = legendWidth / legendColumns;
  let rowHeight = legendHeight / Math.ceil(root.children.length / legendColumns);

  console.log(`legend dimenions: ${legendWidth} x ${legendHeight}`);
  console.log(`legend rect dimensions: ${colWidth} x ${rowHeight}`);

  root.children.forEach((child, index) => {
    curColumn = index % legendColumns;
    curRow = Math.floor(index / legendColumns);
    console.log(`${index}: ${child.data.name} - ${curColumn}, ${curRow}`);
    // curX = legendCellX(index);
  });

  legend
    .selectAll("rect")
    .data(root.children)
    .enter()
    .append("rect")
    .attr("x", (d, i) => (i % legendColumns) * colWidth)
    .attr("y", (d, i) => Math.floor(i / legendColumns) * rowHeight)
    .attr("width", rowHeight - 2)
    .attr("height", rowHeight - 2)
    .attr("fill", (d) => color(d.data.name))
    .attr("class", "legend-item");

  legend
    .selectAll("text")
    .data(root.children)
    .enter()
    .append("text")
    .attr("x", (d, i) => (i % legendColumns) * colWidth + rowHeight + 5)
    .attr("y", (d, i) => Math.floor(i / legendColumns) * rowHeight + rowHeight)
    .text((d) => d.data.name);
});