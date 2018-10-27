import chalk from 'chalk'
/** logger.js
* Log time before each message
*
* param: str message: The message to be logged
* param: obj options: Optionally pass an object containing a key "result"
*                     if value is 'error', message will be red and error logged
                      if value is 'success', message will be green
*/
export default function logger(message, options = {}) {
  const time = String(new Date()).slice(16, 24)
  function logStandard(message, time) {
    console.log(`[${time}] - ${message}`)
    return
  }
  if (options.result) {
    const result = options.result
    if (result === 'error') {
      console.error(chalk.red(`[${time}] - ${message}`))
      return
    }
    else if (result === 'success') {
      console.log(chalk.green(`[${time}] - ${message}`))
      return
    }
  }
  logStandard(message, time)
}
