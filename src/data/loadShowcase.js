import localData from './showcase.json'

/**
 * 数据源：读线上 API（后台可视化编辑的内容）。
 *
 * 注意：接口需要登录态，未登录会返回 401 —— 此时抛出 authRequired，
 * 由页面切换到登录界面，不再回退本地 JSON（否则会绕过登录看到内容）。
 */
export async function fetchShowcase() {
  const res = await fetch('/api/showcase', {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  })

  if (res.status === 401) {
    const err = new Error('Unauthorized')
    err.authRequired = true
    throw err
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (!data || !Array.isArray(data.categories) || !data.categories.length) {
    throw new Error('empty payload')
  }
  return { meta: data.meta || localData.meta, categories: data.categories, source: 'api' }
}
