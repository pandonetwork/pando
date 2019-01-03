export const imports = {
  'src/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-index" */ 'src/index.mdx'),
  'src/architecture/1 - overview.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-architecture-1-overview" */ 'src/architecture/1 - overview.mdx'),
  'src/architecture/2 - organisms.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-architecture-2-organisms" */ 'src/architecture/2 - organisms.mdx'),
  'src/architecture/3 - factory.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-architecture-3-factory" */ 'src/architecture/3 - factory.mdx'),
  'src/cli/1 - overview.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-cli-1-overview" */ 'src/cli/1 - overview.mdx'),
  'src/cli/2 - commands.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-cli-2-commands" */ 'src/cli/2 - commands.mdx'),
  'src/components/Alert.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-alert" */ 'src/components/Alert.mdx'),
  'src/components/Button.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-button" */ 'src/components/Button.mdx'),
}
