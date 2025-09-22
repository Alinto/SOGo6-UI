const data = {
  domain: {
    Advanced: [
      {
        constrains: null,
        data_type: 'bool',
        default: false,
        depends: null,
        name: 'SOGO_D_IDENTITIES_ENABLED',
        required: true,
        subparent: 'Advanced',
      },
      {
        constrains: null,
        data_type: 'bool',
        default: false,
        depends: null,
        name: 'SOGO_D_FOLDER_DISABLE_SHARING',
        required: false,
        subparent: 'Advanced',
      },
    ],
    Basic: [
      {
        constrains: {
          choices: ['plain', 'openid', 'cas', 'saml2'],
        },
        data_type: 'str',
        default: ['group', 'groupOfNames', 'groupOfUniqueNames', 'posixGroup'],
        depends: null,
        name: 'SOGO_D_AUTH_TYPE',
        required: true,
        subparent: 'Basic',
      },
    ],
    'User Source': [
      {
        constrains: {
          choices: ['ldap', 'sql'],
        },
        data_type: 'str',
        default: null,
        depends: null,
        name: 'US_TYPE',
        required: true,
        subparent: 'User Source',
      },
      {
        constrains: null,
        data_type: 'list[str]',
        default: ['group', 'groupOfNames', 'groupOfUniqueNames', 'posixGroup'],
        depends: 'US_TYPE%%%equal%%%ldap',
        name: 'LDAP_GROUP_CLASS',
        required: true,
        subparent: 'User Source',
      },
    ],
  },
  system: {
    general: [
      {
        constrains: null,
        data_type: 'str',
        default: '/var/spool/sogo',
        depends: null,
        name: 'SOGO_S_MAILSPOOL_PATH',
        required: true,
        subparent: 'User Source',
      },
    ],
  },
}

export async function GET() {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function OPTIONS() {
  return new Response(JSON.stringify({ allow: ['GET'] }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
