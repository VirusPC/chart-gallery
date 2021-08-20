import * as d3 from "d3";
import { field } from "vega";
import rawData from "/src/data/date-price";

main();

function main() {
  const fieldX = "date";
  const fieldY = "price";

  const timeParser = d3.timeParse("%b %d %Y");
  const data = rawData.map((d) => {
    return {
      [fieldX]: timeParser(d.date),
      [fieldY]: +d.price,
    };
  });

  const width = 700;
  const height = 450;
  const topLayoutBox = {
    x: 0,
    y: 0,
    height: height * 0.7,
    width: width,
  };
  const bottomLayoutBox = {
    x: 0,
    y: topLayoutBox.height,
    height: height - topLayoutBox.height,
    width: width,
  };

  const container = document.querySelector("#container");
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  const groupTop = svg
    .append("g")
    .classed("groupTop", true)
    .attr("transform", `translate(${topLayoutBox.x}, ${topLayoutBox.y})`);
  const groupBottom = svg
    .append("g")
    .classed("groupBottom", true)
    .attr("transform", `translate(${bottomLayoutBox.x}, ${bottomLayoutBox.y})`);

  const dateDomain = d3.extent(data, (d) => d[fieldX]);
  const priceDomain = [0, d3.max(data, (d) => d[fieldY])];

  const redraw = renderTop(
    groupTop,
    topLayoutBox,
    data,
    fieldX,
    fieldY,
    priceDomain,
    dateDomain
  );
  renderBottom(
    groupBottom,
    bottomLayoutBox,
    data,
    fieldX,
    fieldY,
    redraw,
    priceDomain,
    dateDomain
  );
}

function renderTop(
  root,
  layoutBox,
  data,
  fieldX,
  fieldY,
  priceDomain,
  dateDomain
) {
  const margin = { top: 30, right: 10, bottom: 50, left: 70 };
  const innerHeight = layoutBox.height - margin.top - margin.bottom;
  const innerWidth = layoutBox.width - margin.left - margin.right;

  const clipPathId = "topClipPath";
  const clipPath = root
    .append("clipPath")
    .attr("id", clipPathId)
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", innerWidth)
    .attr("height", innerHeight);
  const mainGroup = root
    .append("g")
    .classed("main", true)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("clip-path", `url(#${clipPathId})`);
  const axisXGroup = root
    .append("g")
    .classed("axisX", true)
    .attr(
      "transform",
      `translate(${margin.left}, ${margin.top + innerHeight})`
    );
  const axisYGroup = root
    .append("g")
    .classed("axisY", true)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const titleXgroup = axisXGroup.append("text").classed("titleX", true);
  const titleYgroup = axisYGroup.append("text").classed("titleY", true);

  const scaleX = d3.scaleTime().domain(dateDomain).range([0, innerWidth]);
  //.clamp(true);
  const scaleY = d3
    .scaleLinear()
    .domain(priceDomain)
    .range([innerHeight, 0])
    .nice();

  const areaGenerator = d3
    .line()
    .x((d) => scaleX(d[fieldX]))
    .y((d) => scaleY(d[fieldY]));

  axisXGroup.call(d3.axisBottom(scaleX).tickSizeOuter(0));
  axisYGroup.call(d3.axisLeft(scaleY));
  titleXgroup.append("text", "date");
  mainGroup.datum(data);
  const area = mainGroup
    .append("path")
    .datum((d) => d)
    .attr("stroke", "steelblue")
    .attr("fill", "none")
    .attr("d", areaGenerator);
  const circles = mainGroup
    .selectAll("circle")
    .data((d) => d)
    .join("circle")
    .attr("cx", (d) => scaleX(d[fieldX]))
    .attr("cy", (d) => scaleY(d[fieldY]))
    .attr("opacity", 0.5)
    .attr("r", 3);

  const bboxX = axisXGroup.node().getBBox();
  titleXgroup
    .datum(fieldX)
    .text((d) => d)
    .attr("fill", "black")
    .attr("font-weight", "700")
    .attr("font-size", "1.5em")
    .attr("transform", `translate(${bboxX.width / 2}, ${bboxX.height})`)
    .attr("dominant-baseline", "hanging");
  const bboxY = axisYGroup.node().getBBox();
  titleYgroup
    .datum(fieldY)
    .text((d) => d)
    .attr("fill", "black")
    .attr("font-weight", "700")
    .attr("font-size", "1.5em")
    .attr(
      "transform",
      `translate(${-bboxY.width}, ${bboxY.height / 2}) rotate(-90)`
    )
    .attr("dominant-baseline", "auto");

  const filterCircle = (elem) => circles.nodes().indexOf(elem) != -1;
  const translateXAnnotations = addAnnotationInteraction(
    mainGroup,
    innerWidth,
    innerHeight,
    fieldX,
    fieldY,
    scaleX,
    scaleY,
    filterCircle
  );

  function redraw(newDomain) {
    scaleX.domain(newDomain);
    axisXGroup.call(d3.axisBottom(scaleX).tickSizeOuter(0));
    area.attr("d", areaGenerator);
    circles
      .attr("cx", (d) => scaleX(d[fieldX]))
      .attr("cy", (d) => scaleY(d[fieldY]));
    translateXAnnotations(circles.nodes(), scaleX);
  }

  return redraw;
}

function renderBottom(
  root,
  layoutBox,
  data,
  fieldX,
  fieldY,
  redraw,
  priceDomain,
  dateDomain
) {
  const margin = { top: 30, right: 10, bottom: 50, left: 70 };
  const innerHeight = layoutBox.height - margin.top - margin.bottom;
  const innerWidth = layoutBox.width - margin.left - margin.right;

  const mainGroup = root
    .append("g")
    .classed("main", true)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const axisXGroup = root
    .append("g")
    .classed("axisX", true)
    .attr(
      "transform",
      `translate(${margin.left}, ${margin.top + innerHeight})`
    );

  const scaleX = d3.scaleTime().domain(dateDomain).range([0, innerWidth]);
  const scaleY = d3
    .scaleLinear()
    .domain(priceDomain)
    .range([innerHeight, 0])
    .nice();

  const areaGenerator = d3
    .area()
    .x((d) => scaleX(d[fieldX]))
    .y((d) => scaleY(d[fieldY]));

  axisXGroup.call(d3.axisBottom(scaleX).tickSizeOuter(0));
  mainGroup
    .append("path")
    .attr("stroke", "steelblue")
    .attr("fill", "none")
    .attr("d", areaGenerator(data));

  const brushed = function (event) {
    const domain = event.selection.map(scaleX.invert);
    redraw(domain);
  };
  const brush = d3
    .brushX()
    .handleSize(10)
    .extent([
      [0, 0],
      [innerWidth, innerHeight],
    ])
    .on("brush", brushed);
  mainGroup.call(brush);
}

/**
 *
 * @param {*} root
 * @param {*} width
 * @param {*} height
 * @param {*} filterFunc determine what type of elements can be add annotation.
 */
function addAnnotationInteraction(
  root,
  width,
  height,
  fieldX,
  fieldY,
  scaleX,
  scaleY,
  filterFunc
) {
  const annotationsGroup = root.append("g").classed("annotationGroup", true);
  const overlay = root
    .append("rect")
    .attr("opacity", 0)
    .attr("width", width)
    .attr("height", height);
  const targets = root.selectAll("*").nodes().filter(filterFunc);

  overlay.on("mousemove", highlight);
  const drag = d3
    .drag()
    .on("start", onDragStart)
    .on("drag", onDragging)
    .on("end", onDragEnd);
  drag(overlay);

  function highlight(e) {
    const elemsUnderPointer = document.elementsFromPoint(e.clientX, e.clientY);
    targets.forEach((target) => target.setAttribute("fill", "black"));
    for (const elem of elemsUnderPointer) {
      if (targets.indexOf(elem) !== -1) {
        elem.setAttribute("fill", "red");
      }
    }
  }

  let annotationTarget = null;
  let annotationGroup = null;
  const targetToAnnotationMap = {};
  //let start = [0, 0];
  function onDragStart(e) {
    console.log(e);
    const elemsUnderPointer = document.elementsFromPoint(
      e.sourceEvent.clientX,
      e.sourceEvent.clientY
    );
    for (const elem of elemsUnderPointer) {
      if (targets.indexOf(elem) !== -1) {
        annotationTarget = elem;
      }
    }
    if (annotationTarget === null) return;
    if(annotationTarget._annotationGroup) annotationTarget._annotationGroup.remove();

    //start = d3.pointer(e.sourceEvent, root.node());
    const targetDatum =  d3.select(annotationTarget).datum();
    const start = [scaleX(targetDatum[fieldX]), scaleY(targetDatum[fieldY])];
    annotationGroup = annotationsGroup.append("g").attr("transform", `translate(${start[0]}, ${start[1]})`);
    annotationGroup 
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 2);
    // .attr("x1", start[0])
    // .attr("y1", start[1])
    // .attr("x2", start[0])
    // .attr("y2", start[1])
    const annotationText = annotationGroup 
      .append("text")
      .datum(annotationTarget)
      .text((t) => d3.select(t).datum()["price"])
      .attr("stroke", "black")
      // .attr("x", start[0])
      // .attr("y", start[1])
      .attr("dominant-baseline", "hanging");
    const bbox = annotationText.node().getBBox();
    annotationGroup 
      .append("rect")
      // .attr("x", start[0])
      // .attr("y", start[1])
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("width", bbox.width)
      .attr("height", bbox.height);
    annotationTarget._annotationGroup = annotationGroup;
    //targetToAnnotationMap[annotationTarget] = annotationGroup; 
  }
  let offset = [0, 0];
  function onDragging(e) {
    console.log(targetToAnnotationMap);
    if (annotationTarget === null) return;
    const end = d3.pointer(e.sourceEvent, root.node());
    offset[0] += e.dx;
    offset[1] += e.dy;
    annotationGroup.select("line").attr("x2", offset[0]).attr("y2", offset[1]);
    annotationGroup.select("text").attr("x", offset[0]).attr("y", offset[1]);
    annotationGroup.select("rect").attr("x", offset[0]).attr("y", offset[1]);
  }
  function onDragEnd(e) {
    annotationTarget = null;
    offset = [0, 0];
    console.log(targetToAnnotationMap);
  }

  function translateXAnnotations(targets, newScaleX) {
    let i = 0;
    for(const target of targets) {
      const annotationGroup = target._annotationGroup//targetToAnnotationMap[target];
      if(!annotationGroup) continue;
      const targetSelection = d3.select(target);
      const datum = targetSelection.datum();
      const start = [newScaleX(datum[fieldX]), scaleY(datum[fieldY])];
      console.log(target);
      console.log(start);
      annotationGroup.attr("transform", `translate(${start[0]}, ${start[1]})`)
    }
  }
  return translateXAnnotations;
}

function getXYfromTransform(node) {
  try {
    const transform = node
      .attr("transform")
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map((i) => parseFloat(i));
    return transform;
  } catch (e) {
    return [0, 0];
  }
}
