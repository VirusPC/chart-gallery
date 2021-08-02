import * as d3 from 'd3';
import data from './data.json';

const timeParser = d3.timeParse("%b %d %Y");
data = data.map((d) => {
    return {
        "date": timeParser(d.date),
        "price": +d.price
    }
})

const width = 700,
    height = 450;

const svg = d3.select("#canvas")
    .attr("width", width)
    .attr("height", height);

const topBox = {
    x: 0,
    y: 0,
    height: height * 0.7,
    width: width,
    margin: { top: 30, right: 10, bottom: 50, left: 70 },
}
topBox.innerHeight = topBox.height - topBox.margin.top - topBox.margin.bottom;
topBox.innerWidth = topBox.width - topBox.margin.left - topBox.margin.right;

const bottomBox = {
    x: 0,
    y: topBox.height,
    height: height - topBox.height,
    width: width,
    margin: { top: 30, right: 10, bottom: 50, left: 70 },
}
bottomBox.innerHeight = bottomBox.height - bottomBox.margin.top - bottomBox.margin.bottom;
bottomBox.innerWidth = bottomBox.width - bottomBox.margin.left - bottomBox.margin.right;

const groupTop = svg.append("g")
    .classed("groupTop", true)
    .attr("transform", `translate(${topBox.x}, ${topBox.y})`);
const groupBottom = svg.append("g")
    .classed("groupBottom", true)
    .attr("transform", `translate(${bottomBox.x}, ${bottomBox.y})`);

const dateDomain = d3.extent(data, d => d.date);
const priceDomain = [0, d3.max(data, (d) => d.price)];


const redraw = renderTop(groupTop, topBox, data);
renderBottom(groupBottom, bottomBox, data, redraw);

function renderTop(root, box, data) {
    const mainGroup = root.append("g").classed("main", true).attr("transform", `translate(${box.margin.left}, ${box.margin.top})`);
    const axisXGroup = root.append("g").classed("axisX", true).attr("transform", `translate(${box.margin.left}, ${box.margin.top + box.innerHeight})`);
    const axisYGroup = root.append("g").classed("axisY", true).attr("transform", `translate(${box.margin.left}, ${box.margin.top})`);

    const scaleX = d3.scaleTime()
        .domain(dateDomain)
        .range([0, box.innerWidth])
        .clamp(true);
    const scaleY= d3.scaleLinear()
        .domain(priceDomain)
        .range([box.innerHeight, 0])
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


function renderBottom(root, box, data, redraw) {
    const mainGroup = root.append("g").classed("main", true).attr("transform", `translate(${box.margin.left}, ${box.margin.top})`);
    const axisXGroup = root.append("g").classed("axisX", true).attr("transform", `translate(${box.margin.left}, ${box.margin.top + box.innerHeight})`);

    const scaleX= d3.scaleTime()
        .domain(dateDomain)
        .range([0, box.innerWidth]);
    const scaleY= d3.scaleLinear()
        .domain(priceDomain)
        .range([box.innerHeight, 0])
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
        .extent([[0, 0], [width, box.innerHeight]])
        .on("brush", brushed);
    mainGroup.call(brush);
}

