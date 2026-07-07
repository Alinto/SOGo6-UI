describe('sse index exports', () => {
  it('re-exports SSE types, service, API, and config helpers', async () => {
    const sse = await import('../index')

    expect(sse.SSEConnectionState).toBeDefined()
    expect(sse.SSEService).toBeDefined()
    expect(sse.getSSEService).toBeDefined()
    expect(sse.initializeSSEService).toBeDefined()
    expect(sse.resetSSEService).toBeDefined()

    expect(sse.sseApi).toBeDefined()
    expect(sse.initSSEApi).toBeDefined()
    expect(sse.getSSEServiceInstance).toBeDefined()
    expect(sse.useConnectSSEMutation).toBeDefined()
    expect(sse.useDisconnectSSEMutation).toBeDefined()
    expect(sse.useGetSSEStatusQuery).toBeDefined()
    expect(sse.useSubscribeToEventsQuery).toBeDefined()

    expect(sse.buildSSEConfig).toBeDefined()
    expect(sse.getDefaultSSEConfig).toBeDefined()
    expect(sse.getDefaultSSEConfigSync).toBeDefined()
    expect(sse.getDevelopmentSSEConfig).toBeDefined()
    expect(sse.getProductionSSEConfig).toBeDefined()
    expect(sse.getSSEConfigForEnvironment).toBeDefined()
    expect(sse.getTestSSEConfig).toBeDefined()
  })
})
