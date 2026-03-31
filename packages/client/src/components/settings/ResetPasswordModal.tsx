import { useState } from "react";
import { X, Loader2, AlertTriangle, Copy, Check, KeyRound } from "lucide-react";
import { UserItem } from "../../hooks/useUsers";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    userId: string;
    autoGenerate: boolean;
    newPassword?: string;
    mustChangePassword: boolean;
    sendEmail: boolean;
  }) => Promise<any>;
  isSubmitting: boolean;
  user: UserItem;
}

function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&!";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const INPUT_CLS =
  "w-full border border-neutral-300/50 rounded-md px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  user,
}: ResetPasswordModalProps) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [genPassword] = useState(generateSecurePassword());
  const [manualPassword, setManualPassword] = useState("");
  const [mustChange, setMustChange] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultPassword, setResultPassword] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    try {
      const result = await onSubmit({
        userId: user.id,
        autoGenerate: mode === "auto",
        newPassword: mode === "manual" ? manualPassword : undefined,
        mustChangePassword: mustChange,
        sendEmail,
      });
      if (result?.generatedPassword) {
        setResultPassword(result.generatedPassword);
      } else {
        onClose();
      }
    } catch (err) {
      // Handled by toast
    }
  };

  if (resultPassword) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 space-y-5">
          <h2 className="text-lg font-bold text-neutral-900">
            ✅ Mot de passe réinitialisé
          </h2>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-xs text-emerald-700 font-medium mb-1">
              Nouveau mot de passe :
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-mono font-bold text-emerald-900 select-all">
                {resultPassword}
              </code>
              <button
                onClick={() => handleCopy(resultPassword)}
                className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-md text-amber-700">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Réinitialiser mot de passe
              </h2>
              <p className="text-xs text-neutral-500">
                {user.nom} {user.postNom} ({user.email || user.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={mode === "auto"}
                onChange={() => setMode("auto")}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-neutral-700">
                Générer automatiquement
              </span>
            </label>
            {mode === "auto" && (
              <div className="ml-7 flex items-center gap-2 bg-neutral-50 rounded-md px-3 py-2">
                <code className="flex-1 text-sm font-mono font-bold text-neutral-800 select-all">
                  {genPassword}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(genPassword)}
                  className="p-1 text-neutral-500 hover:text-primary transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-neutral-700">
                Définir manuellement
              </span>
            </label>
            {mode === "manual" && (
              <input
                type="text"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
                placeholder="Min. 8 caractères"
                className={`${INPUT_CLS} ml-7 w-[calc(100%-1.75rem)]`}
                minLength={8}
              />
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mustChange}
              onChange={(e) => setMustChange(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-sm text-neutral-700">
              Forcer changement à la prochaine connexion
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-sm text-neutral-700">
              Envoyer nouveau mot de passe par email (si email renseigné)
            </span>
          </label>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs text-amber-800">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            L'utilisateur sera déconnecté immédiatement.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 border-t border-neutral-300/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting || (mode === "manual" && manualPassword.length < 8)
            }
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-md hover:bg-amber-700 disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <KeyRound size={16} />
            )}
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
