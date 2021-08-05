console.log(roughViz);

new roughViz.Bar(
    {
        element: '#divContainer',
        //data: [[1,2], [5, 6], [8,8], [5, 100], [200, 10], [50, 50]],
        data: 'https://gist.githubusercontent.com/mbostock/3310560/raw/98311dc46685ed02588afdcb69e5fa296febc1eb/letter-frequency.tsv',
        title: 'Letters',
        labels: 'letter',
        values: 'frequency',
        //width: window.innerWidth,
        width: 500,
        height: 360,
        stroke: 'coral',
        strokeWidth: 3,
        color: 'pink',
        fillWeight: 1.5,
    }
);