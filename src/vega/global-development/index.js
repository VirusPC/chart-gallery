import * as vega from 'vega'
import spec from './global-development.vega.json'
import data from './gapminder.json'

spec.data.find((d) => d.name === 'dataRoot').values = data;

console.log("spec", spec);

// `fetch(spec)
//   .then((res) => res.json())
//   .then((spec) => render(spec))
//   .catch((err) => console.error(err));`

render(spec);

function render(spec) {
  const view = new vega.View(vega.parse(spec), {
    renderer: "svg", // renderer (canvas or svg)
    container: "#container", // parent DOM container
    hover: true, // enable hover processing
  });
  return view.runAsync();
}