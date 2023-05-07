

const { join: joinPath, resolve: resolvePath } = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')




module.exports = {
    mode: 'development',
    entry: joinPath(__dirname, '/src/index.ts'),
    output: {
        path: resolvePath(__dirname, '../')
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-typescript']
                    }
                }
            },
            {
                test: /\.svg$/i,
                use: ['@svgr/webpack']
            },
            {
                test: /\.(png|jp(e*)g|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            }
        ]
    },
    resolve: {
        alias: {
            'src': resolvePath(__dirname, 'src')
        },
        extensions: ['*', '.js', '.ts', '.scss']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: joinPath(__dirname, 'public', 'index.html')
        })
    ]
}
