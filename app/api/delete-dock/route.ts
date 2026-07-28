import { type NextRequest, NextResponse } from "next/server"

// ============================================================================
// 删除已加入的对接码（使用用户自己的 Cookie）
// ----------------------------------------------------------------------------
// 原平台删除对接的请求：
//   GET api.php?type=41&open=del&uid=<对接码>
// 成功时 code 一般为 1 或 200，这里做宽松判断。
// ============================================================================
const HAOZHUMA_BASE = "https://h5.haozhuma.com"

export async function POST(request: NextRequest) {
  let body: { cookie?: string; uid?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, msg: "请求格式错误" }, { status: 400 })
  }

  const cookie = body.cookie?.trim()
  const uid = body.uid?.trim()

  if (!cookie) {
    return NextResponse.json({ success: false, msg: "请输入你的 Cookie" }, { status: 400 })
  }
  if (!uid) {
    return NextResponse.json({ success: false, msg: "缺少要删除的对接码" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${HAOZHUMA_BASE}/api.php?type=41&open=del&uid=${encodeURIComponent(uid)}`,
      {
        headers: {
          Cookie: cookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://h5.haozhuma.com/",
        },
        cache: "no-store",
      },
    )

    const data = await res.json()

    // 成功时 code 为 1 或 200
    if (data.code !== undefined && data.code !== 1 && data.code !== 200) {
      return NextResponse.json({
        success: false,
        msg: data.msg || "删除失败，请检查 Cookie 是否有效",
      })
    }

    return NextResponse.json({ success: true, uid, msg: data.msg || "删除成功" })
  } catch (e) {
    return NextResponse.json(
      { success: false, msg: e instanceof Error ? e.message : "网络错误" },
      { status: 500 },
    )
  }
}
