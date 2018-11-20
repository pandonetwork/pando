module.exports = {
  title: 'Pando Network',
  typescript: true,
  htmlContext: {
    head: {
      links: [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto:100'
      }]
    }
  },
  themeConfig: {
    mode: 'dark',
    colors: {
        green: '#5ff6b0',
        primary: '#5ff6b0',
        link: '#5ff6b0'
    },
    styles: {
        body: {
          fontFamily: "'Roboto', Helvetica, sans-serif",
          fontSize: 9,
          lineHeight: 1.5
        },
         container: {
              fontFamily: "'Roboto', Helvetica, sans-serif",
              fontWeight: 100,
              lineHeight: 1.6,
              fontSize: 15
        },
    }
  }
}
