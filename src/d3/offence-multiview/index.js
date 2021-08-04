import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import dataAreas from './vanAreas.geojson'
import dataCrime from './vanCrime.geojson'
//d3.hexbin = hexbin;
const dataCrimeFiltered = [];

render();

function render() {
    const width = 800,
        height = 700;
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewbox", `0 0 width height`);
                    svg.append("defs").append("filter")
                    .attr("id", "f1")
                    .attr("x", 0)
                    .attr("y", 0)
                    .append("feGaussianBlur")
                        .attr("in", "SourceGraphic")
                        .attr("stdDeviation", 5)

    const widthMap = width,
        heightMap = height / 2;
    const widthBarChart = width / 2,
        heightBarChart = height / 2;
    const widthLineChart = width / 2,
        heightLineChart = height / 2;

    const groupMap = svg.append("g")
        .attr("class", "map")
        .attr("transform", `translate(0, ${Math.max(heightBarChart, heightLineChart)})`);
    const groupBarChart = svg.append("g")
        .attr("class", "barchart");
    const groupLineChart = svg.append("g")
        .attr("class", "linechart")
        .attr("transform", `translate(${widthBarChart}, 0)`)

    renderBarChart(groupBarChart, dataCrime, widthBarChart, heightBarChart);
    renderLineChart(groupLineChart, dataCrime, widthLineChart, heightLineChart);
    renderMap(groupMap, dataAreas, dataCrime, widthMap, heightMap);
}
// function renderMap(root, dataAreas, dataCrime, width, height) {
//     root.append("defs").append("clipPath")
//         .attr("id", "clipMap")
//         .append("rect")
//         .attr("width", width)
//         .attr("height", height)
//     root.attr("clip-path", "url(#clipMap)")

//     const projection = d3.geoMercator()
//         .center(d3.geoCentroid(dataAreas))
//         .scale(100000)
//         .translate([width / 2, height / 2]);

//     const groupBackground = root.append("g").attr("class", "background")
//     const groupCrime = root.append("g")
//         .attr("class", "crime")
//         .style("filter", "url(#f1)");
//     const groupAreas = root.append("g").attr("class", "areas");

//     const { renderCrimeInRegion, resetCrime } = renderCrimeInstances(groupCrime, dataCrime, projection);
//     const { resetAreas } = renderAreas(groupAreas, dataAreas, projection, renderCrimeInRegion);
//     renderBackground(groupBackground, width, height, resetCrime, resetAreas);

//     const zoom = d3.zoom()
//         .scaleExtent([0.5, 3])
//         .on('zoom', zoomed);
//     function zoomed(e) {
//         //console.log(e.transform);
//         groupAreas.attr('transform', e.transform);
//         groupCrime.attr('transform', e.transform);
//     }
//     root.call(zoom);
// }


// function renderAreas(root, data, projection, renderCirimeInRegion) {
//     const geoPathGenerator = d3.geoPath()
//         .projection(projection);
//     const colorRegionStroke = "#8c8c8c";
//     const colorRegionNormal = "#ddd";
//     const colorRegionHighlight = "#000";
//     let elementClicked = null;

//     groupPaths = root.attr("opacity", 1)
//         .selectAll("path")
//         .data(data.features)
//         .enter()
//         .append("path")
//         .attr("d", geoPathGenerator)
//         .attr("fill", colorRegionNormal)
//         .attr("fill-opacity", 0.3)
//         .attr("stroke", colorRegionStroke)
//         .on("mouseover", function () {
//             d3.select(this)
//                 .attr("fill", colorRegionHighlight);
//         })
//         .on("mouseout", function () {
//             if (this !== elementClicked) {
//                 d3.select(this).attr("fill", colorRegionNormal);
//             }
//         })
//         .on("click", function () {
//             if (elementClicked) {
//                 d3.select(elementClicked)
//                     .attr("fill", colorRegionNormal)
//                     .attr("fill-opacity", 0.3);
//             }
//             elementClicked = this;
//             const selectionClicked = d3.select(elementClicked);
//             selectionClicked
//                 .attr("fill", colorRegionHighlight)
//             //.attr("fill-opacity", 0.3)
//             const regionClicked = selectionClicked.datum();
//             renderCirimeInRegion(regionClicked)
//         });

//     function resetAreas() {
//         if (elementClicked) {
//             d3.select(elementClicked).attr("fill", colorRegionNormal)
//             elementClicked = null;
//         }
//     }

//     return { resetAreas: resetAreas };
// }


// function renderCrimeInstances(root, data, projection) {
//     root.append("defs").append("filter")
//         .attr("id", "f1")
//         .attr("x", 0)
//         .attr("y", 0)
//         .append("feGaussianBlur")
//         .attr("in", "SourceGraphic")
//         .attr("stdDeviation", 5)

//     const geoPathGenerator = d3.geoPath()
//         .projection(projection);
//     const projectedData = data.features
//         .map(d => { d.position = [d.properties.lng, d.properties.lat]; return d.position })
//         .map(projection);
//     const hexbinGenerator = hexbin()
//         .extent([[0, 0], [800, 500]])
//         .radius(6);
//     const dataBined = hexbinGenerator(projectedData);

//     //const scaleColor = d3.scaleSequential()
//     //const scaleColor = d3.scaleSequentialSqrt()
//     //const scaleColor = d3.scaleSequentialSymlog()
//     const scaleColor = d3.scaleSequentialLog()
//         .domain(d3.extent(dataBined, d => d.length))
//         .interpolator(d3.interpolateBlues);
//     //.interpolator(d3.interpolateReds);
//     //.interpolator(d3.interpolateSpectral);

//     const radius = d3.scaleSqrt([0, d3.max(dataBined, d => d.length)], [0, hexbinGenerator.radius() * Math.SQRT2])

//     const groupPaths = root.append("g")
//         .attr("opacity", 1)
//         .selectAll("path")
//         .data(dataBined)
//         .join("path")
//         .attr("transform", d => `translate(${d.x},${d.y})`)
//         .attr("d", d => hexbinGenerator.hexagon(hexbinGenerator.radius()))
//         //.attr("d", d => hexbin.hexagon(radius(d.length)))
//         .attr("fill", d => scaleColor(d.length))

//     function renderCrimeInRegion(region) {
//         groupPaths.attr("opacity", d => d3.geoContains(region, projection.invert([d.x, d.y])) ? 1 : 0)
//     }

//     function resetCrime() {
//         groupPaths.attr("opacity", 1);
//     }

//     return {
//         renderCrimeInRegion: renderCrimeInRegion,
//         resetCrime: resetCrime,
//     };
// }

// function renderBackground(root, width, height, resetCrime, resetAreas) {
//     //const fillColor = "#99cc99"
//     const fillColor = "#fafafa"
//     root.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", fillColor)
//         .on("click", () => { resetCrime(); resetAreas() })
// }

function renderMap(root, dataAreas, dataCrime, width, height) {
    const projection = d3.geoMercator()
        .center(d3.geoCentroid(dataAreas))
        .scale(100000)
        .translate([width / 2, height / 2]);
    // .clipExtent([[0,0], [1000, 1000]]);
    //.fitWidth(width);
    //.extent([0, width]);

    const groupBackground = root.append("g").attr("class", "background")
    const groupCrime = root.append("g")
        .attr("class", "crime")
        .style("filter", "url(#f1)");
    const groupAreas = root.append("g").attr("class", "areas");

    const { renderCrimeInRegion, resetCrime } = renderCrimeInstances(groupCrime, dataCrime, projection);
    const { resetAreas } = renderAreas(groupAreas, dataAreas, projection, renderCrimeInRegion);
    renderBackground(groupBackground, width, height, resetCrime, resetAreas);

    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', zoomed);
    function zoomed(e) {
        console.log(e.transform);
        groupAreas.attr('transform', e.transform);
        groupCrime.attr('transform', e.transform);
    }
    root.call(zoom);
}


function renderAreas(root, data, projection, renderCirimeInRegion) {
    const geoPathGenerator = d3.geoPath()
        .projection(projection);
    const colorRegionStroke = "#8c8c8c";
    const colorRegionNormal = "#ddd";
    const colorRegionHighlight = "#000";
    let elementClicked = null;
    // root.append("g")
    //     .attr('class', "bounds")
    //     .append("d", geoPathGenerator.bounds(data));
    // console.log(geoPathGenerator.bounds(data))
    const groupPaths = root.attr("opacity", 1)
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", geoPathGenerator)
        .attr("fill", colorRegionNormal)
        .attr("fill-opacity", 0.3)
        .attr("stroke", colorRegionStroke)
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", colorRegionHighlight);
        })
        .on("mouseout", function () {
            if (this !== elementClicked) {
                d3.select(this).attr("fill", colorRegionNormal);
            }
        })
        .on("click", function () {
            if (elementClicked) {
                d3.select(elementClicked)
                    .attr("fill", colorRegionNormal)
                    .attr("fill-opacity", 0.3);
            }
            elementClicked = this;
            const selectionClicked = d3.select(elementClicked);
            selectionClicked
                .attr("fill", colorRegionHighlight)
            //.attr("fill-opacity", 0.3)
            const regionClicked = selectionClicked.datum();
            renderCirimeInRegion(regionClicked)
        });

    function resetAreas() {
        if (elementClicked) {
            d3.select(elementClicked).attr("fill", colorRegionNormal)
            elementClicked = null;
        }
    }

    return { resetAreas: resetAreas };
}


function renderCrimeInstances(root, data, projection) {
    const geoPathGenerator = d3.geoPath()
        .projection(projection);
    const projectedData = data.features
        .map(d => { d.position = [d.properties.lng, d.properties.lat]; return d.position })
        .map(projection);
    const hexbinGenerator = hexbin()
        .extent([[0, 0], [800, 500]])
        .radius(9);
    const dataBined = hexbinGenerator(projectedData);

    //const scaleColor = d3.scaleSequential()
    const scaleColor = d3.scaleSequentialSqrt()
        //const scaleColor = d3.scaleSequentialSymlog()
        //const scaleColor = d3.scaleSequentialLog()
        .domain(d3.extent(dataBined, d => d.length))
        .interpolator(d3.interpolateReds);
    //.interpolator(d3.interpolateSpectral);

    const radius = d3.scaleSqrt([0, d3.max(dataBined, d => d.length)], [0, hexbinGenerator.radius() * Math.SQRT2])

    const groupPaths = root.append("g")
        .attr("opacity", 1)
        .selectAll("path")
        .data(dataBined)
        .join("path")
        .classed("crimeInstances", true)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("d", d => hexbinGenerator.hexagon(hexbinGenerator.radius()))
        //.attr("d", d => hexbin.hexagon(radius(d.length)))
        .attr("fill", d => scaleColor(d.length))

    function renderCrimeInRegion(region) {
        groupPaths.attr("opacity", d => d3.geoContains(region, projection.invert([d.x, d.y])) ? 1 : 0)
    }

    function resetCrime() {
        groupPaths.attr("opacity", 1);
    }

    return {
        renderCrimeInRegion: renderCrimeInRegion,
        resetCrime: resetCrime,
    };
}

function renderBackground(root, width, height, resetCrime, resetAreas) {
    //const fillColor = "#99cc99"
    const fillColor = "#d9f7be"
    root.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", fillColor)
        .on("click", () => { resetCrime(); resetAreas() })
}


function renderBarChart(root, data, width, height) {
    const margin = { top: 10, right: 10, bottom: 50, left: 70 }
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.right;
    root.append("rect")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("fill", "blue")
        .attr("width", width)
        .attr("height", height)
    const dataGroupedByOffense = d3.groups(data.features, d => d.properties.Offense);
    //console.log(dataGroupedByOffense.map(d));
    const offenseTypes = dataGroupedByOffense.map(d => d[0])
    //const scaleY = d3.scaleBand().domain(offenseTypes).range(0, height);

    //const scaleX = d3.scaleLinear().domain().range();
}
function renderLineChart(root, data, width, height) {
    const margin = { top: 10, right: 10, bottom: 50, left: 70 }
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.right;
    root.append("rect")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("fill", "red")
        .attr("width", width)
        .attr("height", height)
}
