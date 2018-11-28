module.exports = {
  title: 'Pando Network',
  typescript: true,
  htmlContext: {
    head: {
      links: [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto+Condensed:300|Roboto+Mono:100|Roboto:100'
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
        h2: {
            fontFamily: "'Playfair Display', serif"
        },
        h3: {
            display: 'inline',
            // fontFamily: "'Roboto Condensed', sans-serif",
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 'light',
            backgroundColor: '#5ff6b0',
            color: '#13161f',
            padding: '3px 5px'
        },
        code: {
            margin: '0 3px',
            padding: '2px 4px',
            borderRadius: '3px',
            fontFamily: '"Roboto Mono", monospace',
            fontWeight: 'bold'

            // fontSize: '0.85em'
        }
    }
  }
}
