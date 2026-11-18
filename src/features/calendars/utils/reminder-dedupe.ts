export type ReminderIdentity = {
  event_key: string
  trigger_at: string
}

export function reminderNotificationKey(reminder: ReminderIdentity): string {
  return `${reminder.event_key}|${reminder.trigger_at}`
}

export function collectNewReminders<T extends ReminderIdentity>(
  reminders: T[],
  seen: Set<string>
): T[] {
  const fresh: T[] = []
  for (const reminder of reminders) {
    const key = reminderNotificationKey(reminder)
    if (seen.has(key)) continue
    seen.add(key)
    fresh.push(reminder)
  }
  return fresh
}
