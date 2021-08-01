import data from './gapminder.json'
import clusters from './clusters.json'
import * as d3 from 'd3';

const clustersDict = {};
clusters.forEach(d => clustersDict[d.id] = d.name);

data = data.map(d => ({
    ...d,
    region: clustersDict[d.cluster]
}));
console.log("gapminder", data);

const xField = "fertility";
const yField = "life_expect";
const zField = "region";
const xTickCount = 5;
const yTickCount = 5;
const minYear = 1955;
const maxYear = 2005;
const stepYear = 5;
const currentYear = 1980;

const width = 1000;
const height = 600;
const margin = {top: 30, right:300, bottom: 70, left: 70};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select("#canvas").attr("width", width).attr("height", height).attr("viewbox", `0 0 ${width} ${height}`);
const mainGroup = svg.append("g").classed("mainGroup", true).attr("transform", `translate(${margin.left}, ${margin.top})`)
const xGroup = svg.append("g").classed("xGroup", true).attr("transform", `translate(${margin.left}, ${margin.top + innerHeight})`)
const yGroup = svg.append("g").classed("yGroup", true).attr("transform", `translate(${margin.left}, ${margin.top})`)
const legendGroup = svg.append("g").classed("legendGroup", true).attr("transform", `translate(${margin.left + innerWidth}, ${margin.top})`)

// const xExtent = [0, d3.max(data, d => d[xField])];
// const yExtent = [0, d3.max(data, d => d[yField])];
const xExtent = d3.extent(data, d => d[xField]);
const yExtent = d3.extent(data, d => d[yField]);
const zUniqueValues = [];
const zAllValues = data.map(d => d[zField]).sort();
zUniqueValues.push(zAllValues[0]);
zAllValues.forEach(z => {
    if(z !== zUniqueValues[zUniqueValues.length - 1]) {
        zUniqueValues.push(z);
    }
})

const xScale = d3.scaleLinear().domain(xExtent).range([0, innerWidth]).nice();
const yScale = d3.scaleLinear().domain(yExtent).range([innerHeight, 0]).nice();
const zScale = d3.scaleOrdinal().domain(zUniqueValues).range(d3.schemeCategory10);

const xAxis = d3.axisBottom(xScale).tickSizeOuter(0).tickValues(d3.ticks(xScale.domain()[0], xScale.domain()[1], xTickCount));//.tickSizeOuter(0);
const yAxis = d3.axisLeft(yScale).tickSizeOuter(0).tickValues(d3.ticks(yScale.domain()[0], yScale.domain()[1], yTickCount));//s.tickSizeOuter(0);

xGroup
    .call(xAxis)
    .call(g => {
        g.selectAll("line").clone()
            .attr("y2", -innerHeight)
            .attr("opacity", 0.3)
    });
const xAxisBBox = xGroup.node().getBBox();
xGroup.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", xAxisBBox.y + xAxisBBox.height)
    .attr("fill", "black")
    .attr("stroke", "black")
    .style("font-size", 15)
    .style("text-anchor", "middle")
    .style("dominant-baseline", "hanging")
    .text(xField)

yGroup.call(yAxis)
    .call(g => {
        g.selectAll("line").clone()
            .attr("x2", innerWidth)
            .attr("opacity", 0.3)
    });
const yAxisBBox = yGroup.node().getBBox();
yGroup.append("text")
    .attr("x", yAxisBBox.x)
    .attr("y", innerHeight / 2)
    .attr("fill", "black")
    .attr("stroke", "black")
    .style("font-size", 15)
    .style("writing-mode", "vertical-rl")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "hanging")
    .text(yField)

mainGroup.selectAll("circle")
    .data(data.filter(d => d.year === currentYear))
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d[xField]))
    .attr("cy", d => yScale(d[yField]))
    .attr("r", 6)
    .attr("fill", d => zScale(d[zField]))
    .attr("opacity", 0.5);

drawLegend(legendGroup, margin.right, innerHeight, zScale, zField);

function drawLegend(g, width, height, zScale, zField) {
    const circleSize = 7;
    const margin = {top: 30, right: width-circleSize * 3 - 50, bottom: height*2/3, left: 50};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height- margin.top - margin.bottom

    const titleGroup = g.append("g").classed("title", true).attr("transform", `translate(${margin.left})`);
    const axisGroup = g.append("g").classed("axis", true).attr("transform", `translate(${margin.left + innerWidth}, ${margin.top})`)
    const mainGroup = g.append("g").classed("legend", true).attr("transform", `translate(${margin.left}, ${margin.top})`)

    const legendScale = d3.scalePoint().domain(zScale.domain()).range([0, innerHeight]);
    
    titleGroup.append("text")
        .text(zField)
        .attr("x", innerWidth / 2)
        .attr("fill", "black")
        .attr("stroke", "black")
        .style("font-size", 12)
        .style("dominant-baseline", "auto")
        .style("text-anchor", "middle")
    
    axisGroup
        .style("font-size", 8)
        .call(d3.axisRight(legendScale))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("line").remove());

    mainGroup
        .selectAll("circle")
        .data(zScale.domain())
        .join("circle")
        .attr("cx", innerWidth / 2)
        .attr("cy", d => legendScale(d))
        .attr("r", circleSize)
        .attr("fill", d => zScale(d));
    
    
}