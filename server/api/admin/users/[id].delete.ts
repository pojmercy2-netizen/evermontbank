export default defineEventHandler(async (event) => {
  const mod = await import('./[id]/index.delete')
  return (mod.default as any)(event)
})
