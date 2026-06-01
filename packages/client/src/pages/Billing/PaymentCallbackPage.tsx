import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Home } from 'lucide-react';

export default function PaymentCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderNumber = searchParams.get('order') || searchParams.get('orderNumber') || '';

    const [status, setStatus] = useState<'LOADING' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'TIMEOUT'>('LOADING');
    const [attempts, setAttempts] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const maxAttempts = 10;

    // Polling effect
    useEffect(() => {
        if (!orderNumber) {
            setStatus('FAILED');
            return;
        }

        let isMounted = true;
        let attemptCount = 0;
        setStatus('PENDING');

        const checkStatus = async () => {
            if (!isMounted) return;
            attemptCount++;
            setAttempts(attemptCount);

            try {
                const res = await api.get(`/billing/status/${orderNumber}`);
                const paymentStatus = res.data?.status; // PENDING, SUCCESSFUL, FAILED

                if (paymentStatus === 'SUCCESSFUL') {
                    if (isMounted) setStatus('SUCCESSFUL');
                } else if (paymentStatus === 'FAILED') {
                    if (isMounted) setStatus('FAILED');
                } else if (attemptCount >= maxAttempts) {
                    if (isMounted) setStatus('TIMEOUT');
                } else {
                    // Continue polling after 3 seconds
                    setTimeout(checkStatus, 3000);
                }
            } catch (error) {
                console.error('[STATUS POLL ERROR]', error);
                if (attemptCount >= maxAttempts) {
                    if (isMounted) setStatus('TIMEOUT');
                } else {
                    setTimeout(checkStatus, 3000);
                }
            }
        };

        // Start initial check
        checkStatus();

        return () => {
            isMounted = false;
        };
    }, [orderNumber]);

    // Canvas Confetti Animation Loop
    useEffect(() => {
        if (status !== 'SUCCESSFUL' || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#1B5E20', '#2E7D32', '#4CAF50', '#F57F17', '#FF8F00', '#FFC107', '#2196F3', '#00BCD4'];
        interface Particle {
            x: number;
            y: number;
            size: number;
            color: string;
            speedX: number;
            speedY: number;
            rotation: number;
            rotationSpeed: number;
        }

        const particles: Particle[] = [];

        // Generate initial particles
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 4 - 2,
                speedY: Math.random() * 5 + 3,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 4 - 2,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let active = false;
            particles.forEach((p) => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                // Draw rectangle particle
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();

                // Recycle particles that fall off bottom
                if (p.y < canvas.height) {
                    active = true;
                } else {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.speedY = Math.random() * 5 + 3;
                }
            });

            if (active) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animate();

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [status]);

    return (
        <div className="relative min-h-[80vh] flex items-center justify-center p-4 overflow-hidden">
            {/* Full-screen Canvas for Confetti */}
            {status === 'SUCCESSFUL' && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 z-0 pointer-events-none w-full h-full"
                />
            )}

            <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-xl w-full max-w-lg p-8 text-center space-y-6 z-10 transition-all transform duration-300">
                {/* ── STATE 1: PENDING POLLING ────────────────────────────────────── */}
                {status === 'PENDING' && (
                    <div className="space-y-6">
                        <div className="relative flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary" />
                            <Loader2 className="absolute h-8 w-8 text-primary animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-neutral-900">
                                Vérification de votre paiement...
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                S'il vous plaît, validez la demande d'autorisation push sur votre téléphone. Nous vérifions le statut en temps réel.
                            </p>
                        </div>

                        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-semibold max-w-xs mx-auto">
                            <span>Tentative de validation :</span>
                            <span className="text-primary font-bold">{attempts} / {maxAttempts}</span>
                        </div>

                        <p className="text-[10px] text-neutral-400">
                            ID Transaction: <span className="font-mono text-neutral-600">{orderNumber}</span>
                        </p>
                    </div>
                )}

                {/* ── STATE 2: SUCCESSFUL PAYMENT ─────────────────────────────────── */}
                {status === 'SUCCESSFUL' && (
                    <div className="space-y-6 animate-scaleIn">
                        <div className="flex justify-center">
                            <div className="p-3 bg-green-50 rounded-full border border-green-200/50 animate-bounce">
                                <CheckCircle2 className="h-16 w-16 text-primary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-primary">
                                Félicitations !
                            </h3>
                            <p className="text-md font-bold text-neutral-800">
                                Votre abonnement a été activé avec succès !
                            </p>
                            <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed pt-1">
                                Merci de faire confiance à EduGoma 360. Toutes vos fonctionnalités scolaires sont maintenant débloquées.
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Retour au tableau de bord
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STATE 3: FAILED PAYMENT ─────────────────────────────────────── */}
                {status === 'FAILED' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="p-3 bg-red-50 rounded-full border border-red-200/50">
                                <XCircle className="h-16 w-16 text-red-600" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-red-700">
                                Échec du paiement
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                La transaction a été déclinée par votre opérateur de téléphonie ou la validation a expiré.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-col gap-2">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all duration-150"
                            >
                                Réessayer le paiement
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold text-sm transition-all duration-150"
                            >
                                Retour au tableau de bord
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STATE 4: TIMEOUT/PENDING OVERTIME ────────────────────────────── */}
                {status === 'TIMEOUT' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="p-3 bg-amber-50 rounded-full border border-amber-200/50">
                                <AlertCircle className="h-16 w-16 text-amber-600" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-amber-700">
                                Paiement en cours de traitement
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                Nous n'avons pas encore reçu la confirmation de votre opérateur. Si votre compte a déjà été débité, ne vous inquiétez pas : votre abonnement sera activé automatiquement et vous recevrez une confirmation par SMS d'ici quelques instants.
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Retour au tableau de bord
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
