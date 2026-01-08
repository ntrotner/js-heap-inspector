export class Logger {
  /**
   * Dispatch log as info
   *
   * @param message main message
   * @param arguments_ meta data
   */
  public static info(message: string, ...arguments_: any[]) {
    console.log([this.logLevels.info, this.prefix, this.getDate(), message].join(''), arguments_.join(', '));
  }

  /**
   * Dispatch log as warning
   *
   * @param message main message
   * @param arguments_ meta data
   */
  public static warning(message: string, ...arguments_: any[]) {
    console.log([this.logLevels.warning, this.prefix, this.getDate(), message].join(''), arguments_.join(', '));
  }

  /**
   * Dispatch log as error
   *
   * @param message main message
   * @param arguments_ meta data
   */
  public static error(message: string, ...arguments_: any[]) {
    console.log([this.logLevels.error, this.prefix, this.getDate(), message].join(''), arguments_.join(', '));
  }

  /**
   * General prefix for every log
   */
  private static readonly prefix = '[JS Heap Inspector]';

  /**
   * Supported log levels
   */
  private static readonly logLevels = {
    info: '[info]',
    warning: '[warning]',
    error: '[error]',
  };

  /**
   * Returns date for logging
   */
  private static getDate(): string {
    return `[${(new Date()).toISOString()}]`;
  }
}
