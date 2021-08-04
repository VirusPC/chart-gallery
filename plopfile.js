const frameworks = ['D3', 'Vega', 'Vega-Lite', 'AntV', 'Echarts', 'RoughViz'];

const InsertPoints = {};
frameworks.forEach(framework => {
    InsertPoints[framework] = `<!-- ${framework} Insert Point -->`
});

module.exports = function (plop) {
    plop.setGenerator('demo', {
        description: 'Add new demo',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'Demo name please'
        }, {
            type: 'list',
            name: 'framework',
            message: 'Framework please',
            choices: frameworks,
            default: frameworks[0]
            // choices: frameworks.map(framework => ({
            //     name: framework
            // })),
            // default: frameworks[0]
        },
        {
            type: 'input',
            name: 'source',
            message: 'Demo source url please'
        }],
        actions: (answers) => [{
            type: 'add',
            path: 'src/{{kebabCase framework}}/{{kebabCase name}}/index.js'
        },{
            type: 'add',
            path: 'src/{{kebabCase framework}}/{{kebabCase name}}/index.html',
            templateFile: 'templates/demo-template.hbs'
        },{
            type: 'modify',
            path: 'src/index.html',
            pattern: `<!-- ${answers.framework} Insert Point -->`,
            template: `<li><a href="./{{kebabCase framework}}/{{kebabCase name}}/index.html">{{titleCase name}}</a></li>
        <!-- ${answers.framework} Insert Point -->`
        }]
    })
}