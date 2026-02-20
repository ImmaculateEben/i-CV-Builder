"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonalInfoForm } from "@/components/cv/forms/personal-info-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  User, Briefcase, GraduationCap, Award, Languages, 
  Users, FileText, Plus, Trash2, ChevronRight, ChevronLeft,
  Download, Eye, Palette
} from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { cn } from "@/lib/utils"
import { PDFDownloadButton } from "@/components/cv/pdf-button"
import { TemplateSelector } from "@/components/cv/template-selector"
import { ModernTemplate } from "@/components/cv/templates/modern-template"
import { ProfessionalTemplate } from "@/components/cv/templates/professional-template"
import { CreativeTemplate } from "@/components/cv/templates/creative-template"
import { NigerianTemplate } from "@/components/cv/templates/nigerian-template"

const steps = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Award },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "referees", label: "Referees", icon: Users },
]

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { currentCV, currentTemplate, updateSummary, addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    addSkill, updateSkill, removeSkill,
    addCertification, updateCertification, removeCertification,
    addLanguage, updateLanguage, removeLanguage,
    addReferee, updateReferee, removeReferee,
    resetCV } = useCVStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading editor...</div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">CV Editor</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Fill in your information to create your CV</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTemplateSelector(true)}>
                <Palette className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Templates</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <PDFDownloadButton size="sm" />
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max pb-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <step.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium hidden xs:inline">{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 0 && (
              <PersonalInfoForm onNext={handleNext} />
            )}

            {/* Step 2: Summary */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Professional Summary
                  </CardTitle>
                  <CardDescription>
                    Write a brief summary highlighting your key skills and career objectives.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        placeholder="A results-driven professional with experience in..."
                        rows={6}
                        defaultValue={currentCV.summary}
                        onChange={(e) => updateSummary(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        {currentCV.summary.length}/2000 characters
                      </p>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={handlePrevious}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button type="button" onClick={handleNext}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Work Experience */}
            {currentStep === 2 && (
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
                <CardContent className="space-y-4">
                  {currentCV.experience.map((exp, index) => (
                    <div key={exp.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Company *</Label>
                          <Input
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { ...exp, company: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Position *</Label>
                          <Input
                            placeholder="Job Title"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, { ...exp, position: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, { ...exp, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            disabled={exp.current}
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, { ...exp, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, { ...exp, current: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`current-${exp.id}`} className="font-normal">
                          I currently work here
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your responsibilities and achievements..."
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, { ...exp, description: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addExperience} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Education */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                  <CardDescription>
                    Add your educational background.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.education.map((edu, index) => (
                    <div key={edu.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Institution *</Label>
                          <Input
                            placeholder="University/School Name"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, { ...edu, institution: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Degree *</Label>
                          <Input
                            placeholder="Bachelor of Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, { ...edu, degree: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study *</Label>
                        <Input
                          placeholder="Computer Science"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, { ...edu, field: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, { ...edu, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            disabled={edu.current}
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, { ...edu, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addEducation} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Skills */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </CardTitle>
                  <CardDescription>
                    Add your technical and soft skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-4">
                      <Input
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, { ...skill, name: e.target.value })}
                        className="flex-1"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill(skill.id, { ...skill, level: e.target.value as any })}
                        className="h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <select
                        value={skill.category}
                        onChange={(e) => updateSkill(skill.id, { ...skill, category: e.target.value as any })}
                        className="h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="technical">Technical</option>
                        <option value="soft">Soft</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(skill.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSkill} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Certifications */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                  <CardDescription>
                    Add any professional certifications or licenses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.certifications.map((cert, index) => (
                    <div key={cert.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Certification {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCertification(cert.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Certification Name *</Label>
                          <Input
                            placeholder="AWS Solutions Architect"
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, { ...cert, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Issuing Organization *</Label>
                          <Input
                            placeholder="Amazon Web Services"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(cert.id, { ...cert, issuer: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date Obtained</Label>
                          <Input
                            type="month"
                            value={cert.date}
                            onChange={(e) => updateCertification(cert.id, { ...cert, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Credential ID (optional)</Label>
                          <Input
                            placeholder="ABC123XYZ"
                            value={cert.credentialId || ''}
                            onChange={(e) => updateCertification(cert.id, { ...cert, credentialId: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addCertification} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Languages */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages
                  </CardTitle>
                  <CardDescription>
                    List languages you can speak and your proficiency level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.languages.map((lang, index) => (
                    <div key={lang.id} className="flex items-center gap-4">
                      <Input
                        placeholder="Language (e.g., English)"
                        value={lang.language}
                        onChange={(e) => updateLanguage(lang.id, { ...lang, language: e.target.value })}
                        className="flex-1"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => updateLanguage(lang.id, { ...lang, proficiency: e.target.value as any })}
                        className="h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(lang.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addLanguage} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 8: Referees */}
            {currentStep === 7 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Referees
                  </CardTitle>
                  <CardDescription>
                    Add professional references who can vouch for your work.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.referees.map((ref, index) => (
                    <div key={ref.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Referee {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReferee(ref.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            placeholder="Dr. John Smith"
                            value={ref.name}
                            onChange={(e) => updateReferee(ref.id, { ...ref, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Position *</Label>
                          <Input
                            placeholder="Managing Director"
                            value={ref.position}
                            onChange={(e) => updateReferee(ref.id, { ...ref, position: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Company / Organization *</Label>
                        <Input
                          placeholder="ABC Corporation"
                          value={ref.company}
                          onChange={(e) => updateReferee(ref.id, { ...ref, company: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="john.smith@company.com"
                            value={ref.email || ''}
                            onChange={(e) => updateReferee(ref.id, { ...ref, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={ref.phone || ''}
                            onChange={(e) => updateReferee(ref.id, { ...ref, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addReferee} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Referee
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download CV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>CV Preview</DialogTitle>
            <DialogDescription>
              This is how your CV will look when exported to PDF
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-x-auto">
            {currentTemplate === "modern" && <ModernTemplate cv={currentCV} />}
            {currentTemplate === "professional" && <ProfessionalTemplate cv={currentCV} />}
            {currentTemplate === "creative" && <CreativeTemplate cv={currentCV} />}
            {currentTemplate === "nigerian" && <NigerianTemplate cv={currentCV} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select a template for your CV. You can change this anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <TemplateSelector onSelect={() => setShowTemplateSelector(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
