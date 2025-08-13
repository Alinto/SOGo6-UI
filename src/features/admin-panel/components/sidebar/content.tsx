import { Database, Globe, Palette, Settings2, UserCog } from 'lucide-react'

const navItems = [
  {
    title: 'AP_SIDEBAR.theme.string',
    isActive: true,
    collapsedIcon: Palette,
    url: '/admin_panel/theme',
  },
  {
    title: 'AP_SIDEBAR.system.string',
    isActive: true,
    collapsedIcon: Database,
    url: '/admin_panel/system',
  },
  {
    title: 'AP_SIDEBAR.config.string',
    isActive: true,
    items: [
      {
        title: 'AP_SIDEBAR.config.domains.string',
        url: '/admin_panel/domains',
        icon: Globe,
      },
      {
        title: 'AP_SIDEBAR.config.rules.string',
        url: '/admin_panel/rules',
        icon: UserCog,
        collapsedIcon: Settings2,
      },
    ],
  },
]

export default navItems
