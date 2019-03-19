// Github theme
var theme = {
  plain: {
    backgroundColor: '#ffffff',
    color: '#24292e',
  },

  styles: [
    {
      types: ['comment'],
      style: {
        color: '#6a737d',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#24292e',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['tag', 'title', 'selector', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#22863a',
      },
    },
    {
      types: ['property', 'function', 'attr-name', 'code'],
      style: {
        color: '#6f42c1',
      },
    },
    {
      types: ['tag-id', 'atrule-id'],
      style: {
        color: '#2d2006',
      },
    },
    {
      types: ['string', 'attr-value'],
      style: {
        color: '#032f62',
      },
    },
    {
      types: [
        'operator',
        'number',
        'boolean',
        'entity',
        'url',
        'keyword',
        'control',
        'directive',
        'unit',
        'statement',
        'regex',
        'at-rule',
        'placeholder',
        'variable',
      ],
      style: {
        color: '#d73a49',
      },
    },
    {
      types: ['placeholder', 'variable', 'function-variable'],
      style: {
        color: '#005cc5',
      },
    },
    {
      types: ['deleted'],
      style: {
        textDecorationLine: 'line-through',
      },
    },
    {
      types: ['inserted'],
      style: {
        textDecorationLine: 'underline',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['important'],
      style: {
        color: '#896724',
      },
    },
  ],
}

module.exports = theme
