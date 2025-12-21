"use client"

import { useState } from "react"
import { ArrowLeft, Smartphone, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export function WeChatLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    router.push("/")
  }

  const handleWeChatLogin = () => {
    setIsLoading(true)

    // 模拟微信登录过程
    setTimeout(() => {
      const userRole = typeof window !== "undefined" ? sessionStorage.getItem("userRole") : null

      if (userRole === "landlord") {
        // 房东登录后进入仪表盘
        router.push("/dashboard")
      } else {
        // 租客登录后进入租客页面（暂时也跳转到仪表盘作为示例）
        alert("租客功能正在开发中")
        setIsLoading(false)
      }
    }, 2000)
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      {/* 返回按钮 */}
      <button
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors icon-fade-in"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>

      {/* 登录卡片 */}
      <div className="glass-card glass-shimmer rounded-3xl p-8 shadow-2xl icon-fade-in stagger-1">
        {/* 微信图标 */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl icon-float">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">微信登录</h2>
        <p className="text-center text-gray-500 mb-8">使用微信账号快速登录</p>

        {/* 微信登录按钮 */}
        <button
          onClick={handleWeChatLogin}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 icon-hover-bounce"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span>登录中...</span>
            </div>
          ) : (
            <span>微信一键登录</span>
          )}
        </button>

        {/* 特性说明 */}
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 icon-fade-in stagger-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">快速便捷</h4>
              <p className="text-xs text-gray-500 mt-1">无需注册，使用微信即可登录</p>
            </div>
          </div>

          <div className="flex items-start gap-3 icon-fade-in stagger-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">安全可靠</h4>
              <p className="text-xs text-gray-500 mt-1">采用微信官方认证体系</p>
            </div>
          </div>

          <div className="flex items-start gap-3 icon-fade-in stagger-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">智能体验</h4>
              <p className="text-xs text-gray-500 mt-1">AI驱动的智能管理助手</p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部协议 */}
      <p className="text-center text-xs text-gray-400 mt-6 icon-fade-in stagger-5">
        登录即表示您同意
        <span className="text-blue-600 underline cursor-pointer">《用户协议》</span>和
        <span className="text-blue-600 underline cursor-pointer">《隐私政策》</span>
      </p>
    </div>
  )
}
