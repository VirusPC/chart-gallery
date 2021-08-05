import vegaEmbed from "vega-embed";
import * as d3 from "d3";
import spec from "./specification.vl.json";
import penguinsURL from "./penguins_size.csv";
//import "./index.css"

vegaEmbed("#container", spec).then((res) => {
  const { view } = res;

  // read data and visualize it step by step
  d3.csv(penguinsURL, (data, i) => ({
    species: data.species,
    mass: +data.body_mass_g,
  }))
    .then((rawData) => rawData.filter((entry) => entry.mass !== NaN))
    .then((data) => {
      data.sort(() => (Math.random() < 0.5 ? -1 : 1));
      const getSpecies = (d) => d.species;
      const getMass = (d) => d.mass;

      // split data into blocks
      const maxDataLength = 30; // size of one block
      const maxItr = Math.ceil(data.length / maxDataLength); // iterations
      let dataMerged = new Map(); // data to be visualized each iteration
      for (let itr = 0; itr < maxItr; itr++) {
        // get current data block, and group it by species
        const dataCurItr = data.splice(0, maxDataLength);
        const dataGrouped = d3.group(dataCurItr, getSpecies);

        // merge current data with previous data
        for (const key of dataGrouped.keys()) {
          const masses = dataGrouped.get(key).map(getMass);
          masses.sort();
          if (dataMerged.has(key)) {
            const massesMerged = mergeSortedData(dataMerged.get(key), masses);
            dataMerged.set(key, massesMerged);
          } else {
            dataMerged.set(key, masses);
          }
        }

        // calculate summary
        const summary = [];
        for (const key of dataMerged.keys()) {
          const masses = dataMerged.get(key);
          summary.push({
            species: key,
            ...calculateSummary(masses),
          });
        }

        // update view in sequence
        setTimeout(() => {
          view
            .change(
              "penguins",
              view
                .changeset()
                .remove(() => true)
                .insert(summary)
            )
            .run();
        }, 1000 * itr);
      }
    });
});

/**
 * calculate summary for a given array of numbers.
 * @param {number[]} sortedArr
 * @returns {object}
 */
function calculateSummary(sortedArr) {
  if(sortedArr.length <= 0){
    return {
      lower: 0,
      q1: 0,
      median: 0,
      q3: 0,
      upper: 0,
      outliers: 0,
    }
  }
  const q1 = d3.quantileSorted(sortedArr, 1 / 4);
  const median = d3.quantileSorted(sortedArr, 1 / 2);
  const q3 = d3.quantileSorted(sortedArr, 3 / 4);

  const iqr = q3 - q1;
  const top = q3 + 1.5 * iqr;
  const bottom = q1 - 1.5 * iqr;
  let upper = Number.MIN_VALUE;
  let lower = Number.MAX_VALUE;
  const outliers = [];
  for (let i = 0; i < sortedArr.length; i++) {
    const curNum = sortedArr[i];
    if (curNum < bottom || curNum > top) {
      outliers.push(curNum);
    } else if (curNum > upper) {
      upper = curNum;
    } else if (curNum < lower) {
      lower = curNum;
    }
  }

  return {
    lower: +lower,
    q1: q1,
    median: median,
    q3: q3,
    upper: +upper,
    outliers: outliers,
  };
}

/**
 * merge two sorted array.
 * immutable.
 *
 * @param {number[]} oldData sorted
 * @param {number[]} newData sorted
 */
function mergeSortedData(oldData, newData) {
  if (newData.length === 0) return [...oldData];
  // newData.sort();
  if (oldData.length === 0) return [...newData];

  // merge
  const resultData = [];
  const oldLength = oldData.length;
  const newLength = newData.length;
  let m = 0;
  let n = 0;
  while (m < oldLength && n < newLength) {
    if (oldData[m] <= newData[n]) {
      resultData.push(oldData[m]);
      ++m;
    } else {
      resultData.push(newData[n]);
      ++n;
    }
  }
  if (m >= oldLength) {
    resultData.push(newData[n]);
    while (++n < newLength) {
      resultData.push(newData[n]);
    }
  } else if (n >= newLength) {
    resultData.push(oldData[m]);
    while (++m < oldLength) {
      resultData.push(oldData[m]);
    }
  }

  return resultData;
}