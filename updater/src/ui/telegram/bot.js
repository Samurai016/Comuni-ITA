import { Telegraf } from 'telegraf';
import fs from 'node:fs';
import path from 'node:path';

export default class TelegramBot {
  /**
     * Create a new bot
     * @param {Function} onStopUpdate A callback that is called when the user cancel an operation
     */
  constructor(onStopUpdate) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);
    this.user = null;
    this.replyBuffer = new Map();
    this.onStopUpdate = onStopUpdate;

    if (process.env.TELEGRAM_CHAT) { this.user = Number.parseInt(process.env.TELEGRAM_CHAT); }

    this.bot.on('text', (ctx) => this.onMessage(ctx));
    this.onDismiss();

    this.bot.launch(); // Call without await to avoid blocking the thread
  }

  /**
     * Send a markdown text message and wait for a valid reply
     * @param {String} text The markdown text to send
     * @param {Function} validateReply A callback that is called every time a reply is received, it should return true when the reply is ok, false either
     * @returns {Promise<Context>} The reply Context
     */
  waitForReply(text, validateReply) {
    const self = this;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      await self.sendText(text, {
        validateReply,
        onReply: (ctx) => {
          resolve(ctx);
        }
      });
    });
  }

  /**
     * Send a markdown text message
     * @param {String} text The markdown text to send
     * @param {Object} options An object containing various options like the validateReply and the onReply callbacks
     * @returns {Promise<Message>|null} The sent message or null if the user is not set
     */
  async sendText(text, options, replyTo) {
    if (this.user) {
      const message = await this.bot.telegram.sendMessage(this.user, text, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: replyTo || null
      });
      if (options) { this.replyBuffer.set(message.message_id, options); }
      return message;
    }
    return null;
  }

  /**
     * Send a document message based on array of bytes
     * @param {Buffer} bytes The bytes to send
     * @param {String} filename The name of the file that will be shown to the user
     * @param {String} caption The markdown message that will be attached to the document
     * @param {Object} options An object containing various options like the validateReply and the onReply callbacks
     */
  async sendBytes(bytes, filename, caption, options) {
    if (this.user) {
      const message = await this.bot.telegram.sendDocument(this.user, {
        source: bytes,
        filename
      }, {
        caption,
        parse_mode: 'MarkdownV2'
      });
      if (options) { this.replyBuffer.set(message.message_id, options); }
    }
  }

  /**
     * Send a document message based on a file path
     * @param {String} url The path of the file
     * @param {String} caption The markdown message that will be attached to the document
     * @param {Object} options An object containing various options like the validateReply and the onReply callbacks
     */
  async sendFile(url, caption, options) {
    const data = fs.readFileSync(url);
    await this.sendBytes(data, path.basename(url), caption, options);
  }

  /**
   * Edit a message with a new text
   * @param {Message} message The message to edit
   * @param {String} text  The new text
   */
  async editMessage(message, text) {
    if (this.user) {
      await this.bot.telegram.editMessageText(this.user, message.message_id, null, text, {
        parse_mode: 'MarkdownV2'
      });
    }
  }

  async onMessage(ctx) {
    const reply = ctx.update.message.reply_to_message;
    if (reply && this.replyBuffer.has(reply.message_id)) {
      const options = this.replyBuffer.get(reply.message_id);
      if ((options.validateReply && await options.validateReply(ctx)) || !options.validateReply) {
        options.onReply?.apply(null, [ctx]);
        this.replyBuffer.delete(reply.message_id);
      }
    }
  }

  onDismiss() {
    function exitHandler(instance, exitCode, options) {
      if (options.cleanup) {
        try {
          instance.bot.stop(exitCode);
        } catch (error) { }
      }
      if (options.exit) {
        process.exit();
      }
    }

    // do something when app is closing
    process.on('exit', exitHandler.bind(null, this, 'exit', { cleanup: true }));

    // catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, this, 'SIGINT', { exit: true }));
    process.on('SIGTERM', exitHandler.bind(null, this, 'SIGTERM', { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, this, 'SIGUSR1', { exit: true }));
    process.on('SIGUSR2', exitHandler.bind(null, this, 'SIGUSR2', { exit: true }));
  }

  /**
   * Stop the bot
   */
  stop() {
    this.bot.stop();
  }
};
