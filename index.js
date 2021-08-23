// margins and dimensions
const w = 1200;
const h = 900;
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

  d3.treemap().size([graphWidth, graphHeight]).padding(0)(root);

  console.log(root);
  root.children.forEach((x) => {
    console.log(x.data.name + ": " + color(x.data.name));
  });

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

  // add text to tiles
  const minSizeForText = 55;
  graph
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .selectAll("tspan")
    .data((d) => {
      // replace with ellipsis if rect is too small
      let text = Math.min(d.x1 - d.x0, d.y1 - d.y0) < minSizeForText ? "..." : d.data.name;
      return text.split(/(?=[A-Z][^A-Z])/g).map((text) => {
        return {
          text: text,
          x0: d.x0,
          y0: d.y0,
          width: d.x1 - d.x0,
          height: d.y1 - d.y0,
        };
      });
    })
    .enter()
    .append("tspan")
    .attr("x", (d) => d.x0 + 2)
    .attr("y", (d, i) => d.y0 + 12 + i * 10)
    .text((d) => d.text)
    .attr("font-size", "0.7em")
    .attr("fill", "black");
  // hide the text if the rect is too small
  // .attr("opacity", (d) => (Math.min(d.width, d.height) < minSizeForText ? 0 : 1));

  // legend
  let colWidth = legendWidth / legendColumns;
  let rowHeight = legendHeight / Math.ceil(root.children.length / legendColumns);

  legend
    .selectAll("rect")
    .data(root.children)
    .enter()
    .append("rect")
    .attr("x", (d, i) => (i % legendColumns) * colWidth)
    .attr("y", (d, i) => Math.floor(i / legendColumns) * rowHeight)
    .attr("width", rowHeight - 2)
    .attr("height", rowHeight - 2)
    .attr("fill", (d, i) => color(d.data.name))
    .attr("class", "legend-item");

  legend
    .selectAll("text")
    .data(root.children)
    .enter()
    .append("text")
    .attr("x", (d, i) => (i % legendColumns) * colWidth + rowHeight + 5)
    .attr("y", (d, i) => Math.floor(i / legendColumns) * rowHeight + rowHeight - 12)
    .text((d) => d.data.name);
});