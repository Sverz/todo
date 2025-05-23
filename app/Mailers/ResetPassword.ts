import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'

export default class ResetPassword extends BaseMailer {
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "ResetPassword.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    message.subject('The email subject').from('admin@example.com').to('user@example.com')
  }
}
