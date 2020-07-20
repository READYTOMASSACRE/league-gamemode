const { statSync, mkdirSync }   = require('fs')
const { resolve }               = require('path')
const { prompt }                = require('inquirer')
const ncp                       = require('ncp')
const rimraf                    = require('rimraf')
const program                   = require('commander')

const startTime           = Date.now()
const buildPath           = resolve('./', 'build')
const serversideFolders   = ['dist', 'node_modules', 'assets']
const serversidePath      = resolve('./', 'serverside')
const clientsidePath      = resolve('./', 'clientside', 'dist')
const cefPath             = resolve('./', 'cef', 'build')
const serverEntryScript   = resolve(serversidePath, 'index.js')
const clientEntryScript   = resolve('./', 'clientside', 'index.js')

console.info("Check if project files exist...")
statSync(serversidePath)
serversideFolders.forEach(folder => statSync(serversidePath + '/' + folder))
statSync(clientsidePath)
statSync(cefPath)
statSync(serverEntryScript)
statSync(clientEntryScript)
console.info("Check if project files exist...Success")

const destinationServerside         = resolve(buildPath, 'packages', 'league')
const destionationClientsideRoot    = resolve(buildPath, 'client_packages')
const destionationClientside        = resolve(destionationClientsideRoot, 'league')
const destionationCef               = resolve(buildPath, 'client_packages', 'cef')

program
  .command('make')
  .action(async () => {
    try {
      statSync(buildPath)
      console.info(`The folder ${buildPath} is already exists.`)

      const answer = await prompt({
        type: 'input',
        name: 'deleteFolder',
        message: `Delete the folder "${buildPath}"? (y/n):`
      })

      const answerYes = !!answer.deleteFolder.match(/y/gi)

      if (answerYes) {
        rimraf.sync(buildPath)
      } else {
        console.info('Build process stopped.')
        process.exit()
      }
    } catch (err) {}

    console.info(`Making the build folder ${buildPath}...`)
    makeBuildDir([
      buildPath,
      destinationServerside,
      destionationClientside,
      destionationCef,
    ])
    console.info(`Making the build folder ${buildPath}...Success`)

    console.info(`Copying project files in ${buildPath}...`)
    await copyFiles(
      serversideFolders.map(folder => serversidePath + '/' + folder),
      serversideFolders.map(folder => destinationServerside + '/' + folder),
    )
    await copyFiles(
      [clientsidePath, cefPath],
      [destionationClientside, destionationCef],
    )

    await copyFile(serverEntryScript, destinationServerside + '/index.js')
    await copyFile(clientEntryScript, destionationClientsideRoot + '/index.js')

    console.info(`Copying project files in ${buildPath}...Success`)

    console.info('Making build folder is completed for ' + Math.round((Date.now() - startTime)/1000) + ' seconds.')
  })
  .parse(process.argv)

function makeBuildDir(paths) {
  paths.forEach(folderPath => {
    mkdirSync(folderPath, { recursive: true })
    console.info('Created ' + folderPath)
  })
}

async function copyFile(source, destination) {
  return new Promise(resolve => ncp(source, destination, () => {
    console.log(`Copied ${source} to ${destination}`)
    resolve()
  }))
}

async function copyFiles(sources, destinations) {
  const promises = sources
    .filter((_, index) => typeof destinations[index] !== 'undefined')
    .map((source, index) => copyFile(source, destinations[index]))
  return Promise.all(promises)
}