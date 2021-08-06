import rawData from '/src/data/global-development/gapminder.json'
import clusters from '/src/data/global-development/clusters.json'
import * as d3 from 'd3';

const clustersDict = {};
clusters.forEach(d => clustersDict[d.id] = d.name);

const data = rawData.map(d => ({
    ...d,
    region: clustersDict[d.cluster]
}));
console.log("gapminder", data);

const fields = {
    x: "fertility",
    y: "life_expect",
    z: "region"
}
const minYear = 1955;
const maxYear = 2005;
const stepYear = 5;
const currentYear = 1980;

const width = 1000;
const height = 600;
const BBox = {
    x: 0,
    y: 0,
    width: width,
    height: height,
}

const svg = d3.select("#canvas").attr("width", width).attr("height", height).attr("viewbox", `0 0 ${width} ${height}`);


renderScatterPlot(svg, BBox, data, fields, currentYear);

function renderScatterPlot(root, BBox, data, fields, currentYear) {
    const xTickCount = 5;
    const yTickCount = 5;

    const margin = { top: 30, right: 300, bottom: 70, left: 70 };
    const innerWidth = BBox.width - margin.left - margin.right;
    const innerHeight = BBox.height - margin.top - margin.bottom;

    const mainGroup = root.append("g").classed("mainGroup", true).attr("transform", `translate(${margin.left}, ${margin.top})`)
    const xGroup = root.append("g").classed("xGroup", true).attr("transform", `translate(${margin.left}, ${margin.top + innerHeight})`)
    const yGroup = root.append("g").classed("yGroup", true).attr("transform", `translate(${margin.left}, ${margin.top})`)
    const legendGroup = svg.append("g").classed("legendGroup", true).attr("transform", `translate(${margin.left + innerWidth}, ${margin.top})`)

    const xExtent = d3.extent(data, d => d[fields.x]);
    const yExtent = d3.extent(data, d => d[fields.y]);
    const zUniqueValues = [];
    const zAllValues = data.map(d => d[fields.z]).sort();
    zUniqueValues.push(zAllValues[0]);
    zAllValues.forEach(z => {
        if (z !== zUniqueValues[zUniqueValues.length - 1]) {
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
        .text(fields.x)

    yGroup.call(yAxis)
        .call(g => {
            g.selectAll("line").clone()
                .attr("x2", innerWidth)
                .attr("opacity", 0.3)
        });
    const yAxisBBox = yGroup.node().getBBox();
    yGroup
    .append("text")
        .attr("transform", `translate(${yAxisBBox.x}, ${innerHeight / 2}) rotate(-90) translate(0, -10)`)
        .attr("fill", "black")
        .attr("stroke", "black")
        .style("font-size", 15)
        .style("text-anchor", "middle")
        .text(fields.y);

    mainGroup.selectAll("circle")
        .data(data.filter(d => d.year === currentYear))
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[fields.x]))
        .attr("cy", d => yScale(d[fields.y]))
        .attr("r", 6)
        .attr("fill", d => zScale(d[fields.z]))
        .attr("opacity", 0.5);
    
    const legendBBox =  {x: 0, y: 0, width: margin.right, height: innerHeight};
    renderLegend(legendGroup, legendBBox, zScale, fields.z);
}

function renderLegend(g, BBox, zScale, title) {
    const circleSize = 7;
    const margin = { top: 30, right: BBox.width - circleSize * 3 - 50, bottom: BBox.height * 2 / 3, left: 50 };
    const innerWidth = BBox.width - margin.left - margin.right;
    const innerHeight = BBox.height - margin.top - margin.bottom

    const titleGroup = g.append("g").classed("title", true).attr("transform", `translate(${margin.left})`);
    const axisGroup = g.append("g").classed("axis", true).attr("transform", `translate(${margin.left + innerWidth}, ${margin.top})`)
    const mainGroup = g.append("g").classed("legend", true).attr("transform", `translate(${margin.left}, ${margin.top})`)

    const legendScale = d3.scalePoint().domain(zScale.domain()).range([0, innerHeight]);

    titleGroup.append("text")
        .text(title)
        .attr("x", innerWidth / 2)
        .attr("fill", "black")
        .attr("stroke", "black")
        .style("font-size", 12)
        .style("dominant-baseline", "auto")
        .style("text-anchor", "start")

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

function renderTimeline(data) {
}