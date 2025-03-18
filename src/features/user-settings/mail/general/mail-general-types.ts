export type MailGeneralSettings = {
  displaySubscribeMailboxesOnly: boolean
  EAS: boolean
  countAllUnseen: boolean
  sortByThreads: boolean
  displayFullEmails: boolean
  hideInlineAttachments: boolean
  autoMarkAsRead: boolean
  autoMarkAsReadDelay: string
  forwardMessages: 'inline' | 'attachment'
  startReply: 'above' | 'below'
  placeSignature: 'above' | 'below'
  signOnNew: boolean
  signOnReply: boolean
  signOnForward: boolean
  composeIn: 'html' | 'plain'
  defaultFontSize: 'sm' | 'md' | 'lg'
  displayRemoteImages: boolean
  composeOpening: 'ask' | 'always' | 'never'
}
