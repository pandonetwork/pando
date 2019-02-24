export default (message: string): void => {
  console.error(message)
  process.exit(1)
}
