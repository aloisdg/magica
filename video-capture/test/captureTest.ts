import test from 'ava'
import { printMs } from 'misc-utils-of-mine-generic'
import { VideoCapture } from '../src/capture'

test.cb('addFrameListener single ', t => {
  const c = new VideoCapture({ port: 8082 })
  c.addFrameListener(frame => {
    t.deepEqual([frame.width, frame.height, frame.data.length], [480, 360, 691200])
    t.end()
  })
  c.start()
})

test.cb('addFrameListener multiple ', t => {
  let t0 = Infinity
  let t1 = Date.now()
  let i = 0
  const c = new VideoCapture({
    width: 200, height: 200, port: 8081
  })
  c.addFrameListener(frame => {
    i++
    t.deepEqual([frame.width, frame.height, frame.data.length], [200, 200, 160000])
    if (i > 50) {
      // console.log(i, 'frames', printMs(Date.now() - t0))
      // console.log('total', printMs(Date.now() - t1))
      t.end()
    }
  })
  c.initialize().then(() => {
    t0 = Date.now()
    c.start()
  })
})

test('users requesting frames instead notifications', async t => {
  const c = new VideoCapture({
    width: 100, height: 100, port: 8083
  })
  await c.initialize()
  const f = await c.readFrame()
  const f2 = await c.readFrame()
  t.deepEqual([f.width, f.height, f.data.length], [100, 100, 40000])
  t.deepEqual([f2.width, f2.height, f2.data.length], [100, 100, 40000])
  t.true(f !== f2)
})

test.todo('pause, resume, stop')
test.todo('encode')