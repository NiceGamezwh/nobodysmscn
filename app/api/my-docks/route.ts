import { type NextRequest, NextResponse } from "next/server"

// ============================================================================
// 查看已加入的对接码（使用用户自己的 Cookie）
// ----------------------------------------------------------------------------
// 原平台「我的对接 / 已加入列表」请求：
//   GET api.php?type=3&gjc=<关键词>&page=<页码>
// 注意：这个接口成功时 code === 200（和其它接口的 code===1 不同）。
// ============================================================================
const HAOZHUMA_BASE = "https://h5.haozhuma.com"

// 原平台返回的原始字段
interface RawMyDock {
  uid?: string // 对接码
  mc?: string // 项目名称
  yhj?: string // 优惠价
  ksj?: string // 扣税价
  djzt?: string // 对接状态：已对接 / 已暂停
  zxky?: string // 可用数量，例如「可用数量:143」
  yyy?: string // 运营商
  sheng?: string // 省份
  haoduan?: string // 号段类型
  hd?: string // 号段
  lxfs?: string // 联系方式
  minute?: string | null // 时间
}

// 清洗后返回给前端
interface MyDockItem {
  uid: string
  name: string
  price: string
  status: string
  available: string
  isp: string
  province: string
  segmentType: string
  segments: string
  contact: string
  time: string
}

// 价格显示为原始 yhj 的 3 倍（与「搜索对接」保持一致）
function triplePrice(yhj: string): string {
  const raw = (yhj || "").trim()
  if (!raw) return ""
  const num = Number.parseFloat(raw)
  if (Number.isNaN(num)) return raw
  const tripled = num * 3
  return String(Number.parseFloat(tripled.toFixed(2)))
}

function cleanItem(raw: RawMyDock): MyDockItem {
  return {
    uid: raw.uid || "",
    name: raw.mc || "",
    price: triplePrice(raw.yhj || ""),
    status: raw.djzt || "",
    available: (raw.zxky || "").replace(/^可用数量[:：]?/, "").trim(),
    isp: (raw.yyy || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" / "),
    province: (raw.sheng || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" / "),
    segmentType: raw.haoduan || "",
    segments: (raw.hd || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" "),
    contact: raw.lxfs || "",
    time: raw.minute || "",
  }
}

export async function POST(request: NextRequest) {
  let body: { cookie?: string; page?: number; keyword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, msg: "请求格式错误" }, { status: 400 })
  }

  const cookie = body.cookie?.trim()
  const page = body.page && body.page > 0 ? body.page : 1
  const keyword = (body.keyword || "").trim()

  if (!cookie) {
    return NextResponse.json({ success: false, msg: "请输入你的 Cookie" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${HAOZHUMA_BASE}/api.php?type=3&gjc=${encodeURIComponent(keyword)}&page=${page}`,
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

    // 这个接口成功时 code === 200
    if (data.code !== 200) {
      return NextResponse.json({
        success: false,
        msg: data.msg || "获取已对接列表失败，请检查 Cookie 是否有效",
      })
    }

    const list: RawMyDock[] = Array.isArray(data.data) ? data.data : []
    const items = list.map(cleanItem)

    return NextResponse.json({ success: true, page, keyword, items, msg: data.msg })
  } catch (e) {
    return NextResponse.json(
      { success: false, msg: e instanceof Error ? e.message : "网络错误" },
      { status: 500 },
    )
  }
}
