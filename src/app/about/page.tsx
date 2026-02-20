import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Users, Globe, Shield, Zap, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "About - CV Builder",
  description: "Learn more about CV Builder - create professional CVs in minutes",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build Your Professional CV in Minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              CV Builder helps job seekers create professional, ATS-friendly CVs 
              that land interviews. No design skills required.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/editor">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" size="lg">View Templates</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-primary-foreground/80">CVs Created</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-primary-foreground/80">Interviews Landed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4</div>
                <div className="text-primary-foreground/80">CV Templates</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-primary-foreground/80">Free to Use</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose CV Builder?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Professional Templates</h3>
                <p className="text-muted-foreground">
                  Choose from a collection of professionally designed templates 
                  optimized for every industry and job type.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Quick & Easy</h3>
                <p className="text-muted-foreground">
                  Create your CV in minutes with our intuitive editor. 
                  No prior design experience needed.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">ATS Optimized</h3>
                <p className="text-muted-foreground">
                  All our templates are designed to pass through Applicant 
                  Tracking Systems and reach recruiters.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">PDF Export</h3>
                <p className="text-muted-foreground">
                  Export your CV to PDF with perfect formatting that looks 
                  great on any device or platform.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Nigerian Market Focus</h3>
                <p className="text-muted-foreground">
                  Specialized templates tailored for the Nigerian job market 
                  with local preferences and expectations.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Completely Free</h3>
                <p className="text-muted-foreground">
                  All features are free to use. No hidden fees, no premium 
                  subscriptions. Create unlimited CVs at no cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Choose a Template</h3>
                  <p className="text-muted-foreground">
                    Browse our collection of professional templates and select 
                    one that matches your style and industry.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Fill in Your Details</h3>
                  <p className="text-muted-foreground">
                    Use our step-by-step form to add your personal information, 
                    work experience, education, skills, and more.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Preview & Customize</h3>
                  <p className="text-muted-foreground">
                    See exactly how your CV will look with our live preview. 
                    Switch templates anytime if needed.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Download PDF</h3>
                  <p className="text-muted-foreground">
                    Export your CV as a professionally formatted PDF, ready to 
                    apply for your dream job.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your CV?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Start building your professional CV today and land your dream job.
            </p>
            <Link href="/editor">
              <Button size="lg">Create CV Now</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
