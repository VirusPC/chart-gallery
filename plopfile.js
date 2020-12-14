module.exports = function(plop){
    plop.setGenerator('template', {
        description: 'create template',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'example name please'
        }],
        actions: [{
            type: 'add',
            path: 'src/{{kebabCase name}}/index.ts'
        },{
            type: 'add',
            path: 'src/{{kebabCase name}}/index.html',
            templateFile: 'templates/example-template.hbs'
        },{
            type: 'modify',
            path: 'src/index.html',
            pattern: '<!-- Example Insert Point -->',
            template: `<li><a href="./{{kebabCase name}}/index.html">{{titleCase name}}</a></li>
                <!-- Example Insert Point -->`
        }]
    })
} 