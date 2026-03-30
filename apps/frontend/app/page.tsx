import { Pencil, Users, Zap, Download, Layers, Globe } from 'lucide-react';
import Link from 'next/link';

function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Pencil className="w-8 h-8 text-blue-600" />
              
              <Link href={"/"}>
                <span className="text-2xl font-bold text-slate-900">
                  LanceDraw
                </span>
              </Link>
            </div>

            <Link href={"/signup"}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Your Ideas,
            <span className="text-blue-600"> Visualized</span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            A powerful, intuitive whiteboard for sketching diagrams, wireframes, and bringing your creative vision to life.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={"/signin"}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Sign In
              </button>
            </Link>

            <Link href={"/signup"}>
              <button className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all border-2 border-slate-200 hover:border-slate-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/* Prevew */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 aspect-video flex items-center justify-center">
            <div className="text-center">
              <Layers className="w-24 h-24 text-slate-300 mx-auto mb-4" />
              
              <p className="text-slate-400 text-lg">Canvas Preview</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Everything You Need to Create
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-linear-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              
              <p className="text-slate-600 leading-relaxed">
                Built for performance with instant load times and smooth drawing experience. No lag, no waiting.
              </p>
            </div>

            <div className="bg-linear-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Collaboration</h3>
              
              <p className="text-slate-600 leading-relaxed">
                Work together seamlessly with your team. See changes instantly as others draw and edit.
              </p>
            </div>

            <div className="bg-linear-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-7 h-7 text-purple-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Export Anywhere</h3>
              
              <p className="text-slate-600 leading-relaxed">
                Download your creations as PNG, SVG, or share with a simple link. Your work, your way.
              </p>
            </div>

            <div className="bg-linear-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Layers className="w-7 h-7 text-orange-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rich Toolset</h3>
              
              <p className="text-slate-600 leading-relaxed">
                Shapes, arrows, text, freehand drawing, and more. Everything you need for any diagram.
              </p>
            </div>

            <div className="bg-linear-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="bg-cyan-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-cyan-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Works Everywhere</h3>
              
              <p className="text-slate-600 leading-relaxed">
                Browser-based and responsive. Draw on desktop, tablet, or mobile with the same experience.
              </p>
            </div>

            <div className="bg-linear-to-br from-slate-50 to-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="bg-pink-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Pencil className="w-7 h-7 text-pink-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
              
              <p className="text-slate-600 leading-relaxed">
                Your drawings stay yours. End-to-end encrypted collaboration with complete privacy control.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ready to Start Creating?
          </h2>
          
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of creators, designers, and teams using LanceDraw every day.
          </p>
          
          <Link href={"/signin"}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Launch LanceDraw
            </button>
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Pencil className="w-6 h-6 text-blue-400" />
              
              <span className="text-xl font-bold text-white">LanceDraw</span>
            </div>
            
            <p className="text-sm">
              © 2026 LanceDraw. Built for creators, by creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
