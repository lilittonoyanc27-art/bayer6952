import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  User, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flame, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Sparkles, 
  ArrowRight,
  Shuffle,
  Info,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Question, CATEGORIES, CategoryType, questions } from './questions';

// --- CUSTOM WEB AUDIO SYNTHESIZER FOR SOUND EFFECTS ---
class SoundEffectsController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy loaded upon first interaction
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  private initCtx() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Ignored if suspended or disallowed
    }
  }

  playWin() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Arpeggio chord: C5 -> E5 -> G5
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);
        gain.gain.setValueAtTime(0.1, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 0.4);
      });
    } catch {}
  }

  playLose() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, this.ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch {}
  }

  playSpin() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch {}
  }
}

const sfx = new SoundEffectsController();

// --- PRE-LOADED SPANISH AVATARS ---
const SPANISH_AVATARS = [
  { label: '🐃 El Toro', emoji: '🐃', desc: 'Fuerte y veloz' },
  { label: '🦙 La Llama', emoji: '🦙', desc: 'Orgullo andino' },
  { label: '🍳 Tortilla', emoji: '🍳', desc: 'Con mucha cebolla' },
  { label: '💃 Flamenca', emoji: '💃', desc: 'Ritmo andaluz' },
  { label: '🌵 El Sol', emoji: '☀️', desc: 'Brillo veraniego' },
  { label: '🎸 Guitarra', emoji: '🎸', desc: 'Cuerdas mágicas' },
  { label: '🌮 El Taco', emoji: '🌮', desc: 'Picante sabroso' },
  { label: '✈️ El Viajero', emoji: '✈️', desc: 'Listo para volar' }
];

export default function App() {
  // --- APPLICATION STATES ---
  const [gameState, setGameState] = useState<'lobby' | 'ready-to-spin' | 'spinning' | 'card-drawn' | 'answering' | 'answered' | 'victory'>('lobby');
  
  // Players
  const [player1, setPlayer1] = useState({ name: 'Estudiante 1', avatar: '🐃', score: 0, streak: 0, correctCount: 0 });
  const [player2, setPlayer2] = useState({ name: 'Estudiante 2', avatar: '🦙', score: 0, streak: 0, correctCount: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [totalTurns, setTotalTurns] = useState<number>(0); // how many questions asked
  
  // Theme & Mute Settings
  const [isMuted, setIsMuted] = useState(false);
  
  // Roulette settings
  const [wheelAngle, setWheelAngle] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game Play context
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [answeredQuestionsIds, setAnsweredQuestionsIds] = useState<number[]>([]);
  const [isWigglingPointer, setIsWigglingPointer] = useState(false);

  // Stats for Victory Panel
  const [categoryStats, setCategoryStats] = useState<Record<string, { correct: number; total: number }>>({
    pasado: { correct: 0, total: 0 },
    futuro: { correct: 0, total: 0 },
    comida: { correct: 0, total: 0 },
    animales: { correct: 0, total: 0 },
    viajes: { correct: 0, total: 0 }
  });

  // Keep internal mutable state for sound controller to follow React state
  useEffect(() => {
    sfx.setMute(isMuted);
  }, [isMuted]);

  // --- RE-DRAW THE CANVAS ROULETTE WHEEL ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 12;

    ctx.clearRect(0, 0, width, height);

    // Dynamic 3D shading
    // Outer bronze circular shadow rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 11, 0, 2 * Math.PI);
    ctx.fillStyle = '#475569'; // slate-600
    ctx.fill();

    // Golden metallic border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, '#B45309'); // amber-700
    goldGrad.addColorStop(0.3, '#F59E0B'); // amber-500
    goldGrad.addColorStop(0.5, '#FFFBEB'); // amber-50
    goldGrad.addColorStop(0.8, '#D97706'); // amber-600
    goldGrad.addColorStop(1, '#78350F'); // amber-900
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Dark core outer rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 1, 0, 2 * Math.PI);
    ctx.fillStyle = '#1E293B'; // slate-800
    ctx.fill();

    const numSlices = 10;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const slicesOrder: CategoryType[] = ['pasado', 'futuro', 'comida', 'animales', 'viajes', 'pasado', 'futuro', 'comida', 'animales', 'viajes'];

    for (let i = 0; i < numSlices; i++) {
      const angle = wheelAngle + i * sliceAngle;
      const catId = slicesOrder[i];
      const catInfo = CATEGORIES[catId];

      ctx.save();
      // Slice path
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius - 4, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = catInfo.color;
      ctx.fill();

      // Delicate separator lines
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + (radius - 4) * Math.cos(angle), centerY + (radius - 4) * Math.sin(angle));
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Shiny silver studs on segment ends
      ctx.beginPath();
      ctx.arc(centerX + (radius - 12) * Math.cos(angle + sliceAngle / 2), centerY + (radius - 12) * Math.sin(angle + sliceAngle / 2), 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();

      // Text and Emojis
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      
      // Shadow for text legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 13px sans-serif';
      
      // Display: "⏳ Pasado", etc.
      ctx.fillText(`${catInfo.icon} ${catInfo.name}`, radius - 26, 0);
      ctx.restore();
    }

    // Centered Brass metal Core spindle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 28);
    centerGrad.addColorStop(0, '#FEF3C7');
    centerGrad.addColorStop(0.5, '#F59E0B');
    centerGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = centerGrad;
    ctx.fill();

    // Delicate inner central rivet
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#78350F';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

  }, [wheelAngle, gameState]);

  // --- CONFETTI GRAVITY EMITTER (For victory screen) ---
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * 5 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  };

  useEffect(() => {
    if (gameState === 'victory') {
      const cleanup = triggerConfetti();
      return cleanup;
    }
  }, [gameState]);

  // --- PHYSICS SPINNING DECELERATION SEQUENCE ---
  const spinRoulette = () => {
    if (gameState === 'spinning') return;
    sfx.playSpin();

    setGameState('spinning');
    setSelectedOptionIdx(null);
    setIsCardFlipped(false);

    const startRot = wheelAngle;
    const spins = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const randomOffset = Math.random() * 2 * Math.PI;
    const targetRot = startRot + spins * 2 * Math.PI + randomOffset;

    const duration = 4200; // 4.2 seconds
    const startTime = performance.now();

    let lastBorderIdx = -1;
    const numSlices = 10;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const slicesOrder: CategoryType[] = ['pasado', 'futuro', 'comida', 'animales', 'viajes', 'pasado', 'futuro', 'comida', 'animales', 'viajes'];

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      
      if (elapsed < duration) {
        // Cubic ease-out deceleration
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRot = startRot + (targetRot - startRot) * easeOut;
        setWheelAngle(currentRot);

        // Calculate pointer collision index (Pointer represents -Math.PI / 2 relative to rotation center)
        const normalized = (-currentRot - Math.PI / 2) % (2 * Math.PI);
        const positiveVal = normalized < 0 ? normalized + 2 * Math.PI : normalized;
        const sliceIdx = Math.floor(positiveVal / sliceAngle) % numSlices;

        if (sliceIdx !== lastBorderIdx) {
          lastBorderIdx = sliceIdx;
          setIsWigglingPointer(true);
          sfx.playTick();
          setTimeout(() => setIsWigglingPointer(false), 80);
        }

        requestAnimationFrame(animate);
      } else {
        // Completely stopped
        setWheelAngle(targetRot);
        
        // Final calculation
        const finalNormalized = (-targetRot - Math.PI / 2) % (2 * Math.PI);
        const positiveFinal = finalNormalized < 0 ? finalNormalized + 2 * Math.PI : finalNormalized;
        const winSliceIdx = Math.floor(positiveFinal / sliceAngle) % numSlices;
        const categoryDrawn = slicesOrder[winSliceIdx];

        setSelectedCategory(categoryDrawn);

        // Fetch unasked question or fallback
        const unasked = questions.filter(
          q => q.category === categoryDrawn && !answeredQuestionsIds.includes(q.id)
        );

        let selectedQ: Question;
        if (unasked.length > 0) {
          selectedQ = unasked[Math.floor(Math.random() * unasked.length)];
        } else {
          // Recycle questions if already fully exhausted
          const catAll = questions.filter(q => q.category === categoryDrawn);
          selectedQ = catAll[Math.floor(Math.random() * catAll.length)];
        }

        setCurrentQuestion(selectedQ);
        
        setTimeout(() => {
          setGameState('card-drawn');
          sfx.playWin();
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  };

  // --- MANUAL SURPRISE CARD DRAW (Alternative fallback) ---
  const drawSurpriseCard = () => {
    sfx.playSpin();
    const categoriesList: CategoryType[] = ['pasado', 'futuro', 'comida', 'animales', 'viajes'];
    const randomCat = categoriesList[Math.floor(Math.random() * categoriesList.length)];
    
    setSelectedCategory(randomCat);
    
    const unasked = questions.filter(
      q => q.category === randomCat && !answeredQuestionsIds.includes(q.id)
    );

    let selectedQ: Question;
    if (unasked.length > 0) {
      selectedQ = unasked[Math.floor(Math.random() * unasked.length)];
    } else {
      const catAll = questions.filter(q => q.category === randomCat);
      selectedQ = catAll[Math.floor(Math.random() * catAll.length)];
    }

    setCurrentQuestion(selectedQ);
    setIsCardFlipped(false);
    setSelectedOptionIdx(null);
    setGameState('card-drawn');
    sfx.playWin();
  };

  // --- SUBMIT ANSWER VALIDATION & SCORING ---
  const submitAnswer = (optionIdx: number) => {
    if (selectedOptionIdx !== null || !currentQuestion) return;
    
    setSelectedOptionIdx(optionIdx);
    setGameState('answered');
    
    const isCorrect = optionIdx === currentQuestion.correctAnswer;
    setAnsweredQuestionsIds(prev => [...prev, currentQuestion.id]);

    // Update stats
    setCategoryStats(prev => {
      const prevStats = prev[currentQuestion.category] || { correct: 0, total: 0 };
      return {
        ...prev,
        [currentQuestion.category]: {
          correct: prevStats.correct + (isCorrect ? 1 : 0),
          total: prevStats.total + 1
        }
      };
    });

    if (isCorrect) {
      sfx.playWin();
      // Award +10 points & increment streak
      if (currentPlayer === 1) {
        setPlayer1(prev => ({
          ...prev,
          score: prev.score + 10,
          streak: prev.streak + 1,
          correctCount: prev.correctCount + 1
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          score: prev.score + 10,
          streak: prev.streak + 1,
          correctCount: prev.correctCount + 1
        }));
      }
    } else {
      sfx.playLose();
      // Reset streak
      if (currentPlayer === 1) {
        setPlayer1(prev => ({ ...prev, streak: 0 }));
      } else {
        setPlayer2(prev => ({ ...prev, streak: 0 }));
      }
    }
  };

  // --- TRANSITION TO NEXT TURN / WINNER CHECK ---
  const advanceTurn = () => {
    const nextTurnCount = totalTurns + 1;
    setTotalTurns(nextTurnCount);

    // If we reached target limit or answered all 20 questions
    if (nextTurnCount >= 20 || answeredQuestionsIds.length >= 20) {
      setGameState('victory');
    } else {
      // Switch active player
      setCurrentPlayer(prev => (prev === 1 ? 2 : 1));
      setGameState('ready-to-spin');
      setCurrentQuestion(null);
      setSelectedCategory(null);
      setIsCardFlipped(false);
      setSelectedOptionIdx(null);
    }
  };

  // --- INITIALIZE NEW GAME / RESET ---
  const resetGame = () => {
    setPlayer1(prev => ({ ...prev, score: 0, streak: 0, correctCount: 0 }));
    setPlayer2(prev => ({ ...prev, score: 0, streak: 0, correctCount: 0 }));
    setCurrentPlayer(1);
    setTotalTurns(0);
    setAnsweredQuestionsIds([]);
    setCategoryStats({
      pasado: { correct: 0, total: 0 },
      futuro: { correct: 0, total: 0 },
      comida: { correct: 0, total: 0 },
      animales: { correct: 0, total: 0 },
      viajes: { correct: 0, total: 0 }
    });
    setGameState('lobby');
  };

  // Quick helper to start directly
  const startGame = () => {
    setGameState('ready-to-spin');
  };

  const activePlayerDetails = currentPlayer === 1 ? player1 : player2;

  // Calculate winner
  const getWinner = () => {
    if (player1.score > player2.score) return { name: player1.name, avatar: player1.avatar, score: player1.score, tie: false };
    if (player2.score > player1.score) return { name: player2.name, avatar: player2.avatar, score: player2.score, tie: false };
    return { name: 'Empate', avatar: '🤝', score: player1.score, tie: true };
  };

  return (
    <div id="ruleta-app-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-200">
      
      {/* HEADER BAR */}
      <header id="header-bar" className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 z-50 flex items-center justify-between">
        <div id="header-brand" className="flex items-center space-x-3">
          <div id="logo-icon-wrap" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 id="app-title-span" className="font-sans font-bold tracking-tight text-xl bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              Ruleta de Preguntas 3D
            </h1>
            <p id="app-tagline" className="text-xs text-slate-500 font-medium">Práctica de Español • Multi-jugador</p>
          </div>
        </div>

        {/* Global actions */}
        <div id="header-actions" className="flex items-center space-x-4">
          <button
            id="mute-toggle-btn"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer flex items-center space-x-1"
            title={isMuted ? "Activar Sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span className="text-xs font-semibold hidden md:inline">{isMuted ? "Mute" : "Sonido"}</span>
          </button>

          {gameState !== 'lobby' && (
            <button
              id="reset-state-btn"
              onClick={resetGame}
              className="px-3 py-1.5 rounded-lg border border-red-250 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>
          )}
        </div>
      </header>

      <main id="main-content-layout" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* ========================================================= */}
        {/* 1. LOBBY SCREEN                                           */}
        {/* ========================================================= */}
        <AnimatePresence mode="wait">
          {gameState === 'lobby' && (
            <motion.div
              id="lobby-outer-container"
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-2"
            >
              {/* Premium Top Hero Banner */}
              <div id="lobby-hero-banner" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none scale-150">
                  <span className="text-9xl">🎡</span>
                </div>
                
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                    Aventura de Aprendizaje
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    ¡Domina el español jugando!
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base max-w-xl">
                    Saca cartas de cinco categorías en una ruleta giratoria 3D interactiva. Compite con un compañero de clase, gana puntos y aprende con explicaciones gramaticales detalladas.
                  </p>
                </div>
              </div>

              {/* Player Setup Section */}
              <div id="lobby-player-setup" className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* PLAYER 1 SETUP */}
                  <div id="player1-panel" className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <h3 className="font-bold text-lg">Jugador 1</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Alumno</label>
                        <input
                          type="text"
                          value={player1.name}
                          maxLength={16}
                          onChange={(e) => setPlayer1(p => ({ ...p, name: e.target.value || 'Jugador 1' }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                          placeholder="Nombre"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecciona un Avatar Español</label>
                        <div className="grid grid-cols-4 gap-2">
                          {SPANISH_AVATARS.map((av) => (
                            <button
                              key={`p1-av-${av.label}`}
                              type="button"
                              onClick={() => setPlayer1(p => ({ ...p, avatar: av.emoji }))}
                              className={`py-2 px-3 rounded-xl border text-xl flex flex-col items-center justify-center hover:bg-white hover:border-blue-500 transition-all cursor-pointer ${
                                player1.avatar === av.emoji 
                                  ? 'bg-blue-100 border-blue-500 shadow-sm font-bold' 
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{av.emoji}</span>
                              <span className="text-[9px] mt-1 text-slate-500 truncate max-w-full font-medium">{av.label.split(' ')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PLAYER 2 SETUP */}
                  <div id="player2-panel" className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4">
                    <div className="flex items-center space-x-2 text-purple-800">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <h3 className="font-bold text-lg">Jugador 2</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Alumno</label>
                        <input
                          type="text"
                          value={player2.name}
                          maxLength={16}
                          onChange={(e) => setPlayer2(p => ({ ...p, name: e.target.value || 'Jugador 2' }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold"
                          placeholder="Nombre"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecciona un Avatar Español</label>
                        <div className="grid grid-cols-4 gap-2">
                          {SPANISH_AVATARS.map((av) => (
                            <button
                              key={`p2-av-${av.label}`}
                              type="button"
                              onClick={() => setPlayer2(p => ({ ...p, avatar: av.emoji }))}
                              className={`py-2 px-3 rounded-xl border text-xl flex flex-col items-center justify-center hover:bg-white hover:border-purple-500 transition-all cursor-pointer ${
                                player2.avatar === av.emoji 
                                  ? 'bg-purple-100 border-purple-500 shadow-sm font-bold' 
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{av.emoji}</span>
                              <span className="text-[9px] mt-1 text-slate-500 truncate max-w-full font-medium">{av.label.split(' ')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Categories Overview Panel */}
                <div id="lobby-categories-brief" className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    Categorías de Juego Incluidas (20 Preguntas Únicas)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.values(CATEGORIES).map(cat => (
                      <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-sm">
                        <span className="text-2xl block mb-1">{cat.icon}</span>
                        <div className="text-xs font-bold text-slate-800">{cat.name}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5 leading-snug">{cat.description.split(' ')[0]}...</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lobby Call to Action */}
                <div id="lobby-cta" className="pt-2 flex flex-col items-center">
                  <button
                    id="start-game-btn"
                    onClick={startGame}
                    className="group relative px-10 py-4 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-red-600 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center space-x-3 cursor-pointer"
                  >
                    <span>Empezar Desafío 3D</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-xs text-slate-400 mt-3 font-medium">No se requiere registro • Funciona 100% Sin Conexión</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* 2. GAME BOARD                                             */}
          {/* ========================================================= */}
          {gameState !== 'lobby' && gameState !== 'victory' && (
            <motion.div
              id="gameplay-board-grid"
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* LEFT COLUMN: ACTIVE SCORES & STATS (4 cols) */}
              <div id="left-stats-column" className="lg:col-span-4 space-y-6">
                
                {/* Active Round Progress Card */}
                <div id="round-indicator-card" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ronda de Juego</div>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-black text-slate-800">{Math.min(totalTurns + 1, 20)}</span>
                    <span className="text-lg font-bold text-slate-400">/ 20</span>
                  </div>
                  
                  {/* Simple Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-300" 
                      style={{ width: `${(answeredQuestionsIds.length / 20) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-2">
                    {answeredQuestionsIds.length} de 20 preguntas respondidas
                  </div>
                </div>

                {/* PLAYERS CARD LIST */}
                <div id="players-comparison" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-blue-400 to-purple-400" />
                  <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    Tabla de Posiciones
                  </h3>

                  <div className="space-y-3">
                    
                    {/* PLAYER 1 ACTIVE HUD */}
                    <div 
                      id="hud-player-1" 
                      className={`relative p-4 rounded-2xl transition-all border ${
                        currentPlayer === 1 
                          ? 'bg-blue-50/70 border-blue-200 shadow-md ring-2 ring-blue-500/20' 
                          : 'bg-white border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      {currentPlayer === 1 && (
                        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] text-white font-extrabold uppercase tracking-widest leading-none shadow-sm animate-bounce">
                          Su Turno
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-2xl shadow-inner shadow-blue-500/5">
                            {player1.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              {player1.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <span className="flex items-center text-slate-600"><GraduationCap className="w-3 h-3 mr-0.5" />{player1.correctCount} aciertos</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-blue-600">{player1.score}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">PUNTOS</div>
                        </div>
                      </div>

                      {/* Streak badge */}
                      {player1.streak > 0 && (
                        <div className="mt-3 flex items-center space-x-1 justify-end">
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-2 py-0.5 rounded-full flex items-center uppercase tracking-wide gap-0.5 shadow-sm">
                            <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                            Racha: {player1.streak} 🔥
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PLAYER 2 ACTIVE HUD */}
                    <div 
                      id="hud-player-2" 
                      className={`relative p-4 rounded-2xl transition-all border ${
                        currentPlayer === 2 
                          ? 'bg-purple-50/70 border-purple-200 shadow-md ring-2 ring-purple-500/20' 
                          : 'bg-white border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      {currentPlayer === 2 && (
                        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-[10px] text-white font-extrabold uppercase tracking-widest leading-none shadow-sm animate-bounce">
                          Su Turno
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-2xl shadow-inner shadow-purple-500/5">
                            {player2.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              {player2.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <span className="flex items-center text-slate-600"><GraduationCap className="w-3 h-3 mr-0.5" />{player2.correctCount} aciertos</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-purple-600">{player2.score}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">PUNTOS</div>
                        </div>
                      </div>

                      {/* Streak badge */}
                      {player2.streak > 0 && (
                        <div className="mt-3 flex items-center space-x-1 justify-end">
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-2 py-0.5 rounded-full flex items-center uppercase tracking-wide gap-0.5 shadow-sm">
                            <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                            Racha: {player2.streak} 🔥
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Mini instructions list */}
                <div id="game-mini-help" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    ¿Cómo jugar?
                  </h4>
                  <ul className="text-xs text-slate-500 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                    <li>Haz clic en <strong className="text-slate-800">Girar Ruleta</strong> para seleccionar un tema de forma aleatoria y física.</li>
                    <li>Saca una carta sorpresa en 3D en la mesa de juego.</li>
                    <li>Observa la pregunta, haz clic para voltear la carta y responde adecuadamente.</li>
                    <li>¡Suma <span className="font-bold text-emerald-600">+10 puntos</span> si la respuesta es correcta! Lee la lección explicada.</li>
                  </ul>
                </div>

              </div>

              {/* RIGHT COLUMN: ROULETTE STAGE & CARD DESK (8 cols) */}
              <div id="right-board-column" className="lg:col-span-8 space-y-8 flex flex-col items-center">
                
                {/* MIDDLE ROW: CURRENT TURN WHISPERER AND CAROUSEL SWITCHBOARD */}
                <div id="turn-title-announcement" className="w-full text-center bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Turno del Estudiante</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">{activePlayerDetails.avatar}</span>
                    <h3 className="text-xl font-bold text-slate-800">
                      Es el turno de <span className="bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent px-1">{activePlayerDetails.name}</span>
                    </h3>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* VIEW S.1: SPINNING MODE (CHOOSE CATEGORY)                */}
                {/* ========================================================= */}
                {(gameState === 'ready-to-spin' || gameState === 'spinning') && (
                  <div id="roulette-turntable-panel" className="w-full bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-lg flex flex-col items-center relative overflow-hidden">
                    
                    {/* TILTED 3D CONTAINER PLATFORM */}
                    <div id="canvas-3d-tilt-stage" className="relative w-full max-w-[290px] xs:max-w-[320px] sm:max-w-[420px] aspect-square flex items-center justify-center py-2 sm:py-6">
                      
                      {/* Perspective Container */}
                      <div 
                        id="tilted-circle-group"
                        className="transition-transform duration-500 ease-out transform-style-3d cursor-pointer w-full flex justify-center"
                        style={{ 
                          transform: 'perspective(900px) rotateX(42deg) rotateY(15deg) rotateZ(0deg)',
                          filter: 'drop-shadow(0 20px 25px rgba(15, 23, 42, 0.25))'
                        }}
                        onClick={spinRoulette}
                      >
                        <canvas
                          ref={canvasRef}
                          width={380}
                          height={380}
                          className="rounded-full w-full max-w-[250px] xs:max-w-[280px] sm:max-w-[380px] aspect-square h-auto"
                        />

                        {/* Metallic 3D drop depth shadow border for authenticity */}
                        <div className="absolute inset-0 rounded-full border-4 border-amber-900/10 pointer-events-none transform translate-z-[-8px]" />
                      </div>

                      {/* STATIC MECHANICAL NEEDLE / DIAL INDICATOR (Positioned exactly on top) */}
                      <div 
                        id="needle-ticker-mount" 
                        className={`absolute top-0 flex flex-col items-center z-20 pointer-events-none transition-transform ${
                          isWigglingPointer ? 'scale-110 -translate-y-1' : ''
                        }`}
                      >
                        {/* Needle body */}
                        <div 
                          className={`w-5 h-10 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-500 rounded-b-xl shadow-lg border-2 border-slate-800 origin-top transition-transform ${
                            isWigglingPointer ? 'rotate-[-24deg]' : 'rotate-0'
                          }`}
                        />
                        {/* Red pin tip indicator */}
                        <div className="w-3.5 h-3.5 bg-red-600 rounded-full -mt-2 border-2 border-slate-800 shadow-md shadow-red-500/30" />
                      </div>

                      {/* Floor shadow under 3D roulette */}
                      <div className="absolute bottom-2 w-[85%] h-8 bg-slate-900/10 rounded-full blur-md -z-10" />

                    </div>

                    {/* Wheel Interactive controllers */}
                    <div id="wheel-actions-tray" className="mt-4 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                      <button
                        id="action-spin-btn"
                        onClick={spinRoulette}
                        disabled={gameState === 'spinning'}
                        className={`px-8 py-3.5 rounded-2xl text-white font-black uppercase text-base tracking-wider transition-all duration-200 flex items-center space-x-2.5 cursor-pointer ${
                          gameState === 'spinning'
                            ? 'bg-slate-400 opacity-60 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg shadow-amber-500/25 active:scale-95'
                        }`}
                      >
                        <span className="animate-gentle-pulse">🎡 {gameState === 'spinning' ? 'Girando...' : 'Girar Ruleta'}</span>
                      </button>

                      {/* Draw a surprise card directly */}
                      <button
                        id="action-draw-surprise"
                        onClick={drawSurpriseCard}
                        disabled={gameState === 'spinning'}
                        className="px-6 py-3.5 rounded-2xl bg-slate-100 ring-1 ring-slate-200 text-slate-600 font-bold hover:bg-slate-200 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-40"
                      >
                        <Shuffle className="w-4 h-4 text-slate-500" />
                        <span>Sorteo Rápido</span>
                      </button>
                    </div>

                    {gameState === 'spinning' && (
                      <p className="text-xs text-amber-600 font-extrabold uppercase tracking-widest mt-4 animate-pulse">
                        🎲 ¡Cruzando los dedos! Girando la ruleta con física real 🍀
                      </p>
                    )}

                    {gameState === 'ready-to-spin' && (
                      <p className="text-xs text-slate-400 font-medium mt-4">
                        Toca el disco o el botón de arriba para iniciar la tirada interactiva
                      </p>
                    )}
                  </div>
                )}

                {/* ========================================================= */}
                {/* VIEW S.2: CARD CHOSEN / COGNITIVE RETRIEVAL PHASE        */}
                {/* ========================================================= */}
                {(gameState === 'card-drawn' || gameState === 'answering' || gameState === 'answered') && selectedCategory && currentQuestion && (
                  <div id="classroom-card-arena" className="w-full flex flex-col items-center py-4">
                    
                    {/* Visual context alert */}
                    <div className="text-center mb-6">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Has obtenido la categoría
                      </span>
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-extrabold shadow-sm ${CATEGORIES[selectedCategory].accentColor}`}>
                        <span className="mr-1.5 text-lg">{CATEGORIES[selectedCategory].icon}</span>
                        {CATEGORIES[selectedCategory].name}
                      </span>
                    </div>

                    {/* 3D DOUBLE SIDED CARD MODULE */}
                    <div id="card-3d-flipper-box" className="perspective-1000 w-full max-w-lg h-[650px] sm:h-[740px] relative">
                      
                      {/* Active rotation envelope */}
                      <div 
                        id="card-transform-mesh"
                        className={`w-full h-full transform-style-3d duration-700 relative transition-transform ${
                          isCardFlipped ? 'rotate-y-180' : 'animate-float-card'
                        }`}
                      >
                        
                        {/* -------------------------------------------------- */}
                        {/* CARD FRONT SIDE (Theme showcase & Invitation)     */}
                        {/* -------------------------------------------------- */}
                        <div 
                          id="card-face-front" 
                          className="absolute inset-0 backface-hidden bg-white rounded-3xl border-4 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden"
                          style={{ borderColor: CATEGORIES[selectedCategory].color }}
                        >
                          {/* Radial ambient category decoration background glow */}
                          <div 
                            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                            style={{ backgroundColor: CATEGORIES[selectedCategory].color }}
                          />

                          {/* Top row identifier */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">TARJETA DE CLASE</span>
                            <span className="text-sm font-bold text-slate-400">Dificultad única</span>
                          </div>

                          {/* Core thematic presentation */}
                          <div className="flex flex-col items-center text-center my-auto space-y-4">
                            
                            {/* Mega Icon representing category */}
                            <div 
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl flex items-center justify-center shadow-lg border animate-gentle-pulse"
                              style={{ 
                                backgroundColor: `${CATEGORIES[selectedCategory].color}12`,
                                borderColor: CATEGORIES[selectedCategory].color
                              }}
                            >
                              {CATEGORIES[selectedCategory].icon}
                            </div>

                            <div className="space-y-1 sm:space-y-2">
                              <h3 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: CATEGORIES[selectedCategory].color }}>
                                {CATEGORIES[selectedCategory].name}
                              </h3>
                              <p className="text-slate-500 text-xs sm:text-sm max-w-sm">
                                {CATEGORIES[selectedCategory].description}. ¿Estás listo para responder y sumar puntos?
                              </p>
                            </div>
                          </div>

                          {/* Flip activator CTA */}
                          <button
                            id="reveal-question-card-btn"
                            onClick={() => {
                              setIsCardFlipped(true);
                              setGameState('answering');
                              sfx.playSpin();
                            }}
                            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <span>Revelar Pregunta</span>
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* CARD BACK SIDE (Question text & options)         */}
                        {/* -------------------------------------------------- */}
                        <div 
                          id="card-face-back" 
                          className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl border-4 p-5 sm:p-7 flex flex-col justify-between shadow-2xl"
                          style={{ borderColor: CATEGORIES[selectedCategory].color }}
                        >
                          
                          {/* Inner layout container with flexible scroll */}
                          <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 mb-4">
                            
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                              <span className="text-[10px] font-black uppercase text-slate-400">Pregunta en Proceso</span>
                              <span className="text-[10px] font-bold text-slate-400">Intento de {activePlayerDetails.name}</span>
                            </div>

                            {/* QUESTION STEM */}
                            <div id="question-stem-text" className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 sm:p-5 relative overflow-hidden space-y-3.5">
                              <div className="absolute -bottom-4 -right-2 text-6xl text-slate-100/80 font-extrabold pointer-events-none font-mono">
                                ?
                              </div>
                              
                              {/* Spanish Question - Slightly Larger Font */}
                              <p className="text-base sm:text-lg font-extrabold text-slate-900 relative z-10 leading-snug">
                                {currentQuestion.question}
                              </p>

                              {/* Armenian Translation */}
                              {currentQuestion.translationArm && (
                                <div className="border-t border-slate-100 pt-2.5 mt-2.5 relative z-10">
                                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block mb-1">🇦🇲 Թարգմանություն / Перевод:</span>
                                  <p className="text-[15px] sm:text-[17px] font-medium text-slate-700 italic leading-relaxed">
                                    {currentQuestion.translationArm}
                                  </p>
                                </div>
                              )}

                              {/* Grammatical Tense/Topic - "какое время" badge detail */}
                              {currentQuestion.tenseOrTopic && (
                                <div className="pt-1.5 relative z-10 flex flex-wrap gap-1">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-tight">
                                    <span className="mr-1">⏳</span> {currentQuestion.tenseOrTopic}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* OPTION SELECTIONS */}
                            <div id="question-options-list" className="grid grid-cols-1 gap-2">
                              {currentQuestion.options.map((option, idx) => {
                                const isSelected = selectedOptionIdx === idx;
                                const isCorrectAnswer = idx === currentQuestion.correctAnswer;
                                
                                // Color evaluation
                                let btnStyle = 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300';
                                let markerIcon = null;

                                if (selectedOptionIdx !== null) {
                                  if (isCorrectAnswer) {
                                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-500';
                                    markerIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                                  } else if (isSelected) {
                                    btnStyle = 'border-red-500 bg-red-50 text-red-900 font-extrabold ring-1 ring-red-500';
                                    markerIcon = <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
                                  } else {
                                    btnStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed';
                                  }
                                }

                                return (
                                  <button
                                    key={`opt-${idx}`}
                                    type="button"
                                    onClick={() => submitAnswer(idx)}
                                    disabled={selectedOptionIdx !== null}
                                    className={`w-full p-3 rounded-xl border-2 text-left text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-between cursor-pointer ${btnStyle}`}
                                  >
                                    <span className="flex items-center space-x-2.5">
                                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 flex items-center justify-center shrink-0">
                                        {String.fromCharCode(65 + idx)}
                                      </span>
                                      <span>{option}</span>
                                    </span>
                                    {markerIcon}
                                  </button>
                                );
                              })}
                            </div>

                            {/* CLASSROOM LESSON EXPLANATION SCROLL */}
                            <AnimatePresence>
                              {selectedOptionIdx !== null && (
                                <motion.div
                                  id="academic-explanation"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-slate-700 text-xs leading-relaxed"
                                >
                                  <div className="flex items-center space-x-1.5 text-amber-800 font-bold mb-1">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>💡 Explicación Educativa</span>
                                  </div>
                                  <p className="font-semibold text-slate-800">{currentQuestion.explanation}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>

                          {/* ACTION BUTTON TO PROCEED */}
                          <div id="modal-card-actions" className="pt-3 border-t border-slate-100">
                            {selectedOptionIdx !== null ? (
                              <button
                                id="turn-advance-action-btn"
                                onClick={advanceTurn}
                                className="w-full py-3 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-98 transition-all text-xs sm:text-sm cursor-pointer"
                              >
                                <span>Aceptar y Siguiente Turno</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="text-center py-1">
                                <p className="text-[10px] text-slate-400 font-medium italic animate-pulse">
                                  Elige una de las cuatro opciones arriba para verificar tu respuesta
                                </p>
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* 3. VICTORY SCREEN                                         */}
          {/* ========================================================= */}
          {gameState === 'victory' && (
            <motion.div
              id="victory-congratulator-card"
              key="victory"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden text-center min-h-[500px]"
            >
              {/* Confetti canvas overlay */}
              <canvas ref={confettiCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

              <div id="victory-banner-top" className="bg-gradient-to-br from-amber-500 via-red-500 to-rose-600 p-12 text-white relative z-10">
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner shadow-white/20 scale-110">
                    🏆
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 text-yellow-300 w-6 h-6 animate-pulse" />
                </div>

                <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3">
                  ¡Gran Final Ruleta 3D!
                </h2>
                <p className="text-amber-100 text-sm font-medium tracking-wide uppercase mt-1">
                  Desafío lingüístico completado con éxito
                </p>
              </div>

              {/* Victory body summary details */}
              <div id="victory-stats-summary" className="p-8 space-y-8 relative z-10">
                
                {/* Crown winner highlight */}
                <div className="flex flex-col items-center">
                  {getWinner().tie ? (
                    <div className="space-y-2">
                      <span className="text-5xl">🤝</span>
                      <h3 className="text-2xl font-bold text-slate-800">¡Es un Empate espectacular!</h3>
                      <p className="text-slate-500 text-sm">Ambos estudiantes rindieron de forma magnífica de principio a fin.</p>
                      <div className="text-3xl font-black text-slate-700 mt-1">{getWinner().score} puntos de récord</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-6xl animate-bounce">👑</span>
                      <h3 className="text-3xl font-extrabold text-slate-900">
                        ¡Felicidades, {getWinner().name}!
                      </h3>
                      <p className="text-slate-500 text-sm">Eres el campeón indiscutible de esta ronda de preguntas.</p>
                      <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full text-base font-black text-amber-800 mt-2">
                        <span>Puntaje final:</span>
                        <span className="text-xl">{getWinner().score} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Comparison Display Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                    <span className="text-2xl block mb-1">{player1.avatar}</span>
                    <div className="font-bold text-slate-800 text-sm">{player1.name}</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">{player1.score} <span className="text-xs text-slate-400 font-bold">pts</span></div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{player1.correctCount} respuestas acertadas</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                    <span className="text-2xl block mb-1">{player2.avatar}</span>
                    <div className="font-bold text-slate-800 text-sm">{player2.name}</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">{player2.score} <span className="text-xs text-slate-400 font-bold">pts</span></div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{player2.correctCount} respuestas acertadas</div>
                  </div>
                </div>

                {/* Stats Breakdown by Category */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 max-w-xl mx-auto space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider text-left flex items-center gap-1.5">
                    <GraduationCap className="w-5 h-5 text-slate-500" />
                    Rendimiento Pedagógico Temático
                  </h4>
                  
                  <div className="space-y-3">
                    {Object.values(CATEGORIES).map(cat => {
                      const stat = categoryStats[cat.id] || { correct: 0, total: 0 };
                      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                      
                      return (
                        <div key={`stat-cat-${cat.id}`} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                            <span className="text-slate-500">{stat.correct} de {stat.total} aciertos ({pct}%)</span>
                          </div>
                          
                          {/* Tiny category progress gauge */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                backgroundColor: cat.color,
                                width: `${stat.total > 0 ? (stat.correct / stat.total) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Restart Campaign */}
                <div className="pt-4 flex flex-col items-center">
                  <button
                    id="restart-game-btn"
                    onClick={resetGame}
                    className="px-10 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl font-black text-lg hover:from-slate-800 hover:to-indigo-900 shadow-xl active:scale-95 transition-all flex items-center space-x-3 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Volver a Jugar</span>
                  </button>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Se re-autorizarán apodos y se barajará el juego</p>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER SYSTEM CREDITS */}
      <footer id="system-meta-footer" className="w-full py-8 border-t border-slate-200/60 mt-16 text-center text-slate-400 text-xs">
        <p className="font-semibold text-slate-500">Ruleta de Preguntas 3D © 2026</p>
        <p className="text-[10px] mt-1 text-slate-400 leading-relaxed max-w-md mx-auto">
          Desarrollado en un ambiente seguro y optimizado con animaciones aceleradas por hardware para practicar gramática de pasado, futuro, alimentos, fauna y lenguaje de viajes.
        </p>
      </footer>

    </div>
  );
}
