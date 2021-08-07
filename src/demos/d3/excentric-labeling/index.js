import * as d3 from 'd3';
import data from "Data/cars.json";
import addExentricLabelingInteraction from './add-excentric-labeling-interaction';

const width = 800;
const height = 500;
const rootElem = d3.select("#container").node();
console.log(rootElem);
renderUsingD3(rootElem, width, height);

/**
 * 
 * @param {HTMLDivElement} rootElem
 * @param {number} width 
 * @param {number} height 
 * 
 * @param {object} interactionParams
 * @param {string | number} interactionParams.lensRadius 
 * @param {string | number} interactionParams.fontSize
 * @param {string | number} interactionParams.maxLabelsNum
 * @param {boolean} interactionParams.shouldVerticallyCoherent open the function: vertically coherent labeling.
 * @param {boolean} interactionParams.shouldHorizontallyCoherent open the function: horizontally coherent labeling.
 */
function renderUsingD3(rootElem, width, height) {

  // fields of scatter plot
  const fieldX = "Horsepower";
  const fieldY = "Miles_per_Gallon";
  const fieldColor = "Origin";

  // layout
  const margin = { top: 50, right: 100, bottom: 10, left: 150 }
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  const svg = d3.select(rootElem)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewbox", `0 0 ${width} ${height}`)
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  renderScatterPlot(g, width, height, data, fieldX, fieldY, fieldColor);
}

function renderScatterPlot(root, width, height, data, fieldX, fieldY, fieldColor) {
  console.log("d", data);
  // settings
  const radius = 3;
  const fieldLabel = "Name";
  const interactionParams = {
    lensRadius: 20, 
    fontSize: 12, 
    maxLabelsNum: 10,
  }; 

  // layout
  const margin = { top: 10, right: 100, bottom: 50, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data manipulation
  data = data.filter((d) => !!(d[fieldX] && d[fieldY]))
  const extentX = [0, d3.max(data, d => d[fieldX])];
  const extentY = [0, d3.max(data, d => d[fieldY])];
  const valuesColorSet = new Set();
  for (const datum of data) {
    valuesColorSet.add(datum[fieldColor]);
  }
  const valuesColor = Array.from(valuesColorSet);

  // scales
  const scaleX = d3.scaleLinear()
    .domain(extentX)
    .range([0, innerWidth])
    .nice()
    .clamp(true);
  const scaleY = d3.scaleLinear()
    .domain(extentY)
    .range([innerHeight, 0])
    .nice()
    .clamp(true);
  const scaleColor = d3.scaleOrdinal()
    .domain(valuesColor)
    .range(d3.schemeTableau10);

  // const coordinatesWithInfo = data.map(d => ({
  //   x: scaleX(d[fieldX]),
  //   y: scaleY(d[fieldY]),
  //   color: scaleColor(d[fieldColor]),
  //   label: d["Name"],
  // }))

  // groups
  const groupAxisX = root.append("g")
    .attr("class", "groupAxisX")
    .attr("transform", `translate(${margin.left}, ${margin.top + innerHeight})`);
  const groupAxisY = root.append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupMain = root.append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupForeground = root.append("g")
    .attr("class", "groupForeground")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupLegend = root.append("g")
    .attr("class", "groupLegend")
    .attr("transform", `translate(${margin.left + innerWidth}, ${margin.top})`)

  // draw
  groupAxisX.call(d3.axisBottom(scaleX))
    .call(g =>
      g.selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("y2", -innerHeight)
    );
  groupAxisY.call(d3.axisLeft(scaleY))
    .call(g =>
      g.selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", innerWidth)
    );
  groupMain.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("opacity", 0.7)
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .attr("stroke", d => scaleColor(d[fieldColor]))
    .attr("cx", d => scaleX(d[fieldX]))
    .attr("cy", d => scaleY(d[fieldY]))
    .attr("r", radius)

  groupLegend.call(renderLegend, margin.right, height, scaleColor, fieldColor);

  groupMain.call(addExentricLabelingInteraction, innerWidth, innerHeight, scaleColor, fieldColor, fieldLabel, interactionParams);
}

function renderLegend(root, width, height, scaleColor, title) {
  // settings
  const radius = 4;

  // layout
  const margin = { top: 20, right: 60, bottom: height / 6 * 5, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data manipulation
  const domain = scaleColor.domain();

  //scale
  const scaleY = d3.scalePoint()
    .domain(domain)
    .range([innerHeight, 0]);

  // groups
  const groupTitle = root.append("g")
    .attr("class", "groupTitle")
    .attr("transform", `translate(${margin.left}, 0)`)
  const groupAxisY = root.append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left + innerWidth}, ${margin.top})`)
  const groupMain = root.append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)


  // draw
  groupTitle.append("text")
    .text(title)
    .attr("x", innerWidth >> 1)
    .attr("fill", "black")
    .attr("stroke", "black")
    .style("font-size", 12)
    .style("dominant-baseline", "auto")
    .style("text-anchor", "start")
  groupAxisY.call(d3.axisRight(scaleY))
    .call(g =>{
      g.select(".domain").remove();
      g.selectAll("line").remove();
    }
    );
  groupMain.selectAll("circle")
    .data(domain)
    .join("circle")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", d => scaleColor(d))
    .attr("cx", innerWidth >> 1)
    .attr("cy", d => scaleY(d))
    .attr("r", radius);
}



