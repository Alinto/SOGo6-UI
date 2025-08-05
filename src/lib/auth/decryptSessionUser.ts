// async function decryptSessionUser(
//   session: string
// ): Promise<SessionUser | null> {
//   try {
//     const { payload } = await jwtVerify(session, encodedKey, {
//       algorithms: ['HS256'],
//     })

//     if (
//       typeof payload.id !== 'number' ||
//       typeof payload.name !== 'string' ||
//       typeof payload.email !== 'string' ||
//       userTypes.includes(payload?.type as User['type']) === false
//     )
//       throw new Error('Invalid session payload')

//     const user = {
//       id: payload.id,
//       name: payload.name as string,
//       email: payload.email as string,
//       avatar: (payload.avatar ?? null) as string | null,
//       type: payload.type as User['type'],
//     }

//     return user
//   } catch (error) {
//     return null
//   }
// }
