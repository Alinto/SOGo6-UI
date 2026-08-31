import { SHARE_SESSION_KEY } from './pending-share'

function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function buildShareFallbackHtml(
  dest: string,
  payload: { subject: string; body: string; url: string }
): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>
try{sessionStorage.setItem(${jsonForScript(SHARE_SESSION_KEY)},${jsonForScript(JSON.stringify(payload))})}catch(e){}
location.replace(${jsonForScript(dest)})
</script></body></html>`
}
