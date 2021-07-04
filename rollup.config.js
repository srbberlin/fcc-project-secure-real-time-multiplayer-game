import fs from 'fs'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
//import inject from '@rollup/plugin-inject'
//import json from '@rollup/plugin-json'
//import serve from 'rollup-plugin-serve'
//import { babel } from '@rollup/plugin-babel'

function copyAndWatch(fileIn, fileOut) {
  return {
    name: 'copy-and-watch',
    async buildStart() {
      this.addWatchFile(fileIn)
    },
    async generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: fileOut,
        source: fs.readFileSync(fileIn)
      })
    }
  }
}

const config = [
  {
    input: './src/browser/game.js',
    output: {
      name: 'game',
      dir: './public',
      format: 'iife'
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      copyAndWatch('./views/index.html', 'index.html'),
      copyAndWatch('./src/browser/style.css', 'style.css'),
    ]
  },
  {
    input: './src/server/server.js',
    output: {
      name: 'server',
      dir: './'
    },
    plugins: [
      copyAndWatch('./src/Collectible.js', 'Collectible.js'),
      copyAndWatch('./src/Player.js', 'Player.js'),
      copyAndWatch('./src/Item.js', 'Item.js'),
      copyAndWatch('./src/List.js', 'List.js'),
      copyAndWatch('./src/dim.js', 'dim.js'),
    ]
  }
]

export default config


/*,
	{
		input: './src/server/server.js',
		external: [
			'dotenv',
			'fs',
			'express',
			'helmet',
			'nocache',
			'chai',
			'socket.io',
			'path',
			'constants',
			'stram',
			'util',
			'assert'
			//'../../routes/fcctesting.js',
			//'../../test-runner.js'
		],
		output: [
			{
				globals: {
					dotenv: 'dotenv',
					fs: 'fs',
					express: 'express',
					helmet: 'helmet',
					nocache: 'nocache',
					expect: 'chai',
					socket: 'socket.io',
					path: 'path',
					constants: 'constants',
					stream: 'stream',
					util: 'util',
					assert: 'assert'
				},
				name: 'server',
				file: "./dist/server.js",
				format: 'umd'
			}
		],
		plugins: [
			resolve(), // so Rollup can find external packages
			commonjs(), // so Rollup can convert packages to ES modules
			json()
		]
	}*/
/*
			serve({
				open: true,
				host: 'localhost',
				port: 3000,
				contentBase: './public',
				onListening: function (server) {
					//const address = server.getAddress()
					//const host = address.host === '::' ? 'localhost' : address.host
					// by using a bound function, we can access options as `this`
					//const protocol = this.https ? 'https' : 'http'
					//console.log(`Server listening at ${protocol}://${host}:${address.port}/`)
					console.log(`Server listening on port ${server._connectionKey}\n`, process.cwd())
				}
			}),
			json(),*/
