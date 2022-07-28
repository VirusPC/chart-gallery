import * as d3 from "d3";
import dataScanNovel from "/src/data/interaction2/scan-novel.json";
import dataScanPaper from "/src/data/interaction2/scan-paper.json";
import dataFixationNovel from "/src/data/interaction2/fixation-novel.json";
import dataFixationPaper from "/src/data/interaction2/fixation-paper.json";
import dataMouseNovel from "/src/data/interaction2/mouse-novel.json";
import dataMousePaper from "/src/data/interaction2/mouse-paper.json";
const container = document.querySelector("#container");

// 赶的匆忙，待优化代码结构

main();
async function main() {
  const width = 800,
    height = 180;
  const fieldX = "Interface";
  const fieldY1 = "scan path length (10^3 px)";
  const fieldY2 = "#fixation";
  const fieldY3 = "mouse move distacne (10^2 px)";
  const fieldMean = "mean";
  const fieldTop = "top";
  const fieldBottom = "bottom";

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height * 3)
    .attr("viewbox", `0 0 ${width} ${height * 3}`);
  const barChart1 = svg.append("g");
  const barChart2 = svg
    .append("g")
    .attr("transform", `translate(0, ${height})`);
  const barChart3 = svg
    .append("g")
    .attr("transform", `translate(0, ${height * 2})`);
// const getMinY = getMinYY();
  renderBarChartWithErrorBar(
    barChart1,
    width,
    height,
    dataScanNovel,
    dataScanPaper,
    fieldX,
    fieldY1,
    fieldMean,
    fieldTop,
    fieldBottom,
    50
  );
  renderBarChartWithErrorBar(
    barChart2,
    width,
    height,
    dataFixationNovel,
    dataFixationPaper,
    fieldX,
    fieldY2,
    fieldMean,
    fieldTop,
    fieldBottom,
    50
  );
  renderBarChartWithErrorBar(
    barChart3,
    width,
    height,
    dataMouseNovel,
    dataMousePaper,
    fieldX,
    fieldY3,
    fieldMean,
    fieldTop,
    fieldBottom,
    200
  );
}
// const minYs = [50, 20, 100];
// let counter = 0;
function* getMinYY(){
  yield 50;
  yield 20;
  yield 100;
}
function renderBarChartWithErrorBar(
  root,
  width,
  height,
  data1,
  data2,
  fieldX,
  fieldY,
  fieldMean,
  fieldTop,
  fieldBottom,
  minYYY
) {
  const margin = { top: 20, right: 0, bottom: 20, left: 70 };

  const scaleX = d3
    .scaleBand()
    .domain(data1.map((d) => d[fieldX]))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  const maxY = Math.max(
    d3.max(data1, (d) => d[fieldTop]),
    d3.max(data2, (d) => d[fieldTop])
  );
  const minY = Math.min(
    d3.min(data1, (d) => d[fieldBottom]),
    d3.min(data2, (d) => d[fieldBottom])
  );
  console.log(minY);
  // console.log(1);
  // console.log(counter);
  // console.log(minYs[counter]);
  // console.log(getMinY());
  const scaleY = d3
    .scaleLinear()
    .domain([minYYY, maxY])
    .nice(50)
    .range([height - margin.bottom, margin.top]);
  const axisGroup = root.append("g");
  const barsGroupLeft = root.append("g");
  const barsGroupRight = root.append("g");
  const errorBarsGroupLeft = root.append("g");
  const errorBarsGroupRight = root.append("g");
  drawAxis(
    axisGroup,
    width,
    height,
    margin,
    scaleX,
    scaleY,
    fieldX,
    fieldY,
    fieldMean
  );
  drawBarsLeft(
    barsGroupLeft,
    width,
    height,
    data1,
    scaleX,
    scaleY,
    fieldX,
    fieldMean,
    minYYY  );
  drawBarsRight(
    barsGroupRight,
    width,
    height,
    data2,
    scaleX,
    scaleY,
    fieldX,
    fieldMean,
  );
  drawErrorBarsLeft(
    errorBarsGroupLeft,
    width,
    height,
    data1,
    scaleX,
    scaleY,
    fieldX,
    fieldY,
    fieldTop,
    fieldBottom
  );
  drawErrorBarsRight(
    errorBarsGroupRight,
    width,
    height,
    data2,
    scaleX,
    scaleY,
    fieldX,
    fieldY,
    fieldTop,
    fieldBottom
  );
}

function drawAxis(
  root,
  width,
  height,
  margin,
  scaleX,
  scaleY,
  titleX,
  titleY,
  fieldMean
) {
  // groups
  const groupAxisX = root
    .append("g")
    .attr("class", "groupAxisX")
    // .attr("opacity", 0)
    .attr("transform", `translate(0, ${height - margin.bottom})`);
  const groupAxisY = root
    .append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, 0)`);

  // draw
  groupAxisX
    .call(d3.axisBottom(scaleX).tickSizeOuter(0))
    // .call((g) =>
    //   g
    //     .selectAll(".tick line")
    //     .clone()
    //     .attr("stroke-opacity", 0.1)
    //     .attr("y2", -(height - margin.top - margin.bottom))
    // )
    .append("text")
    .text(titleX)
    .attr("opacity", 0)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 32);
  groupAxisY
    .call(d3.axisLeft(scaleY).ticks(5))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", width - margin.left - margin.right)
    )
    .append("g")
    .attr(
      "transform",
      `translate(${-margin.left / 2 - 10}, ${
        (height - margin.top - margin.bottom) / 2
      })`
    )
    .append("text")
    .text(titleY)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .style("writing-mode", "tb")
    .attr("transform", "rotate(180)");
}
function drawBarsLeft(
  root,
  width,
  height,
  data,
  scaleX,
  scaleY,
  fieldX,
  fieldY
) {
  root
    .selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("opacity", "1")
    .attr("fill", "rgb(244, 170, 178)")
    // .attr("stroke", "#fff")
    .attr("stroke", "#0")
    .attr("x", (d) => scaleX(d[fieldX]))
    .attr("y", (d) => scaleY(d[fieldY]))
    .attr("height", (d) => {
      return scaleY.range()[0] - scaleY(d[fieldY]);
    })
    .attr("width", scaleX.bandwidth() / 2);
}

function drawBarsRight(
  root,
  width,
  height,
  data,
  scaleX,
  scaleY,
  fieldX,
  fieldY
) {
  root
    .selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("opacity", "1")
    .attr("fill", "rgb(191, 180, 208)")
    // .attr("stroke", "#fff")
    .attr("stroke", "#0")
    .attr("x", (d) => scaleX(d[fieldX]) + scaleX.bandwidth() / 2)
    .attr("y", (d) => scaleY(d[fieldY]))
    .attr("height", (d) => {
      return scaleY.range()[0] - scaleY(d[fieldY]);
    })
    .attr("width", scaleX.bandwidth() / 2);
}

function drawErrorBarsLeft(
  root,
  width,
  height,
  data,
  scaleX,
  scaleY,
  fieldX,
  fieldMean,
  fieldTop,
  fieldBottom
) {
  const strokeWidth = 1;
  root
    .append("g")
    .selectAll(".h")
    .data(data)
    .join("line")
    .attr("opacity", "1")
    .attr("fill", "black")
    .attr("stroke", "black")
    // .attr("stroke-width", strokeWidth)

    .attr("x1", (d) => scaleX(d[fieldX]) + scaleX.bandwidth() / 4)
    .attr("y1", (d) => scaleY(d[fieldBottom]))
    .attr("x2", (d) => scaleX(d[fieldX]) + scaleX.bandwidth() / 4)
    .attr("y2", (d) => scaleY(d[fieldTop]));
  root
    .append("g")
    .selectAll(".h")
    .data(data)
    .join("line")
    .attr("opacity", "1")
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("x1", (d) => scaleX(d[fieldX]) + scaleX.bandwidth() / 8)
    .attr("y1", (d) => scaleY(d[fieldBottom]))
    .attr("x2", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 8) * 3)
    .attr("y2", (d) => scaleY(d[fieldBottom]));
  root
    .append("g")
    .selectAll(".h")
    .data(data)
    .join("line")
    .attr("opacity", "1")
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("x1", (d) => scaleX(d[fieldX]) + scaleX.bandwidth() / 8)
    .attr("y1", (d) => scaleY(d[fieldTop]))
    .attr("x2", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 8) * 3)
    .attr("y2", (d) => scaleY(d[fieldTop]));
  // [fieldMean, fieldTop, fieldY].forEach((fieldY) => {
  //   root
  //     .append("g")
  //     .selectAll(".mean")
  //     .data(data)
  //     .join("circle")
  //     .attr("opacity", "1")
  //     .attr("fill", "black")
  //     .attr("stroke", "black")
  //     .attr("cx", (d) => scaleX(d[fieldX]) + scaleX.bandwidth()/2)
  //     .attr("cy", (d) => scaleY(d[fieldY]))
  //     .attr("r", meanR);
  // });
}

function drawErrorBarsRight(
  root,
  width,
  height,
  data,
  scaleX,
  scaleY,
  fieldX,
  fieldMean,
  fieldTop,
  fieldBottom
) {
  const strokeWidth = 1;
  root
    .append("g")
    .selectAll(".h")
    .data(data)
    .join("line")
    .attr("opacity", "1")
    .attr("fill", "black")
    .attr("stroke", "black")
    // .attr("stroke-width", strokeWidth)

    .attr("x1", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 4) * 3)
    .attr("y1", (d) => scaleY(d[fieldBottom]))
    .attr("x2", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 4) * 3)
    .attr("y2", (d) => scaleY(d[fieldTop]));
  root
    .append("g")
    .selectAll(".h")
    .data(data)
    .join("line")
    .attr("opacity", "1")
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("x1", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 8) * 5)
    .attr("y1", (d) => scaleY(d[fieldBottom]))
    .attr("x2", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 8) * 7)
    .attr("y2", (d) => scaleY(d[fieldBottom]));
  root
    .append("g")
    .selectAll(".h")
    .data(data)
    .join("line")
    .attr("opacity", "1")
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("x1", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 8) * 5)
    .attr("y1", (d) => scaleY(d[fieldTop]))
    .attr("x2", (d) => scaleX(d[fieldX]) + (scaleX.bandwidth() / 8) * 7)
    .attr("y2", (d) => scaleY(d[fieldTop]));
  // [fieldMean, fieldTop, fieldY].forEach((fieldY) => {
  //   root
  //     .append("g")
  //     .selectAll(".mean")
  //     .data(data)
  //     .join("circle")
  //     .attr("opacity", "1")
  //     .attr("fill", "black")
  //     .attr("stroke", "black")
  //     .attr("cx", (d) => scaleX(d[fieldX]) + scaleX.bandwidth()/2)
  //     .attr("cy", (d) => scaleY(d[fieldY]))
  //     .attr("r", meanR);
  // });
}
