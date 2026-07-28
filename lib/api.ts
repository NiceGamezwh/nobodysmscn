const API_BASE = "https://api.haozhuma.com"

export interface LoginResponse {
  msg: string
  code: number
  token: string
}

export interface AccountInfo {
  msg: string
  code: number
  money: string
  num: number
}

export interface PhoneResponse {
  code: string
  msg: string
  sid: string
  shop_name?: string
  country_name: string
  country_code: string
  country_qu: string
  uid?: string | null
  phone: string
  sp: string
  phone_gsd: string
}

export interface MessageResponse {
  code: string
  msg: string
  sms?: string
  yzm?: string
}

export interface ReleaseResponse {
  code: string
  data: string
  msg: string
}

export async function login(user: string, pass: string): Promise<LoginResponse> {
  const res = await fetch(
    `${API_BASE}/sms/?api=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`,
  )
  return res.json()
}

export async function getAccountInfo(token: string): Promise<AccountInfo> {
  const res = await fetch(`${API_BASE}/sms/?api=getSummary&token=${encodeURIComponent(token)}`)
  return res.json()
}

export async function getPhone(
  token: string,
  sid: string,
  options?: {
    isp?: string
    province?: string
    ascription?: string
    paragraph?: string
    exclude?: string
  },
): Promise<PhoneResponse> {
  let url = `${API_BASE}/sms/?api=getPhone&token=${encodeURIComponent(token)}&sid=${encodeURIComponent(sid)}`
  if (options?.isp) url += `&isp=${options.isp}`
  if (options?.province) url += `&Province=${options.province}`
  if (options?.ascription) url += `&ascription=${options.ascription}`
  if (options?.paragraph) url += `&paragraph=${options.paragraph}`
  if (options?.exclude) url += `&exclude=${options.exclude}`
  const res = await fetch(url)
  return res.json()
}

export async function specifyPhone(token: string, sid: string, phone: string): Promise<PhoneResponse> {
  const res = await fetch(
    `${API_BASE}/sms/?api=getPhone&token=${encodeURIComponent(token)}&sid=${encodeURIComponent(sid)}&phone=${encodeURIComponent(phone)}`,
  )
  return res.json()
}

export async function getMessage(token: string, sid: string, phone: string): Promise<MessageResponse> {
  const res = await fetch(
    `${API_BASE}/sms/?api=getMessage&token=${encodeURIComponent(token)}&sid=${encodeURIComponent(sid)}&phone=${encodeURIComponent(phone)}`,
  )
  return res.json()
}

export async function releasePhone(token: string, sid: string, phone: string): Promise<ReleaseResponse> {
  const res = await fetch(
    `${API_BASE}/sms/?api=cancelRecv&token=${encodeURIComponent(token)}&sid=${encodeURIComponent(sid)}&phone=${encodeURIComponent(phone)}`,
  )
  return res.json()
}

export async function releaseAllPhones(token: string): Promise<ReleaseResponse> {
  const res = await fetch(`${API_BASE}/sms/?api=cancelAllRecv&token=${encodeURIComponent(token)}`)
  return res.json()
}

export async function blacklistPhone(token: string, sid: string, phone: string): Promise<ReleaseResponse> {
  const res = await fetch(
    `${API_BASE}/sms/?api=addBlacklist&token=${encodeURIComponent(token)}&sid=${encodeURIComponent(sid)}&phone=${encodeURIComponent(phone)}`,
  )
  return res.json()
}

export const addBlack = blacklistPhone

// 项目搜索：按项目名搜索，返回项目ID + 项目名
// 调用本站服务端接口（服务端带 Cookie 请求豪猪网页接口）
export interface SearchProject {
  id: string
  name: string
  // 十六进制 sid，用于「搜索对接」功能
  sid: string
}

export interface SearchProjectResponse {
  success: boolean
  msg?: string
  keyword?: string
  projects?: SearchProject[]
}

export async function searchProjects(keyword: string): Promise<SearchProjectResponse> {
  const res = await fetch(`/api/search-project?keyword=${encodeURIComponent(keyword)}`)
  return res.json()
}

// 搜索对接：根据项目 sid 加载对接码列表
export interface DockItem {
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

export interface DockResponse {
  success: boolean
  msg?: string
  sid?: string
  items?: DockItem[]
}

export async function dockProject(sid: string): Promise<DockResponse> {
  const res = await fetch(`/api/dock?sid=${encodeURIComponent(sid)}`)
  return res.json()
}

// ============================================================================
// 对接管理（使用用户自己的 Cookie）
// 加入对接码 / 查看已加入 / 删除已加入
// ============================================================================

// 加入对接码
export interface JoinDockResponse {
  success: boolean
  msg?: string
  djm?: string
}

export async function joinDock(cookie: string, djm: string): Promise<JoinDockResponse> {
  const res = await fetch("/api/join-dock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cookie, djm }),
  })
  return res.json()
}

// 已加入的对接码
export interface MyDockItem {
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

export interface MyDocksResponse {
  success: boolean
  msg?: string
  page?: number
  keyword?: string
  items?: MyDockItem[]
}

export async function getMyDocks(
  cookie: string,
  options?: { page?: number; keyword?: string },
): Promise<MyDocksResponse> {
  const res = await fetch("/api/my-docks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cookie, page: options?.page ?? 1, keyword: options?.keyword ?? "" }),
  })
  return res.json()
}

// 删除已加入的对接码
export interface DeleteDockResponse {
  success: boolean
  msg?: string
  uid?: string
}

export async function deleteDock(cookie: string, uid: string): Promise<DeleteDockResponse> {
  const res = await fetch("/api/delete-dock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cookie, uid }),
  })
  return res.json()
}

export const ISP_OPTIONS = [
  { value: "", label: "不限" },
  { value: "1", label: "中国移动" },
  { value: "5", label: "中国联通" },
  { value: "9", label: "中国电信" },
  { value: "14", label: "中国广电" },
  { value: "16", label: "虚拟运营商" },
]

export const PROVINCE_OPTIONS = [
  { value: "", label: "不限" },
  { value: "11", label: "北京" },
  { value: "12", label: "天津" },
  { value: "13", label: "河北" },
  { value: "14", label: "山西" },
  { value: "15", label: "内蒙古" },
  { value: "21", label: "辽宁" },
  { value: "22", label: "吉林" },
  { value: "23", label: "黑龙江" },
  { value: "31", label: "上海" },
  { value: "32", label: "江苏" },
  { value: "33", label: "浙江" },
  { value: "34", label: "安徽" },
  { value: "35", label: "福建" },
  { value: "36", label: "江西" },
  { value: "37", label: "山东" },
  { value: "41", label: "河南" },
  { value: "42", label: "湖北" },
  { value: "43", label: "湖南" },
  { value: "44", label: "广东" },
  { value: "45", label: "广西" },
  { value: "46", label: "海南" },
  { value: "50", label: "重庆" },
  { value: "51", label: "四川" },
  { value: "52", label: "贵州" },
  { value: "53", label: "云南" },
  { value: "54", label: "西藏" },
  { value: "61", label: "陕西" },
  { value: "62", label: "甘肃" },
  { value: "63", label: "青海" },
  { value: "64", label: "宁夏" },
  { value: "65", label: "新疆" },
]

export const ASCRIPTION_OPTIONS = [
  { value: "", label: "不限" },
  { value: "1", label: "仅虚拟卡" },
  { value: "2", label: "仅实体卡" },
]
