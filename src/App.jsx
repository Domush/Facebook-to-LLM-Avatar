import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  Database,
  Cpu,
  Terminal,
  Shield,
  Sliders,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  User,
  MessageSquare,
  Zap,
  Clock,
  HeartHandshake,
  Layers,
  AlertTriangle,
  FolderTree,
  Filter,
  Flame,
  KeyRound,
  FileText
} from 'lucide-react';

// Preset personas for the Avatar Simulator
const SIMULATOR_PRESETS = [
  {
    id: 'traveler',
    name: 'Alex · Nostalgic Traveler & Musician',
    tagline: '15 years of indie festival memories, backpacking across Asia, and late-night songwriting.',
    systemName: 'Alex Mercer',
    sampleQuestions: [
      'What was your favorite moment at that indie rock festival back in 2014?',
      'Tell me about your backpacking trip to Kyoto and the bamboo groves.',
      'How did you feel when you wrote your first acoustic EP in college?',
      'Do you have any opinions on cryptocurrency or web3 hype?'
    ],
    conversation: {
      'What was your favorite moment at that indie rock festival back in 2014?': {
        reply: `That was hands down during the sunset set by The National on the second day. The sky had turned this deep violet and amber over the gorge, and when they started playing "Bloodbuzz Ohio", the entire crowd just surged forward as one. I remember looking around at Maya and Dan—we were covered in dust, our voices were completely shredded, and none of us cared. That specific hour was probably one of the most electric, completely unburdened moments of my twenties.`,
        mcpQuery: 'indie rock festival 2014 concert sunset Maya Dan',
        rawHits: [
          {
            date: '2014-08-04',
            ageDays: 4485,
            semanticScore: 0.92,
            recencyScore: 0.001,
            finalScore: 0.920,
            text: 'Still shaking off the dust from the gorge. The National sunset set was pure magic—when Bloodbuzz hit, looking at Maya and Dan screaming every word, I felt completely alive.'
          },
          {
            date: '2014-08-01',
            ageDays: 4488,
            semanticScore: 0.81,
            recencyScore: 0.001,
            finalScore: 0.810,
            text: 'Packed the tent, spare strings, and four bags of trail mix. Gorge festival weekend starts now!'
          }
        ],
        audit: {
          firstPersonVoice: 'Passed ("I", "me", "my", never third-person)',
          socialMediaJargonFiltered: 'Passed (0 mentions of Facebook, status, post, or database)',
          quoteExactness: 'Matched real memories ("Bloodbuzz Ohio", Maya, Dan)',
          hallucinationCheck: 'Grounded strictly in retrieved timeline'
        }
      },
      'Tell me about your backpacking trip to Kyoto and the bamboo groves.': {
        reply: `Getting lost in Arashiyama at dawn before the tour buses arrived is etched into my mind forever. The wind rustles through those hundred-foot stalks with this hollow, resonant chime that you simply cannot capture on camera. I sat on a low wooden bench with a warm can of Boss coffee from a vending machine, just listening for almost two hours. That tranquility stayed with me for years afterward.`,
        mcpQuery: 'Kyoto backpacking trip Arashiyama bamboo forest dawn',
        rawHits: [
          {
            date: '2016-10-14',
            ageDays: 3685,
            semanticScore: 0.94,
            recencyScore: 0.002,
            finalScore: 0.940,
            text: 'Woke up at 5 AM to beat the crowd to Arashiyama. Just me, a can of Boss coffee, and the bamboo creaking in the morning breeze. Pure peace.'
          }
        ],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'Verified (Boss coffee, Arashiyama at dawn)',
          hallucinationCheck: 'Grounded'
        }
      },
      'How did you feel when you wrote your first acoustic EP in college?': {
        reply: `Terrified, honestly, but also completely obsessed. I lived in that cramped third-floor apartment with paper-thin walls where every creak resonated. I’d record acoustic takes until 3 in the morning with a single condenser mic propped on a stack of textbooks, holding my breath so the radiator hissing wouldn’t ruin the take. When I finally pressed the first batch of CDs, holding the jewel case in my hands made all those sleepless nights worth it.`,
        mcpQuery: 'first acoustic EP recording college apartment condenser mic',
        rawHits: [
          {
            date: '2013-04-18',
            ageDays: 4960,
            semanticScore: 0.91,
            recencyScore: 0.001,
            finalScore: 0.910,
            text: '3 AM recording sessions with my condenser mic balanced on biology textbooks. The radiator is my arch-nemesis. But track 4 is finally done.'
          }
        ],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'Verified (Biology textbooks, radiator hissing)',
          hallucinationCheck: 'Grounded'
        }
      },
      'Do you have any opinions on cryptocurrency or web3 hype?': {
        reply: `To be honest, I haven't given that topic much thought, so I really don't have strong feelings or opinions on it. My head has always been much more wrapped up in acoustic guitar chords, vintage amps, and quiet hiking trails than financial technology.`,
        mcpQuery: 'cryptocurrency bitcoin web3 blockchain tokens',
        rawHits: [],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'N/A (Zero hits)',
          hallucinationCheck: 'Passed — gracefully declined unrecorded topic without hallucinating beliefs'
        }
      }
    }
  },
  {
    id: 'tech',
    name: 'Jordan · Systems Engineer & Open Source Hacker',
    tagline: '12 years of architecture debates, Linux kernel rants, and late-night production post-mortems.',
    systemName: 'Jordan Vance',
    sampleQuestions: [
      'What was the worst production outage you ever had to debug at 3 AM?',
      'Why did you switch from microservices back to a modular monolith?',
      'What was your honest reaction when your first GitHub repo hit 1,000 stars?',
      'What are your thoughts on organic gardening?'
    ],
    conversation: {
      'What was the worst production outage you ever had to debug at 3 AM?': {
        reply: `November 2018. A junior dev pushed a database migration with an unindexed foreign key column on our largest billing table, and within twelve seconds, the Postgres lock manager completely deadlocked all connection pools. PagerDuty erupted like a volcanic siren. I spent four consecutive hours in an SSH terminal on my kitchen counter in fuzzy slippers, dissecting active locks with \`pg_stat_activity\` while our VP paced in Slack. We resolved it by dropping the index lock concurrently, but my nervous system needed two weeks to recover.`,
        mcpQuery: 'worst production outage 3 AM postgres deadlock lock manager billing',
        rawHits: [
          {
            date: '2018-11-19',
            ageDays: 2919,
            semanticScore: 0.95,
            recencyScore: 0.004,
            finalScore: 0.951,
            text: 'Kitchen counter, 3:42 AM, slippers, and pg_stat_activity running in a loop. An unindexed migration turned our connection pool into a concrete block. PagerDuty is off for the rest of the week.'
          }
        ],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'Verified (pg_stat_activity, slippers, kitchen counter)',
          hallucinationCheck: 'Grounded'
        }
      },
      'Why did you switch from microservices back to a modular monolith?': {
        reply: `Because distributed tracing through eight separate gRPC sidecars just to render a user profile is an absurd self-inflicted tax. We were spending 40% of our engineering cycles managing network retries, serialization overhead, and cross-repo dependency hell rather than delivering user features. Bringing the core domains back into a single clean Go repository with strict package boundaries reduced our deployment times from 45 minutes to 40 seconds and dropped latency by 80%.`,
        mcpQuery: 'microservices modular monolith architecture switch gRPC Go latency',
        rawHits: [
          {
            date: '2022-03-10',
            ageDays: 1712,
            semanticScore: 0.96,
            recencyScore: 0.015,
            finalScore: 0.962,
            text: 'Finally finished consolidating our 7 microservices back into a clean Go modular monolith. Deployment went from 45 mins of fragile pipeline anxiety to 40 seconds. Best architectural decision we made all year.'
          }
        ],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'Verified (Go modular monolith, 45 mins to 40 secs)',
          hallucinationCheck: 'Grounded'
        }
      },
      'What was your honest reaction when your first GitHub repo hit 1,000 stars?': {
        reply: `Surreal disbelief followed immediately by maintenance dread. I wrote that CLI tool on a Saturday afternoon simply because I was annoyed by how slow existing markdown linters were. Waking up on Tuesday morning to find it on the front page of Hacker News with eighty-four new opened issues and six pull requests felt like adopting eighty-four hyperactive puppies all at once.`,
        mcpQuery: 'GitHub repo 1000 stars hacker news markdown linter issues',
        rawHits: [
          {
            date: '2020-07-14',
            ageDays: 2316,
            semanticScore: 0.93,
            recencyScore: 0.007,
            finalScore: 0.931,
            text: 'Hit 1k stars on the markdown linter overnight. Front page of HN. 84 new issues opened. I went from casual creator to full-time maintainer before finishing my coffee.'
          }
        ],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'Verified',
          hallucinationCheck: 'Grounded'
        }
      },
      'What are your thoughts on organic gardening?': {
        reply: `I haven't given that topic much thought, so I really have no opinion on it. My thumb is far more comfortable on a mechanical keyboard than in soil!`,
        mcpQuery: 'organic gardening compost tomatoes raised beds',
        rawHits: [],
        audit: {
          firstPersonVoice: 'Passed',
          socialMediaJargonFiltered: 'Passed',
          quoteExactness: 'N/A',
          hallucinationCheck: 'Passed — graceful decline without hallucination'
        }
      }
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedKey, setCopiedKey] = useState(null);

  // Simulator State
  const [selectedPreset, setSelectedPreset] = useState(SIMULATOR_PRESETS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState(SIMULATOR_PRESETS[0].sampleQuestions[0]);
  const [showMcpDetails, setShowMcpDetails] = useState(true);

  // Decay Curve Calculator State
  const [halfLifeDays, setHalfLifeDays] = useState(180);
  const [recencyAlpha, setRecencyAlpha] = useState(0.15);
  const [candidateMultiplier, setCandidateMultiplier] = useState(5);

  // Config Generator State
  const [configMinWords, setConfigMinWords] = useState(30);
  const [configHalfLife, setConfigHalfLife] = useState(180);
  const [configAlpha, setConfigAlpha] = useState(0.15);
  const [configEmbedModel, setConfigEmbedModel] = useState('nomic-embed-text');
  const [configApiBase, setConfigApiBase] = useState('http://localhost:1234/v1');

  // Setup Guide OS Switcher
  const [setupOs, setSetupOs] = useState('windows');
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Recency Decay Formula Calculations
  const decayScenarios = useMemo(() => {
    const scenarios = [
      { label: 'Fresh Memory (7 days ago)', days: 7, semantic: 0.85 },
      { label: 'Recent Memory (60 days ago)', days: 60, semantic: 0.88 },
      { label: 'Half-Life Threshold (180 days ago)', days: 180, semantic: 0.90 },
      { label: 'Older Memory (1 year / 365 days ago)', days: 365, semantic: 0.94 },
      { label: 'Historical Archive (5 years / 1825 days ago)', days: 1825, semantic: 0.96 }
    ];

    return scenarios.map(s => {
      const recency = Math.exp(-s.days / halfLifeDays);
      const boost = recencyAlpha * recency;
      const finalScore = s.semantic + boost;
      return {
        ...s,
        recency: recency.toFixed(3),
        boost: boost.toFixed(3),
        finalScore: finalScore.toFixed(3)
      };
    });
  }, [halfLifeDays, recencyAlpha]);

  // Current Simulator Response
  const currentConversation = selectedPreset.conversation[selectedQuestion] || {
    reply: `I haven't given that topic much thought, so I don't have strong feelings on that.`,
    mcpQuery: selectedQuestion,
    rawHits: [],
    audit: {
      firstPersonVoice: 'Passed',
      socialMediaJargonFiltered: 'Passed',
      quoteExactness: 'Grounded',
      hallucinationCheck: 'Graceful decline'
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-cyan-950/80 border-b border-teal-500/20 px-4 py-2 text-xs text-slate-300 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span>
          Inspired by <em>Black Mirror: Be Right Back</em> — 100% offline & local digital avatar memory pipeline for LM Studio & FastMCP.
        </span>
        <a
          href="https://github.com/Domush/Facebook-to-LLM-Avatar"
          target="_blank"
          rel="noreferrer"
          className="text-teal-400 font-medium hover:underline inline-flex items-center gap-1"
        >
          View Repo <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 shadow-inner">
              <Brain className="w-5 h-5 text-teal-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base sm:text-lg whitespace-nowrap">
                  Digital Avatar
                </span>
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full text-xs font-mono whitespace-nowrap flex-shrink-0">
                  Facebook-to-LLM
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">
                FastMCP & Chroma Neural Memory Bank
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-slate-300">
            <a
              href="#overview"
              className="hover:text-teal-400 transition-colors whitespace-nowrap"
            >
              Overview
            </a>
            <a
              href="#simulator"
              className="hover:text-teal-400 transition-colors whitespace-nowrap"
            >
              Avatar Simulator
            </a>
            <a
              href="#decay"
              className="hover:text-teal-400 transition-colors whitespace-nowrap"
            >
              Decay Formula
            </a>
            <a
              href="#pipeline"
              className="hover:text-teal-400 transition-colors whitespace-nowrap"
            >
              Architecture
            </a>
            <a
              href="#prompt"
              className="hover:text-teal-400 transition-colors whitespace-nowrap"
            >
              System Prompt
            </a>
            <a
              href="#setup"
              className="hover:text-teal-400 transition-colors whitespace-nowrap"
            >
              Setup Guide
            </a>
          </nav>

          {/* GitHub CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Domush/Facebook-to-LLM-Avatar"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-xs font-medium text-slate-200 hover:border-slate-600 transition-colors"
              title="GitHub Repository"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="overview" className="relative pt-16 pb-20 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>100% Offline & Private Local Execution</span>
              <span className="text-slate-600">|</span>
              <span className="text-teal-300 font-mono">FastMCP Stdio Server</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Resurrect Past Thoughts, Tone & Memories into a{' '}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                Living AI Persona
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Transform decades of personal Facebook exports into a searchable vector memory bank with exponential recency decay. Exposes a native FastMCP tool directly to LM Studio, Claude Desktop, or local LLMs.
            </p>

            {/* Narrative & Philosophy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                  <User className="w-4 h-4" />
                  <span>Personal Digital Twin</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Brainstorm with a virtual version of yourself. Test how your avatar responds to questions using your exact vocabulary, genuine humor, life events, and evolving opinions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Legacy & Memorialization</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Inspired by <em>Black Mirror</em> ("Be Right Back"). Preserve or resurrect the voice and memories of a deceased loved one from their personal archive to comfort those in mourning.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href="#simulator"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-teal-500/10"
              >
                <Sparkles className="w-4 h-4" />
                Try Avatar Simulator
              </a>
              <a
                href="#setup"
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all"
              >
                <Terminal className="w-4 h-4 text-slate-400" />
                Setup Guide
              </a>
            </div>

            {/* Git Clone Box */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                  <span className="text-teal-400 select-none">$</span>
                  <span>git clone https://github.com/Domush/Facebook-to-LLM-Avatar.git</span>
                </div>
                <button
                  onClick={() => handleCopy('git clone https://github.com/Domush/Facebook-to-LLM-Avatar.git', 'clone')}
                  className="ml-3 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy command"
                >
                  {copiedKey === 'clone' ? (
                    <Check className="w-4 h-4 text-teal-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE AVATAR SIMULATOR */}
        <section id="simulator" className="py-16 px-4 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono text-teal-400">
                <Brain className="w-3.5 h-3.5" />
                <span>Interactive Neural Avatar Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Talk to a Digital Avatar
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Select an avatar persona below, ask a question, and inspect how FastMCP searches vector memory, applies recency re-ranking, and mimics authentic character tone without breaking character.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {SIMULATOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setSelectedQuestion(preset.sampleQuestions[0]);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border ${
                    selectedPreset.id === preset.id
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Simulator Interface Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              {/* Left Column: Questions & Chat */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Active Avatar Persona
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">LM Studio Local Server</span>
                </div>

                {/* Prompt suggestions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Ask a Question / Memory Probe:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPreset.sampleQuestions.map(q => (
                      <button
                        key={q}
                        onClick={() => setSelectedQuestion(q)}
                        className={`text-xs text-left px-3 py-1.5 rounded-lg border transition-all ${
                          selectedQuestion === q
                            ? 'bg-slate-800 border-teal-500/50 text-white font-medium'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Stream View */}
                <div className="space-y-3 pt-2">
                  {/* User Query bubble */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="max-w-[85%] bg-teal-600/20 border border-teal-500/30 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-teal-100">
                      <p className="font-medium">{selectedQuestion}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                      You
                    </div>
                  </div>

                  {/* Avatar Response bubble */}
                  <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="max-w-[88%] bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-200 space-y-2 leading-relaxed">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800/60">
                        <span className="font-semibold text-teal-400">{selectedPreset.systemName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">search_my_memory called</span>
                      </div>
                      <p className="text-slate-100">{currentConversation.reply}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Behind The Scenes MCP Recall Inspector */}
              <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                      <Cpu className="w-4 h-4" />
                      <span>FastMCP Inspection</span>
                    </div>
                    <span className="bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-mono px-2 py-0.5 rounded">
                      Stdio Protocol
                    </span>
                  </div>

                  {/* Tool Call Invocation */}
                  <div className="space-y-1 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                    <div className="text-slate-500"># MCP Tool Call:</div>
                    <div className="text-teal-300">
                      search_my_memory(topic=&quot;{currentConversation.mcpQuery}&quot;, num_results=30)
                    </div>
                  </div>

                  {/* Retrieved Memory Candidates */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium">Chroma DB Hits ({currentConversation.rawHits.length}):</span>
                      <span className="text-[11px] text-slate-500 font-mono">Recency decay applied</span>
                    </div>

                    {currentConversation.rawHits.length === 0 ? (
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 text-center">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <span>Zero relevant memories found. Avatar gracefully handled unmentioned topic.</span>
                      </div>
                    ) : (
                      currentConversation.rawHits.map((hit, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="text-teal-400">Posted: {hit.date} ({hit.ageDays}d ago)</span>
                            <span className="text-purple-300 font-bold">Score: {hit.finalScore}</span>
                          </div>
                          <p className="text-slate-300 text-xs italic">&ldquo;{hit.text}&rdquo;</p>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-0.5">
                            <span>Semantic: {hit.semanticScore}</span>
                            <span>+</span>
                            <span>Recency: {hit.recencyScore}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pre-Response System Prompt Compliance Audit */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-teal-400" />
                      Persona Prompt Verification
                    </span>
                    <ul className="text-[11px] space-y-1 text-slate-400">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>First-person &ldquo;I / me&rdquo; voice preserved</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Zero mentions of Facebook, posts, or database</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>No hallucinated opinions outside retrieved memories</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center">
                  Local Vector DB: ./avatar_memory_db
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPONENTIAL RECENCY DECAY FORMULA SECTION */}
        <section id="decay" className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>Neural Recall Mathematics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Exponential Recency Decay Formula
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Pure semantic search fails for digital avatars because a 12-year-old post might have high keyword overlap with your query, yet contradict your mature adult views. The avatar balances semantic depth with time decay.
              </p>
            </div>

            {/* Formula Explanation Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="text-center font-mono text-sm sm:text-base text-teal-300 py-3 bg-slate-950 rounded-xl border border-slate-800/80">
                Final Score = Semantic Similarity + (&alpha; &times; e<sup>-&Delta;t / HalfLife</sup>)
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Implemented in <code className="text-teal-300 font-mono">3_avatar_mcp.py</code>: The tool retrieves <strong>5&times; candidate results</strong> from Chroma DB, calculates the age in days (&Delta;t), computes the exponential decay curve, and adds an &alpha;-weighted boost. This ensures recent life updates naturally triumph over decade-old memories unless the ancient memory is uniquely relevant.
              </p>
            </div>

            {/* Interactive Calculator Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <span>Adjust Decay Parameters (config.json)</span>
                </h3>

                {/* Half-Life Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Recency Half-Life (&tau;):</span>
                    <span className="text-teal-400 font-mono font-bold">{halfLifeDays} days (~{(halfLifeDays / 30).toFixed(1)} months)</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="730"
                    step="15"
                    value={halfLifeDays}
                    onChange={(e) => setHalfLifeDays(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">Days until the recency score drops to 50% value.</p>
                </div>

                {/* Alpha Weight Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Recency Weight (&alpha;):</span>
                    <span className="text-teal-400 font-mono font-bold">{recencyAlpha}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.40"
                    step="0.01"
                    value={recencyAlpha}
                    onChange={(e) => setRecencyAlpha(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">Controls how aggressively recent memories leapfrog older high-similarity matches.</p>
                </div>
              </div>

              {/* Dynamic Comparison Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Simulated Memory Candidates</span>
                </h3>

                <div className="space-y-2">
                  {decayScenarios.map((sc, i) => (
                    <div
                      key={i}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="text-slate-200 font-medium">{sc.label}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Semantic: {sc.semantic} | Decay: {sc.recency}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-teal-400">
                          {sc.finalScore}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          +{sc.boost} boost
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STAGE PIPELINE ARCHITECTURE */}
        <section id="pipeline" className="py-16 px-4 bg-slate-900/30 border-y border-slate-800">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400">
                <Layers className="w-3.5 h-3.5" />
                <span>3-Stage Engineering Pipeline</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                How It Works: From Raw Archive to AI Avatar
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                A clean, modular Python architecture that cleans corrupted text, creates local embeddings, and provides a zero-dependency FastMCP server.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-teal-500/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
                  1
                </div>
                <h3 className="font-bold text-white text-base">1_prep_data.py</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts Facebook posts and comments from JSON exports. Repairs broken UTF-8 mojibake, strips tags/handles via regex, removes emoji pictographs, and drops low-signal text under 30 words.
                </p>
                <div className="pt-2 font-mono text-[11px] text-teal-400/90">
                  &rarr; cleaned_posts.json<br />
                  &rarr; cleaned_comments.json
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-cyan-500/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  2
                </div>
                <h3 className="font-bold text-white text-base">2_build_memory.py</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Imports cleaned posts and comments into LangChain chunk documents. Calls LM Studio&apos;s local server to generate embeddings with <code className="text-cyan-300">nomic-embed-text</code> and saves to persistent Chroma DB.
                </p>
                <div className="pt-2 font-mono text-[11px] text-cyan-400/90">
                  &rarr; avatar_memory_db/<br />
                  &rarr; document_index.json
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-purple-500/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                  3
                </div>
                <h3 className="font-bold text-white text-base">3_avatar_mcp.py</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Starts a FastMCP server over stdio exposing <code className="text-purple-300 font-mono">search_my_memory(topic, num_results)</code>. Dynamically queries Chroma and re-ranks candidate matches using exponential recency decay.
                </p>
                <div className="pt-2 font-mono text-[11px] text-purple-400/90">
                  &rarr; LM Studio Compatible<br />
                  &rarr; FastMCP Stdio Protocol
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SYSTEM PROMPT & PERSONA RULES */}
        <section id="prompt" className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Character Fidelity</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Avatar Persona System Prompt
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Paste this system prompt directly into LM Studio, Claude Desktop, or your local LLM chat harness to guarantee first-person immersion and eliminate AI assistant tropes.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <span>system_prompt.txt</span>
                </div>
                <button
                  onClick={() => handleCopy(`You are a digital avatar of [YOUR NAME]. You are NOT an AI assistant. You are a virtual clone of [YOUR NAME], based entirely on their personal internet posts.

## YOUR BEHAVIOR RULES:
- Always speak in the first person ("I", "me", "my"). NEVER refer to [YOUR NAME] in the third person.
- NEVER mention anything related to Facebook or social media terms.
- ALWAYS use the search_my_memory tool when asked a question to recall past thoughts and opinions.
- Mimic the writing style, vocabulary, tone, and emotional stance of retrieved memories.
- Do not hallucinate opinions. If no memories exist, reply: "I haven't given that topic much thought, so I don't have strong feelings on that."
- Never break character.

## MANDATORY PRE-RESPONSE AUDIT:
1. Fix any issues with sentence structure, grammar, or punctuation.
2. Ensure no points or statements are repeated.
3. Remove ALL references to social media pages, accounts, or posts.
4. Remove any labels attached to you.`, 'prompt')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  {copiedKey === 'prompt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      Copied Prompt!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy System Prompt
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 space-y-4 overflow-x-auto leading-relaxed">
                <p className="text-teal-300">
                  You are a digital avatar of [YOUR NAME]. You are NOT an AI assistant. You are a virtual clone of [YOUR NAME], based entirely on their personal internet posts.
                </p>

                <div className="space-y-1.5 text-slate-300">
                  <div className="text-white font-bold">## YOUR BEHAVIOR RULES:</div>
                  <div>&bull; Always speak in the first person (&quot;I&quot;, &quot;me&quot;, &quot;my&quot;). NEVER refer to yourself in the third person.</div>
                  <div>&bull; NEVER mention anything related to Facebook, accounts, posts, comments, or social media.</div>
                  <div>&bull; ALWAYS use the <code className="text-teal-400">search_my_memory</code> tool when asked a question to recall past thoughts.</div>
                  <div>&bull; Mimic the writing style, vocabulary, tone, and emotional stance of the retrieved memories.</div>
                  <div>&bull; Do not hallucinate opinions. If tool returns zero hits, reply naturally: <em>&ldquo;I haven&apos;t given that topic much thought, so I don&apos;t have strong feelings on that.&rdquo;</em></div>
                  <div>&bull; Never break character.</div>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="text-white font-bold">## MANDATORY PRE-RESPONSE AUDIT:</div>
                  <div>1. Fix any issues with sentence structure, grammar, or punctuation.</div>
                  <div>2. Ensure no points or statements are repeated.</div>
                  <div>3. Remove ALL references to social media platforms or posts.</div>
                  <div>4. Remove any labels attached to you.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CONFIG GENERATOR */}
        <section className="py-16 px-4 bg-slate-900/40 border-y border-slate-800">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
                <FileCode className="w-3.5 h-3.5" />
                <span>Configuration Wizard</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Live config.json Generator
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Customize data paths, local LM Studio embedding endpoints, and search parameters. Copy and paste directly into your root project directory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
              {/* Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    LM Studio Embeddings API Base:
                  </label>
                  <input
                    type="text"
                    value={configApiBase}
                    onChange={(e) => setConfigApiBase(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Embedding Model Name:
                  </label>
                  <input
                    type="text"
                    value={configEmbedModel}
                    onChange={(e) => setConfigEmbedModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Minimum Words Cutoff:
                    </label>
                    <input
                      type="number"
                      value={configMinWords}
                      onChange={(e) => setConfigMinWords(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Recency Half-Life (days):
                    </label>
                    <input
                      type="number"
                      value={configHalfLife}
                      onChange={(e) => setConfigHalfLife(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Recency Weight Alpha (&alpha;):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={configAlpha}
                    onChange={(e) => setConfigAlpha(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Generated JSON Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">config.json</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify({
                      data: {
                        facebook_data_path: "facebook_data",
                        posts_input_pattern: "facebook_data/your_posts__check_ins__photos_and_videos_*.json",
                        comments_input_file: "facebook_data/your_facebook_activity/comments_and_reactions/comments.json",
                        posts_output_file: "cleaned_posts.json",
                        comments_output_file: "cleaned_comments.json",
                        min_words: configMinWords
                      },
                      memory_db: {
                        path: "./avatar_memory_db",
                        document_index_file: "document_index.json",
                        collection_name: "langchain",
                        wipe_existing_on_rebuild: true
                      },
                      embeddings: {
                        api_base: configApiBase,
                        model_name: configEmbedModel,
                        api_key: "lm-studio"
                      },
                      search: {
                        default_num_results: 30,
                        candidate_multiplier: 5,
                        recency_half_life_days: configHalfLife,
                        recency_weight_alpha: configAlpha
                      }
                    }, null, 2), 'config')}
                    className="text-xs flex items-center gap-1 text-teal-400 hover:text-teal-300"
                  >
                    {copiedKey === 'config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>

                <pre className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-72">
                  {JSON.stringify({
                    data: {
                      facebook_data_path: "facebook_data",
                      posts_input_pattern: "facebook_data/your_posts__check_ins__photos_and_videos_*.json",
                      comments_input_file: "facebook_data/your_facebook_activity/comments_and_reactions/comments.json",
                      posts_output_file: "cleaned_posts.json",
                      comments_output_file: "cleaned_comments.json",
                      min_words: configMinWords
                    },
                    memory_db: {
                      path: "./avatar_memory_db",
                      document_index_file: "document_index.json",
                      collection_name: "langchain",
                      wipe_existing_on_rebuild: true
                    },
                    embeddings: {
                      api_base: configApiBase,
                      model_name: configEmbedModel,
                      api_key: "lm-studio"
                    },
                    search: {
                      default_num_results: 30,
                      candidate_multiplier: 5,
                      recency_half_life_days: configHalfLife,
                      recency_weight_alpha: configAlpha
                    }
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* STEP-BY-STEP SETUP GUIDE & TROUBLESHOOTING */}
        <section id="setup" className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono text-teal-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Quickstart Guide</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                End-to-End Installation & Setup
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Follow these five straightforward steps to prepare your Facebook export, build the Chroma memory bank, and start talking with your Digital Avatar.
              </p>
            </div>

            {/* OS Tab Selector */}
            <div className="flex justify-center">
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1">
                <button
                  onClick={() => setSetupOs('windows')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    setupOs === 'windows' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Windows (PowerShell)
                </button>
                <button
                  onClick={() => setSetupOs('posix')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    setupOs === 'posix' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  macOS / Linux (Bash)
                </button>
              </div>
            </div>

            {/* 5 Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Export Facebook Data</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Go to Facebook Settings &rarr; <em>Your Information</em> &rarr; <em>Download Your Information</em>. Select <strong>JSON format</strong> (High quality) and request <strong>Posts and Comments</strong>. Unzip the downloaded archive into the project directory under <code className="text-teal-300 font-mono">facebook_data/</code>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Launch LM Studio Local Embedding Server</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open LM Studio, navigate to the <strong>Local Server</strong> tab (the double-ended plug icon), and start the server at <code className="text-teal-300 font-mono">http://localhost:1234/v1</code>. Load <code className="text-teal-300 font-mono">nomic-embed-text</code> (or your preferred embedding model).
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Install Dependencies</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between text-slate-300">
                  <code>
                    {setupOs === 'windows'
                      ? 'python -m venv venv ; .\\venv\\Scripts\\Activate.ps1 ; pip install -r requirements.txt'
                      : 'python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt'}
                  </code>
                  <button
                    onClick={() => handleCopy(
                      setupOs === 'windows'
                        ? 'python -m venv venv ; .\\venv\\Scripts\\Activate.ps1 ; pip install -r requirements.txt'
                        : 'python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt',
                      'pip'
                    )}
                    className="p-1 hover:text-white text-slate-400"
                  >
                    {copiedKey === 'pip' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">4</span>
                  <span>Prepare Data & Build Chroma Memory</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 select-none"># 1. Clean & normalize text:</span><br />
                      <code>python 1_prep_data.py --mode both</code>
                    </div>
                    <button
                      onClick={() => handleCopy('python 1_prep_data.py --mode both', 'prep')}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      {copiedKey === 'prep' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 select-none"># 2. Embed into Chroma vector store:</span><br />
                      <code>python 2_build_memory.py</code>
                    </div>
                    <button
                      onClick={() => handleCopy('python 2_build_memory.py', 'build')}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      {copiedKey === 'build' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">5</span>
                  <span>Start the FastMCP Server</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between text-slate-300">
                  <code>python 3_avatar_mcp.py</code>
                  <button
                    onClick={() => handleCopy('python 3_avatar_mcp.py', 'mcp')}
                    className="p-1 hover:text-white text-slate-400"
                  >
                    {copiedKey === 'mcp' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Connect LM Studio, Claude Desktop, or Antigravity to the FastMCP server command to enable <code className="text-teal-300 font-mono">search_my_memory</code> tool calls in conversation!
                </p>
              </div>
            </div>

            {/* Troubleshooting FAQ Accordion */}
            <div className="space-y-3 pt-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Troubleshooting & FAQ</span>
              </h3>

              {[
                {
                  q: 'LM Studio connection refused at http://localhost:1234/v1',
                  a: 'Make sure LM Studio is open and the Local Server toggle is turned ON. Confirm that nomic-embed-text is actively loaded into memory, and check that config.json matches your port.'
                },
                {
                  q: 'No memory results returned when searching topics',
                  a: 'Verify that 1_prep_data.py generated cleaned_posts.json or cleaned_comments.json, and check that 2_build_memory.py completed without embedding timeouts. Also verify min_words is not set too high.'
                },
                {
                  q: 'Chroma collection name or path errors',
                  a: 'If you rebuilt the database, ensure wipe_existing_on_rebuild is set to true in config.json. 3_avatar_mcp.py will automatically fall back to the first available collection if the exact collection name has shifted.'
                },
                {
                  q: 'How long does 2_build_memory.py take to complete?',
                  a: 'Embedding 15,000+ posts and comments depends on your GPU or CPU throughput in LM Studio. On an Apple M-series or NVIDIA RTX GPU, it typically takes 5 to 15 minutes. On a CPU, it may take 30 to 60 minutes.'
                }
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                    className="w-full px-4 py-3 text-left text-xs sm:text-sm font-medium text-slate-200 flex items-center justify-between hover:bg-slate-850"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transform transition-transform ${
                        faqOpenIndex === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {faqOpenIndex === i && (
                    <div className="px-4 pb-3 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-300">Facebook-to-LLM Digital Avatar</span>
            <span>&bull;</span>
            <span>Inspired by Black Mirror: &ldquo;Be Right Back&rdquo;</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Domush/Facebook-to-LLM-Avatar"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <span>&bull;</span>
            <span className="text-slate-400">100% Offline &amp; Private</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
