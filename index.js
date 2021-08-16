// margins and dimensions
const w = 1600;
const h = 700;
const legendWidth = 300;
const legendHeight = 40;
const legendMarginBottom = 20;
const graphMargin = { top: 100, right: 50, bottom: 100, left: 100 };
const graphWidth = w - graphMargin.left - graphMargin.right;
const graphHeight = h - graphMargin.top - graphMargin.bottom;

// tooltip, hidden by default
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
  .attr("transform", `translate(${w / 2 - legendWidth / 2}, ${h - legendHeight - 20})`);

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
    .style("fill", "blue")
    .attr("class", "cell");
});

consold;
