import dynamicForm from '../dynamicForm.json'

export async function GET() {
  return new Response(JSON.stringify(dynamicForm), {
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
