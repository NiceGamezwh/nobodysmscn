import { type NextRequest, NextResponse } from "next/server"

// ============================================================================
// 豪猪平台登录 Cookie（硬编码）
// ----------------------------------------------------------------------------
// 说明：豪猪的「按项目名搜索返回项目ID」功能没有开放 API，只能带着登录后的
// Cookie 去请求网页接口 api.php?type=30。由于平台登录需要验证码、无法自动登录，
// 所以在本地电脑登录后手动把 Cookie 复制到这里。
//
// 更新方法：本地登录 https://h5.haozhuma.com/ 后，从浏览器开发者工具里复制
// PHPSESSID 和 sl-session 两个值，替换下面这一行即可，然后重新部署。
// Cookie 失效时，搜索会返回「登录状态已失效」，此时更新即可。
// ============================================================================
const HAOZHUMA_COOKIE = "PHPSESSID=ficrma0v7d0oh4qo10m91561e5; sl-session=VPufepnrWGoU/oG+94OLpQ=="

const HAOZHUMA_BASE = "https://h5.haozhuma.com"

interface HaozhumaProject {
  name: string
  sid: string
}

interface ParsedProject {
  // 我们真正需要的项目ID（从 name 中的【】里解析出来，例如 77756）
  id: string
  // 展示用的项目名（去掉【id】和末尾的 [sid] 后的部分，例如「抖音百科[限对接]」）
  name: string
  // 十六进制 sid，用于「搜索对接」功能（api.php?type=8&sid=xxx）
  sid: string
}

// 从豪猪返回的 name 中解析出项目ID和干净的项目名
// 原始示例: "【77756】抖音百科[限对接]                    [ec552cf77e862aa0]"
function parseProject(raw: HaozhumaProject): ParsedProject | null {
  const name = raw.name || ""
  // 提取【】中的数字作为项目ID
  const idMatch = name.match(/【(\d+)】/)
  if (!idMatch) return null
  const id = idMatch[1]

  // 十六进制 sid：优先用接口返回的 sid 字段，其次从 name 末尾的 [xxx] 里解析
  let sid = raw.sid || ""
  if (!sid) {
    const sidMatch = name.match(/\[([0-9a-fA-F]+)\]\s*$/)
    if (sidMatch) sid = sidMatch[1]
  }

  // 去掉【id】前缀
  let display = name.replace(/【\d+】/, "")
  // 去掉末尾的 [十六进制sid]（展示时不需要）
  display = display.replace(/\s*\[[0-9a-fA-F]+\]\s*$/, "")
  display = display.trim()

  return { id, name: display, sid }
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim()

  if (!keyword) {
    return NextResponse.json({ success: false, msg: "请输入搜索关键词" }, { status: 400 })
  }

  try {
    const res = await fetch(`${HAOZHUMA_BASE}/api.php?type=30&gjc=${encodeURIComponent(keyword)}`, {
      headers: {
        Cookie: HAOZHUMA_COOKIE,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    })

    const data = await res.json()

    // code !== 1 表示豪猪那边返回失败（多半是 Cookie 失效或未登录）
    if (data.code !== 1) {
      return NextResponse.json({
        success: false,
        msg: "Cookie失效，请联系管理员更新 Cookie",
      })
    }

    const list: HaozhumaProject[] = Array.isArray(data.data) ? data.data : []
    const projects = list
      .map(parseProject)
      .filter((p): p is ParsedProject => p !== null)

    return NextResponse.json({ success: true, keyword, projects })
  } catch (e) {
    return NextResponse.json(
      { success: false, msg: e instanceof Error ? e.message : "网络错误" },
      { status: 500 },
    )
  }
}
