"use client"

import { Home, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function RoleSelection() {
  const router = useRouter()

  const handleRoleSelect = (role: "tenant" | "landlord") => {
    // 存储用户选择的身份
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userRole", role)
    }
    router.push("/login")
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      {/* Logo和标语 */}
      <div className="text-center mb-12 icon-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-2xl icon-float">
          <Home className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          智居AI
        </h1>
        <p className="text-lg text-gray-600">定义未来居住新方式</p>
      </div>

      {/* 身份选择按钮 */}
      <div className="space-y-4">
        {/* 租客按钮 */}
        <button
          onClick={() => handleRoleSelect("tenant")}
          className="w-full glass-card glass-shimmer rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group icon-fade-in stagger-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center icon-hover-bounce">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                  我是租客
                </h3>
                <p className="text-sm text-gray-500 mt-1">寻找理想的居住空间</p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* 房东按钮 */}
        <button
          onClick={() => handleRoleSelect("landlord")}
          className="w-full glass-card glass-shimmer rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group icon-fade-in stagger-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center icon-hover-bounce">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  我是房东
                </h3>
                <p className="text-sm text-gray-500 mt-1">智能管理我的房产</p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* 底部说明 */}
      <p className="text-center text-sm text-gray-400 mt-8 icon-fade-in stagger-3">选择您的身份以继续使用</p>
    </div>
  )
}
