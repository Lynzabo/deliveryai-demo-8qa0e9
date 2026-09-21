import { test, expect } from '@playwright/test'

/**
 * 首页第一屏推荐菜展示 — E2E 验收测试
 *
 * 覆盖 Spec SPEC-HOME-RECO-001 / REQ-001：
 * - 推荐菜区域展示带 badge 的 4 款菜品（图片、名称、价格、徽章）
 * - 推荐菜区域位于品牌标题与桌台绑定区之间，移动端首屏可见
 * - 推荐菜卡片不响应点击，不触发导航
 */

const RECOMMENDED_DISHES = [
  { name: '鎏金番茄鸳鸯锅', price: '¥68.00', badge: '人气 No.1' },
  { name: '牛油麻辣锅', price: '¥59.00', badge: '招牌' },
  { name: '琥珀嫩牛肉', price: '¥42.00', badge: '主厨推荐' },
  { name: '鲜虾滑', price: '¥39.00', badge: '新品' },
]

test.describe('首页推荐菜展示 - E2E 验收测试', () => {
  test('REQ-001: 首页展示推荐菜区域，含 4 款带 badge 菜品卡片', async ({ page }) => {
    await page.goto('/')

    // 推荐菜区域标题可见
    const recommendHeading = page.getByRole('heading', { name: '推荐菜' })
    await expect(recommendHeading).toBeVisible()

    // 4 款推荐菜品卡片，每张含名称、价格（¥xx.xx）和 badge 徽章
    for (const dish of RECOMMENDED_DISHES) {
      const cardName = page.getByRole('heading', { name: dish.name })
      await expect(cardName).toBeVisible()
      await expect(page.getByText(dish.price, { exact: true })).toBeVisible()
      await expect(page.getByText(dish.badge, { exact: true })).toBeVisible()
    }
  })

  test('REQ-001.2/.4: 推荐菜区域位于品牌标题与桌台绑定区之间且移动端首屏可见', async ({ page }) => {
    // 移动端视口：单列布局，品牌标题 → 推荐菜 → 桌台绑定纵向排列
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const brandTitle = page.getByRole('heading', { name: /热气升腾/ })
    const recommendHeading = page.getByRole('heading', { name: '推荐菜' })
    const bindButton = page.getByRole('button', { name: /A08/ }).first()

    await expect(brandTitle).toBeVisible()
    await expect(recommendHeading).toBeVisible()
    await expect(bindButton).toBeVisible()

    // 单列布局下：品牌标题 → 推荐菜 → 桌台绑定（基于纵向坐标顺序）
    const brandY = (await brandTitle.boundingBox()).y
    const recommendY = (await recommendHeading.boundingBox()).y
    const bindY = (await bindButton.boundingBox()).y
    expect(brandY).toBeLessThan(recommendY)
    expect(recommendY).toBeLessThan(bindY)

    // 推荐菜区域在移动端首屏可见（无需向下滚动即可看到至少部分推荐菜内容）
    expect(recommendY).toBeGreaterThanOrEqual(0)
    expect(recommendY).toBeLessThan(812)
  })

  test('REQ-001.5: 推荐菜卡片不响应点击，不触发导航或弹窗', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/#\/home$/)

    // 点击第一张推荐菜卡片
    const firstCardName = page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })
    await firstCardName.click({ force: true })

    // 仍在首页，未发生导航
    await expect(page).toHaveURL(/#\/home$/)
    // 未弹出任何对话框（桌台绑定卡片等仍可正常使用）
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
  })
})
