class Logger {
  static info(message, details) {
    Logger.write('INFO', message, details);
  }

  static warn(message, details) {
    Logger.write('WARN', message, details);
  }

  static error(message, details) {
    Logger.write('ERROR', message, details);
  }

  static write(level, message, details) {
    const suffix = details ? ` | ${JSON.stringify(details)}` : '';
    console.log(`[${new Date().toISOString()}] [${level}] ${message}${suffix}`);
  }
}

module.exports = { Logger };
