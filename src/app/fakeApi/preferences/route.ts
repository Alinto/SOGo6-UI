import { NextRequest, NextResponse } from 'next/server'

const data = {
  data: {
    USER_CALENDAR_CATEGORY: {
      SOGO_U_CALENDAR_CATEGORIES: [
        {
          color: '#ef4444',
          is_default: true,
          name: 'Work',
        },
        {
          color: '#8b5cf6',
          is_default: true,
          name: 'Family',
        },
        {
          color: '#eab308',
          is_default: true,
          name: 'Friends',
        },
        {
          color: '#0c2e07',
          is_default: false,
          name: 'Alumni',
        },
      ],
    },
    USER_CALENDAR_GENERAL: {
      SOGO_U_BUSY_OFF_HOURS: true,
      SOGO_U_CALENDAR_CREATION_NOTIF: true,
      SOGO_U_CALENDAR_DAYS_SHOWED: [0, 1, 2, 3, 4, 5, 6],
      SOGO_U_CALENDAR_DEFAULT: 'SOGO_DEFAULT_CALENDAR',
      SOGO_U_CALENDAR_VIEW_FIRST_DAY: 0,
      SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: '%U',
      SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: true,
      SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: false,
      SOGO_U_EVENT_DEFAULT_CLASS: 'CONFIDENTIAL',
      SOGO_U_EVENT_DEFAULT_REMINDER: '-PT15M',
      SOGO_U_JOURNAL_DEFAULT_CLASS: 'PUBLIC',
      SOGO_U_JOURNAL_DEFAULT_REMINDER: '-PT15M',
      SOGO_U_NO_INVITATION: false,
      SOGO_U_NO_INVITATION_WHITELIST: ['maelle@lumiere.fr'],
      SOGO_U_TASK_DEFAULT_CLASS: 'PUBLIC',
      SOGO_U_TASK_DEFAULT_REMINDER: '-PT15M',
      SOGO_U_WORKDAY_END_TIME: '20:00',
      SOGO_U_WORKDAY_START_TIME: '09:00',
    },
    USER_CONTACT_CATEGORY: {
      SOGO_U_CONTACT_CATEGORIES: [
        {
          color: '#ef4444',
          is_default: true,
          name: 'Work',
        },
        {
          color: '#8b5cf6',
          is_default: true,
          name: 'Family',
        },
        {
          color: '#eab308',
          is_default: true,
          name: 'Friends',
        },
        {
          color: '#014bff',
          is_default: false,
          name: 'Alumni',
        },
      ],
    },
    USER_CONTACT_GENERAL: {
      SOGO_U_ADDRESSBOOK_CREATION_NOTIF: false,
    },
    USER_EXTRA_SETTINGS: {},
    USER_GENERAL: {
      SOGO_U_BROWSER_NOTIF: false,
      SOGO_U_EXT_AVATAR_ENABLED: true,
      SOGO_U_FIRST_MODULE: 'mail',
      SOGO_U_LANGUAGE: 'en',
      SOGO_U_LONG_DATE: 'FULL_LONG_US',
      SOGO_U_REFRESH_MAIL_VIEW: 0,
      SOGO_U_SHORT_DATE: 'DD-MMM-YY',
      SOGO_U_TIMEZONE: 'Etc/GMT+12',
      SOGO_U_TIME_FORMAT: 'HH:mm',
    },
    USER_MAIL_CATEGORY_SETTINGS: {
      SOGO_U_MAIL_CATEGORIES: [
        {
          color: '#ef4444',
          is_default: true,
          name: 'Work',
        },
        {
          color: '#8b5cf6',
          is_default: true,
          name: 'Family',
        },
        {
          color: '#eab308',
          is_default: true,
          name: 'Friends',
        },
        {
          color: '#0c2e07',
          is_default: false,
          name: 'Alumni',
        },
      ],
    },
    USER_MAIL_GENERAL_SETTINGS: {
      SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: false,
      SOGO_U_ATTACHMENT_POSITION: 'below',
      SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: 'Collected',
      SOGO_U_COLLECT_UNKNWON_ADDRESSES: true,
      SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'html',
      SOGO_U_COMPOSE_MAIL_WINDOW: 'popup',
      SOGO_U_HIDE_INLINE_ATTACHMENT: true,
      SOGO_U_MAIL_ALLOW_RECEIPT: true,
      SOGO_U_MAIL_FORWARDING_FORMAT: 'inline',
      SOGO_U_MARK_READ_DELAY: 0,
      SOGO_U_REPLY_POSITION: 'below',
      SOGO_U_SHOW_ALL_UNSEEN_COUNT: false,
      SOGO_U_SIGNATURE_POSITION: 'below',
      SOGO_U_SORT_BY_THREAD: false,
      SOGO_U_USE_SIGNATURE: ['new', 'reply'],
    },
    USER_SECURITY: {
      SOGO_U_MFA_ENABLE: false,
    },
  },
  error_code: 'S000000',
  error_msg: 'No Error',
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}

export async function PATCH(req: NextRequest) {
  // const body = await req.json()
  // Merge all body parameters into data.data, avoiding duplicate keys
  // Object.entries(body.settings).forEach(([key, value]) => {
  //   data.data[key] = { ...data.data[key], ...value }
  // })
  return NextResponse.json(data, { status: 200 })
}
