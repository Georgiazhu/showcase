import localData from './showcase.json'

/**
 * 数据源：优先读线上 API（后台可视化编辑的内容），失败时回退到仓库内的
 * showcase.json（保证静态预览 / API 未部署时页面仍可用）。
 */
export async function fetchShowcase() {
  try {
    const res = await fetch('/api/showcase', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data || !Array.isArray(data.categories) || !data.categories.length) {
      throw new Error('empty payload')
    }
    return { meta: data.meta || localData.meta, categories: data.categories, source: 'api' }
  } catch (err) {
    console.warn('[showcase] API 不可用，回退到本地 showcase.json：', err?.message)
    return { meta: localData.meta, categories: localData.categories, source: 'local' }
  }
}
