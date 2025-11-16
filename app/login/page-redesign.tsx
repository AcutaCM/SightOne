"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PageTransition from "@/components/PageTransition";
import { BackgroundLayer } from "@/components/login/BackgroundLayer";
import { BrandingSection } from "@/components/login/BrandingSection";
import { LoginCard } from "@/components/login/LoginCard";
import { FormInput } from "@/components/login/FormInput";
import { PasswordInput } from "@/components/login/PasswordInput";
import { validateEmail, validatePassword } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/design-tokens";

interface LoginFormData {
  email: string;
  password: string;
}

interface ValidationState {
  emailTouched: boolean;
  passwordTouched: boolean;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPageRedesign() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  
  const [validation, setValidation] = useState<ValidationState>({
    emailTouched: false,
    passwordTouched: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Handle input change
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    
    // Clear form-level error
    if (error) {
      setError(null);
    }
  };

  // Handle input blur - validate field
  const handleBlur = (field: keyof LoginFormData) => {
    setValidation((prev) => ({
      ...prev,
      [`${field}Touched`]: true,
    }));

    // Validate field
    let validationResult;
    if (field === "email") {
      validationResult = validateEmail(formData.email);
    } else {
      validationResult = validatePassword(formData.password);
    }

    if (!validationResult.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: validationResult.error,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setValidation({
      emailTouched: true,
      passwordTouched: true,
    });

    // Validate all fields
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);

    const errors: FieldErrors = {};
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Submit form
    setIsLoading(true);
    setError(null);

    try {
      await login({ email: formData.email });
      router.push("/login-success");
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Layer */}
        <BackgroundLayer variant="gradient" intensity="medium" />

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
          {/* Branding Section - Hidden on mobile */}
          <div className="hidden lg:flex lg:flex-1">
            <BrandingSection />
          </div>

          {/* Login Form Section */}
          <div className="flex-1 lg:max-w-xl flex items-center justify-center p-6 md:p-8">
            <LoginCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <FormInput
                  label="邮箱地址"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={formData.email}
                  onChange={(value) => handleInputChange("email", value)}
                  onBlur={() => handleBlur("email")}
                  error={fieldErrors.email}
                  touched={validation.emailTouched}
                  required
                />

                {/* Password Input */}
                <PasswordInput
                  label="密码"
                  placeholder="请输入您的密码"
                  value={formData.password}
                  onChange={(value) => handleInputChange("password", value)}
                  onBlur={() => handleBlur("password")}
                  error={fieldErrors.password}
                  touched={validation.passwordTouched}
                  required
                />

                {/* Form-level Error */}
                {error && (
                  <div className="p-4 rounded-login-md bg-red-500/20 border border-red-500/30">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <a
                    href="/forgot-password"
                    className="text-sm text-login-primary-400 hover:text-login-primary-300 transition-colors"
                  >
                    忘记密码？
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    login-button-hover
                    w-full
                    h-12 md:h-14
                    rounded-login-md
                    bg-login-primary-600
                    hover:bg-login-primary-700
                    active:bg-login-primary-800
                    disabled:bg-login-gray-400
                    disabled:cursor-not-allowed
                    text-white
                    font-semibold
                    text-base
                    transition-all
                    duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  {isLoading && (
                    <div className="login-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  )}
                  <span>{isLoading ? "登录中..." : "登录"}</span>
                </button>

                {/* Sign Up Prompt */}
                <div className="text-center pt-4">
                  <p className="text-white/70 text-sm">
                    还没有账户？{" "}
                    <a
                      href="/register"
                      className="text-login-primary-400 hover:text-login-primary-300 font-medium transition-colors"
                    >
                      立即注册
                    </a>
                  </p>
                </div>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/50">或</span>
                  </div>
                </div>

                {/* Quick Demo Button */}
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="
                    w-full
                    h-11
                    rounded-login-md
                    border-[1.5px]
                    border-white/20
                    bg-transparent
                    hover:bg-white/5
                    text-white/80
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  <Zap className="w-4 h-4" />
                  <span>快速体验（无需登录）</span>
                </button>
              </form>

              {/* Security Footer */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-white/50 text-xs">
                  登录即表示您同意我们的{" "}
                  <a href="/terms" className="text-login-primary-400 hover:underline">
                    服务条款
                  </a>{" "}
                  和{" "}
                  <a href="/privacy" className="text-login-primary-400 hover:underline">
                    隐私政策
                  </a>
                </p>
              </div>
            </LoginCard>
          </div>
        </div>

        {/* Page Footer */}
        <div className="absolute bottom-0 left-0 w-full z-20">
          <div className="bg-black/30 backdrop-blur-sm py-3">
            <p className="text-center text-white/60 text-xs">
              © {new Date().getFullYear()} TTtalentDronePLF. Developed by TTtalentDev Team. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
