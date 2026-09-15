"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ExternalLink, Info } from "lucide-react"
import Image from "next/image"

const tiers = [
  {
    amount: 15,
    price: 13.5,
    discount: "9折",
    url: "https://ur.alipay.com/_6kbAsTsF3GrLhNPFijKys4",
    qr: "/images/15%E5%85%83.png",
  },
  {
    amount: 30,
    price: 26,
    discount: "86折",
    url: "https://ur.alipay.com/_dDZXe8sAyCdEGKERueExf",
    qr: "/images/30%E5%85%83.png",
  },
  {
    amount: 60,
    price: 50,
    discount: "83折",
    url: "https://ur.alipay.com/_GcrMbEX55wAnmb2DvCXoA",
    qr: "/images/60%E5%85%83.png",
    popular: true,
  },
]

export default function RechargePage() {
  return (
    <div className="space-y-6">
      {/* Header with banner */}
      <div className="relative rounded-xl overflow-hidden h-32 md:h-40">
        <Image src="/images/banner.gif" alt="Nobody SMS" fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50 flex items-center">
          <div className="px-6">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">立即充值</h1>
            <p className="text-muted-foreground">选择充值档位，享受折扣优惠</p>
          </div>
        </div>
      </div>

      {/* Member notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-primary">充值说明</p>
          <p className="text-sm text-muted-foreground">充值会在一个工作日内到账,加急请联系客服。</p>
        </div>
      </div>

      {/* Tiers */}
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.amount}
            className={
              tier.popular
                ? "bg-card/50 border-2 border-primary relative"
                : "bg-card/50 border-border/50"
            }
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-xs text-primary-foreground font-medium">
                最受欢迎
              </span>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">充值 {tier.amount} 元</CardTitle>
              <CardDescription>到账 {tier.amount} 元</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-primary">¥{tier.price}</span>
                  <span className="text-sm text-muted-foreground line-through">¥{tier.amount}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/15 text-xs text-primary font-medium">
                  {tier.discount}
                </span>
              </div>
              <a
                href={tier.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                立即充值
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="pt-2 border-t border-border/50">
                <div className="mx-auto w-40 h-40 rounded-lg overflow-hidden bg-white p-2">
                  <Image
                    src={tier.qr || "/placeholder.svg"}
                    alt={`充值 ${tier.amount} 元收款二维码`}
                    width={160}
                    height={160}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
