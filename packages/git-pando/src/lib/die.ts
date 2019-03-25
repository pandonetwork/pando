// OK
export default (message?: string): void => {
  // tslint:disable-next-line:no-console
  if (message) console.error(message)
  process.exit(1)
}
