'use client'

import { useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Eye, EyeOff, Heart, LockKeyhole, Menu, Sparkles, UserRound, X } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
]

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Sukoon home">
      <span className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></span>
      <span>Sukoon</span>
    </Link>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Brand />
        <button className="menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end={item.to === '/'}>{item.label}</NavLink>
          ))}
          <div className="nav-actions">
            <Link className="nav-login" to="/login" onClick={() => setOpen(false)}>Log in</Link>
            <Link className="button button-small" to="/signup" onClick={() => setOpen(false)}>Get started <ArrowRight size={15} /></Link>
          </div>
        </nav>
      </div>
      {location.pathname !== '/' && <div className="nav-shadow" />}
    </header>
  )
}

function HomePage() {
  return (
    <main>
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> A calmer way to connect</span>
          <h1>Make space for what <em>matters.</em></h1>
          <p className="hero-text">Sukoon gives you the simple tools and gentle guidance to build a life that feels more like your own.</p>
          <div className="hero-actions"><Link to="/signup" className="button">Start your journey <ArrowRight size={17} /></Link><Link to="/about" className="text-link">See how it works <ArrowRight size={15} /></Link></div>
          <div className="social-proof"><div className="avatar-stack"><span>AS</span><span>RM</span><span>JK</span></div><span><strong>2,000+</strong> people finding their flow</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of a relaxed person sitting in a quiet garden" role="img">
          <div className="sun-orb" /><div className="leaf leaf-one" /><div className="leaf leaf-two" /><div className="leaf leaf-three" />
          <div className="art-card"><span className="art-card-label">TODAY&apos;S CHECK-IN</span><strong>Feeling grounded</strong><div className="mood-line"><span /><span /><span /><span className="chosen" /><span /></div><small>That&apos;s a good place to begin.</small></div>
          <div className="plant plant-left"><i /><i /><i /><b /></div><div className="plant plant-right"><i /><i /><b /></div>
          <div className="person"><div className="head" /><div className="hair" /><div className="body" /><div className="leg leg-left" /><div className="leg leg-right" /><div className="arm" /></div>
        </div>
      </section>
      <section className="feature-section"><div className="section-intro"><span className="eyebrow">A little more ease</span><h2>Small steps. <em>Real change.</em></h2><p>Everything you need to feel more present, more often.</p></div><div className="feature-grid"><Feature icon={<Heart size={20} />} title="Know yourself" text="Thoughtful prompts that help you notice what you need." /><Feature icon={<Sparkles size={20} />} title="Find your rhythm" text="Simple rituals designed to fit the life you already live." /><Feature icon={<Check size={20} />} title="Feel the difference" text="Celebrate progress that feels meaningful to you." /></div></section>
    </main>
  )
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span className="feature-arrow"><ArrowRight size={16} /></span></article> }

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const isSignup = mode === 'signup'
  return <main className="auth-shell"><div className="auth-visual"><span className="eyebrow"><Sparkles size={14} /> Your space to grow</span><h1>{isSignup ? 'Begin with a little curiosity.' : 'Welcome back to your space.'}</h1><p>{isSignup ? 'Create an account and take the first small step toward a life with more room to breathe.' : 'Pick up where you left off. Your next small step is waiting.'}</p><div className="quote">“The quieter you become, the more you are able to hear.”<small>— Rumi</small></div></div><div className="auth-card"><Link to="/" className="auth-brand"><span className="brand-mark"><Sparkles size={16} /></span> Sukoon</Link><div className="auth-heading"><span className="eyebrow">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</span><h2>{isSignup ? 'Create your account' : 'Log in to Sukoon'}</h2><p>{isSignup ? 'A calmer space is just a few details away.' : 'Good to see you again.'}</p></div>{submitted ? <div className="success-state"><div className="success-icon"><Check size={22} /></div><h3>{isSignup ? "You're on your way." : "You're all set."}</h3><p>This demo form is ready for your real authentication flow.</p><Link to="/" className="button">Back to home <ArrowRight size={16} /></Link></div> : <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}><div className="field-group">{isSignup && <label>Full name<input type="text" placeholder="Your name" required /></label>}<label>Email address<input type="email" placeholder="you@example.com" required /></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} placeholder="••••••••" minLength={6} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label></div>{!isSignup && <div className="form-row"><label className="check-label"><input type="checkbox" /> <span>Remember me</span></label><button type="button" className="forgot">Forgot password?</button></div>}{isSignup && <label className="check-label"><input type="checkbox" required /> <span>I agree to the <a href="#terms">terms & privacy</a></span></label>}<button className="button auth-submit" type="submit">{isSignup ? 'Create account' : 'Log in'} <ArrowRight size={16} /></button></form>}<p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to Sukoon?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link></p></div></main>
}

function AboutPage() { return <main className="about-page"><section className="about-hero"><span className="eyebrow"><Sparkles size={14} /> Our why</span><h1>A softer approach to <em>everyday life.</em></h1><p>We believe feeling good shouldn&apos;t feel like another thing to achieve. Sukoon is a place to pause, listen in, and make small changes that add up.</p></section><section className="about-grid"><div className="about-number">01<span> / 03</span></div><div><h2>Start where you are.</h2><p>No perfect morning routines. No pressure to become a different person. Just useful prompts, warm reminders, and a little more awareness of what makes you feel like you.</p><Link to="/signup" className="text-link">Find your starting point <ArrowRight size={15} /></Link></div><div className="about-stamp"><LockKeyhole size={20} /><strong>Your privacy<br />comes first.</strong><small>Always.</small></div></section><section className="values"><div><span className="eyebrow">What we believe</span><h2>Gentle is <em>powerful.</em></h2></div><div className="value-list"><p><b>01</b> Progress can be quiet.</p><p><b>02</b> You are allowed to change your mind.</p><p><b>03</b> A little kindness goes a long way.</p></div></section></main> }

export default function SiteApp() { return <BrowserRouter><Navbar /><Routes><Route path="/" element={<HomePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/signup" element={<AuthPage mode="signup" />} /></Routes><footer className="site-footer"><span>© 2026 Sukoon</span><span>Made for slower, better days.</span></footer></BrowserRouter> }
