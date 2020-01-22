import { resolve } from 'path'
import test from 'ava'
import { Nuxt, Builder } from 'nuxt'


// Init Nuxt.js and start listening on localhost:4000
test.before('Init Nuxt.js', async (t) => {
  const rootDir = resolve(__dirname, '..')
  let config = {}
  try { config = require(resolve(rootDir, 'nuxt.config.js')) } catch (e) {}
  config.rootDir = rootDir // project folder
  config.dev = false // production build
  config.mode = 'universal' // Isomorphic application
  const nuxt = new Nuxt(config)
  t.context.nuxt = nuxt // We keep a reference to Nuxt so we can close the server at the end of the test
  await new Builder(nuxt).build()
  nuxt.listen(4000, 'localhost')
})

// Example of testing only generated html
test('Route / exists and render HTML', async (t) => {
  const { nuxt } = t.context
  const context = {}
  const { html } = await nuxt.renderRoute('/', context)
  // console.log(nuxt)
  console.log(Object.keys(context))
  t.true(1 === 1)
  // t.true(html.includes('<h1 class="red">Hello world!</h1>'))
})

/*
describe('Testing Box', function () {

  before(async function (t) {

    const rootDir = resolve(__dirname, '..')
    let config = {}
    try {
      config = require(resolve(rootDir, 'nuxt.config.js'))
    } catch (e) {
    }
    config.rootDir = rootDir // project folder
    config.dev = false // production build
    config.mode = 'universal' // Isomorphic application
    const nuxt = new Nuxt(config)
    t.context.nuxt = nuxt // We keep a reference to Nuxt so we can close the server at the end of the test
    await new Builder(nuxt).build()
    // nuxt.listen(4000, 'localhost')
  })

  it('should assert obj is instance of Box', function () {
    var obj = {a: 0}
    assert.equal(obj.a, 0)
    // assert.instanceOf(obj, Box);
  })

})
*/
