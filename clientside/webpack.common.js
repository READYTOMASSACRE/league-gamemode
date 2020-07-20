const path = require('path')
const fs = require('fs')

const outputPath = path.resolve("./dist")

// check if directory exists
fs.statSync(outputPath)

module.exports = {
  entry: "./src/app.ts",
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.d.ts'],
    mainFields: ["main"],
  },
  output: {
    path: outputPath,
    filename: "bundle.js"
  },
}