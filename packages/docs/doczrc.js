module.exports = {
  title: 'Pando Network',
  typescript: true,
  htmlContext: {
    head: {
      links: [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto:300'
      }]
    }
  },
  themeConfig: {
    mode: 'dark',
    styles: {
        body: {
          fontFamily: "'Roboto', Helvetica, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
        }
    }
  }
}
