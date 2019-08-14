import test from 'ava'
import fetch from 'cross-fetch'
import { readFileSync } from 'fs'
import { rm } from 'shelljs'
import { imageInfo } from '../src'
import { File } from '../src/file/file'
import { main } from '../src/main/main'
import { getOption } from '../src/options'
import { filterResultStdErr } from './testUtil'
import fileType = require('file-type')

test.serial('from url request as array buffer view', async t => {
  const u = 'https://cancerberosgx.github.io/demos/geometrizejs-cli/bridge.jpg', o = {}
  const r = await fetch(u, o)
  const result = await main({
    command: ['identify', 'bridge.jpg'],
    inputFiles: [{ name: 'bridge.jpg', content: new Uint8Array(await r.arrayBuffer()) }]
  })
  t.true(result.stdout.join('').includes('bridge.jpg JPEG 500x333 500x333+0+0 8-bit sRGB 35527B'))
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)
})

test('InputFile.fromUrl', async t => {
  const url = 'https://cancerberosgx.github.io/demos/geometrizejs-cli/bridge.jpg'
  const result = await main({
    command: ['identify', 'bridge.jpg'],
    inputFiles: [await File.fromUrl(url)]
  })
  t.true(result.stdout.join('').includes('bridge.jpg JPEG 500x333 500x333+0+0 8-bit sRGB 35527B'))
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)
})

test.serial('InputFile.fromFile', async t => {
  let result = await main({
    command: ['convert', 'chala.tiff', '-scale', '200%', 'bigger.tiff'],
    inputFiles: [await File.fromFile('test/assets/chala.tiff')],
  })
  t.deepEqual(fileType(result.outputFiles[0].content.buffer), { ext: 'tif', mime: 'image/tiff' })
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)
  result = await main({
    command: ['identify', 'bigger.tiff'],
    inputFiles: result.outputFiles
  })
  t.true(result.stdout.join('').includes('bigger.tiff TIFF 100x100 100x100+0+0 8-bit sRGB 30346B'))
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)
})

test.serial('accept array buffer view', async t => {
  let result = await main({
    command: ['convert', 'chala.tiff', '-scale', '200%', 'bigger.tiff'],
    inputFiles: [await File.fromFile('test/assets/chala.tiff')],
  })
  t.deepEqual(fileType(result.outputFiles[0].content.buffer), { ext: 'tif', mime: 'image/tiff' })
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)
  result = await main({
    command: ['identify', 'bigger.tiff'],
    inputFiles: result.outputFiles
  })
  t.true(result.stdout.join('').includes('bigger.tiff TIFF 100x100 100x100+0+0 8-bit sRGB 30346B'))
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)
})

test.serial('size()', async t => {
  var f = await File.fromFile('test/assets/n.png')
  var i = await imageInfo(f)
  t.deepEqual(i[0].image.mimeType, 'image/png')
  t.deepEqual(await f!.size(), { width: 109, height: 145 })
})

test('isFile()', async t => {
  var f = await File.fromFile('test/assets/n.png')
  t.true(File.isFile(f))
  var f2 = { name: 'foo.png', content: readFileSync('test/assets/n.png') }
  t.false(File.isFile(f2))
})

test.serial('protected files are not erased', async t => {
  rm('-rf', getOption('nodeFsLocalRoot') + '/*')
  t.false(await File.fileExists('protected1.tiff'))
  t.false(await File.fileExists('unprotected1.tiff'))
  t.false(await File.fileExists('aa33ee.gif'))
  t.true(await File.fileExists('/'))
  let result = await main({
    command: ['convert', 'protected1.tiff', 'unprotected1.tiff', '-scale', '60%', 'aa33ee.gif'],
    inputFiles: [await File.fromFile('test/assets/chala.tiff', { protected: true, name: 'protected1.tiff' }), await File.fromFile('test/assets/chala.tiff', { name: 'unprotected1.tiff' })],
  })
  t.deepEqual(fileType(result.outputFiles[0].content.buffer), { ext: 'gif', mime: 'image/gif' })
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)

  t.true(await File.fileExists('protected1.tiff'))
  t.false(await File.fileExists('unprotected1.tiff'))
  t.false(await File.fileExists('aa33ee.gif'))

  result = await main({
    command: ['identify', 'protected1.tiff'],
    inputFiles: []
  })
  t.true(result.stdout.join('').includes('protected1.tiff TIFF 50x50 50x50+0+0 8-bit sRGB 7824B'))
  t.deepEqual(filterResultStdErr(result), [])
  t.falsy(result.error)

})

