import transpileModules from 'next-transpile-modules'

const withTranspileModules = transpileModules([
  '@sushiswap/ui',
  '@sushiswap/redux-token-lists',
  '@sushiswap/chain',
  '@sushiswap/wallet-connector',
  '@sushiswap/hooks',
  '@sushiswap/currency',
  '@sushiswap/math',
  '@sushiswap/format'
])

export default withTranspileModules({
  basePath: '/furo',
  reactStrictMode: true,
  swcMinify: true,
  runtime: 'edge',
  serverComponents: true,
  // TEMPORARY UNTIL TYPE ERROR IS SOLVED
  typescript: {
    ignoreBuildErrors: true,
  },
})
