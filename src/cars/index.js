// import * as d3 from "d3"

d3.json("./cars.json").then((data) => {

  // fields to bin
  const keys = ['Cylinders', 'Displacement', 'Weight_in_lbs', 'Acceleration']; // Can choosen from one of the properties.

  // fields of scatter plot
  const fieldX = "Horsepower";
  const fieldY = "Miles_per_Gallon";
  const fieldColor = "Origin"

  // layout
  const width = 950,
    height = 500;
  const widthBinnedChart = width / 3,
    heightBinnedChart = height / keys.length;
  const widthScatterPlot = width - widthBinnedChart,
    heightScatterPlot = height;


  const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  const filterFuncs = {};
  const [filterExtents, setFilterExtent] = createExtent(filterFuncs);

  // render histograms
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const groupBinedChart = svg.append("g")
      .attr("class", "group" + key)
      .attr("transform", `translate(0, ${heightBinnedChart * i})`);
    const filterFunc = renderBinnedChart(groupBinedChart, widthBinnedChart, heightBinnedChart, data, key, setFilterExtent);
    filterFuncs[key] = filterFunc;
  }

  // render scatter plot
  const groupScatterPlot = svg.append("g")
    .attr("class", "groupScatterPlot")
    .attr("transform", `translate(${widthBinnedChart}, 0)`)

  filterFuncs["scatter"] = renderScatterPlot(groupScatterPlot, widthScatterPlot, heightScatterPlot, data, fieldX, fieldY, fieldColor, setFilterExtent);
});

function renderBinnedChart(root, width, height, data, key, setFilterExtent) {
  // layout
  const margin = { top: 10, right: 10, bottom: 40, left: 50 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;

  // data manipulation
  const extent = d3.extent(data, d => d[key]);
  const bin = d3.bin()
    .domain(extent)
    .value(d => d[key])
  //.thresholds(d3.thresholdSturges);
  const binnedData = bin(data);
  let maxY = 0;
  binnedData.forEach(d => { if (d.length > maxY) maxY = d.length });
  const bandStep = width / binnedData.length;
  const bandWidth = bandStep * 0.9;
  const bandPadding = (bandStep - bandWidth) / 2;

  // scales
  const scaleX = d3.scaleLinear()
    .domain(extent)
    .range([0, width])
    .nice()
    .clamp(true);
  const scaleY = d3.scaleLinear()
    .domain([0, maxY])
    .range([height, 0])
    .nice()
    .clamp(true);

  // groups
  const groupAxisX = root.append("g")
    .attr("class", "groupAxisX")
    .attr("transform", `translate(${margin.left}, ${margin.top + height})`);
  const groupAxisY = root.append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupTitle = root.append("g")
    .attr("class", "title")
    .attr("transform", `translate(${margin.left + width / 2}, ${margin.top + height})`)
  const groupPlot = root.append("g")
    .attr("class", "groupPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupMarks = groupPlot.append("g")
    .attr("class", "groupMarks")
  const groupMarksFiltered = groupPlot.append("g")
    .attr("class", "groupMarksFiltered")

  // draw
  groupAxisX.call(d3.axisBottom(scaleX));
  groupAxisY.call(d3.axisLeft(scaleY))
    .call(g =>
      g.selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", width)
    ).call(g =>
      g.selectAll(".tick")
        .each(function (node, i) {
          if (i % 2 === 1) d3.select(this).select("text").remove();
        })
    );
  groupTitle.append("text")
    .text(key)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("y", groupAxisX.node().getBBox().height + groupTitle.node().getBBox().height)
  groupMarks.selectAll("rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "grey")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", d => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", d => scaleY(0) - scaleY(d.length))
  const barsFiltered = groupMarksFiltered.selectAll("rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "steelblue")
    .attr("x", (d, i) => i * bandStep + bandPadding)
    .attr("y", d => scaleY(d.length))
    .attr("width", bandWidth)
    .attr("height", d => scaleY(0) - scaleY(d.length))


  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("brush end", brushed); // "end" to capture the event that click but not drag.
  brush(groupPlot);

  function brushed(e) {
    const { selection } = e;
    if (selection) {
      setFilterExtent(key, [scaleX.invert(selection[0]), scaleX.invert(selection[1])]);
    } else { // reset
      setFilterExtent(key)
    }
  }

  function filterData(filterExtents) {
    barsFiltered
      .attr("y", d => {
        d = d.filter(d => {
          for (const key in filterExtents) {
            const extent = filterExtents[key];
            if (extent && (d[key] < extent[0] || d[key] > extent[1])) return false;
          }
          return true;
        })
        return scaleY(d.length)
      })
      .attr("height", d => {
        d = d.filter(d => {
          for (const key in filterExtents) {
            const extent = filterExtents[key];
            if (extent && (d[key] < extent[0] || d[key] > extent[1])) return false;
          }
          return true;
        })
        return scaleY(0) - scaleY(d.length)
      });
  }

  return filterData;
}


function renderScatterPlot(root, width, height, data, fieldX, fieldY, fieldColor, setFilterExtent) {
  // settings
  const radius = 3;
  const colorHidden = "#ddd";
  const tooltipFields = ['Miles_per_Gallon', 'Cylinders', 'Displacement', 'Horsepower', 'Weight_in_lbs', 'Acceleration', 'Name'];

  // layout
  const margin = { top: 10, right: 100, bottom: 40, left: 60 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;

  // data manipulation
  data = data.filter((d) => !!(d[fieldX] && d[fieldY]))
  const extentX = [0, d3.max(data, d => d[fieldX])];
  const extentY = [0, d3.max(data, d => d[fieldY])];
  const valuesColorSet = new Set;
  for (const datum of data) {
    valuesColorSet.add(datum[fieldColor]);
  }
  const valuesColor = Array.from(valuesColorSet);

  // scales
  const scaleX = d3.scaleLinear()
    .domain(extentX)
    .range([0, width])
    .nice()
    .clamp(true);
  const scaleY = d3.scaleLinear()
    .domain(extentY)
    .range([height, 0])
    .nice()
    .clamp(true);
  const scaleColor = d3.scaleOrdinal()
    .domain(valuesColor)
    .range(d3.schemeTableau10);

  // groups
  const groupAxisX = root.append("g")
    .attr("class", "groupAxisX")
    .attr("transform", `translate(${margin.left}, ${margin.top + height})`);
  const groupAxisY = root.append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupTitle = root.append("g")
    .attr("class", "title")
    .attr("transform", `translate(${margin.left + width / 2}, ${margin.top + height})`)
  const groupMarks = root.append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  const groupLegends = root.append("g")
    .attr("class", "groupLegends")
    .attr("transform", `translate(${margin.left + width}, ${margin.top})`)
  const groupTooltip = root.append("g")
    .attr("class", "tooltip")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

  // draw
  groupAxisX.call(d3.axisBottom(scaleX))
    .call(g =>
      g.selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("y2", -height)
    )
    .append("text")
    .text(fieldX)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", width / 2)
    .attr("y", 30)
  groupAxisY.call(d3.axisLeft(scaleY))
    .call(g =>
      g.selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", width)
    )
    .append("g")
    .attr("transform", `translate(${-margin.left / 2 - 5}, ${height / 2})`)
    .append("text")
    .text(fieldY)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .style("writing-mode", "tb")
    .attr("transform", "rotate(180)");

  const circles = groupMarks.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", d => scaleColor(d[fieldColor]))
    .attr("cx", d => scaleX(d[fieldX]))
    .attr("cy", d => scaleY(d[fieldY]))
    .attr("r", radius)
    .on("mouseover", onMouseover)
    .on("mouseleave", onMoueleave);

  renderLegends(groupLegends, margin.right, height + margin.top + margin.left, fieldColor, scaleColor);
  const { showTooltip, updateTooltip } = renderTooltip(groupTooltip, 0, 0, data, tooltipFields);
  showTooltip(false);

  //groupTooltip.attr("display", null)
  function onMouseover(e) {
    const circleSelected = d3.select(this);
    const data = circleSelected.datum();
    const dx = 10,
      dy = 10;
    const x = +circleSelected.attr("cx") + margin.left + dx;
    const y = +circleSelected.attr("cy") + margin.top + dy;
    //renderTooltip(groupTooltip, x, y, data, tooltipFields);
    updateTooltip(x, y, data)
    showTooltip(true);
  }
  function onMoueleave(e) {
    //groupTooltip.attr("display", "none");
    //groupTooltip.selectAll("*").remove();
    showTooltip(false);
  }

  function filterData(filterExtents) {
    circles
      .attr("stroke", d => {
        for (const key in filterExtents) {
          const extent = filterExtents[key];
          if (extent && (d[key] < extent[0] || d[key] > extent[1])) return colorHidden;
        }
        return scaleColor(d[fieldColor]);
      })
  }

  return filterData;
}

function renderLegends(root, width, height, field, scaleColor) {
  // settings
  const radius = 4;

  // layout
  const margin = { top: 30, right: 50, bottom: height / 6 * 5, left: 10 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;
  // data manipulation
  const domain = scaleColor.domain();

  //scale
  const scaleY = d3.scalePoint()
    .domain(domain)
    .range([height, 0]);

  // groups
  const groupTitle = root.append("g")
    .attr("class", "groupTitle")
    .attr("transform", `translate(${margin.left + width / 2}, ${5})`)
  const groupAxisY = root.append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left + width}, ${margin.top})`)
  const groupMarks = root.append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)


  // draw
  groupTitle.append("text")
    .attr("text-anchor", "start")
    .text(field);
  groupAxisY.call(d3.axisRight(scaleY))
    .call(g =>
      g.selectAll(".domain").remove()
    );
  groupMarks.selectAll("circle")
    .data(domain)
    .join("circle")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", d => scaleColor(d))
    .attr("cx", width / 2)
    .attr("cy", d => scaleY(d))
    .attr("r", radius);
}

function renderTooltip(root, x, y, data, fieldsToShow) {
  // settings
  const colorBackground = "#fff";
  const colorKey = "#888"
  const fontSize = "12px";
  const fontWeight = "normal"
  const fontFamily = "sans-serif";
  const textSpan = 15;

  // groups
  root.attr("transform", `translate(${x}, ${y})`);
  const groupBackground = root.append("g");
  const groupKeyText = root.append("g").attr("color", colorKey);
  const groupValueText = root.append("g");
  const paddingBackground = { top: 10, right: 10, bottom: 2, left: 10 };

  // draw
  for (let i = 0; i < fieldsToShow.length; i++) {
    const field = fieldsToShow[i] ?? "none";
    groupKeyText.append("text")
      .text(field + ":　")
      //.attr("font-color", colorKey)
      .attr("stroke", colorKey)
      .attr('y', textSpan * i + 10)
      .attr("font-size", fontSize)
      .attr("font-weight", fontWeight)
      .attr("font-family", fontFamily)
      .attr("text-anchor", "end")
    groupValueText.append("text")
      .attr("class", field + "_value")
      .text(data[field])
      .attr('y', textSpan * i + 10)
      .attr("font-size", fontSize)
      .attr("font-weight", fontWeight)
      .attr("font-family", fontFamily)
      .attr("text-anchor", "start")
  }
  const bboxKey = groupKeyText.node().getBBox();
  const bboxValue = groupValueText.node().getBBox();
  groupKeyText.attr("transform", `translate(${bboxKey.width + paddingBackground.left}, ${paddingBackground.top})`)
  groupValueText.attr("transform", `translate(${bboxKey.width + paddingBackground.left}, ${paddingBackground.top})`)
  groupBackground.append("rect")
    .attr("fill", colorBackground)
    .attr("opacity", 1)
    .attr("width", bboxKey.width + bboxValue.width + paddingBackground.left + paddingBackground.right)
    .attr("height", Math.max(bboxKey.height, bboxValue.height) + paddingBackground.top + paddingBackground.left)
    .attr("stroke", "#000")
    .attr("rx", "10px")


  function show(isDisplay = true) {
    if (!isDisplay) {
      root.style("display", "none");
      return;
    }
    root.style("display", null);

  }

  function update(x, y, data) {
    root.attr("transform", `translate(${x}, ${y})`)
    for (let i = 0; i < fieldsToShow.length; i++) {
      const field = fieldsToShow[i] ?? "none";
      groupValueText.select("." + field + "_value")
        .text(data[field])
    }
    const newBBoxValue = groupValueText.node().getBBox();
    groupBackground.select("rect")
      .attr("width", bboxKey.width + newBBoxValue.width + paddingBackground.left + paddingBackground.right)
      .attr("height", Math.max(bboxKey.height, newBBoxValue.height + paddingBackground.top + paddingBackground.bottom))
  }

  return {
    showTooltip: show,
    updateTooltip: update
  };
}

/**
* @param {([key: string]: (extent: [number, number]) => void)[]} updateFuncs
*/
function createExtent(updateFuncs = {}) {
  const filterExtents = {};

  function setFilterExtent(key, value) {
    filterExtents[key] = value;
    for (const key in updateFuncs) {
      updateFuncs[key](filterExtents);
    }
  }

  return [filterExtents, setFilterExtent];
}