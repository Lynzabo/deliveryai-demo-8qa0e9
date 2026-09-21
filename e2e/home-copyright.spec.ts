import { test, expect } from '@playwright/test'

/**
 * 首页底部版权声明 — E2E 验收测试
 *
 * 覆盖 Spec：首页底部增加版权声明文字"© 概念演示 2026 版权所有"
 * - 中文环境首页底部展示版权声明
 * - 英文环境版权声明切换为对应英文版本
 * - 版权声明位于首页内容最底部，不影响既有布局与内容
 */

const COPYRIGHT_ZH = '© 概念演示 2026 版权所有'
const COPYRIGHT_EN = '© Concept Demo 2026. All rights reserved.'

test.describe('首页底部版权声明 - E2E 验收测试', () => {
  test('REQ-COPY-001: 中文环境首页底部展示版权声明文字', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toHaveText(COPYRIGHT_ZH)
  })

  test('REQ-COPY-002: 英文环境版权声明显示对应英文版本', async ({ page }) => {
    // 首页无语言切换按钮，通过 localStorage 设置初始语言
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'en')
    })
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toHaveText(COPYRIGHT_EN)
  })

  test('REQ-COPY-003: 版权声明位于首页内容最底部且不影响既有布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toHaveText(COPYRIGHT_ZH)

    // 版权声明 Y 坐标大于品牌标题与桌台绑定区（位于最底部）
    const brandTitle = page.getByRole('heading', { name: /热气升腾/ })
    const bindButton = page.getByRole('button', { name: /A08/ }).first()
    const footerBox = await footer.boundingBox()
    const brandBox = await brandTitle.boundingBox()
    const bindBox = await bindButton.boundingBox()

    expect(footerBox!.y).toBeGreaterThan(brandBox!.y)
    expect(footerBox!.y).toBeGreaterThan(bindBox!.y)

    // 既有首页内容不受影响：品牌标题、推荐菜标题、桌台绑定按钮仍可见
    await expect(brandTitle).toBeVisible()
    await expect(page.getByRole('heading', { name: '推荐菜' })).toBeVisible()
    await expect(bindButton).toBeVisible()
  })
})
