"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { useCVStore } from "@/store/cv-store"
import type { CV } from "@/types/cv"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react"

interface PersonalInfoFormProps {
  onNext?: () => void
}

export function PersonalInfoForm({ onNext }: PersonalInfoFormProps): React.JSX.Element {
  const { currentCV, updatePersonalInfo } = useCVStore()
  const { personalInfo } = currentCV

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CV["personalInfo"]>({
    defaultValues: personalInfo,
  })

  const onSubmit = (data: CV["personalInfo"]) => {
    updatePersonalInfo(data)
    onNext?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Enter your basic contact information. This will be displayed at the top of your CV.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message as string}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message as string}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                className="pl-10"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message as string}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                className="pl-10"
                {...register("phone")}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="123 Main Street, Lagos, Nigeria"
                className="pl-10"
                {...register("address")}
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="linkedIn"
                placeholder="https://linkedin.com/in/johndoe"
                className="pl-10"
                {...register("linkedIn")}
              />
            </div>
          </div>

          {/* Portfolio URL */}
          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio / Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="portfolioUrl"
                placeholder="https://johndoe.com"
                className="pl-10"
                {...register("portfolioUrl")}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Save & Continue</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
