import { type NextRequest, NextResponse } from "next/server"

// ============================================================================
// 加入对接码（使用用户自己的 Cookie）
// ----------------------------------------------------------------------------
// 原平台前端点击「加入 / 对接」时发出的请求：
//   GET api.php?type=4&djm=<对接码>
// 这里用用户自己传过来的 Cookie 去调用，本服务不存储任何用户 Cookie。
// 成功时原平台返回 code === 1。
// ============================================================================
const HAOZHUMA_BASE = "https://h5.haozhuma.com"

export async function POST(request: NextRequest) {
  let body: { cookie?: string; djm?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, msg: "请求格式错误" }, { status: 400 })
  }

  const cookie = body.cookie?.trim()
  const djm = body.djm?.trim()

  if (!cookie) {
    return NextResponse.json({ success: false, msg: "请输入你的 Cookie" }, { status: 400 })
  }
  if (!djm) {
    return NextResponse.json({ success: false, msg: "请输入要加入的对接码" }, { status: 400 })
  }

  try {
    const res = await fetch(`${HAOZHUMA_BASE}/api.php?type=4&djm=${encodeURIComponent(djm)}`, {
      headers: {
        Cookie: cookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://h5.haozhuma.com/",
      },
      cache: "no-store",
    })

    const data = await res.json()

    // 成功时 code === 1；其它情况多半是 Cookie 失效或对接码无效
    if (data.code !== undefined && data.code !== 1) {
      return NextResponse.json({
        success: false,
        msg: data.msg || "加入失败，请检查 Cookie 是否有效或对接码是否正确",
      })
    }

    return NextResponse.json({ success: true, djm, msg: data.msg || "对接成功" })
  } catch (e) {
    return NextResponse.json(
      { success: false, msg: e instanceof Error ? e.message : "网络错误" },
      { status: 500 },
    )
  }
}
