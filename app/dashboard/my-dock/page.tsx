"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Plus, RefreshCw, Trash2, KeyRound, Save, Search } from "lucide-react"
import { joinDock, getMyDocks, deleteDock, type MyDockItem } from "@/lib/api"
import { toast } from "sonner"

const COOKIE_KEY = "hzm_user_cookie"

export default function MyDockPage() {
  // 用户 Cookie
  const [cookie, setCookie] = useState("")
  const [cookieSaved, setCookieSaved] = useState(false)

  // 加入对接码
  const [djm, setDjm] = useState("")
  const [joining, setJoining] = useState(false)

  // 已对接列表
  const [keyword, setKeyword] = useState("")
  const [listLoading, setListLoading] = useState(false)
  const [items, setItems] = useState<MyDockItem[] | null>(null)

  // 删除确认
  const [pendingDelete, setPendingDelete] = useState<MyDockItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 初始化：从 sessionStorage 读取已保存的 Cookie
  useEffect(() => {
    const saved = sessionStorage.getItem(COOKIE_KEY)
    if (saved) {
      setCookie(saved)
      setCookieSaved(true)
    }
  }, [])

  const requireCookie = () => {
    const c = cookie.trim()
    if (!c) {
      toast.error("请先填写并保存你的 Cookie")
      return null
    }
    return c
  }

  // 保存 Cookie 到本地会话
  const handleSaveCookie = () => {
    const c = cookie.trim()
    if (!c) {
      toast.error("请输入你的 Cookie")
      return
    }
    sessionStorage.setItem(COOKIE_KEY, c)
    setCookieSaved(true)
    toast.success("Cookie 已保存到本地会话")
  }

  const handleClearCookie = () => {
    sessionStorage.removeItem(COOKIE_KEY)
    setCookie("")
    setCookieSaved(false)
    toast.success("已清除本地 Cookie")
  }

  // 加入对接码
  const handleJoin = async () => {
    const c = requireCookie()
    if (!c) return
    const code = djm.trim()
    if (!code) {
      toast.error("请输入要加入的对接码")
      return
    }

    setJoining(true)
    try {
      const res = await joinDock(c, code)
      if (res.success) {
        toast.success(res.msg || "对接成功")
        setDjm("")
        // 加入成功后刷新列表
        loadList()
      } else {
        toast.error(res.msg || "加入失败")
      }
    } catch {
      toast.error("加入失败，请稍后重试")
    } finally {
      setJoining(false)
    }
  }

  // 查看已对接列表
  const loadList = async () => {
    const c = requireCookie()
    if (!c) return

    setListLoading(true)
    try {
      const res = await getMyDocks(c, { keyword: keyword.trim(), page: 1 })
      if (res.success && res.items) {
        setItems(res.items)
        if (res.items.length === 0) {
          toast.error("暂无已加入的对接码")
        } else {
          toast.success(`共 ${res.items.length} 条已对接`)
        }
      } else {
        setItems([])
        toast.error(res.msg || "获取列表失败")
      }
    } catch {
      setItems([])
      toast.error("获取列表失败，请稍后重试")
    } finally {
      setListLoading(false)
    }
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const c = requireCookie()
    if (!c) {
      setPendingDelete(null)
      return
    }

    setDeleting(true)
    try {
      const res = await deleteDock(c, pendingDelete.uid)
      if (res.success) {
        toast.success(res.msg || "删除成功")
        setItems((prev) => (prev ? prev.filter((i) => i.uid !== pendingDelete.uid) : prev))
      } else {
        toast.error(res.msg || "删除失败")
      }
    } catch {
      toast.error("删除失败，请稍后重试")
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 p-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">对接管理</h1>
        <p className="text-muted-foreground text-sm text-pretty">
          填写你自己账号的 对接码密钥 后，可直接加入对接码、查看已对接项目以及删除对接。
        </p>
      </div>

      {/* Cookie 配置 */}
      <section className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <KeyRound className="h-4 w-4 text-blue-500" />
          我的 对接码密钥
          {cookieSaved && (
            <span className="text-xs bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded font-normal">
              已保存
            </span>
          )}
        </div>
        <Textarea
          placeholder="粘贴你自己账号的对接码密钥（只有会员账号有，购买卡密时会送）"
          value={cookie}
          onChange={(e) => {
            setCookie(e.target.value)
            setCookieSaved(false)
          }}
          className="bg-background border-border text-primary min-h-20 font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={handleSaveCookie} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Save className="h-4 w-4 mr-1" />
            确定
          </Button>
          <Button variant="outline" onClick={handleClearCookie}>
            清除
          </Button>
        </div>
      </section>

      {/* 加入对接码 */}
      <section className="bg-card rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Plus className="h-4 w-4 text-emerald-500" />
          加入对接码
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="请输入对接码，例如 102533-2UQ3NDHDZU"
            value={djm}
            onChange={(e) => setDjm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                handleJoin()
              }
            }}
            className="bg-background border-border text-primary h-11 flex-1 font-mono"
          />
          <Button
            onClick={handleJoin}
            disabled={joining}
            className="h-11 bg-emerald-500 hover:bg-emerald-600 text-white px-6"
          >
            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            立即对接
          </Button>
        </div>
      </section>

      {/* 已对接列表 */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-card rounded-lg border border-border flex items-center overflow-hidden flex-1">
            <Input
              placeholder="按项目名筛选（可留空查全部）"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  loadList()
                }
              }}
              className="border-0 bg-transparent text-primary h-11 placeholder:text-muted-foreground"
            />
            <Button
              onClick={loadList}
              disabled={listLoading}
              className="h-11 rounded-none bg-blue-500 hover:bg-blue-600 text-white px-5"
            >
              {listLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  查询
                </>
              )}
            </Button>
          </div>
          <Button variant="outline" onClick={loadList} disabled={listLoading} className="h-11">
            <RefreshCw className={`h-4 w-4 mr-1 ${listLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>

        {items !== null && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">已对接列表</h2>
              <span className="text-sm text-muted-foreground">共 {items.length} 条</span>
            </div>

            {items.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
                暂无已加入的对接码
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.uid} className="bg-card rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground font-medium">{item.name || "未知项目"}</span>
                        {item.status && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
                              item.status.includes("暂停")
                                ? "bg-amber-500/15 text-amber-600"
                                : "bg-emerald-500/15 text-emerald-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingDelete(item)}
                        className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>

                    <div className="font-mono text-primary text-sm break-all">{item.uid}</div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                        价格 ¥{item.price}
                      </span>
                      <span className="text-sm bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded">
                        可用 {item.available || "-"}
                      </span>
                      {item.segmentType && (
                        <span className="text-sm bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {item.segmentType}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <InfoRow label="运营商" value={item.isp} />
                      <InfoRow label="省份" value={item.province} />
                      <InfoRow label="号段" value={item.segments} />
                      <InfoRow label="联系方式" value={item.contact} />
                      <InfoRow label="更新时间" value={item.time} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 删除确认弹窗 */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除对接？</AlertDialogTitle>
            <AlertDialogDescription className="break-all">
              将从你的账号中删除对接码 {pendingDelete?.uid}
              {pendingDelete?.name ? `（${pendingDelete.name}）` : ""}，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground shrink-0">{label}：</span>
      <span className="text-foreground break-all">{value || "-"}</span>
    </div>
  )
}
