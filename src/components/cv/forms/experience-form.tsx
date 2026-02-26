"use client"

import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { WorkExperienceInput } from "@/lib/schemas"
import { useCVStore } from "@/store/cv-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Briefcase } from "lucide-react"

interface ExperienceFormProps {
  onNext?: () => void
  onPrevious?: () => void
}

export function ExperienceForm({ onNext, onPrevious }: ExperienceFormProps) {
  const { currentCV, updateExperience } = useCVStore()
  const { experience } = currentCV

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ experience: WorkExperienceInput[] }>({
    defaultValues: {
      experience: experience.length > 0 ? experience : [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  })

  const watchCurrent = useWatch({
    control,
    name: "experience",
    defaultValue: [],
  })

  const onSubmit = () => {
    // Update store with each experience entry
    watchCurrent.forEach((exp) => {
      updateExperience(exp.id, exp)
    })
    onNext?.()
  }

  const handleAdd = () => {
    append({
      id: Math.random().toString(36).substring(2, 15),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
        </CardTitle>
        <CardDescription>
          Add your work history, starting with the most recent position.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative rounded-lg border p-4 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Experience {index + 1}</h4>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor={`experience.${index}.company`}>Company *</Label>
                <Input
                  id={`experience.${index}.company`}
                  placeholder="Company Name"
                  {...register(`experience.${index}.company`)}
                />
                {errors.experience?.[index]?.company && (
                  <p className="text-sm text-destructive">
                    {errors.experience[index]?.company?.message}
                  </p>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor={`experience.${index}.position`}>Position *</Label>
                <Input
                  id={`experience.${index}.position`}
                  placeholder="Job Title"
                  {...register(`experience.${index}.position`)}
                />
                {errors.experience?.[index]?.position && (
                  <p className="text-sm text-destructive">
                    {errors.experience[index]?.position?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor={`experience.${index}.startDate`}>Start Date *</Label>
                <Input
                  id={`experience.${index}.startDate`}
                  type="month"
                  {...register(`experience.${index}.startDate`)}
                />
                {errors.experience?.[index]?.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.experience[index]?.startDate?.message}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor={`experience.${index}.endDate`}>End Date</Label>
                <Input
                  id={`experience.${index}.endDate`}
                  type="month"
                  disabled={watchCurrent[index]?.current}
                  {...register(`experience.${index}.endDate`)}
                />
              </div>
            </div>

            {/* Current Position Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`experience.${index}.current`}
                {...register(`experience.${index}.current`)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor={`experience.${index}.current`} className="font-normal">
                I currently work here
              </Label>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor={`experience.${index}.description`}>Description</Label>
              <Textarea
                id={`experience.${index}.description`}
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
                {...register(`experience.${index}.description`)}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            Save & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
