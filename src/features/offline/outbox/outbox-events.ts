const EVENT_NAME = 'sogo:outbox-changed'
const CHANNEL_NAME = 'sogo-outbox'

/**
 * Notify every outbox consumer (badge, list) that items changed.
 * Same-tab via window event; other tabs via BroadcastChannel — needed
 * because the cross-tab flush lock means only one tab actually flushes.
 */
export function notifyOutboxChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENT_NAME))
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage('changed')
    channel.close()
  } catch {
    // BroadcastChannel unavailable — same-tab event already dispatched
  }
}

export function subscribeOutboxChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT_NAME, callback)
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = () => callback()
  } catch {
    channel = null
  }
  return () => {
    window.removeEventListener(EVENT_NAME, callback)
    channel?.close()
  }
}
