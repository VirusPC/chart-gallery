import * as d3 from 'd3';
import rawData from '/src/data/date-price';

const timeParser = d3.timeParse("%b %d %Y");
const data = rawData.map((d) => {
    return {
        "date": timeParser(d.date),
        "price": +d.price
    }
})

const width = 700;
const height = 450;
const topLayoutBox = {
    x: 0,
    y: 0,
    height: height * 0.7,
    width: width,
}
const bottomLayoutBox = {
    x: 0,
    y: topLayoutBox.height,
    height: height - topLayoutBox.height,
    width: width,
}


const svg = d3.select("#canvas")
    .attr("width", width)
    .attr("height", height);
const groupTop = svg.append("g")
    .classed("groupTop", true)
    .attr("transform", `translate(${topLayoutBox.x}, ${topLayoutBox.y})`);
const groupBottom = svg.append("g")
    .classed("groupBottom", true)
    .attr("transform", `translate(${bottomLayoutBox.x}, ${bottomLayoutBox.y})`);

const dateDomain = d3.extent(data, d => d.date);
const priceDomain = [0, d3.max(data, (d) => d.price)];


const redraw = renderTop(groupTop, topLayoutBox, data);
renderBottom(groupBottom, bottomLayoutBox, data, redraw);

function renderTop(root, layoutBox, data) {
    const margin = { top: 30, right: 10, bottom: 50, left: 70 };
    const innerHeight = layoutBox.height - margin.top - margin.bottom;
    const innerWidth = layoutBox.width - margin.left - margin.right;

    const mainGroup = root.append("g").classed("main", true).attr("transform", `translate(${margin.left}, ${margin.top})`);
    const axisXGroup = root.append("g").classed("axisX", true).attr("transform", `translate(${margin.left}, ${margin.top + innerHeight})`);
    const axisYGroup = root.append("g").classed("axisY", true).attr("transform", `translate(${margin.left}, ${margin.top})`);

    const scaleX = d3.scaleTime()
        .domain(dateDomain)
        .range([0, innerWidth])
        .clamp(true);
    const scaleY= d3.scaleLinear()
        .domain(priceDomain)
        .range([innerHeight, 0])
        .nice();

    const areaGenerator= d3.area()
        .x((d) => scaleX(d.date))
        .y0(scaleY(0))
        .y1((d) => scaleY(d.price));

    axisXGroup.call(d3.axisBottom(scaleX).tickSizeOuter(0));
    axisYGroup.call(d3.axisLeft(scaleY));
    const area = mainGroup.append("path")
        .attr("fill", "steelblue")
        .attr("d", areaGenerator(data));
    
    function redraw(newDomain) {
        scaleX.domain(newDomain);
        axisXGroup.call(d3.axisBottom(scaleX).tickSizeOuter(0));
        area.attr("d", areaGenerator(data));
    }

    return redraw;
}


function renderBottom(root, layoutBox, data, redraw) {
    const margin = { top: 30, right: 10, bottom: 50, left: 70 };
    const innerHeight = layoutBox.height - margin.top - margin.bottom;
    const innerWidth = layoutBox.width - margin.left - margin.right;

    const mainGroup = root.append("g").classed("main", true).attr("transform", `translate(${margin.left}, ${margin.top})`);
    const axisXGroup = root.append("g").classed("axisX", true).attr("transform", `translate(${margin.left}, ${margin.top + innerHeight})`);

    const scaleX= d3.scaleTime()
        .domain(dateDomain)
        .range([0, innerWidth]);
    const scaleY= d3.scaleLinear()
        .domain(priceDomain)
        .range([innerHeight, 0])
        .nice();

    const areaGenerator= d3.area()
        .x((d) => scaleX(d.date))
        .y0(scaleY(0))
        .y1((d) => scaleY(d.price));

    axisXGroup.call(d3.axisBottom(scaleX).tickSizeOuter(0))
    mainGroup
        .append("path")
        .attr("fill", "steelblue")
        .attr("d", areaGenerator(data));

    const brushed = function (event) {
        const domain= event.selection.map(scaleX.invert);
        redraw(domain);
    }
    const brush = d3.brushX()
        .handleSize(10)
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on("brush", brushed);
    mainGroup.call(brush);
}

