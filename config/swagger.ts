import path from 'path'

export default {
    path: path.join(__dirname, '../'),
    title: 'My API',
    version: '1.0.0',
    dirs: ['app/Controllers/Http'],
    ignore: ['/swagger', '/docs'],
    tagIndex: 2,
    snakeCase: false,
    common: {
        parameters: {},
        headers: {},
    }

}
