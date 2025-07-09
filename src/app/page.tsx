'use client';

import { useState } from 'react';
import Link from "next/link";
import { BookOpen, Users, Sparkles, Archive, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">故事王</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/stories" className="text-gray-600 hover:text-purple-600 dark:text-gray-300">
              浏览故事
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 dark:text-gray-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 dark:text-gray-300"
              >
                <LogIn className="h-4 w-4" />
                <span>登录</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            欢迎来到故事王国
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            在这里，每个人都是故事的创造者。生成独特的故事开头，与他人接龙创作，共同编织精彩的故事世界。
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/generate"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              开始创作
            </Link>
            <Link
              href="/stories"
              className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              浏览故事
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              智能故事生成
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              基于时间、地点、人物、事件等参数，智能生成独特的故事开头
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              协作接龙
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              与其他创作者一起接龙，每个人都能为故事添加自己的创意
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Archive className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              故事存档
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              保存完成的故事，随时回顾你和朋友们共同创作的精彩作品
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            快速开始
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/generate"
              className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                创建新故事
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                设置故事参数，生成一个全新的故事开头
              </p>
            </Link>

            <Link
              href="/continue"
              className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                参与接龙
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                加入现有故事，为其添加你的创意段落
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
