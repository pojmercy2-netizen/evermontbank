export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Evermont Bank API Service'
  }
})
