import { type NextRequest, NextResponse } from "next/server"

// ============================================================================
// 搜索对接（确认加载）
// ----------------------------------------------------------------------------
// 豪猪的「对接码」功能没有开放 API，只能带着登录后的 Cookie 去请求网页接口
// api.php?type=8&sid=<十六进制sid>。sid 来自「搜索项目」返回结果。
//
// Cookie 更新方法与 search-project 路由相同：本地登录 https://h5.haozhuma.com/
// 后复制 PHPSESSID 和 sl-session 两个值替换下面这一行，然后重新部署。
// ============================================================================
const HAOZHUMA_COOKIE = "PHPSESSID=ficrma0v7d0oh4qo10m91561e5; sl-session=VPufepnrWGoU/oG+94OLpQ=="

const HAOZHUMA_BASE = "https://h5.haozhuma.com"

// 豪猪返回的原始对接码字段
interface RawDockItem {
  sid?: string
  mc?: string // 项目名称
  uid?: string // 对接码唯一标识
  yhj?: string // 价格（优惠价）
  zxky?: string // 可用数量，例如「可用数量:145」
  yyy?: string // 运营商，多个用 | 分隔
  sheng?: string // 省份
  haoduan?: string // 号段类型
  hd?: string // 号段，多个用 | 分隔
  lxfs?: string // 联系方式
  open?: string // 状态
  time?: string // 创建时间
  zd?: string // 是否置顶（1=置顶）
}

// 清洗后返回给前端的对接码
interface DockItem {
  uid: string
  name: string
  price: string
  available: string
  isp: string
  province: string
  segmentType: string
  segments: string
  contact: string
  top: boolean
  time: string
}

// 价格显示为原始 yhj 的 3 倍。豪猪返回的 yhj 是字符串（可能带小数），
// 能解析成数字就 x3 后返回，解析不了就原样返回。
function triplePrice(yhj: string): string {
  const raw = (yhj || "").trim()
  if (!raw) return ""
  const num = Number.parseFloat(raw)
  if (Number.isNaN(num)) return raw
  const tripled = num * 3
  // 去掉浮点误差产生的多余小数位（例如 0.1*3），最多保留两位小数
  return String(Number.parseFloat(tripled.toFixed(2)))
}

function cleanDockItem(raw: RawDockItem): DockItem {
  return {
    uid: raw.uid || "",
    name: raw.mc || "",
    price: triplePrice(raw.yhj || ""),
    // 「可用数量:145」-> 「145」
    available: (raw.zxky || "").replace(/^可用数量[:：]?/, "").trim(),
    // 「虚拟运营商|移动|」-> 「虚拟运营商 / 移动」
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
    top: raw.zd === "1",
    time: raw.time || "",
  }
}

export async function GET(request: NextRequest) {
  const sid = request.nextUrl.searchParams.get("sid")?.trim()

  if (!sid) {
    return NextResponse.json({ success: false, msg: "缺少项目 sid" }, { status: 400 })
  }

  try {
    const res = await fetch(`${HAOZHUMA_BASE}/api.php?type=8&sid=${encodeURIComponent(sid)}`, {
      headers: {
        Cookie: HAOZHUMA_COOKIE,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://h5.haozhuma.com/",
      },
      cache: "no-store",
    })

    const data = await res.json()

    // code 存在且不为 1 表示失败（多半是 Cookie 失效或未登录）
    if (data.code !== undefined && data.code !== 1) {
      return NextResponse.json({
        success: false,
        msg: data.msg || "Cookie失效，请联系管理员更新 Cookie",
      })
    }

    const list: RawDockItem[] = Array.isArray(data.data) ? data.data : []
    const items = list.map(cleanDockItem)

    return NextResponse.json({ success: true, sid, items })
  } catch (e) {
    return NextResponse.json(
      { success: false, msg: e instanceof Error ? e.message : "网络错误" },
      { status: 500 },
    )
  }
}
