export const imports = {
  'src/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-index" */ 'src/index.mdx'),
  'src/architecture/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-architecture-index" */ 'src/architecture/index.mdx'),
  'src/cli/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-cli-index" */ 'src/cli/index.mdx'),
  'src/components/Alert.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-alert" */ 'src/components/Alert.mdx'),
  'src/components/Button.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "src-components-button" */ 'src/components/Button.mdx'),
}
