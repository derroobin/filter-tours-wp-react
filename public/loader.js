const host = 'https://touren.deingipfel-outdoorverleih.de/'
fetch(host + 'manifest.json')
  .then((res) => res.json())
  .then((manifest) => {
    const index = manifest['index.html']
    const app = document.head

    index.css.forEach((x) => {
      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.type = 'text/css'
      style.href = host + x
      app.append(style)
    })

    const js = document.createElement('script')
    js.async = true
    js.src = host + index.file
    js.type = 'module'
    app.append(js)
  })
