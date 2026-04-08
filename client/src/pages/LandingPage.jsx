import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../layout/Navbar';
import Footer from '../components/Footer';
import { Sparkles, Users, Trophy, BarChart3, Settings2, CheckCircle2, Keyboard } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentTheme, switchTheme, allThemes } = useTheme();

  const features = [
    {
      title: 'Lightning Fast',
      description: 'Optimized for ultra-responsive typing with zero latency',
      icon: Sparkles,
    },
    {
      title: 'AI Powered',
      description: 'Intelligent analysis of your typing patterns and weak keys',
      icon: Settings2,
    },
    {
      title: 'Multiplayer Races',
      description: 'Compete with others in real-time typing competitions',
      icon: Users,
    },
    {
      title: '7 Stunning Themes',
      description: 'From cyberpunk neon to minimal white - find your style',
      icon: Trophy,
    },
    {
      title: 'Advanced Analytics',
      description: 'Detailed insights into your performance and progress',
      icon: BarChart3,
    },
    {
      title: 'Customizable',
      description: 'Create custom tests and practice lists tailored to you',
      icon: CheckCircle2,
    },
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Professional Typist',
      text: 'TypeZone helped me improve from 120 to 180 WPM. The AI coaching is incredible!',
      avatar: 'A',
    },
    {
      name: 'Sarah Chen',
      role: 'Competitive Racer',
      text: 'The multiplayer races are so smooth and addictive. Best typing platform ever!',
      avatar: 'S',
    },
    {
      name: 'Mike Rodriguez',
      role: 'Coding Enthusiast',
      text: 'Love the custom test mode for code. This is perfect for developers.',
      avatar: 'M',
    },
  ];

  return (
    <div className="min-h-screen" style={{
      background: `
        radial-gradient(circle at 20% 10%, rgba(59,130,246,0.18), transparent 40%),
        radial-gradient(circle at 80% 60%, rgba(56,189,248,0.12), transparent 40%),
        linear-gradient(180deg,#020617,#020617)
      `
    }}>
      <Navbar />

      <section style={{
        maxWidth: 1200,
        margin: 'auto',
        padding: '120px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64
        }}>
          <div>
            <span style={{
              display: 'inline-flex',
              borderRadius: '9999px',
              border: '1px solid #374151',
              backgroundColor: '#1F2937',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#60A5FA'
            }}>
              Next Generation Typing Platform
            </span>

            <div style={{ marginTop: 32 }}>
              <h1 style={{
                fontSize: '56px',
                fontWeight: 700,
                lineHeight: '1.05',
                color: '#E2E8F0'
              }}>
                Master Your <span style={{
                  background: 'linear-gradient(90deg, #60a5fa, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Typing</span> Speed
              </h1>

              <p style={{
                fontSize: '18px',
                color: '#94a3b8',
                marginTop: 24,
                lineHeight: '1.6'
              }}>
                Level up your typing with a polished racing experience, live metrics, and structured practice designed for speed and accuracy.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: 16,
              marginTop: 40,
              flexWrap: 'wrap'
            }}>
              <Button size="lg" onClick={() => navigate('/login')} className="primary-btn">
                <Keyboard size={18} style={{ marginRight: 8 }} />
                Start Typing
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/multiplayer')} className="secondary-btn">
                Multiplayer Race
              </Button>
            </div>
          </div>

          <div style={{
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '28px'
          }}>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#E2E8F0',
              marginBottom: 24
            }}>
              The quick brown fox jumps over the lazy dog while keeping a steady rhythm and precise accuracy across every keystroke.
            </p>

            <div style={{ marginBottom: 24 }}>
              <div style={{
                height: '4px',
                backgroundColor: '#374151',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '75%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #60a5fa, #22d3ee)',
                  borderRadius: '2px'
                }}></div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#94a3b8',
                marginTop: 8
              }}>
                <span>75% progress</span>
                <span>10/13 words</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }}>
              <div style={{
                background: 'linear-gradient(180deg, #1F2937, #111827)',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#E2E8F0'
                }}>87</div>
                <p style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginTop: 8
                }}>WPM</p>
              </div>
              <div style={{
                background: 'linear-gradient(180deg, #1F2937, #111827)',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#E2E8F0'
                }}>98%</div>
                <p style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginTop: 8
                }}>Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 32,
          maxWidth: 1200,
          margin: 'auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Users size={24} style={{ color: '#60a5fa', margin: '0 auto 16px auto' }} />
            <div style={{ fontSize: '32px', fontWeight: 600, color: '#E2E8F0' }}>150+</div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: 8 }}>Active users</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Trophy size={24} style={{ color: '#60a5fa', margin: '0 auto 16px auto' }} />
            <div style={{ fontSize: '32px', fontWeight: 600, color: '#E2E8F0' }}>25K+</div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: 8 }}>Races completed</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <BarChart3 size={24} style={{ color: '#60a5fa', margin: '0 auto 16px auto' }} />
            <div style={{ fontSize: '32px', fontWeight: 600, color: '#E2E8F0' }}>180+</div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: 8 }}>Avg WPM</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={24} style={{ color: '#60a5fa', margin: '0 auto 16px auto' }} />
            <div style={{ fontSize: '32px', fontWeight: 600, color: '#E2E8F0' }}>98%</div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: 8 }}>Accuracy</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#E2E8F0',
              marginBottom: 16
            }}>
              Packed with Features
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#94a3b8'
            }}>
              Everything you need to become a typing master
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32
          }}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    background: 'rgba(15,23,42,0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '32px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Icon size={32} style={{ color: '#60a5fa', marginBottom: 16 }} />
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#E2E8F0',
                    marginBottom: 12
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#94a3b8',
                    lineHeight: '1.6'
                  }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#E2E8F0',
              marginBottom: 16
            }}>
              What Users Say
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#94a3b8'
            }}>
              Join thousands of typing enthusiasts
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32
          }}>
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} variant="glass">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16
                }}>
                  <span style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB, #38BDF8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'white'
                  }}>{testimonial.avatar}</span>
                  <div>
                    <p style={{
                      fontWeight: 600,
                      color: '#E2E8F0'
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#94a3b8'
                    }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p style={{
                  color: '#E2E8F0',
                  fontStyle: 'italic',
                  lineHeight: '1.6'
                }}>
                  "{testimonial.text}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(56,189,248,0.1))'
      }}>
        <div style={{
          maxWidth: 600,
          margin: 'auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#E2E8F0',
            marginBottom: 24
          }}>
            Ready to Start?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            marginBottom: 40
          }}>
            Join thousands of typists and improve your speed today
          </p>
          <Button size="lg" onClick={() => navigate('/login')}>
            Get Started Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
